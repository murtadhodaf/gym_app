"use client";

import { VolumeWeek } from "@/lib/progress-queries";

interface Props {
  weeks: VolumeWeek[];
}

const W = 560;
const H = 160;
const PAD = { top: 12, right: 12, bottom: 32, left: 48 };

function formatWeek(w: string) {
  // "2025-W20" → "W20"
  return w.split("-")[1] ?? w;
}

export function VolumeChart({ weeks }: Props) {
  if (weeks.length === 0) {
    return (
      <div
        style={{
          height: H,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink-3)",
          fontSize: 13,
        }}
      >
        No data yet — finish your first workout to see volume trends.
      </div>
    );
  }

  const maxVol = Math.max(...weeks.map((w) => w.volumeKg), 1);
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const barW = Math.max(4, Math.min(32, chartW / weeks.length - 4));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ overflow: "visible", display: "block" }}
    >
      {/* Y-axis labels */}
      {[0, 0.5, 1].map((pct) => {
        const y = PAD.top + chartH * (1 - pct);
        const label =
          pct === 0 ? "0" : `${Math.round((maxVol * pct) / 1000)}k`;
        return (
          <g key={pct}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray={pct === 0 ? "none" : "3 3"}
            />
            <text
              x={PAD.left - 6}
              y={y + 4}
              textAnchor="end"
              fontSize={10}
              fill="var(--ink-3)"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {weeks.map((w, i) => {
        const x =
          PAD.left +
          (i / (weeks.length - 1 || 1)) * chartW -
          barW / 2;
        const barH = Math.max(2, (w.volumeKg / maxVol) * chartH);
        const y = PAD.top + chartH - barH;

        return (
          <g key={w.week}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={3}
              fill="var(--ink)"
              opacity={0.85}
            />
            {/* X label */}
            <text
              x={x + barW / 2}
              y={H - 6}
              textAnchor="middle"
              fontSize={9}
              fill="var(--ink-3)"
            >
              {formatWeek(w.week)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
