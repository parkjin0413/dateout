"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CompanyInfo } from "@/lib/company-info";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

type CopyRowProps = {
  label?: string;
  display: string;
  copied: boolean;
  onCopy: () => void;
  emphasized?: boolean;
};

const CopyRow = ({ label, display, copied, onCopy, emphasized }: CopyRowProps) => (
  <button
    type="button"
    onClick={onCopy}
    aria-label={`${label ? `${label} ` : ""}복사하기`}
    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#F5F3EA]"
  >
    {label && <span className="w-20 shrink-0 text-sm font-medium text-[#8A8270]">{label}</span>}
    <span
      className={[
        "min-w-0 flex-1 break-words",
        emphasized ? "text-lg font-bold text-[#211D14]" : "text-base text-[#211D14]",
      ].join(" ")}
    >
      {display}
    </span>
    <span
      className={[
        "shrink-0 text-xs font-semibold transition-colors",
        copied ? "text-[#0F5C56]" : "text-[#B9B29B] group-hover:text-[#8A8270]",
      ].join(" ")}
    >
      {copied ? "복사됨" : "복사"}
    </span>
  </button>
);

const CertImage = ({ src, name }: { src: string; name: string }) => {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-[#E7E2D2] bg-[#FAF8F0] text-sm text-[#8A8270]">
        파일 준비 중
      </div>
    );
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      className="block overflow-hidden rounded-lg border border-[#E7E2D2]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 정적 문서 스캔이라 next/image 최적화 불필요 */}
      <img
        src={src}
        alt={`${name} 사업자등록증`}
        loading="lazy"
        onError={() => setErrored(true)}
        className="h-auto w-full object-contain"
      />
    </a>
  );
};

const downloadBtn =
  "flex-1 rounded-lg border border-[#E7E2D2] px-3 py-2 text-center text-sm font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]";

type Props = {
  companies: CompanyInfo[];
};

const CompanyInfoView = ({ companies }: Props) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleCopy = useCallback(async (key: string, value: string) => {
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setCopiedKey(key);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#211D14]">회사정보</h1>
        <p className="mt-1 text-base text-[#6B6455]">
          항목을 클릭하면 클립보드에 복사됩니다. 사업자번호·전화번호는 하이픈 없이 숫자만 복사돼요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company, i) => {
          const rows: { label?: string; display: string; copyValue: string; key: string }[] = [
            { label: "대표자", display: company.ceo, copyValue: company.ceo, key: `${i}:ceo` },
            { label: "주소", display: company.address, copyValue: company.address, key: `${i}:address` },
            { label: "사업자번호", display: company.bizNo, copyValue: onlyDigits(company.bizNo), key: `${i}:bizNo` },
            { label: "전화번호", display: company.phone, copyValue: onlyDigits(company.phone), key: `${i}:phone` },
            { label: "이메일", display: company.email, copyValue: company.email, key: `${i}:email` },
          ];

          return (
            <div key={company.name} className="rounded-2xl border border-[#E7E2D2] bg-white p-3">
              <CopyRow
                display={company.name}
                copied={copiedKey === `${i}:name`}
                onCopy={() => handleCopy(`${i}:name`, company.name)}
                emphasized
              />
              <div className="mt-1 border-t border-[#F0EDE1] pt-1">
                {rows.map((row) => (
                  <CopyRow
                    key={row.key}
                    label={row.label}
                    display={row.display}
                    copied={copiedKey === row.key}
                    onCopy={() => handleCopy(row.key, row.copyValue)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold text-[#211D14]">사업자등록증</h2>
        <p className="mt-1 text-sm text-[#6B6455]">
          이미지를 클릭하면 원본이 열립니다. 아래 버튼으로 PDF·JPG를 각각 내려받을 수 있어요.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <div key={company.name} className="flex flex-col rounded-2xl border border-[#E7E2D2] bg-white p-4">
              <div className="mb-3 text-base font-bold text-[#211D14]">{company.name}</div>
              <CertImage src={company.certJpg} name={company.name} />
              <div className="mt-3 flex gap-2">
                <a href={company.certPdf} download className={downloadBtn}>
                  PDF 다운로드
                </a>
                <a href={company.certJpg} download className={downloadBtn}>
                  JPG 다운로드
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoView;
