-- VAT 포함/별도 선택 항목 제거 (VAT는 필요 시 품목명/금액에 직접 표기)
alter table public.expense_reports
  drop column if exists vat_mode;
