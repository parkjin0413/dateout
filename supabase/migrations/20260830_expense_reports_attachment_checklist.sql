-- 증빙 첨부를 파일 업로드 대신 체크리스트 방식으로 변경
-- (실제 증빙 서류는 인쇄물 뒤에 별도로 첨부하는 방식이라 파일을 올리지 않는다)
-- 각 체크박스는 서로 독립적이라 여러 개를 동시에 체크할 수 있고, "기타"는
-- 별도의 자유 입력 텍스트 컬럼으로 관리한다.
-- 기존 attachments 컬럼(업로드 파일 경로)은 과거 데이터 보존을 위해 그대로 둔다.
alter table public.expense_reports
  add column if not exists attachment_types jsonb not null default '[]'::jsonb,
  add column if not exists attachment_other text not null default '';
