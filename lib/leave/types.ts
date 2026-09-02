export type LeaveApprover = {
  order: number;
  userId: string;
  name: string;
  jobTitle: string;
};

export const LEAVE_TYPES = [
  "연차",
  "오전반차",
  "오후반차",
  "병가",
  "경조휴가",
  "공가",
  "기타",
  "연차+오전반차",
  "오후반차+연차",
] as const;
export type LeaveType = (typeof LEAVE_TYPES)[number];

// 0.5일 단위로 0.5 ~ 10일
export const LEAVE_DAY_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1) * 0.5);

// 전체일수/전일까지누계/사용일/잔여일 - 자동 계산 없이 작성자가 직접 입력하는 값
export type LeaveBalanceEntry = {
  total: string;
  priorUsed: string;
  used: string;
  remaining: string;
};

export type LeaveBalance = {
  annual: LeaveBalanceEntry;
  substitute: LeaveBalanceEntry;
};

export const EMPTY_LEAVE_BALANCE_ENTRY: LeaveBalanceEntry = { total: "", priorUsed: "", used: "", remaining: "" };

export type LeaveRequest = {
  id: string;
  doc_number: string;
  drafter_id: string;
  drafter_name: string;
  department: string;
  drafted_at: string;
  start_date: string;
  end_date: string;
  days: number;
  leave_type: LeaveType;
  reason: string;
  substitute_job_title: string;
  substitute_name: string;
  leave_balance: LeaveBalance;
  approvers: LeaveApprover[];
  created_at: string;
};
