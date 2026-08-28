export default function FormsLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-[#6B6455]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E7E2D2] border-t-[#0F5C56]" />
      <p className="text-sm">불러오는 중...</p>
    </div>
  );
}
