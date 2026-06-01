import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <h1
        style={{
          fontSize: 30,
          fontWeight: 500,
          letterSpacing: "-0.025em",
          color: "var(--ink)",
          marginBottom: 8,
        }}
      >
        {greeting}, <em>{user?.firstName ?? "there"}.</em>
      </h1>
      <p style={{ color: "var(--ink-3)", fontSize: 14 }}>
        {user?.emailAddresses?.[0]?.emailAddress}
      </p>
      <p style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 16 }}>
        Phase 3 complete — dashboard coming in Phase 4.
      </p>
    </div>
  );
}
