-- 지출결의서(양식 문서 작성) 기능

-- 1. 개인 도장 이미지 경로
alter table public.users
  add column if not exists stamp_path text;

-- 2. 지출결의서
create table if not exists public.expense_reports (
  id uuid primary key default gen_random_uuid(),
  doc_number text not null unique,
  drafter_id uuid not null references auth.users(id) on delete cascade,
  drafter_name text not null,
  department text not null default '',
  drafted_at date not null,
  title text not null,
  items jsonb not null default '[]'::jsonb, -- [{date, description, vendor, amount}]
  total_amount numeric not null default 0,
  vat_mode text not null check (vat_mode in ('포함', '별도')),
  payment_method text not null check (payment_method in ('법인카드', '개인카드(후결제)', '계좌이체', '현금', '기타')),
  vendor_basis text not null default '',
  attachments jsonb not null default '[]'::jsonb, -- [{path, filename}]
  approvers jsonb not null default '[]'::jsonb, -- [{order, user_id, name, job_title}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expense_reports_drafter_id_idx
  on public.expense_reports (drafter_id);

alter table public.expense_reports enable row level security;

-- 본인이 기안한 문서만 읽기/쓰기 가능, 관리자는 전체 열람 가능
create policy "read own expense_reports" on public.expense_reports
  for select to authenticated using (drafter_id = auth.uid() or is_admin());
create policy "insert own expense_reports" on public.expense_reports
  for insert to authenticated with check (drafter_id = auth.uid());
create policy "update own expense_reports" on public.expense_reports
  for update to authenticated
  using (drafter_id = auth.uid() or is_admin())
  with check (drafter_id = auth.uid() or is_admin());
create policy "delete own expense_reports" on public.expense_reports
  for delete to authenticated using (drafter_id = auth.uid() or is_admin());

-- 3. 스토리지 버킷: 개인 도장, 지출 증빙 (둘 다 비공개, signed URL로만 접근)
insert into storage.buckets (id, name, public)
values ('stamps', 'stamps', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('expense-attachments', 'expense-attachments', false)
on conflict (id) do nothing;

-- stamps 버킷: 파일 경로가 "{auth.uid()}/..." 형태이므로 본인 폴더만 읽기/쓰기/삭제 가능
create policy "read own stamp" on storage.objects
  for select to authenticated
  using (bucket_id = 'stamps' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "upload own stamp" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'stamps' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "delete own stamp" on storage.objects
  for delete to authenticated
  using (bucket_id = 'stamps' and (storage.foldername(name))[1] = auth.uid()::text);

-- expense-attachments 버킷: 경로가 "{drafter_id}/{report_id}/..." 형태이므로 본인 폴더만 접근
create policy "read own expense attachment" on storage.objects
  for select to authenticated
  using (bucket_id = 'expense-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "upload own expense attachment" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'expense-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "delete own expense attachment" on storage.objects
  for delete to authenticated
  using (bucket_id = 'expense-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
