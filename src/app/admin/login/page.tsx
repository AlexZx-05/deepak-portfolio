import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LoginForm from "../../../components/LoginForm";
import { authOptions } from "../../../lib/auth";

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === "admin") {
    redirect("/admin");
  }

  return (
    <main className="admin-login">
      <section className="admin-login-card">
        <p className="eyebrow">Admin</p>
        <h1 style={{ fontSize: 38, whiteSpace: "normal" }}>Sign in</h1>
        <p className="admin-muted">Sign in securely with a one-time code sent to the configured admin email.</p>
        <LoginForm />
      </section>
    </main>
  );
}
