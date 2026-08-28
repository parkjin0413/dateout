export type CustomerStatsSourceRow = {
  category: string;
  owner_id: string | null;
  created_at: string;
};

export type CustomerStats = {
  totalCustomers: number;
  categoryList: { category: string; count: number; pct: number }[];
  ownerList: { ownerName: string; count: number }[];
  monthCounts: number[]; // index 0 = 1월 ... index 11 = 12월, 선택 연도 기준
  busyMonth: number;
};

export function computeCustomerStats(
  rows: CustomerStatsSourceRow[],
  ownerNameMap: Map<string, string>,
  year: number
): CustomerStats {
  const categoryCounts: Record<string, number> = {};
  const ownerCounts: Record<string, number> = {};
  const monthCounts = new Array(12).fill(0) as number[];
  const kstFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
  });

  for (const row of rows) {
    categoryCounts[row.category] = (categoryCounts[row.category] ?? 0) + 1;

    const ownerName = row.owner_id ? (ownerNameMap.get(row.owner_id) ?? "담당자 미지정") : "담당자 미지정";
    ownerCounts[ownerName] = (ownerCounts[ownerName] ?? 0) + 1;

    const parts = kstFormatter.formatToParts(new Date(row.created_at));
    const createdYear = Number(parts.find((p) => p.type === "year")!.value);
    const createdMonth = Number(parts.find((p) => p.type === "month")!.value);
    if (createdYear === year) {
      monthCounts[createdMonth - 1] += 1;
    }
  }

  const totalCustomers = rows.length;

  const categoryList = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category,
      count,
      pct: totalCustomers > 0 ? Math.round((count / totalCustomers) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category, "ko"));

  const ownerList = Object.entries(ownerCounts)
    .map(([ownerName, count]) => ({ ownerName, count }))
    .sort((a, b) => b.count - a.count || a.ownerName.localeCompare(b.ownerName, "ko"));

  let busyMonth = 1;
  let busyCount = 0;
  monthCounts.forEach((count, idx) => {
    if (count > busyCount) {
      busyCount = count;
      busyMonth = idx + 1;
    }
  });

  return { totalCustomers, categoryList, ownerList, monthCounts, busyMonth };
}
