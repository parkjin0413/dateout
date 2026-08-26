"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { formatPhoneNumber, normalizePhoneDigits } from "@/lib/phone";
import { isValidDate } from "@/lib/customers/date";
import { parseCustomerCsv } from "@/lib/customers/csv";
import { CARD_IMAGE_BUCKET, buildCardImagePath } from "@/lib/customers/card-image";
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

  const { data: inserted, error } = await supabase
    .from("customers")
    .insert({
      owner_id: userId,
      category,
      name,
      company,
      phone: formatPhoneNumber(phoneRaw),
      phone_normalized: phoneNormalized,
      email,
      memo,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    if (error?.code === "23505") return { error: "이미 등록된 연락처입니다." };
    return { error: "등록 중 오류가 발생했습니다." };
  }

  const cardImage = formData.get("card_image");
  if (cardImage instanceof File && cardImage.size > 0) {
    const path = buildCardImagePath(inserted.id, cardImage.name);
    const { error: uploadError } = await supabase.storage.from(CARD_IMAGE_BUCKET).upload(path, cardImage);
    if (!uploadError) {
      await supabase.from("customers").update({ card_image_path: path }).eq("id", inserted.id);
    }
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

  const { data: existing } = await supabase.from("customers").select("owner_id, card_image_path").eq("id", id).single();
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

  const cardImage = formData.get("card_image");
  const removeCardImage = formData.get("remove_card_image") === "on";

  if (cardImage instanceof File && cardImage.size > 0) {
    const path = buildCardImagePath(id, cardImage.name);
    const { error: uploadError } = await supabase.storage.from(CARD_IMAGE_BUCKET).upload(path, cardImage);
    if (!uploadError) {
      if (existing.card_image_path) {
        await supabase.storage.from(CARD_IMAGE_BUCKET).remove([existing.card_image_path]);
      }
      await supabase.from("customers").update({ card_image_path: path }).eq("id", id);
    }
  } else if (removeCardImage && existing.card_image_path) {
    await supabase.storage.from(CARD_IMAGE_BUCKET).remove([existing.card_image_path]);
    await supabase.from("customers").update({ card_image_path: null }).eq("id", id);
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

  const { data: existing } = await supabase
    .from("customers")
    .select("owner_id, name, company, card_image_path")
    .eq("id", id)
    .single();

  if (existing && (existing.owner_id === userId || isAdmin)) {
    await supabase.from("customers").delete().eq("id", id);
    if (existing.card_image_path) {
      await supabase.storage.from(CARD_IMAGE_BUCKET).remove([existing.card_image_path]);
    }
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

  revalidatePath("/customers");
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

// --- 목록 일괄 작업 ---

export type BulkState = { error?: string; successCount: number; skipCount: number } | null;

export async function runBulkAction(_prevState: BulkState, formData: FormData): Promise<BulkState> {
  const kind = String(formData.get("kind") ?? "");
  const ids = formData.getAll("ids").map(String);
  if (ids.length === 0) return { successCount: 0, skipCount: 0 };

  const { supabase, userId, isAdmin, actorName } = await getViewer();

  if (kind === "category") {
    const category = String(formData.get("category") ?? "").trim();
    if (!category) return { error: "구분을 선택해주세요.", successCount: 0, skipCount: ids.length };

    const { data: rows } = await supabase.from("customers").select("id, owner_id").in("id", ids);
    const allowedIds = (rows ?? []).filter((r) => r.owner_id === userId || isAdmin).map((r) => r.id);

    if (allowedIds.length > 0) {
      await supabase
        .from("customers")
        .update({ category, updated_at: new Date().toISOString() })
        .in("id", allowedIds);

      await writeLog({
        level: "info",
        action: "BULK_UPDATE_CUSTOMER_CATEGORY",
        message: `${actorName}님이 고객 ${allowedIds.length}건의 구분을 일괄 변경했습니다: ${category}`,
        actorId: userId,
        actorName,
      });

      revalidatePath("/customers");
    }

    return { successCount: allowedIds.length, skipCount: ids.length - allowedIds.length };
  }

  if (kind === "contact") {
    const contactDate = String(formData.get("contact_date") ?? "").trim();
    if (!isValidDate(contactDate)) return { error: "날짜 형식이 올바르지 않습니다.", successCount: 0, skipCount: ids.length };

    const method = String(formData.get("method") ?? "").trim();
    if (!["문자", "전화", "이메일", "방문", "기타"].includes(method)) {
      return { error: "연락 방법을 선택해주세요.", successCount: 0, skipCount: ids.length };
    }

    const memo = String(formData.get("memo") ?? "").trim();

    const { error } = await supabase
      .from("customer_contacts")
      .insert(ids.map((customerId) => ({ customer_id: customerId, contact_date: contactDate, method, memo, created_by: userId })));

    if (error) return { error: "연락 기록 저장 중 오류가 발생했습니다.", successCount: 0, skipCount: ids.length };

    await writeLog({
      level: "info",
      action: "BULK_CREATE_CUSTOMER_CONTACT",
      message: `${actorName}님이 고객 ${ids.length}건에 연락 기록을 일괄 추가했습니다.`,
      actorId: userId,
      actorName,
    });

    revalidatePath("/customers");
    return { successCount: ids.length, skipCount: 0 };
  }

  if (kind === "delete") {
    const { data: rows } = await supabase.from("customers").select("id, owner_id, card_image_path").in("id", ids);
    const allowed = (rows ?? []).filter((r) => r.owner_id === userId || isAdmin);

    if (allowed.length > 0) {
      await supabase.from("customers").delete().in("id", allowed.map((r) => r.id));

      const imagePaths = allowed.map((r) => r.card_image_path).filter((p): p is string => !!p);
      if (imagePaths.length > 0) {
        await supabase.storage.from(CARD_IMAGE_BUCKET).remove(imagePaths);
      }

      await writeLog({
        level: "info",
        action: "BULK_DELETE_CUSTOMER",
        message: `${actorName}님이 고객 ${allowed.length}건을 일괄 삭제했습니다.`,
        actorId: userId,
        actorName,
      });

      revalidatePath("/customers");
    }

    return { successCount: allowed.length, skipCount: ids.length - allowed.length };
  }

  return { successCount: 0, skipCount: ids.length };
}

// --- 일괄등록 ---

export type ImportState = {
  error?: string;
  total: number;
  successCount: number;
  failures: { row: number; reason: string }[];
} | null;

export async function importCustomers(_prevState: ImportState, formData: FormData): Promise<ImportState> {
  const { supabase, userId, actorName } = await getViewer();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "CSV 파일을 선택해주세요.", total: 0, successCount: 0, failures: [] };
  }

  const text = await file.text();
  const { rows, headerError } = parseCustomerCsv(text);
  if (headerError) return { error: headerError, total: 0, successCount: 0, failures: [] };
  if (rows.length === 0) return { error: "등록할 데이터가 없습니다.", total: 0, successCount: 0, failures: [] };

  const { data: categoryRows } = await supabase.from("customer_categories").select("label");
  const validCategories = new Set((categoryRows ?? []).map((c) => c.label));

  const { data: existingRows } = await supabase.from("customers").select("phone_normalized");
  const existingPhones = new Set((existingRows ?? []).map((c) => c.phone_normalized));

  const failures: { row: number; reason: string }[] = [];
  const seenPhones = new Set<string>();
  const toInsert: {
    owner_id: string;
    category: string;
    name: string;
    company: string;
    phone: string;
    phone_normalized: string;
    email: string;
    memo: string;
  }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rowNum = i + 2; // 1행은 헤더

    if (!r.category) {
      failures.push({ row: rowNum, reason: "구분이 비어 있습니다." });
      continue;
    }
    if (!validCategories.has(r.category)) {
      failures.push({ row: rowNum, reason: `등록되지 않은 구분입니다: ${r.category}` });
      continue;
    }
    if (!r.name) {
      failures.push({ row: rowNum, reason: "이름이 비어 있습니다." });
      continue;
    }
    if (!r.company) {
      failures.push({ row: rowNum, reason: "소속이 비어 있습니다." });
      continue;
    }
    if (!r.phoneRaw) {
      failures.push({ row: rowNum, reason: "연락처가 비어 있습니다." });
      continue;
    }

    const phoneNormalized = normalizePhoneDigits(r.phoneRaw);
    if (phoneNormalized.length < 8) {
      failures.push({ row: rowNum, reason: "연락처 형식이 올바르지 않습니다." });
      continue;
    }
    if (existingPhones.has(phoneNormalized)) {
      failures.push({ row: rowNum, reason: "이미 등록된 연락처입니다." });
      continue;
    }
    if (seenPhones.has(phoneNormalized)) {
      failures.push({ row: rowNum, reason: "파일 내에 중복된 연락처입니다." });
      continue;
    }

    seenPhones.add(phoneNormalized);
    toInsert.push({
      owner_id: userId,
      category: r.category,
      name: r.name,
      company: r.company,
      phone: formatPhoneNumber(r.phoneRaw),
      phone_normalized: phoneNormalized,
      email: r.email,
      memo: r.memo,
    });
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from("customers").insert(toInsert);
    if (error) {
      return { error: "등록 중 오류가 발생했습니다. 다시 시도해주세요.", total: rows.length, successCount: 0, failures };
    }

    await writeLog({
      level: "info",
      action: "IMPORT_CUSTOMERS",
      message: `${actorName}님이 고객 ${toInsert.length}건을 일괄등록했습니다.`,
      actorId: userId,
      actorName,
    });

    revalidatePath("/customers");
  }

  return { total: rows.length, successCount: toInsert.length, failures };
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

    const { error } = await supabase.from("customer_categories").insert({ label, sort_order: nextSortOrder });
    if (error) redirect("/customers/categories?dup=1");
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
