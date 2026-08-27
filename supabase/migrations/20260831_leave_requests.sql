-- 연차신청서 (양식 문서 작성 메뉴)
create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  doc_number text not null unique,
  drafter_id uuid not null references auth.users(id) on delete cascade,
  drafter_name text not null,
  department text not null default '',
  drafted_at date not null,
  start_date date not null,
  end_date date not null,
  days numeric not null check (days > 0),
  leave_type text not null check (leave_type in ('연차', '오전반차', '오후반차', '병가', '경조휴가', '공가', '기타', '연차+오전반차', '오후반차+연차')),
  reason text not null default '',
  approvers jsonb not null default '[]'::jsonb, -- [{order, user_id, name, job_title}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leave_requests_drafter_id_idx
  on public.leave_requests (drafter_id);

alter table public.leave_requests enable row level security;

-- 본인이 기안한 문서만 읽기/쓰기 가능, 관리자는 전체 열람 가능
create policy "read own leave_requests" on public.leave_requests
  for select to authenticated using (drafter_id = auth.uid() or is_admin());
create policy "insert own leave_requests" on public.leave_requests
  for insert to authenticated with check (drafter_id = auth.uid());
create policy "update own leave_requests" on public.leave_requests
  for update to authenticated
  using (drafter_id = auth.uid() or is_admin())
  with check (drafter_id = auth.uid() or is_admin());
create policy "delete own leave_requests" on public.leave_requests
  for delete to authenticated using (drafter_id = auth.uid() or is_admin());
