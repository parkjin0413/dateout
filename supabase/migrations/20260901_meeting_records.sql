-- 현장 협의록 (양식 문서 작성 메뉴)
-- 현장에서 담당자와 협의한 내용을 기록해 추후 협의 내용이 틀어지지 않도록 남기는 증거 자료.
-- 상대방 서명은 받지 않고, 우리 직원 결재선으로만 확인한다. 사진/도면은 별도 보관하고
-- 문서에는 촬영/첨부 여부만 체크박스로 표시한다.
create table if not exists public.meeting_records (
  id uuid primary key default gen_random_uuid(),
  doc_number text not null unique,
  drafter_id uuid not null references auth.users(id) on delete cascade,
  drafter_name text not null,
  department text not null default '',
  drafted_at date not null,
  site_name text not null,
  meeting_date date not null,
  location text not null default '',
  counterpart_name text not null default '',
  counterpart_org text not null default '',
  items jsonb not null default '[]'::jsonb, -- [{category, content, note}]
  photo_taken boolean not null default false,
  drawing_attached boolean not null default false,
  approvers jsonb not null default '[]'::jsonb, -- [{order, user_id, name, job_title}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meeting_records_drafter_id_idx
  on public.meeting_records (drafter_id);

alter table public.meeting_records enable row level security;

-- 본인이 기안한 문서만 읽기/쓰기 가능, 관리자는 전체 열람 가능
create policy "read own meeting_records" on public.meeting_records
  for select to authenticated using (drafter_id = auth.uid() or is_admin());
create policy "insert own meeting_records" on public.meeting_records
  for insert to authenticated with check (drafter_id = auth.uid());
create policy "update own meeting_records" on public.meeting_records
  for update to authenticated
  using (drafter_id = auth.uid() or is_admin())
  with check (drafter_id = auth.uid() or is_admin());
create policy "delete own meeting_records" on public.meeting_records
  for delete to authenticated using (drafter_id = auth.uid() or is_admin());
