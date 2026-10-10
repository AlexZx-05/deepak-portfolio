import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminDashboard from "../../components/AdminDashboard";
import { authOptions } from "../../lib/auth";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
