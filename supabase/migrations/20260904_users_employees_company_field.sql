-- 법인(소속)이 여러 개이므로 직원 계정과 직원명부에 소속 컬럼을 추가합니다.
alter table public.users
  add column if not exists company text not null default '';

alter table public.employees
  add column if not exists company text not null default '';
