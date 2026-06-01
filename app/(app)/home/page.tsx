import { getCurrentUser } from "@/lib/auth";
import { SignOutButton } from "@clerk/nextjs";

export default async function HomePage() {
  const user = await getCurrentUser();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-[30px] font-medium tracking-[-0.025em] text-ink">
          {greeting}, <em>{user?.firstName ?? "there"}.</em>
        </h1>
        <p className="text-ink-3 text-[14px] mt-2">
          {user?.emailAddresses?.[0]?.emailAddress}
        </p>
        <p className="text-ink-3 text-[13px] mt-4">
          Phase 2 complete — dashboard coming in Phase 4.
        </p>
        <div className="mt-6">
          <SignOutButton redirectUrl="/sign-in">
            <button
              style={{
                padding: "9px 18px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--ink-2)",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>
    </main>
  );
}
