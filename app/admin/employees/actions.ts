"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPhoneNumber } from "@/lib/phone";
import { writeLog } from "@/lib/logs";

export type EmployeeAccountFormState = { error: string } | null;

const EMAIL_DOMAIN = "ks.com";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin, name").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");

  return { adminId: user.id, adminName: profile.name ?? user.email ?? "관리자" };
}

export async function createEmployeeAccount(
  _prevState: EmployeeAccountFormState,
  formData: FormData
): Promise<EmployeeAccountFormState> {
  const { adminId, adminName } = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const jobTitle = String(formData.get("job_title") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "이름을 입력해주세요." };
  if (!department) return { error: "부서를 입력해주세요." };
  if (!jobTitle) return { error: "직급을 입력해주세요." };
  if (!phoneRaw) return { error: "전화번호를 입력해주세요." };
  if (password.length < 4) return { error: "비밀번호는 4자 이상 입력해주세요." };

  const digits = phoneRaw.replace(/\D/g, "");
  if (digits.length < 4) return { error: "전화번호를 정확히 입력해주세요." };
  const email = `${digits.slice(-4)}@${EMAIL_DOMAIN}`;

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    const dup = createError?.message?.toLowerCase().includes("already");
    return {
      error: dup
        ? `이미 사용 중인 전화번호 뒷자리입니다 (${email}). 다른 번호를 확인해주세요.`
        : "계정 생성 중 오류가 발생했습니다.",
    };
  }

  const formattedPhone = formatPhoneNumber(phoneRaw);

  const { error: profileError } = await admin.from("users").upsert({
    id: created.user.id,
    email,
    name,
    department,
    job_title: jobTitle,
    phone: formattedPhone,
    is_admin: false,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "직원 정보 저장 중 오류가 발생했습니다." };
  }

  // Reuses the auth user's id as the employees row id, so a deleted account
  // can find and remove its directory entry with the same id later.
  const { error: directoryError } = await admin.from("employees").upsert({
    id: created.user.id,
    name,
    department,
    job_title: jobTitle,
    phone: formattedPhone,
  });

  if (directoryError) {
    console.error("Failed to sync employee to directory:", directoryError);
  }

  await writeLog({
    level: "info",
    action: "CREATE_EMPLOYEE",
    message: `${adminName}님이 ${name}(${email}) 계정을 생성했습니다.`,
    actorId: adminId,
    actorName: adminName,
  });

  revalidatePath("/admin/employees");
  redirect("/admin/employees");
}

export async function deleteEmployeeAccount(id: string): Promise<void> {
  const { adminId, adminName } = await requireAdmin();
  if (id === adminId) redirect("/admin/employees");

  const admin = createAdminClient();
  const { data: target } = await admin.from("users").select("name, email").eq("id", id).single();

  await admin.auth.admin.deleteUser(id);
  await admin.from("users").delete().eq("id", id);
  await admin.from("employees").delete().eq("id", id);

  await writeLog({
    level: "info",
    action: "DELETE_EMPLOYEE",
    message: `${adminName}님이 ${target?.name ?? target?.email ?? id} 계정을 삭제했습니다.`,
    actorId: adminId,
    actorName: adminName,
  });

  revalidatePath("/admin/employees");
  redirect("/admin/employees");
}
