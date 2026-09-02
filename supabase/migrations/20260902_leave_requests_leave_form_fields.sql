-- 연차신청서를 휴가신청서 양식으로 개편: 업무 대행자, 연차/대체휴가 잔여일수 표 추가

alter table public.leave_requests
  add column if not exists substitute_job_title text not null default '',
  add column if not exists substitute_name text not null default '',
  add column if not exists leave_balance jsonb not null default '{}'::jsonb; -- {annual:{total,priorUsed,used,remaining}, substitute:{...}}
