export type MeetingItem = {
  category: string;
  content: string;
  note: string;
};

export type MeetingApprover = {
  order: number;
  userId: string;
  name: string;
  jobTitle: string;
};

export type MeetingRecord = {
  id: string;
  doc_number: string;
  drafter_id: string;
  drafter_name: string;
  department: string;
  drafted_at: string;
  site_name: string;
  meeting_date: string;
  location: string;
  counterpart_name: string;
  counterpart_org: string;
  items: MeetingItem[];
  photo_taken: boolean;
  drawing_attached: boolean;
  approvers: MeetingApprover[];
  created_at: string;
};
