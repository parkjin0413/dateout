-- 지출결의서에 "내용"(기안 사유) 필드 추가
alter table public.expense_reports
  add column if not exists content text not null default '';
