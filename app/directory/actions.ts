"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { formatPhoneNumber } from "@/lib/phone";

export type DirectoryFormState = { error: string } | null;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/directory");

  return supabase;
}

function readFields(formData: FormData) {
  return {
    department: String(formData.get("department") ?? "").trim(),
    jobTitle: String(formData.get("job_title") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    directLine: String(formData.get("direct_line") ?? "").trim(),
  };
}

export async function createEmployee(
  _prevState: DirectoryFormState,
  formData: FormData
): Promise<DirectoryFormState> {
  const supabase = await requireAdmin();

  const { department, jobTitle, name, phone, directLine } = readFields(formData);
  if (!department) return { error: "부서를 입력해주세요." };
  if (!jobTitle) return { error: "직급을 입력해주세요." };
  if (!name) return { error: "이름을 입력해주세요." };
  if (!phone) return { error: "연락처를 입력해주세요." };

  const { error } = await supabase.from("employees").insert({
    department,
    job_title: jobTitle,
    name,
    phone: formatPhoneNumber(phone),
    direct_line: directLine ? formatPhoneNumber(directLine) : "",
  });

  if (error) return { error: "등록 중 오류가 발생했습니다." };

  revalidatePath("/directory");
  redirect("/directory");
}

export async function updateEmployee(
  id: string,
  _prevState: DirectoryFormState,
  formData: FormData
): Promise<DirectoryFormState> {
  const supabase = await requireAdmin();

  const { department, jobTitle, name, phone, directLine } = readFields(formData);
  if (!department) return { error: "부서를 입력해주세요." };
  if (!jobTitle) return { error: "직급을 입력해주세요." };
  if (!name) return { error: "이름을 입력해주세요." };
  if (!phone) return { error: "연락처를 입력해주세요." };

  const { error } = await supabase
    .from("employees")
    .update({
      department,
      job_title: jobTitle,
      name,
      phone: formatPhoneNumber(phone),
      direct_line: directLine ? formatPhoneNumber(directLine) : "",
    })
    .eq("id", id);

  if (error) return { error: "수정 중 오류가 발생했습니다." };

  revalidatePath("/directory");
  redirect("/directory");
}

export async function deleteEmployee(id: string): Promise<void> {
  const supabase = await requireAdmin();
  await supabase.from("employees").delete().eq("id", id);
  revalidatePath("/directory");
  redirect("/directory");
}
