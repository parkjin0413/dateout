# 고객관리(Customer Management) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "고객관리" (customer management) section to dateout where every employee can see all customers, but only the registering employee (or an admin) can edit/delete their own, and the same phone number can never be registered twice across employees.

**Architecture:** Three new Postgres tables (`customers`, `customer_contacts`, `customer_categories`) with RLS mirroring the existing `is_admin()`-based pattern. Next.js App Router pages under `app/customers/**` reuse the exact server-action/form/table-card patterns already established for `/schedule` and `/field-trip`. No new infrastructure (no Storage bucket, no new npm dependency, no service-role client).

**Tech Stack:** Next.js 16 (App Router, Server Actions), Supabase (Postgres + `@supabase/ssr`), Tailwind CSS v4, TypeScript.

**Spec:** `docs/superpowers/specs/2026-08-24-customer-management-design.md`

## Global Constraints

- No emoji, no new npm dependencies, no Storage bucket — Phase 1 only (spec's "이번 범위에서 제외" list stays excluded: favorites, business card photos, Excel import/export, dashboard, bulk actions).
- Duplicate phone numbers are blocked with no override, even for admins — enforced by a DB unique index on `phone_normalized`, not just app-code.
- **This project has no test runner** (`package.json` scripts are only `dev`/`build`/`start`/`lint`; verified throughout the codebase's history — every existing feature was checked with `npx tsc --noEmit`, `npx eslint`, and manual dev-server route checks, never with a unit test suite). Every task's "test" step in this plan means: type-check, lint, and a concrete manual check (curl route status and/or an in-browser walkthrough) — not a Jest/Vitest file. Do not add a test framework as part of this work; it is out of scope.
- Follow existing file conventions exactly: light-theme hex classes (`#211D14` ink, `#6B6455` secondary text, `#8A8270` muted, `#E7E2D2` border, `#F5F3EA` canvas, `#0F5C56` accent / `#0C4A45` accent-hover), `useActionState` + `"use client"` wrapper for forms that show inline errors, plain `<form action={fn}>` for simple admin add-forms with no error UI, `useTransition` + `confirm()` for delete buttons.
- All new source files use LF line endings like the rest of the repo (Git will warn about CRLF conversion on Windows checkouts — that warning is expected and harmless, same as every prior commit in this project).

---

### Task 0: Apply the SQL migration (manual, blocking)

**Files:**
- Create: `supabase/migrations/20260824_customer_management.sql`

This task has no code to write in the app — it produces the SQL for the user to run in the Supabase SQL Editor before any later task can be verified against a real database. Every subsequent task's manual-check step assumes this has already been run.

- [ ] **Step 1: Write the migration file**

```sql
create table if not exists public.customer_categories (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  category text not null,
  name text not null,
  company text not null,
  phone text not null,
  phone_normalized text not null,
  email text not null default '',
  memo text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_phone_normalized_idx
  on public.customers (phone_normalized);

create table if not exists public.customer_contacts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  contact_date date not null,
  method text not null check (method in ('문자','전화','이메일','방문','기타')),
  memo text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists customer_contacts_customer_id_idx
  on public.customer_contacts (customer_id);

alter table public.customer_categories enable row level security;
alter table public.customers enable row level security;
alter table public.customer_contacts enable row level security;

-- customer_categories: everyone reads and adds, only admins delete
create policy "read customer_categories" on public.customer_categories
  for select to authenticated using (true);
create policy "insert customer_categories" on public.customer_categories
  for insert to authenticated with check (true);
create policy "delete customer_categories" on public.customer_categories
  for delete to authenticated using (is_admin());

-- customers: everyone reads and creates; only the owner or an admin can
-- change a row; only an admin can hand a row to a different owner
-- (the WITH CHECK re-evaluates against the *new* row, so a non-admin
-- update that tries to change owner_id away from itself fails)
create policy "read customers" on public.customers
  for select to authenticated using (true);
create policy "insert customers" on public.customers
  for insert to authenticated with check (true);
create policy "update customers" on public.customers
  for update to authenticated
  using (owner_id = auth.uid() or is_admin())
  with check (owner_id = auth.uid() or is_admin());
create policy "delete customers" on public.customers
  for delete to authenticated using (owner_id = auth.uid() or is_admin());

-- customer_contacts: everyone reads and adds; only the person who logged
-- an entry (or an admin) can delete it
create policy "read customer_contacts" on public.customer_contacts
  for select to authenticated using (true);
create policy "insert customer_contacts" on public.customer_contacts
  for insert to authenticated with check (true);
create policy "delete customer_contacts" on public.customer_contacts
  for delete to authenticated using (created_by = auth.uid() or is_admin());
```

- [ ] **Step 2: Ask the user to run it**

Tell the user: "Supabase SQL Editor에서 `supabase/migrations/20260824_customer_management.sql`을 실행해주세요. 실행 전에는 다음 태스크들의 실제 동작 확인이 불가능합니다." Wait for confirmation before treating any later task's manual-check step as passable — `tsc`/`eslint` steps can still run without it.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260824_customer_management.sql
git commit -m "Add customers/customer_contacts/customer_categories migration"
```

---

### Task 1: Hand-authored Supabase types and shared utilities

**Files:**
- Modify: `lib/supabase/types.ts`
- Create: `lib/customers/types.ts`
- Create: `lib/customers/date.ts`
- Modify: `lib/phone.ts`

**Interfaces:**
- Produces: `Database["public"]["Tables"]["customers" | "customer_contacts" | "customer_categories"]` (Row/Insert/Update), `Customer`, `CustomerContact`, `CustomerCategory`, `CustomerListItem` types from `lib/customers/types.ts`; `isValidDate(value: string): boolean` from `lib/customers/date.ts`; `normalizePhoneDigits(raw: string): string` from `lib/phone.ts` (alongside the existing `formatPhoneNumber`).

This project has no Supabase codegen access in this session, so table types are hand-authored exactly like `employees`/`schedules`/`logs` already are in this same file. Insert the three new blocks alphabetically, right before the existing `employees` block (`customer_categories`, `customer_contacts`, `customers`, then `employees`...).

- [ ] **Step 1: Add the three table blocks to `lib/supabase/types.ts`**

Open the file and find the line `      employees: {` (the first table block). Insert this immediately above it, keeping the same indentation:

```ts
      customer_categories: {
        Row: {
          created_at: string
          id: string
          label: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      customer_contacts: {
        Row: {
          contact_date: string
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          memo: string
          method: string
        }
        Insert: {
          contact_date: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          memo?: string
          method: string
        }
        Update: {
          contact_date?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          memo?: string
          method?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          category: string
          company: string
          created_at: string
          email: string
          id: string
          memo: string
          name: string
          owner_id: string | null
          phone: string
          phone_normalized: string
          updated_at: string
        }
        Insert: {
          category: string
          company: string
          created_at?: string
          email?: string
          id?: string
          memo?: string
          name: string
          owner_id?: string | null
          phone: string
          phone_normalized: string
          updated_at?: string
        }
        Update: {
          category?: string
          company?: string
          created_at?: string
          email?: string
          id?: string
          memo?: string
          name?: string
          owner_id?: string | null
          phone?: string
          phone_normalized?: string
          updated_at?: string
        }
        Relationships: []
      }
```

- [ ] **Step 2: Create `lib/customers/types.ts`**

```ts
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
```

- [ ] **Step 3: Create `lib/customers/date.ts`**

```ts
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(value: string): boolean {
  return DATE_RE.test(value);
}
```

- [ ] **Step 4: Add `normalizePhoneDigits` to `lib/phone.ts`**

Append to the end of the existing file (do not touch `formatPhoneNumber`):

```ts

export function normalizePhoneDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no output (no type errors). Nothing runtime-testable yet — this task is pure types/utilities.

- [ ] **Step 6: Commit**

```bash
git add lib/supabase/types.ts lib/customers/types.ts lib/customers/date.ts lib/phone.ts
git commit -m "Add customer_management types and normalizePhoneDigits"
```

---

### Task 2: Customer CRUD server actions with duplicate-block

**Files:**
- Create: `app/customers/actions.ts`

**Interfaces:**
- Consumes: `isValidDate` (unused in this task, used in Task 3), `normalizePhoneDigits`/`formatPhoneNumber` from `lib/phone.ts`, `writeLog` from `lib/logs.ts` (already exists — see `app/schedule/actions.ts` for the call shape), `createClient` from `lib/supabase/server.ts`.
- Produces: `CustomerFormState`, `createCustomer(prevState, formData)`, `updateCustomer(id, prevState, formData)`, `deleteCustomer(id)`, `reassignOwner(customerId, formData)` — all later tasks (forms, buttons) bind to these exact names.

- [ ] **Step 1: Write the file**

```ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { formatPhoneNumber, normalizePhoneDigits } from "@/lib/phone";
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
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint app/customers`
Expected: no errors. There is no route wired to this file yet, so nothing to click-test until Task 6/7 exist — this task's check is purely static (compiles clean, exported names match what Task 6/7/8 will import).

- [ ] **Step 3: Commit**

```bash
git add app/customers/actions.ts
git commit -m "Add customer CRUD server actions with duplicate-phone block"
```

---

### Task 3: Contact log server actions

**Files:**
- Modify: `app/customers/actions.ts`

**Interfaces:**
- Consumes: `isValidDate` from `lib/customers/date.ts`, `getViewer()` (private helper already in the file from Task 2).
- Produces: `ContactFormState`, `createContact(customerId, prevState, formData)`, `deleteContact(id, customerId)`.

- [ ] **Step 1: Add the import**

At the top of `app/customers/actions.ts`, add below the existing `formatPhoneNumber` import line:

```ts
import { isValidDate } from "@/lib/customers/date";
```

- [ ] **Step 2: Append the contact actions**

Add at the end of `app/customers/actions.ts`:

```ts

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
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint app/customers`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/customers/actions.ts
git commit -m "Add contact log server actions"
```

---

### Task 4: Category management server actions

**Files:**
- Modify: `app/customers/actions.ts`

**Interfaces:**
- Produces: `createCategory(formData)`, `deleteCategory(id)`.

Categories are a simple admin-adjacent add/remove list — matches the existing `createReportBoard`/`deleteReportBoard` shape in `app/report/actions.ts` (plain `Promise<void>`, no `useActionState`, no inline error display) rather than the `CustomerFormState` pattern. `deleteCategory` keeps a server-side "still in use" guard as a safety net, but the UI (Task 9) is what actually prevents the button from being clickable when a category is in use — so no error needs to surface from this action.

- [ ] **Step 1: Append the category actions**

Add at the end of `app/customers/actions.ts`:

```ts

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
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint app/customers`
Expected: no errors. `app/customers/actions.ts` now exports: `createCustomer`, `updateCustomer`, `deleteCustomer`, `reassignOwner`, `createContact`, `deleteContact`, `createCategory`, `deleteCategory`, plus the `CustomerFormState`/`ContactFormState` types — confirm all eight function names are present (`grep "^export async function" app/customers/actions.ts` should list exactly these eight).

- [ ] **Step 3: Commit**

```bash
git add app/customers/actions.ts
git commit -m "Add category management server actions"
```

---

### Task 5: Route shell — layout and sidebar nav entry

**Files:**
- Create: `app/customers/layout.tsx`
- Modify: `components/main/app-sidebar.tsx`

**Interfaces:**
- Consumes: `AppShell` from `components/main/app-shell.tsx` (existing, unchanged).

"고객관리" is a regular nav item (every employee uses it), not an admin-only one — it goes in `NAV_LINKS`, not `ADMIN_LINKS`.

- [ ] **Step 1: Create the layout**

```tsx
import AppShell from "@/components/main/app-shell";

export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Step 2: Add the nav entry and icon**

In `components/main/app-sidebar.tsx`, add `"customers"` to the `NAV_LINKS` array (after `"인명록"`/`"직원명부"` — check the current label from the most recent rename before writing this line) and add a matching icon case.

Change:
```ts
const NAV_LINKS = [
  { label: "대시보드", href: "/dashboard", icon: "dashboard" },
  { label: "외근계획표", href: "/field-trip", icon: "trip" },
  { label: "연간 일정", href: "/schedule", icon: "calendar" },
  { label: "업무 보고", href: "/report", icon: "report" },
  { label: "직원명부", href: "/directory", icon: "directory" },
] as const;
```
to:
```ts
const NAV_LINKS = [
  { label: "대시보드", href: "/dashboard", icon: "dashboard" },
  { label: "외근계획표", href: "/field-trip", icon: "trip" },
  { label: "연간 일정", href: "/schedule", icon: "calendar" },
  { label: "업무 보고", href: "/report", icon: "report" },
  { label: "고객관리", href: "/customers", icon: "customers" },
  { label: "직원명부", href: "/directory", icon: "directory" },
] as const;
```

Then add a new case to the `NavIcon` switch (anywhere among the existing cases, e.g. right after `"report"` and before `"directory"`):

```tsx
    case "customers":
      return (
        <svg {...common} className="h-5 w-5">
          <rect x="3.5" y="5" width="17" height="13" rx="2" />
          <path d="M3.5 9.5h17" />
          <circle cx="8.5" cy="14" r="1.5" />
          <path d="M13 14h4.5" />
        </svg>
      );
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint components/main/app-sidebar.tsx`
Expected: no errors.

Manual check (no page exists at `/customers` yet, so this only confirms the sidebar itself still renders): start the dev server and confirm no console/runtime error appears on any existing page (the sidebar is global).

```bash
npm run dev &
sleep 2
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/dashboard
```
Expected: `307` (redirects to `/auth` when logged out — same as every other protected route; this just proves the sidebar file still compiles into a working page).

- [ ] **Step 4: Commit**

```bash
git add app/customers/layout.tsx components/main/app-sidebar.tsx
git commit -m "Add customers route shell and sidebar nav entry"
```

---

### Task 6: Customer list page with search, filter, sort, and pagination

**Files:**
- Create: `components/main/customers/customer-table.tsx`
- Create: `components/main/customers/customer-cards.tsx`
- Create: `components/main/customers/delete-customer-button.tsx`
- Create: `app/customers/page.tsx`

**Interfaces:**
- Consumes: `CustomerListItem` from `lib/customers/types.ts`, `deleteCustomer` from `app/customers/actions.ts`.
- Produces: default exports `CustomerTable`, `CustomerCards`, `DeleteCustomerButton` (props below) — Task 8's detail page also imports `DeleteCustomerButton`.

`CustomerTable` props: `{ customers: CustomerListItem[]; ownerMap: Map<string, string | null>; sort: string; dir: "asc" | "desc"; buildSortHref: (column: string) => string }`.
`CustomerCards` props: `{ customers: CustomerListItem[]; ownerMap: Map<string, string | null> }`.
`DeleteCustomerButton` props: `{ id: string }`.

- [ ] **Step 1: Create `components/main/customers/delete-customer-button.tsx`**

```tsx
"use client";

import { useTransition } from "react";

import { deleteCustomer } from "@/app/customers/actions";

const DeleteCustomerButton = ({ id }: { id: string }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        startTransition(() => {
          deleteCustomer(id);
        });
      }}
      className="text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
    >
      삭제
    </button>
  );
};

export default DeleteCustomerButton;
```

- [ ] **Step 2: Create `components/main/customers/customer-table.tsx`**

```tsx
import Link from "next/link";

import type { CustomerListItem } from "@/lib/customers/types";

type Props = {
  customers: CustomerListItem[];
  ownerMap: Map<string, string | null>;
  sort: string;
  dir: "asc" | "desc";
  buildSortHref: (column: string) => string;
};

const COLUMNS: { key: string; label: string }[] = [
  { key: "category", label: "구분" },
  { key: "name", label: "이름" },
  { key: "company", label: "소속" },
  { key: "phone", label: "연락처" },
  { key: "email", label: "이메일" },
];

const CustomerTable = ({ customers, ownerMap, sort, dir, buildSortHref }: Props) => {
  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-[#E7E2D2] bg-white md:block">
      <table className="w-full min-w-[860px] text-base">
        <thead>
          <tr className="border-b border-[#E7E2D2] text-left text-sm text-[#8A8270]">
            {COLUMNS.map((col) => (
              <th key={col.key} className="px-4 py-4 font-medium">
                <Link href={buildSortHref(col.key)} className="inline-flex items-center gap-1 hover:text-[#4B4739]">
                  {col.label}
                  {sort === col.key && <span>{dir === "asc" ? "▲" : "▼"}</span>}
                </Link>
              </th>
            ))}
            <th className="px-4 py-4 font-medium">담당자</th>
            <th className="px-4 py-4 font-medium" />
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-base text-[#8A8270]">
                등록된 고객이 없습니다.
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr key={customer.id} className="border-b border-[#EDE7D3] text-[#4B4739]">
                <td className="px-4 py-4">{customer.category}</td>
                <td className="px-4 py-4">
                  <Link href={`/customers/${customer.id}`} className="font-medium text-[#211D14] hover:underline">
                    {customer.name}
                  </Link>
                </td>
                <td className="px-4 py-4">{customer.company}</td>
                <td className="px-4 py-4">
                  <a href={`tel:${customer.phone}`} className="hover:text-[#0F5C56]">
                    {customer.phone}
                  </a>
                </td>
                <td className="px-4 py-4">
                  {customer.email ? (
                    <a href={`mailto:${customer.email}`} className="hover:text-[#0F5C56]">
                      {customer.email}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-4 text-[#6B6455]">{ownerMap.get(customer.owner_id ?? "") ?? "담당자 미지정"}</td>
                <td className="px-4 py-4">
                  <Link href={`/customers/${customer.id}`} className="text-sm font-medium text-[#4B4739] hover:text-[#211D14]">
                    상세
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;
```

- [ ] **Step 3: Create `components/main/customers/customer-cards.tsx`**

```tsx
import Link from "next/link";

import type { CustomerListItem } from "@/lib/customers/types";

type Props = {
  customers: CustomerListItem[];
  ownerMap: Map<string, string | null>;
};

const CustomerCards = ({ customers, ownerMap }: Props) => {
  if (customers.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E7E2D2] bg-white px-4 py-12 text-center text-base text-[#8A8270] md:hidden">
        등록된 고객이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {customers.map((customer) => (
        <Link
          key={customer.id}
          href={`/customers/${customer.id}`}
          className="block rounded-2xl border border-[#E7E2D2] bg-white p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-[#CFE3E0] bg-[#E3EFEC] px-2.5 py-0.5 text-xs font-medium text-[#0F5C56]">
              {customer.category}
            </span>
            <span className="font-semibold text-[#211D14]">{customer.name}</span>
            <span className="text-base text-[#6B6455]">{customer.company}</span>
          </div>
          <div className="mt-2 text-base text-[#4B4739]">{customer.phone}</div>
          {customer.email && <div className="text-sm text-[#8A8270]">{customer.email}</div>}
          <div className="mt-2 text-sm text-[#8A8270]">담당자: {ownerMap.get(customer.owner_id ?? "") ?? "미지정"}</div>
        </Link>
      ))}
    </div>
  );
};

export default CustomerCards;
```

- [ ] **Step 4: Create `app/customers/page.tsx`**

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import CustomerTable from "@/components/main/customers/customer-table";
import CustomerCards from "@/components/main/customers/customer-cards";

const PAGE_SIZE = 25;
const SORTABLE_COLUMNS = ["category", "name", "company", "phone", "email", "created_at"] as const;
type SortColumn = (typeof SORTABLE_COLUMNS)[number];

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string | string[];
    sort?: string;
    dir?: string;
    page?: string;
  }>;
};

export default async function CustomersPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const selectedCategories = params.category
    ? Array.isArray(params.category)
      ? params.category
      : [params.category]
    : [];
  const sort: SortColumn = (SORTABLE_COLUMNS as readonly string[]).includes(params.sort ?? "")
    ? (params.sort as SortColumn)
    : "created_at";
  const dir: "asc" | "desc" = params.dir === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(params.page) || 1);

  const { data: categoryRows } = await supabase
    .from("customer_categories")
    .select("id, label")
    .order("sort_order", { ascending: true });
  const categories = categoryRows ?? [];

  let query = supabase
    .from("customers")
    .select("id, owner_id, category, name, company, phone, email, memo, created_at", { count: "exact" });

  if (q) {
    const safeQ = q.replace(/[,()]/g, " ").trim();
    if (safeQ) {
      query = query.or(`name.ilike.%${safeQ}%,company.ilike.%${safeQ}%,phone.ilike.%${safeQ}%,email.ilike.%${safeQ}%`);
    }
  }
  if (selectedCategories.length > 0) {
    query = query.in("category", selectedCategories);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.order(sort, { ascending: dir === "asc" }).range(from, to);

  const { data: rows, count } = await query;
  const customers = rows ?? [];

  const ownerIds = Array.from(new Set(customers.map((c) => c.owner_id).filter((id): id is string => !!id)));
  const { data: owners } =
    ownerIds.length > 0 ? await supabase.from("users").select("id, name, email").in("id", ownerIds) : { data: [] };
  const ownerMap = new Map((owners ?? []).map((o) => [o.id, o.name ?? o.email]));

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  for (const c of selectedCategories) baseParams.append("category", c);

  const buildSortHref = (column: string) => {
    const p = new URLSearchParams(baseParams);
    p.set("sort", column);
    p.set("dir", sort === column && dir === "asc" ? "desc" : "asc");
    return `/customers?${p.toString()}`;
  };

  const buildPageHref = (targetPage: number) => {
    const p = new URLSearchParams(baseParams);
    p.set("sort", sort);
    p.set("dir", dir);
    p.set("page", String(targetPage));
    return `/customers?${p.toString()}`;
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#211D14]">고객관리</h1>
          <p className="mt-1 text-base text-[#6B6455]">전 직원이 등록한 고객을 함께 확인하고, 본인이 등록한 고객을 관리하세요.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/customers/categories"
            className="rounded-lg border border-[#E7E2D2] bg-white px-4 py-2 text-base font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
          >
            구분 관리
          </Link>
          <Link
            href="/customers/new"
            className="rounded-lg bg-[#0F5C56] px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45]"
          >
            + 고객 등록
          </Link>
        </div>
      </div>

      <form method="get" className="mb-4 space-y-3 rounded-2xl border border-[#E7E2D2] bg-white p-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="이름, 소속, 연락처, 이메일로 검색"
          className="w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none placeholder:text-[#B9B29B]"
        />
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-1.5 text-sm text-[#4B4739]">
                <input type="checkbox" name="category" value={c.label} defaultChecked={selectedCategories.includes(c.label)} />
                {c.label}
              </label>
            ))}
          </div>
        )}
        <button
          type="submit"
          className="rounded-lg bg-[#0F5C56] px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45]"
        >
          검색
        </button>
      </form>

      <div className="space-y-3">
        <CustomerTable customers={customers} ownerMap={ownerMap} sort={sort} dir={dir} buildSortHref={buildSortHref} />
        <CustomerCards customers={customers} ownerMap={ownerMap} />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-[#6B6455]">
        <span>
          총 {totalCount}명 중 {customers.length === 0 ? 0 : from + 1}–{Math.min(to + 1, totalCount)}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={buildPageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={`rounded-lg border border-[#E7E2D2] bg-white px-3 py-1.5 ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-[#F5F3EA]"}`}
          >
            이전
          </Link>
          <span>
            {page} / {totalPages}
          </span>
          <Link
            href={buildPageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={`rounded-lg border border-[#E7E2D2] bg-white px-3 py-1.5 ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-[#F5F3EA]"}`}
          >
            다음
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint app/customers components/main/customers`
Expected: no errors.

Manual check:
```bash
npm run dev &
sleep 2
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/customers"
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/customers?q=test&category=지인소개&sort=name&dir=asc&page=1"
```
Expected: both `307` (redirect to `/auth`, logged out) — confirms the route compiles and the searchParams parsing doesn't throw before the auth check even runs.

- [ ] **Step 6: Commit**

```bash
git add components/main/customers/customer-table.tsx components/main/customers/customer-cards.tsx components/main/customers/delete-customer-button.tsx app/customers/page.tsx
git commit -m "Add customer list page with search, filter, sort, pagination"
```

---

### Task 7: Customer create/edit form and pages

**Files:**
- Create: `components/main/customers/customer-form.tsx`
- Create: `app/customers/new/page.tsx`
- Create: `app/customers/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `CustomerFormState`, `createCustomer`, `updateCustomer` from `app/customers/actions.ts`; `Customer`, `CustomerCategory` from `lib/customers/types.ts`.
- Produces: `CustomerForm` default export, props `{ mode: "create" | "edit"; action: (state: CustomerFormState, formData: FormData) => Promise<CustomerFormState>; categories: CustomerCategory[]; customer?: Customer }`.

- [ ] **Step 1: Create `components/main/customers/customer-form.tsx`**

```tsx
"use client";

import { useActionState, type ReactNode } from "react";
import Link from "next/link";

import type { CustomerFormState } from "@/app/customers/actions";
import type { Customer, CustomerCategory } from "@/lib/customers/types";

const inputCls =
  "w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2.5 text-base text-[#211D14] outline-none transition-colors focus:border-[#0F5C56]";

type Props = {
  mode: "create" | "edit";
  action: (state: CustomerFormState, formData: FormData) => Promise<CustomerFormState>;
  categories: CustomerCategory[];
  customer?: Customer;
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-base font-medium text-[#4B4739]">{label}</label>
    {children}
  </div>
);

const CustomerForm = ({ mode, action, categories, customer }: Props) => {
  const [state, formAction, isPending] = useActionState(action, null);
  const listHref = customer ? `/customers/${customer.id}` : "/customers";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#211D14]">{mode === "create" ? "고객 등록" : "고객 정보 수정"}</h1>
      </div>

      <form action={formAction} className="max-w-2xl space-y-5 rounded-2xl border border-[#E7E2D2] bg-white p-6">
        <Field label="구분">
          <select name="category" defaultValue={customer?.category ?? ""} required className={inputCls}>
            <option value="" disabled>
              선택하세요
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="mt-1 text-sm text-red-600">
              등록된 구분이 없습니다.{" "}
              <Link href="/customers/categories" className="underline">
                구분 관리
              </Link>
              에서 먼저 추가해주세요.
            </p>
          )}
        </Field>

        <Field label="이름">
          <input name="name" defaultValue={customer?.name ?? ""} required className={inputCls} />
        </Field>

        <Field label="소속">
          <input name="company" defaultValue={customer?.company ?? ""} required placeholder="회사명" className={inputCls} />
        </Field>

        <Field label="연락처">
          <input name="phone" defaultValue={customer?.phone ?? ""} required placeholder="예) 01012345678" className={inputCls} />
        </Field>

        <Field label="이메일">
          <input name="email" type="email" defaultValue={customer?.email ?? ""} className={inputCls} />
        </Field>

        <Field label="메모">
          <textarea name="memo" defaultValue={customer?.memo ?? ""} rows={4} className={inputCls} />
        </Field>

        {state?.error && <p className="text-base text-red-600">{state.error}</p>}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[#0F5C56] px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "저장 중..." : mode === "create" ? "등록" : "수정하기"}
          </button>
          <Link href={listHref} className="text-base text-[#6B6455] transition-colors hover:text-[#211D14]">
            목록으로
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
```

- [ ] **Step 2: Create `app/customers/new/page.tsx`**

```tsx
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createCustomer } from "@/app/customers/actions";
import CustomerForm from "@/components/main/customers/customer-form";

export default async function NewCustomerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: categories } = await supabase
    .from("customer_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return <CustomerForm mode="create" action={createCustomer} categories={categories ?? []} />;
}
```

- [ ] **Step 3: Create `app/customers/[id]/edit/page.tsx`**

```tsx
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { updateCustomer } from "@/app/customers/actions";
import CustomerForm from "@/components/main/customers/customer-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCustomerPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  const { data: customer } = await supabase.from("customers").select("*").eq("id", id).single();
  if (!customer) notFound();
  if (customer.owner_id !== user.id && !isAdmin) redirect(`/customers/${id}`);

  const { data: categories } = await supabase
    .from("customer_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const boundUpdate = updateCustomer.bind(null, id);

  return <CustomerForm mode="edit" action={boundUpdate} categories={categories ?? []} customer={customer} />;
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint app/customers components/main/customers`
Expected: no errors.

Manual check:
```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/customers/new"
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/customers/00000000-0000-0000-0000-000000000000/edit"
```
Expected: both `307` (redirect to `/auth`, logged out).

- [ ] **Step 5: Commit**

```bash
git add components/main/customers/customer-form.tsx app/customers/new/page.tsx "app/customers/[id]/edit/page.tsx"
git commit -m "Add customer create/edit form and pages"
```

---

### Task 8: Customer detail page — contact log and admin owner reassignment

**Files:**
- Create: `components/main/customers/delete-contact-button.tsx`
- Create: `components/main/customers/contact-log.tsx`
- Create: `components/main/customers/reassign-owner-form.tsx`
- Create: `app/customers/[id]/page.tsx`

**Interfaces:**
- Consumes: `createContact`, `deleteContact`, `reassignOwner` from `app/customers/actions.ts`; `DeleteCustomerButton` from Task 6; `CustomerContact` from `lib/customers/types.ts`.
- Produces: `ContactLog` (props `{ customerId: string; contacts: CustomerContact[]; viewerId: string; isAdmin: boolean }`), `ReassignOwnerForm` (props `{ customerId: string; employees: { id: string; name: string | null; email: string }[]; currentOwnerId: string | null }`), `DeleteContactButton` (props `{ id: string; customerId: string }`).

- [ ] **Step 1: Create `components/main/customers/delete-contact-button.tsx`**

```tsx
"use client";

import { useTransition } from "react";

import { deleteContact } from "@/app/customers/actions";

const DeleteContactButton = ({ id, customerId }: { id: string; customerId: string }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("이 연락 기록을 삭제하시겠습니까?")) return;
        startTransition(() => {
          deleteContact(id, customerId);
        });
      }}
      className="shrink-0 text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
    >
      삭제
    </button>
  );
};

export default DeleteContactButton;
```

- [ ] **Step 2: Create `components/main/customers/contact-log.tsx`**

```tsx
"use client";

import { useActionState } from "react";

import { createContact } from "@/app/customers/actions";
import type { CustomerContact } from "@/lib/customers/types";
import DeleteContactButton from "./delete-contact-button";

const METHODS = ["문자", "전화", "이메일", "방문", "기타"] as const;

type Props = {
  customerId: string;
  contacts: CustomerContact[];
  viewerId: string;
  isAdmin: boolean;
};

const ContactLog = ({ customerId, contacts, viewerId, isAdmin }: Props) => {
  const boundCreate = createContact.bind(null, customerId);
  const [state, formAction, isPending] = useActionState(boundCreate, null);

  return (
    <div className="rounded-2xl border border-[#E7E2D2] bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-[#211D14]">연락 기록</h2>

      <form action={formAction} className="mb-5 space-y-3 rounded-xl border border-[#E7E2D2] bg-[#FAF8F0] p-4">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            name="contact_date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none focus:border-[#0F5C56]"
          />
          <select
            name="method"
            required
            defaultValue=""
            className="rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none focus:border-[#0F5C56]"
          >
            <option value="" disabled>
              연락 방법
            </option>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <input
          name="memo"
          placeholder="메모 (선택)"
          className="w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none focus:border-[#0F5C56]"
        />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#0F5C56] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0C4A45] disabled:opacity-60"
        >
          {isPending ? "저장 중..." : "기록 추가"}
        </button>
      </form>

      {contacts.length === 0 ? (
        <p className="text-base text-[#8A8270]">아직 연락 기록이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {contacts.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-3 border-b border-[#EDE7D3] pb-2 last:border-b-0">
              <div>
                <span className="text-sm font-medium text-[#211D14]">{c.contact_date}</span>{" "}
                <span className="text-sm text-[#0F5C56]">{c.method}</span>
                {c.memo && <p className="mt-0.5 text-sm text-[#6B6455]">{c.memo}</p>}
              </div>
              {(isAdmin || c.created_by === viewerId) && <DeleteContactButton id={c.id} customerId={customerId} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContactLog;
```

- [ ] **Step 3: Create `components/main/customers/reassign-owner-form.tsx`**

```tsx
"use client";

import { reassignOwner } from "@/app/customers/actions";

type Props = {
  customerId: string;
  employees: { id: string; name: string | null; email: string }[];
  currentOwnerId: string | null;
};

const ReassignOwnerForm = ({ customerId, employees, currentOwnerId }: Props) => {
  const boundReassign = reassignOwner.bind(null, customerId);

  return (
    <form action={boundReassign} className="flex flex-col gap-2">
      <select
        name="owner_id"
        defaultValue={currentOwnerId ?? ""}
        className="rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none focus:border-[#0F5C56]"
      >
        <option value="">담당자 미지정</option>
        {employees.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name ?? e.email}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-sm font-medium text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
      >
        저장
      </button>
    </form>
  );
};

export default ReassignOwnerForm;
```

- [ ] **Step 4: Create `app/customers/[id]/page.tsx`**

```tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import DeleteCustomerButton from "@/components/main/customers/delete-customer-button";
import ContactLog from "@/components/main/customers/contact-log";
import ReassignOwnerForm from "@/components/main/customers/reassign-owner-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  const { data: customer } = await supabase.from("customers").select("*").eq("id", id).single();
  if (!customer) notFound();

  const canManage = isAdmin || customer.owner_id === user.id;

  const ownerRow = customer.owner_id
    ? (await supabase.from("users").select("name, email").eq("id", customer.owner_id).single()).data
    : null;

  const { data: contacts } = await supabase
    .from("customer_contacts")
    .select("*")
    .eq("customer_id", id)
    .order("contact_date", { ascending: false })
    .order("created_at", { ascending: false });

  let employees: { id: string; name: string | null; email: string }[] = [];
  if (isAdmin) {
    const { data } = await supabase.from("users").select("id, name, email").order("email", { ascending: true });
    employees = data ?? [];
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/customers" className="text-sm text-[#8A8270] transition-colors hover:text-[#4B4739]">
            ← 고객 목록
          </Link>
          <h1 className="mt-1 text-3xl font-bold text-[#211D14]">{customer.name}</h1>
          <p className="mt-1 text-base text-[#6B6455]">{customer.company}</p>
        </div>
        {canManage && (
          <div className="flex items-center gap-3">
            <Link
              href={`/customers/${id}/edit`}
              className="rounded-lg border border-[#E7E2D2] bg-white px-4 py-2 text-base font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
            >
              수정
            </Link>
            <DeleteCustomerButton id={id} />
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E7E2D2] bg-white p-6">
            <dl className="space-y-3">
              <Row label="구분" value={customer.category} />
              <Row label="연락처" value={customer.phone} href={`tel:${customer.phone}`} />
              <Row label="이메일" value={customer.email || "-"} href={customer.email ? `mailto:${customer.email}` : undefined} />
              <Row label="메모" value={customer.memo || "-"} />
              <Row label="담당자" value={ownerRow?.name ?? ownerRow?.email ?? "담당자 미지정"} />
            </dl>
          </div>

          <ContactLog customerId={id} contacts={contacts ?? []} viewerId={user.id} isAdmin={isAdmin} />
        </div>

        {isAdmin && (
          <div className="rounded-2xl border border-[#E7E2D2] bg-white p-5">
            <h2 className="mb-3 text-base font-semibold text-[#211D14]">담당자 변경</h2>
            <ReassignOwnerForm customerId={id} employees={employees} currentOwnerId={customer.owner_id} />
          </div>
        )}
      </div>
    </div>
  );
}

const Row = ({ label, value, href }: { label: string; value: string; href?: string }) => (
  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
    <dt className="w-16 shrink-0 text-base text-[#6B6455]">{label}</dt>
    <dd className="text-base text-[#211D14]">
      {href ? (
        <a href={href} className="hover:text-[#0F5C56]">
          {value}
        </a>
      ) : (
        value
      )}
    </dd>
  </div>
);
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint app/customers components/main/customers`
Expected: no errors.

Manual check:
```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/customers/00000000-0000-0000-0000-000000000000"
```
Expected: `307` (redirect to `/auth`, logged out).

- [ ] **Step 6: Commit**

```bash
git add components/main/customers/delete-contact-button.tsx components/main/customers/contact-log.tsx components/main/customers/reassign-owner-form.tsx "app/customers/[id]/page.tsx"
git commit -m "Add customer detail page with contact log and owner reassignment"
```

---

### Task 9: Category management page

**Files:**
- Create: `components/main/customers/delete-category-button.tsx`
- Create: `app/customers/categories/page.tsx`

**Interfaces:**
- Consumes: `createCategory`, `deleteCategory` from `app/customers/actions.ts`.
- Produces: `DeleteCategoryButton` (props `{ id: string; label: string }`).

The page decides whether to render `DeleteCategoryButton` at all (only when a category's usage count is 0) — this is what makes the "사용 중인 값 보호" rule visible, instead of a delete attempt silently failing.

- [ ] **Step 1: Create `components/main/customers/delete-category-button.tsx`**

```tsx
"use client";

import { useTransition } from "react";

import { deleteCategory } from "@/app/customers/actions";

const DeleteCategoryButton = ({ id, label }: { id: string; label: string }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`"${label}" 구분을 삭제하시겠습니까?`)) return;
        startTransition(() => {
          deleteCategory(id);
        });
      }}
      className="text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
    >
      삭제
    </button>
  );
};

export default DeleteCategoryButton;
```

- [ ] **Step 2: Create `app/customers/categories/page.tsx`**

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createCategory } from "@/app/customers/actions";
import DeleteCategoryButton from "@/components/main/customers/delete-category-button";

export default async function CustomerCategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  const { data: categories } = await supabase
    .from("customer_categories")
    .select("id, label, sort_order")
    .order("sort_order", { ascending: true });

  const { data: customerRows } = await supabase.from("customers").select("category");
  const usageCount = new Map<string, number>();
  for (const row of customerRows ?? []) {
    usageCount.set(row.category, (usageCount.get(row.category) ?? 0) + 1);
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/customers" className="text-sm text-[#8A8270] transition-colors hover:text-[#4B4739]">
          ← 고객 목록
        </Link>
        <h1 className="mt-1 text-3xl font-bold text-[#211D14]">구분 관리</h1>
        <p className="mt-1 text-base text-[#6B6455]">고객 등록 시 선택하는 구분(유입경로) 값을 관리합니다.</p>
      </div>

      <form
        action={createCategory}
        className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-[#E7E2D2] bg-white p-4"
      >
        <input
          name="label"
          required
          placeholder="예) 지인소개, 웹사이트, 전시회"
          className="min-w-0 flex-1 rounded-lg border border-[#E7E2D2] bg-white px-3 py-2 text-base text-[#211D14] outline-none focus:border-[#0F5C56]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[#0F5C56] px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45]"
        >
          추가
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-[#E7E2D2] bg-white">
        {(categories ?? []).length === 0 ? (
          <div className="px-4 py-12 text-center text-base text-[#8A8270]">등록된 구분이 없습니다.</div>
        ) : (
          <ul className="divide-y divide-[#EDE7D3]">
            {(categories ?? []).map((c) => {
              const count = usageCount.get(c.label) ?? 0;
              return (
                <li key={c.id} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-base text-[#211D14]">{c.label}</span>
                  {count > 0 ? (
                    <span className="text-sm text-[#8A8270]">사용 중 · {count}건</span>
                  ) : isAdmin ? (
                    <DeleteCategoryButton id={c.id} label={c.label} />
                  ) : (
                    <span className="text-sm text-[#8A8270]">미사용</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint app/customers components/main/customers`
Expected: no errors.

Manual check:
```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/customers/categories"
```
Expected: `307` (redirect to `/auth`, logged out).

- [ ] **Step 4: Commit**

```bash
git add components/main/customers/delete-category-button.tsx app/customers/categories/page.tsx
git commit -m "Add customer category management page"
```

---

### Task 10: Full integration check

**Files:** none (verification only).

- [ ] **Step 1: Type-check and lint the whole feature**

```bash
npx tsc --noEmit -p tsconfig.json
npx eslint app/customers components/main/customers components/main/app-sidebar.tsx lib/customers lib/phone.ts lib/supabase/types.ts
```
Expected: no errors from either command.

- [ ] **Step 2: Route smoke test (logged out — every route must redirect, none may 500)**

```bash
npm run dev &
sleep 3
for p in /customers /customers/new /customers/categories "/customers/00000000-0000-0000-0000-000000000000" "/customers/00000000-0000-0000-0000-000000000000/edit"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$p")
  echo "$p -> $code"
done
```
Expected: every line prints `307`. If any line prints `500`, read the dev server log for the stack trace before continuing — that means Task 0's migration likely wasn't applied yet, or a column/type name in `app/customers/actions.ts` doesn't match Task 1's hand-authored types.

- [ ] **Step 3: Manual logged-in walkthrough (ask the user to do this, or do it yourself if you have credentials)**

Checklist to confirm against the spec:
1. Visit `/customers/categories`, add a category (e.g. "지인소개") — the bootstrapping step, since customer registration needs at least one category to exist first.
2. Visit `/customers/new`, register a customer with a phone number.
3. Log in as a second employee (or have the admin do it), try registering a customer with the **same** phone number → must show "이미 OOO님이 등록한 연락처입니다." and refuse to save, even as an admin.
4. As a non-owning, non-admin employee, visit that customer's detail page → confirm it's visible (shared read) but "수정"/"삭제" are not shown.
5. As an admin, open the same customer detail page → confirm "담당자 변경" panel appears, reassign to a different employee, confirm it saved.
6. Add a few connect-the-dots checks: click-to-call (`tel:`) and click-to-email (`mailto:`) links render with the right `href`; mobile viewport shows `CustomerCards` instead of `CustomerTable`.
7. In `/admin/logs`, confirm `CREATE_CUSTOMER`, `UPDATE_CUSTOMER`, `DELETE_CUSTOMER`, `REASSIGN_CUSTOMER_OWNER`, `CREATE_CUSTOMER_CONTACT`, `DELETE_CUSTOMER_CONTACT` entries show up for the actions taken above.

- [ ] **Step 4: Commit** (only if Step 3 surfaced fixes; otherwise this task has nothing to commit)

```bash
git add -A
git commit -m "Fix issues found in customer management integration walkthrough"
```
