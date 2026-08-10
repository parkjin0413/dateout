import { DEPT_COLORS, getDeptClass, getDeptLabel } from "@/lib/field-trip/dept";

const DeptBadge = ({ department }: { department: string }) => {
  const cls = getDeptClass(department);
  const colors = DEPT_COLORS[cls];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium ${colors.bg} ${colors.text} ${colors.border}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {getDeptLabel(department) || "미지정"}
    </span>
  );
};

export default DeptBadge;
