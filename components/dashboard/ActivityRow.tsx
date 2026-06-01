"use client";

import type { RecentSession } from "@/data/sample";

interface ActivityRowProps {
  session: RecentSession;
  isLast?: boolean;
}

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k kg`;
  return `${kg} kg`;
}

export function ActivityRow({ session, isLast }: ActivityRowProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr auto auto",
        gap: 16,
        alignItems: "center",
        padding: "14px 20px",
        borderBottom: isLast ? "none" : "1px solid var(--line)",
        cursor: "pointer",
        transition: "background 150ms",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.background = "var(--surface-2)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.background = "transparent")
      }
    >
      {/* Date */}
      <span
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: 11,
          color: "var(--ink-3)",
          whiteSpace: "nowrap",
        }}
      >
        {session.date}
      </span>

      {/* Title + sub */}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--ink)",
            marginBottom: 2,
          }}
        >
          {session.title}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{session.sub}</div>
      </div>

      {/* Volume */}
      <span
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: 12,
          color: "var(--ink-2)",
        }}
      >
        {formatVolume(session.volumeKg)}
      </span>

      {/* Chevron */}
      <span style={{ color: "var(--ink-3)", fontSize: 14 }}>›</span>
    </div>
  );
}
