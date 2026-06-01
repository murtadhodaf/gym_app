import { auth } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/sidebar";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Lightweight session check (reads the JWT, no network round-trip to Clerk).
  // Full user profile is loaded client-side in <Sidebar> via useUser(), so menu
  // navigation is not blocked on a Clerk API call each time.
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "232px 1fr", minHeight: "100vh" }}>
      <Sidebar />
      {/* min-width: 0 prevents grid blowout when child content is wide */}
      <main style={{ padding: "28px 36px 64px", minWidth: 0, width: "100%", maxWidth: 1240 }}>
        {children}
      </main>
    </div>
  );
}
