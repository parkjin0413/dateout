-- 지출/연차/회의록 등 양식 문서의 결재자 선택 목록은 users 테이블을 조회하는데,
-- 기존 users 테이블 SELECT 정책이 "본인 행 + 관리자 행"만 허용하고 있어
-- 일반 직원으로 로그인하면 결재자 후보로 관리자만 보이는 문제가 있었다.
-- employees 테이블(주소록)은 이미 전 직원 조회가 가능하므로, users 테이블도
-- 동일하게 로그인한 모든 직원이 조회할 수 있도록 permissive 정책을 하나 추가한다.
-- (기존 정책은 그대로 두고 추가만 하는 것이라 안전하다 — Postgres RLS의 permissive
-- 정책은 OR로 합쳐지므로 이 정책이 더해지면 접근 범위만 넓어진다.)
create policy "authenticated users can read all users" on public.users
  for select
  to authenticated
  using (true);
