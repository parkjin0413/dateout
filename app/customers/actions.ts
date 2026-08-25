"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { formatPhoneNumber, normalizePhoneDigits } from "@/lib/phone";
import { isValidDate } from "@/lib/customers/date";
import { writeLog } from "@/lib/logs";

export type CustomerFormState = { error: string } | null;

async function getViewer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin, name").eq("id", user.id).single();
  const actorName = profile?.name ?? user.email ?? "알 수 없음";

  return { supabase, userId: user.id, isAdmin: profile?.is_admin ?? false, actorName };
}

async function findDuplicateOwnerName(
  supabase: Awaited<ReturnType<typeof createClient>>,
  phoneNormalized: string,
  excludeId?: string
): Promise<string | null> {
  let query = supabase.from("customers").select("id, name, owner_id").eq("phone_normalized", phoneNormalized);
  if (excludeId) query = query.neq("id", excludeId);
  const { data: existing } = await query.maybeSingle();
  if (!existing) return null;

  if (!existing.owner_id) return existing.name;
  const { data: owner } = await supabase.from("users").select("name").eq("id", existing.owner_id).single();
  return owner?.name ?? existing.name;
}

function readCustomerFields(formData: FormData) {
  return {
    category: String(formData.get("category") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    company: String(formData.get("company") ?? "").trim(),
    phoneRaw: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    memo: String(formData.get("memo") ?? "").trim(),
  };
}

export async function createCustomer(_prevState: CustomerFormState, formData: FormData): Promise<CustomerFormState> {
  const { supabase, userId, actorName } = await getViewer();

  const { category, name, company, phoneRaw, email, memo } = readCustomerFields(formData);
  if (!category) return { error: "구분을 선택해주세요." };
  if (!name) return { error: "이름을 입력해주세요." };
  if (!company) return { error: "소속을 입력해주세요." };
  if (!phoneRaw) return { error: "연락처를 입력해주세요." };

  const phoneNormalized = normalizePhoneDigits(phoneRaw);
  if (phoneNormalized.length < 8) return { error: "연락처를 정확히 입력해주세요." };

  const duplicateOwnerName = await findDuplicateOwnerName(supabase, phoneNormalized);
  if (duplicateOwnerName) return { error: `이미 ${duplicateOwnerName}님이 등록한 연락처입니다.` };

  const { error } = await supabase.from("customers").insert({
    owner_id: userId,
    category,
    name,
    company,
    phone: formatPhoneNumber(phoneRaw),
    phone_normalized: phoneNormalized,
    email,
    memo,
  });

  if (error) {
    if (error.code === "23505") return { error: "이미 등록된 연락처입니다." };
    return { error: "등록 중 오류가 발생했습니다." };
  }

  await writeLog({
    level: "info",
    action: "CREATE_CUSTOMER",
    message: `${actorName}님이 고객을 등록했습니다: ${name} (${company})`,
    actorId: userId,
    actorName,
  });

  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomer(
  id: string,
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const { supabase, userId, isAdmin, actorName } = await getViewer();

  const { data: existing } = await supabase.from("customers").select("owner_id").eq("id", id).single();
  if (!existing) return { error: "고객을 찾을 수 없습니다." };
  if (existing.owner_id !== userId && !isAdmin) return { error: "수정 권한이 없습니다." };

  const { category, name, company, phoneRaw, email, memo } = readCustomerFields(formData);
  if (!category) return { error: "구분을 선택해주세요." };
  if (!name) return { error: "이름을 입력해주세요." };
  if (!company) return { error: "소속을 입력해주세요." };
  if (!phoneRaw) return { error: "연락처를 입력해주세요." };

  const phoneNormalized = normalizePhoneDigits(phoneRaw);
  if (phoneNormalized.length < 8) return { error: "연락처를 정확히 입력해주세요." };

  const duplicateOwnerName = await findDuplicateOwnerName(supabase, phoneNormalized, id);
  if (duplicateOwnerName) return { error: `이미 ${duplicateOwnerName}님이 등록한 연락처입니다.` };

  const { error } = await supabase
    .from("customers")
    .update({
      category,
      name,
      company,
      phone: formatPhoneNumber(phoneRaw),
      phone_normalized: phoneNormalized,
      email,
      memo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "이미 등록된 연락처입니다." };
    return { error: "수정 중 오류가 발생했습니다." };
  }

  await writeLog({
    level: "info",
    action: "UPDATE_CUSTOMER",
    message: `${actorName}님이 고객 정보를 수정했습니다: ${name} (${company})`,
    actorId: userId,
    actorName,
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function deleteCustomer(id: string): Promise<void> {
  const { supabase, userId, isAdmin, actorName } = await getViewer();

  const { data: existing } = await supabase.from("customers").select("owner_id, name, company").eq("id", id).single();

  if (existing && (existing.owner_id === userId || isAdmin)) {
    await supabase.from("customers").delete().eq("id", id);
    await writeLog({
      level: "info",
      action: "DELETE_CUSTOMER",
      message: `${actorName}님이 고객을 삭제했습니다: ${existing.name} (${existing.company})`,
      actorId: userId,
      actorName,
    });
    revalidatePath("/customers");
  }

  redirect("/customers");
}

export async function reassignOwner(customerId: string, formData: FormData): Promise<void> {
  const { supabase, isAdmin, userId, actorName } = await getViewer();
  if (!isAdmin) redirect(`/customers/${customerId}`);

  const newOwnerId = String(formData.get("owner_id") ?? "").trim();
  await supabase
    .from("customers")
    .update({ owner_id: newOwnerId || null })
    .eq("id", customerId);

  await writeLog({
    level: "info",
    action: "REASSIGN_CUSTOMER_OWNER",
    message: `${actorName}님이 고객 담당자를 변경했습니다.`,
    actorId: userId,
    actorName,
  });

  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}

// --- 연락 기록 ---

export type ContactFormState = { error: string } | null;

export async function createContact(
  customerId: string,
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const { supabase, userId, actorName } = await getViewer();

  const contactDate = String(formData.get("contact_date") ?? "").trim();
  if (!isValidDate(contactDate)) return { error: "날짜 형식이 올바르지 않습니다." };

  const method = String(formData.get("method") ?? "").trim();
  if (!["문자", "전화", "이메일", "방문", "기타"].includes(method)) {
    return { error: "연락 방법을 선택해주세요." };
  }

  const memo = String(formData.get("memo") ?? "").trim();

  const { error } = await supabase.from("customer_contacts").insert({
    customer_id: customerId,
    contact_date: contactDate,
    method,
    memo,
    created_by: userId,
  });

  if (error) return { error: "연락 기록 저장 중 오류가 발생했습니다." };

  await writeLog({
    level: "info",
    action: "CREATE_CUSTOMER_CONTACT",
    message: `${actorName}님이 연락 기록을 추가했습니다.`,
    actorId: userId,
    actorName,
  });

  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}

export async function deleteContact(id: string, customerId: string): Promise<void> {
  const { supabase, userId, isAdmin, actorName } = await getViewer();

  const { data: existing } = await supabase.from("customer_contacts").select("created_by").eq("id", id).single();

  if (existing && (existing.created_by === userId || isAdmin)) {
    await supabase.from("customer_contacts").delete().eq("id", id);
    await writeLog({
      level: "info",
      action: "DELETE_CUSTOMER_CONTACT",
      message: `${actorName}님이 연락 기록을 삭제했습니다.`,
      actorId: userId,
      actorName,
    });
    revalidatePath(`/customers/${customerId}`);
  }

  redirect(`/customers/${customerId}`);
}

// --- 구분 관리 ---

export async function createCategory(formData: FormData): Promise<void> {
  const { supabase } = await getViewer();

  const label = String(formData.get("label") ?? "").trim();
  if (label) {
    const { data: maxRow } = await supabase
      .from("customer_categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextSortOrder = (maxRow?.sort_order ?? 0) + 1;

    await supabase.from("customer_categories").insert({ label, sort_order: nextSortOrder });
    revalidatePath("/customers/categories");
  }

  redirect("/customers/categories");
}

export async function deleteCategory(id: string): Promise<void> {
  const { supabase, isAdmin } = await getViewer();
  if (!isAdmin) redirect("/customers/categories");

  const { data: category } = await supabase.from("customer_categories").select("label").eq("id", id).single();

  if (category) {
    const { count } = await supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("category", category.label);

    if ((count ?? 0) === 0) {
      await supabase.from("customer_categories").delete().eq("id", id);
      revalidatePath("/customers/categories");
    }
  }

  redirect("/customers/categories");
}
