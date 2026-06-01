import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || null;
  const email = user.emailAddresses?.[0]?.emailAddress ?? null;
  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : firstName
      ? firstName.slice(0, 2).toUpperCase()
      : email
      ? email.slice(0, 2).toUpperCase()
      : "??";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "232px 1fr", minHeight: "100vh" }}>
      <Sidebar userName={fullName} userEmail={email} initials={initials} />
      <main style={{ padding: "28px 36px 64px", maxWidth: 1240 }}>
        {children}
      </main>
    </div>
  );
}
