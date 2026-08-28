import type { Tables } from "@/lib/supabase/types";

export type Customer = Tables<"customers">;
export type CustomerContact = Tables<"customer_contacts">;
export type CustomerCategory = Tables<"customer_categories">;

// The list page only selects a subset of columns (no phone_normalized,
// no updated_at) — this is what the table/card components actually receive.
export type CustomerListItem = Pick<
  Customer,
  "id" | "owner_id" | "category" | "name" | "company" | "phone" | "email" | "memo" | "created_at"
>;

export const CONTACT_METHODS = ["문자", "전화", "이메일", "방문", "기타"] as const;
