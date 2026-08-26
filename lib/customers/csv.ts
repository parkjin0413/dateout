export function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const BOM = String.fromCharCode(0xfeff);

export function parseCsv(text: string): string[][] {
  const withoutBom = text.startsWith(BOM) ? text.slice(1) : text;
  const body = withoutBom.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inQuotes) {
      if (ch === '"') {
        if (body[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

const REQUIRED_HEADERS = ["구분", "이름", "소속", "연락처"] as const;

export type CustomerCsvRow = {
  category: string;
  name: string;
  company: string;
  phoneRaw: string;
  email: string;
  memo: string;
};

export function parseCustomerCsv(text: string): { rows: CustomerCsvRow[]; headerError?: string } {
  const table = parseCsv(text);
  if (table.length === 0) return { rows: [], headerError: "파일이 비어 있습니다." };

  const header = table[0].map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);

  const missing = REQUIRED_HEADERS.filter((h) => idx(h) === -1);
  if (missing.length > 0) {
    return { rows: [], headerError: `필수 컬럼이 없습니다: ${missing.join(", ")}` };
  }

  const catIdx = idx("구분");
  const nameIdx = idx("이름");
  const companyIdx = idx("소속");
  const phoneIdx = idx("연락처");
  const emailIdx = idx("이메일");
  const memoIdx = idx("메모");

  const rows: CustomerCsvRow[] = table.slice(1).map((cols) => ({
    category: (cols[catIdx] ?? "").trim(),
    name: (cols[nameIdx] ?? "").trim(),
    company: (cols[companyIdx] ?? "").trim(),
    phoneRaw: (cols[phoneIdx] ?? "").trim(),
    email: emailIdx >= 0 ? (cols[emailIdx] ?? "").trim() : "",
    memo: memoIdx >= 0 ? (cols[memoIdx] ?? "").trim() : "",
  }));

  return { rows };
}
