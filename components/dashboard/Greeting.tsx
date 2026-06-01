"use client";

import { useUser } from "@clerk/nextjs";

/**
 * Renders the personalized greeting on the client using Clerk's already-loaded
 * user data (no extra network request). This keeps the Home page from blocking
 * on a server-side currentUser() call on every navigation.
 */
export function Greeting() {
  const { user } = useUser();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const firstName = user?.firstName ?? "there";

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <h1
        style={{
          fontSize: 30,
          fontWeight: 500,
          letterSpacing: "-0.025em",
          lineHeight: 1.1,
          color: "var(--ink)",
          margin: 0,
        }}
      >
        {greeting}, <em>{firstName}.</em>
      </h1>
      <p style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 6 }}>
        {today} · 5-day intermediate hypertrophy program
      </p>
    </div>
  );
}
