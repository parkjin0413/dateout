const inputCls =
  "w-full rounded-lg border border-[#E7E2D2] bg-white px-3 py-2.5 text-base text-[#211D14] outline-none transition-colors focus:border-[#0F5C56]";

export type Employee = { id: string; name: string | null; department: string; job_title: string };

export const ApproverSelect = ({
  label,
  required,
  value,
  onChange,
  employees,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  employees: Employee[];
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-[#4B4739]">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} required={required} className={inputCls}>
      <option value="">{required ? "선택" : "선택 안 함"}</option>
      {employees.map((e) => (
        <option key={e.id} value={e.id}>
          {e.name} {e.job_title ? `(${e.job_title})` : ""}
        </option>
      ))}
    </select>
  </div>
);

export default ApproverSelect;
