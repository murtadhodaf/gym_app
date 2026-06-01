import { Sparkline } from "@/components/ui/sparkline";
import { Ring } from "@/components/ui/ring";
import type { StatData } from "@/data/sample";

interface StatCardProps {
  stat: StatData;
  style?: React.CSSProperties;
}

const deltaColorMap = {
  success: "var(--success)",
  coral: "var(--coral)",
  "ink-3": "var(--ink-3)",
};

const arrowMap = {
  up: "↑",
  down: "↓",
  none: "",
};

export function StatCard({ stat, style }: StatCardProps) {
  const deltaColor = deltaColorMap[stat.deltaColor];
  const arrow = arrowMap[stat.deltaDir];

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: 20,
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        minHeight: 132,
        ...style,
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 14 }}>{stat.icon}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}
        >
          {stat.label}
        </span>
      </div>

      {/* Value + visual row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <div>
          {/* Stat value */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: 30,
                fontWeight: 400,
                letterSpacing: "-0.025em",
                lineHeight: 1,
                color: "var(--ink)",
              }}
            >
              {stat.value}
            </span>
            <span
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: 13,
                color: "var(--ink-3)",
              }}
            >
              {stat.unit}
            </span>
          </div>

          {/* Delta */}
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: deltaColor,
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            {arrow && <span style={{ fontSize: 10 }}>{arrow}</span>}
            <span>{stat.delta}</span>
          </div>
        </div>

        {/* Visual */}
        {stat.visual === "sparkline" && stat.sparkPoints && (
          <Sparkline
            points={stat.sparkPoints}
            width={72}
            height={36}
            color={stat.deltaColor === "coral" ? "var(--coral)" : "var(--accent)"}
          />
        )}
        {stat.visual === "ring" && stat.ringValue !== undefined && (
          <div style={{ position: "relative", width: 56, height: 56 }}>
            <Ring value={stat.ringValue} size={56} strokeWidth={5} />
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-geist-mono)",
                fontSize: 11,
                color: "var(--ink)",
                fontWeight: 500,
              }}
            >
              {stat.ringValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
