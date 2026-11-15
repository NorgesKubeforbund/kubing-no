import AgreementOverview from "@/components/admin/agreement-overview";
import OrderOverview from "@/components/admin/order-overview";
import UserDataTable from "@/components/settings/user-data";
import BackArrow from "@/components/ui/back-arrow";
import Title from "@/components/ui/title";
import { getAuth } from "@/lib/auth";
import { getUserData } from "@/lib/user";
import { getAgreements, getOrders } from "@/lib/vipps";
import { redirect } from "next/navigation";

export default async function UserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { permissions } = await getAuth();
  if (!permissions || !permissions.includes("user_overview")) {
    redirect("/admin");
  }

  const { userId } = await params;
  const id = Number(userId);

  const userDataRes = Number.isInteger(id)
    ? await getUserData(id)
    : { success: false as const };

  if (!userDataRes.success) {
    return (
      <div className="flex flex-col px-4 sm:px-8 gap-8 text-center w-full max-w-5xl">
        <BackArrow href="/admin/brukere" />
        <p>Kunne ikke finne brukeren...</p>
      </div>
    );
  }

  const userData = userDataRes.data;
  const orders = await getOrders(id);
  const agreements = await getAgreements(id);

  return (
    <div className="flex flex-col px-4 sm:px-8 gap-8 text-center w-full max-w-5xl">
      <div className="flex flex-col gap-2">
        <BackArrow href="/admin/brukere" />
        <Title>{userData.name}</Title>
      </div>
      <UserDataTable userData={userData} />
      <div className="flex flex-col gap-4">
        <Title small>Ordre</Title>
        <OrderOverview orders={orders} />
      </div>
      <div className="flex flex-col gap-4">
        <Title small>Avtaler</Title>
        <AgreementOverview agreements={agreements} />
      </div>
    </div>
  );
}
