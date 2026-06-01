"use client";

import { CoachInsight } from "@/lib/progress-queries";

interface Props {
  insight: CoachInsight;
}

export function InsightCard({ insight }: Props) {
  const barWidth = insight.confidence;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{insight.icon}</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--ink)",
              letterSpacing: "-0.01em",
              marginBottom: 4,
            }}
          >
            {insight.title}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
            {insight.detail}
          </div>
        </div>
      </div>

      {/* Confidence bar */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--ink-3)",
            marginBottom: 4,
          }}
        >
          <span>Confidence</span>
          <span>{insight.confidence}%</span>
        </div>
        <div
          style={{
            height: 3,
            background: "var(--border)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${barWidth}%`,
              background: barWidth >= 85 ? "var(--success)" : "var(--ink-3)",
              borderRadius: 2,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
