-- 근무지(사업장)가 3곳으로 나뉘어 있으므로 직원 계정과 직원명부에 근무지 컬럼을 추가합니다.
alter table public.users
  add column if not exists work_location text not null default '';

alter table public.employees
  add column if not exists work_location text not null default '';
