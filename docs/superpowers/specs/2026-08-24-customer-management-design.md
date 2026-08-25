# 고객관리(Customer Management) 설계 문서

- 작성일: 2026-08-24
- 롤백 체크포인트: git tag `pre-customer-management` (commit c6a9d30)
- 상태: 1단계(핵심) 범위 확정, 구현 계획 수립 전 검토 대기

## 배경

기존에 별도로 만든 1인 영업용 CRM 사이트(공유 비밀번호 인증, 소유권 개념 없음)의 기능을
dateout(강산 업무지원)에 이식한다. dateout은 직원별 개별 계정 체제이므로, 원본 사이트의
"소유권 없음" 모델을 dateout의 소유권 모델(부서/일정/외근/업무보고 전반에 이미 쓰이는
"본인 또는 관리자만 수정" 패턴)에 맞게 재설계한다.

원본 사이트 기능 명세(13개 영역)는 범위가 커서, 기존 코드 패턴만으로 인프라 추가 없이
구현 가능한 항목을 1단계로 분리했다. 명함 사진(Storage 버킷 필요), 엑셀 일괄등록/내보내기
(새 라이브러리 필요), 통계 대시보드, 일괄 작업은 1단계 완료 후 별도로 진행한다.

## 요구사항 (확정)

- 전 직원이 모든 고객을 열람할 수 있다.
- 고객마다 담당자(등록한 직원)가 있고, 담당자 본인 또는 관리자만 수정·삭제할 수 있다.
- 같은 연락처가 서로 다른 직원에 의해 중복 등록될 수 없다 — **완전 차단, 관리자도 우회 불가**.
- 담당자 직원의 로그인 계정이 삭제돼도 그 직원이 등록한 고객 데이터는 남아 있는다
  (담당자만 미지정 상태가 됨). 관리자가 다른 직원에게 수동으로 재배정할 수 있다.
- 즐겨찾기 기능은 제외한다 (2026-08-24 결정, 원본 명세에는 있었으나 이번 이식에서 뺌).

## 데이터 모델

### `customers`

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid pk | |
| owner_id | uuid, `references auth.users(id) on delete set null` | 담당자. 계정 삭제 시 null로 남고 고객 행 자체는 삭제되지 않음 |
| category | text not null | 구분(유입경로). `customer_categories.label` 중에서 선택 — DB FK는 걸지 않고(구분 값 변경/삭제 이력을 유연하게 다루기 위해) 서버 액션에서 관리 목록에 있는 값인지 검증 |
| name | text not null | 이름 |
| company | text not null | 소속 |
| phone | text not null | 화면 표시용 연락처 (하이픈 포함 형태로 정규화해 저장) |
| phone_normalized | text not null | 숫자만 남긴 값. **unique 인덱스** — 중복 등록 차단의 실제 메커니즘 |
| email | text not null default '' | 선택 |
| memo | text not null default '' | 선택 |
| created_at | timestamptz not null default now() | |
| updated_at | timestamptz not null default now() | |

인덱스: `unique index on customers (phone_normalized)`.

### `customer_contacts` (고객 1명당 여러 건)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid pk | |
| customer_id | uuid, `references customers(id) on delete cascade` | |
| contact_date | date not null | |
| method | text not null, `check (method in ('문자','전화','이메일','방문','기타'))` | |
| memo | text not null default '' | |
| created_by | uuid, `references auth.users(id) on delete set null` | 기록을 남긴 직원 |
| created_at | timestamptz not null default now() | |

### `customer_categories` (구분 관리)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid pk | |
| label | text not null unique | |
| sort_order | int not null default 0 | |
| created_at | timestamptz not null default now() | |

삭제 시 `customers.category`에서 사용 중인 값이면 서버 액션에서 막는다 (원본 명세의
"사용 중인 값 보호"를 그대로 유지).

### RLS

schedules/field_trips 등 기존 테이블과 동일한 방식을 따른다: RLS는 인증된 사용자에게
넓게 열어두고, "본인 또는 관리자만 수정/삭제" 판단은 서버 액션 코드에서 수행한다
(`app/schedule/actions.ts`의 `existing.user_id !== userId && !isAdmin` 패턴 재사용).
새 테이블에 service role key나 관리자 클라이언트는 필요 없다.

## 권한 모델

| 동작 | 누가 |
|---|---|
| 조회 | 전 직원 |
| 등록 | 전 직원 (등록한 사람이 자동으로 담당자가 됨) |
| 수정/삭제 | 담당자 본인 또는 관리자 |
| 연락 기록 추가/삭제 | 해당 고객의 담당자 본인 또는 관리자 |
| 구분 추가 | 전 직원 |
| 구분 삭제 | 관리자만, 사용 중인 값은 삭제 불가 |
| 담당자 재배정 | 관리자만 |

## 중복 등록 차단

전화번호에서 숫자만 남긴 값(`phone_normalized`)에 DB unique 인덱스를 건다. 등록/수정
서버 액션은 저장을 시도하기 전에 같은 값이 있는지 먼저 조회해 "이미 OOO님이 등록한
연락처입니다"처럼 담당자 이름을 포함한 안내를 보여주고, 저장을 막는다. 동시 등록
레이스 컨디션은 DB unique 제약이 최종 방어선이 된다 (제약 위반 에러를 잡아서 같은
안내 메시지로 변환).

관리자를 포함해 예외 없이 차단한다. 예외가 필요한 상황(동명이인, 번호 변경 등)이
생기면 기존 고객 쪽을 먼저 수정/삭제한 뒤 다시 등록하는 흐름으로 유도한다.

## 담당자 재배정

고객 상세 화면에 관리자 전용 인라인 담당자 변경 UI를 둔다 (업무보고 목록의 부서
인라인 수정 — `updateBoardDepartment` — 과 동일한 패턴: `<select>` + 저장 버튼의
작은 폼). 계정이 삭제돼 `owner_id`가 null인 고객은 "담당자 미지정"으로 표시된다.

## 페이지 구성

```
/customers             목록 — 검색(이름·소속·연락처·이메일) + 구분 다중선택 필터
                        + 컬럼 정렬 + 페이지네이션(25건) + "+ 고객 등록" 버튼
/customers/new         등록 폼
/customers/[id]        상세 — 연락 기록 목록/추가, 수정·삭제 링크(권한자만),
                        관리자 전용 담당자 재배정
/customers/[id]/edit   수정 폼
/customers/categories  구분 관리 (추가는 전 직원, 삭제는 관리자만)
```

사이드바: "고객관리"를 관리자 섹션이 아니라 일반 메뉴 항목으로 추가한다 (전 직원이
접근하는 기능이므로 외근계획표·연간 일정과 같은 레벨).

## UI/디자인

기존 앱의 라이트 테마·카드 스타일·통계 카드 패턴을 그대로 따른다 (연간 일정/직원
관리 페이지에서 확립한 톤 — `#F5F3EA` 캔버스, 흰 카드, `#0F5C56` 액센트). 새로운
디자인 시스템을 만들지 않는다.

목록은 PC에서는 표, 모바일에서는 세로 카드형으로 반응형 전환한다 (외근계획표
`schedule-table.tsx`/`schedule-cards.tsx` 페어와 동일한 패턴 재사용).

## 이번 범위에서 제외 (2단계 이후)

- 즐겨찾기
- 명함 사진 (Supabase Storage 비공개 버킷 + 서명 URL 필요)
- 엑셀 일괄등록 / 내보내기 (새 라이브러리 필요)
- 통계 대시보드
- 일괄 작업(다중 선택 후 일괄 연락기록/구분변경/삭제)

## 실현 가능성

이번 범위는 새 테이블 3개(SQL 마이그레이션, 사용자가 Supabase SQL Editor에서 직접
실행)만 있으면 되고, 기존 서버 액션·RLS·UI 패턴을 그대로 재사용한다. 새 인프라
(Storage, 외부 라이브러리, service role 사용)는 필요 없다. 기술적으로 막히는 부분 없음.
