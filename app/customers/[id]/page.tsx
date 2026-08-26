import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { todayKst } from "@/lib/customers/date";
import { getCardImageSignedUrl } from "@/lib/customers/card-image";
import DeleteCustomerButton from "@/components/main/customers/delete-customer-button";
import ContactLog from "@/components/main/customers/contact-log";
import ReassignOwnerForm from "@/components/main/customers/reassign-owner-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("users").select("is_admin").eq("id", user.id).single();
  const isAdmin = profile?.is_admin ?? false;

  const { data: customer } = await supabase.from("customers").select("*").eq("id", id).single();
  if (!customer) notFound();

  const canManage = isAdmin || customer.owner_id === user.id;
  const today = todayKst();
  const cardImageUrl = await getCardImageSignedUrl(supabase, customer.card_image_path);

  const ownerRow = customer.owner_id
    ? (await supabase.from("users").select("name, email").eq("id", customer.owner_id).single()).data
    : null;

  const { data: contacts } = await supabase
    .from("customer_contacts")
    .select("*")
    .eq("customer_id", id)
    .order("contact_date", { ascending: false })
    .order("created_at", { ascending: false });

  let employees: { id: string; name: string | null; email: string }[] = [];
  if (isAdmin) {
    const { data } = await supabase.from("users").select("id, name, email").order("email", { ascending: true });
    employees = data ?? [];
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/customers" className="text-sm text-[#8A8270] transition-colors hover:text-[#4B4739]">
            ← 고객 목록
          </Link>
          <h1 className="mt-1 text-3xl font-bold text-[#211D14]">{customer.name}</h1>
          <p className="mt-1 text-base text-[#6B6455]">{customer.company}</p>
        </div>
        {canManage && (
          <div className="flex items-center gap-3">
            <Link
              href={`/customers/${id}/edit`}
              className="rounded-lg border border-[#E7E2D2] bg-white px-4 py-2 text-base font-semibold text-[#4B4739] transition-colors hover:bg-[#F5F3EA]"
            >
              수정
            </Link>
            <DeleteCustomerButton id={id} />
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E7E2D2] bg-white p-6">
            {cardImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- 비공개 버킷 서명 URL, next/image 원격 도메인 설정 불필요
              <img
                src={cardImageUrl}
                alt="명함 사진"
                className="mb-4 h-40 w-40 rounded-lg border border-[#E7E2D2] object-cover"
              />
            )}
            <dl className="space-y-3">
              <Row label="구분" value={customer.category} />
              <Row label="연락처" value={customer.phone} href={`tel:${customer.phone}`} />
              <Row label="이메일" value={customer.email || "-"} href={customer.email ? `mailto:${customer.email}` : undefined} />
              <Row label="메모" value={customer.memo || "-"} />
              <Row label="담당자" value={ownerRow?.name ?? ownerRow?.email ?? "담당자 미지정"} />
            </dl>
          </div>

          <ContactLog customerId={id} contacts={contacts ?? []} viewerId={user.id} isAdmin={isAdmin} today={today} />
        </div>

        {isAdmin && (
          <div className="rounded-2xl border border-[#E7E2D2] bg-white p-5">
            <h2 className="mb-3 text-base font-semibold text-[#211D14]">담당자 변경</h2>
            <ReassignOwnerForm customerId={id} employees={employees} currentOwnerId={customer.owner_id} />
          </div>
        )}
      </div>
    </div>
  );
}

const Row = ({ label, value, href }: { label: string; value: string; href?: string }) => (
  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
    <dt className="w-16 shrink-0 text-base text-[#6B6455]">{label}</dt>
    <dd className="text-base text-[#211D14]">
      {href ? (
        <a href={href} className="hover:text-[#0F5C56]">
          {value}
        </a>
      ) : (
        value
      )}
    </dd>
  </div>
);
