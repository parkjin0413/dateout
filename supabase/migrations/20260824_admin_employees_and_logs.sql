-- 1. users 테이블에 직원 관리용 컬럼 추가 (부서/직급/전화번호)
alter table public.users
  add column if not exists department text not null default '',
  add column if not exists job_title text not null default '',
  add column if not exists phone text not null default '';

-- 2. 감사 로그 테이블
-- RLS만 켜고 정책은 만들지 않습니다. 즉 service role key로만 읽고 쓸 수 있고,
-- 일반 로그인 사용자(anon/authenticated)는 이 테이블에 전혀 접근할 수 없습니다.
-- 앱 쪽에서는 관리자 여부를 먼저 확인한 서버 코드만 service role로 이 테이블을 다룹니다.
create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('info', 'error')),
  action text not null,
  message text not null,
  actor_id uuid,
  actor_name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.logs enable row level security;

create index if not exists logs_created_at_idx on public.logs (created_at desc);
