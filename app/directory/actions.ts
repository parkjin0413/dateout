"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { formatPhoneNumber } from "@/lib/phone";
import { writeLog } from "@/lib/logs";

export type DirectoryFormState = { error: string } | null;

function readFields(formData: FormData) {
  return {
    company: String(formData.get("company") ?? "").trim(),
    workLocation: String(formData.get("work_location") ?? "").trim(),
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
  const { supabase } = await requireAdmin("/directory");

  const { company, workLocation, department, jobTitle, name, phone, directLine } = readFields(formData);
  if (!workLocation) return { error: "근무지를 선택해주세요." };
  if (!department) return { error: "부서를 입력해주세요." };
  if (!jobTitle) return { error: "직급을 입력해주세요." };
  if (!name) return { error: "이름을 입력해주세요." };
  if (!phone) return { error: "연락처를 입력해주세요." };

  const formattedPhone = formatPhoneNumber(phone);

  const { data: existing } = await supabase.from("employees").select("id").eq("phone", formattedPhone).maybeSingle();
  if (existing) return { error: "이미 등록된 전화번호입니다. 기존 직원 정보를 수정해주세요." };

  const { error } = await supabase.from("employees").insert({
    company,
    work_location: workLocation,
    department,
    job_title: jobTitle,
    name,
    phone: formattedPhone,
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
  const { supabase } = await requireAdmin("/directory");

  const { company, workLocation, department, jobTitle, name, phone, directLine } = readFields(formData);
  if (!workLocation) return { error: "근무지를 선택해주세요." };
  if (!department) return { error: "부서를 입력해주세요." };
  if (!jobTitle) return { error: "직급을 입력해주세요." };
  if (!name) return { error: "이름을 입력해주세요." };
  if (!phone) return { error: "연락처를 입력해주세요." };

  const { error } = await supabase
    .from("employees")
    .update({
      company,
      work_location: workLocation,
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
  const { supabase } = await requireAdmin("/directory");
  const { error } = await supabase.from("employees").delete().eq("id", id);

  if (error) {
    await writeLog({
      level: "error",
      action: "DELETE_DIRECTORY_EMPLOYEE",
      message: `직원 삭제 실패 (id: ${id}): ${error.message}`,
      actorId: null,
      actorName: "system",
    });
  }

  revalidatePath("/directory");
  redirect("/directory");
}
