import { COACH_INSIGHTS } from "@/data/sample";
import type { CoachRecommendation } from "@/data/sample";

interface CoachCardProps {
  insights?: CoachRecommendation[];
  updatedAt?: string;
}

export function CoachCard({
  insights = COACH_INSIGHTS,
  updatedAt = "9:23 AM",
}: CoachCardProps) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 20px 16px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Orb */}
        <div
          className="animate-orb-pulse"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 35%, var(--accent), #8fb800)",
            flexShrink: 0,
          }}
        />

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--ink)",
              letterSpacing: "-0.01em",
            }}
          >
            Forma <em>Coach</em>
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>
            Updated from your check-in {updatedAt}
          </div>
        </div>

        <span
          style={{
            background: "var(--success-soft)",
            color: "var(--success)",
            border: "none",
            borderRadius: 20,
            padding: "3px 10px",
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          On track
        </span>
      </div>

      {/* Recommendations */}
      <div style={{ padding: "4px 0" }}>
        {insights.map((rec, i) => (
          <div
            key={rec.id}
            style={{
              padding: "14px 20px",
              display: "grid",
              gridTemplateColumns: "36px 1fr auto",
              gap: 14,
              alignItems: "center",
              borderBottom:
                i < insights.length - 1 ? "1px solid var(--line)" : "none",
            }}
          >
            {/* Icon box */}
            <div
              style={{
                width: 36,
                height: 36,
                border: "1px solid var(--border)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                background: "var(--surface-2)",
                flexShrink: 0,
              }}
            >
              {rec.icon}
            </div>

            {/* Text */}
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--ink)",
                  marginBottom: 2,
                }}
              >
                {rec.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.4 }}>
                {rec.detail}
              </div>
            </div>

            {/* Confidence */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 5,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: 12,
                  color: "var(--ink-2)",
                  fontWeight: 400,
                }}
              >
                {rec.confidence}%
              </span>
              <div
                style={{
                  width: 48,
                  height: 3,
                  background: "var(--line)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${rec.confidence}%`,
                    height: "100%",
                    background: "var(--accent)",
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "14px 20px",
          borderTop: "1px solid var(--line)",
          display: "flex",
          gap: 8,
        }}
      >
        <button
          style={{
            flex: 1,
            background: "var(--ink)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 10,
            padding: "9px 16px",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Apply to program
        </button>
        <button
          style={{
            background: "transparent",
            color: "var(--ink-2)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "9px 16px",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
