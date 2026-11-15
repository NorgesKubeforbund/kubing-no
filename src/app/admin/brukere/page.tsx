import UserList from "@/components/admin/user-list";
import BackArrow from "@/components/ui/back-arrow";
import Title from "@/components/ui/title";
import { getAuth } from "@/lib/auth";
import { getAllYearsWithMembers } from "@/lib/membership";
import { getUsers } from "@/lib/user";
import { redirect } from "next/navigation";

export default async function MembersPage() {
  const { permissions } = await getAuth();
  if (!permissions || !permissions.includes("user_overview")) {
    redirect("/admin");
  }
  const years = await getAllYearsWithMembers();
  const users = await getUsers();

  return (
    <div className="flex flex-col px-4 sm:px-8 gap-8 text-center w-full max-w-5xl">
      <div className="flex flex-col gap-2">
        <BackArrow href="/admin" />
        <Title>Brukere</Title>
      </div>
      <UserList
        users={users}
        years={years}
      />
    </div>
  );
}
