"use client";

import { useCoachInsights } from "@/lib/progress-queries";
import { InsightCard } from "@/components/coach/InsightCard";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function useRefreshInsights() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/coach/insights", { method: "POST" });
      if (!res.ok) throw new Error("Failed to refresh");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach", "insights"] }),
  });
}

function Skeleton() {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "16px 18px",
        height: 110,
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

export default function CoachPage() {
  const insightsQ = useCoachInsights();
  const refresh = useRefreshInsights();

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 720 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
              margin: 0,
              marginBottom: 4,
            }}
          >
            Coach
          </h1>
          <p style={{ color: "var(--ink-3)", fontSize: 13, margin: 0 }}>
            {today} · Personalised insights based on your recent training.
          </p>
        </div>

        <button
          onClick={() => refresh.mutate()}
          disabled={refresh.isPending}
          style={{
            background: "var(--surface)",
            color: "var(--ink-2)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 500,
            cursor: refresh.isPending ? "default" : "pointer",
            fontFamily: "inherit",
            opacity: refresh.isPending ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {refresh.isPending ? "Refreshing…" : "↺ Refresh"}
        </button>
      </div>

      {/* Insights */}
      {insightsQ.isLoading || refresh.isPending ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : insightsQ.error ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "24px",
            color: "var(--ink-3)",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          Could not load insights — make sure your database is connected.
        </div>
      ) : insightsQ.data && insightsQ.data.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {insightsQ.data.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      ) : (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏋️</div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "var(--ink)",
              marginBottom: 8,
            }}
          >
            No insights yet
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", maxWidth: 320, margin: "0 auto" }}>
            Complete a few workouts and daily check-ins for Forma to generate personalised coaching insights.
          </div>
        </div>
      )}

      {/* How it works */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "16px 18px",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--ink-3)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 10,
          }}
        >
          How Coach works
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          {[
            { icon: "📊", title: "Analyses your data", detail: "Reads volume, frequency, and strength trends from the last 14 days." },
            { icon: "🫀", title: "Factors in check-ins", detail: "Energy, soreness, and sick reports adjust recommendations in real time." },
            { icon: "🔄", title: "Refreshes daily", detail: "Insights are cached per day. Hit Refresh to force a new read anytime." },
          ].map((item) => (
            <div key={item.title}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", marginBottom: 3 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
