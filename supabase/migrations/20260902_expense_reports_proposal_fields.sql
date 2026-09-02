-- 지출결의서를 품의서 양식으로 개편: 결제방법/선정기준 제거, 협의처·지시사항 추가

alter table public.expense_reports
  drop constraint if exists expense_reports_payment_method_check,
  drop column if exists payment_method,
  drop column if exists vendor_basis;

alter table public.expense_reports
  add column if not exists consultations jsonb not null default '[]'::jsonb, -- [{department}]
  add column if not exists instructions text not null default '';
