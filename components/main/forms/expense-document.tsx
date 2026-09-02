"use client";

import Link from "next/link";
import { useTransition } from "react";

import type { ExpenseApprover, ExpenseConsultation, ExpenseItem } from "@/lib/expense/types";
import { deleteExpenseReport } from "@/app/forms/expense/actions";
import ExpensePaper from "./expense-paper";

type ReportData = {
  id: string;
  doc_number: string;
  drafter_id: string;
  drafter_name: string;
  drafter_job_title: string;
  department: string;
  drafted_at: string;
  title: string;
  content: string;
  items: ExpenseItem[];
  total_amount: number;
  consultations: ExpenseConsultation[];
  instructions: string;
  attachment_types: string[];
  attachment_other: string;
  approvers: ExpenseApprover[];
};

type Props = {
  report: ReportData;
  stampUrl: string | null;
  canManage: boolean;
};

const ExpenseDocument = ({ report, stampUrl, canManage }: Props) => {
  const [isDeleting, startDeleteTransition] = useTransition();

  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href="/forms/expense" className="text-base text-[#6B6455] transition-colors hover:text-[#211D14]">
          목록으로
        </Link>
        <div className="flex gap-2">
          {canManage && (
            <>
              <Link
                href={`/forms/expense/${report.id}/edit`}
                className="rounded-lg border border-[#E7E2D2] bg-white px-5 py-2.5 text-base font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
              >
                수정
              </Link>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  if (!confirm("정말 삭제하시겠습니까?")) return;
                  startDeleteTransition(() => {
                    deleteExpenseReport(report.id);
                  });
                }}
                className="rounded-lg border border-[#E7E2D2] bg-white px-5 py-2.5 text-base font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                삭제
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-[#0F5C56] px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#0C4A45]"
          >
            인쇄하기
          </button>
        </div>
      </div>

      <ExpensePaper
        docNumber={report.doc_number}
        drafterName={report.drafter_name}
        drafterJobTitle={report.drafter_job_title}
        department={report.department}
        draftedAt={report.drafted_at}
        title={report.title}
        content={report.content}
        items={report.items}
        totalAmount={report.total_amount}
        consultations={report.consultations}
        instructions={report.instructions}
        approvers={report.approvers.map((a) => ({ order: a.order, name: a.name, jobTitle: a.jobTitle }))}
        attachmentTypes={report.attachment_types}
        attachmentOther={report.attachment_other}
        stampUrl={stampUrl}
      />
    </div>
  );
};

export default ExpenseDocument;
