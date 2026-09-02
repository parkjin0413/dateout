export type ExpenseItem = {
  description: string;
  vendor: string;
  amount: number;
};

export type ExpenseConsultation = {
  department: string;
};

export type ExpenseApprover = {
  order: number;
  userId: string;
  name: string;
  jobTitle: string;
};

// 증빙 서류는 업로드하지 않고 인쇄물 뒤에 별도로 첨부하는 방식이라,
// 실제 첨부할 서류 종류를 체크리스트로만 표시한다. 각 항목은 서로 독립적으로
// 체크할 수 있다(동시에 여러 개 선택 가능). "기타"는 별도의 자유 입력 텍스트로 관리한다.
export const ATTACHMENT_TYPES = [
  "견적서",
  "세금계산서(인보이스)",
  "영수증",
  "카드 매출전표",
  "계좌이체 확인서",
  "결제 페이지 스크린샷",
  "계약서",
] as const;
export type AttachmentType = (typeof ATTACHMENT_TYPES)[number];

export type ExpenseReport = {
  id: string;
  doc_number: string;
  drafter_id: string;
  drafter_name: string;
  department: string;
  drafted_at: string;
  title: string;
  content: string;
  items: ExpenseItem[];
  total_amount: number;
  consultations: ExpenseConsultation[];
  instructions: string;
  attachment_types: AttachmentType[];
  attachment_other: string;
  approvers: ExpenseApprover[];
  created_at: string;
};
