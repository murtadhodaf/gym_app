"use client";

import { StrengthPoint } from "@/lib/progress-queries";

interface Props {
  points: StrengthPoint[];
  exercise: string;
}

const W = 560;
const H = 150;
const PAD = { top: 12, right: 12, bottom: 32, left: 48 };

function fmtDate(d: string) {
  // "YYYY-MM-DD" → "DD/MM"
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
}

export function StrengthChart({ points, exercise }: Props) {
  if (points.length === 0) {
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
        No {exercise} data in this period.
      </div>
    );
  }

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const maxE1rm = Math.max(...points.map((p) => p.e1rm), 1);
  const minE1rm = Math.min(...points.map((p) => p.e1rm));
  const range = maxE1rm - minE1rm || 1;

  const px = (i: number) =>
    PAD.left + (i / (points.length - 1 || 1)) * chartW;
  const py = (val: number) =>
    PAD.top + chartH - ((val - minE1rm) / range) * chartH;

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${px(i).toFixed(1)} ${py(p.e1rm).toFixed(1)}`)
    .join(" ");

  const areaD =
    pathD +
    ` L ${px(points.length - 1).toFixed(1)} ${(PAD.top + chartH).toFixed(1)} L ${PAD.left.toFixed(1)} ${(PAD.top + chartH).toFixed(1)} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ overflow: "visible", display: "block" }}
    >
      {/* Y gridlines */}
      {[0, 0.5, 1].map((pct) => {
        const val = minE1rm + range * pct;
        const y = py(val);
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
              {Math.round(val)}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaD} fill="var(--ink)" opacity={0.08} />

      {/* Line */}
      <path d={pathD} fill="none" stroke="var(--ink)" strokeWidth={2} />

      {/* Dots + labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={px(i)} cy={py(p.e1rm)} r={3.5} fill="var(--ink)" />
          {/* X-axis date label (show max 8 labels) */}
          {(points.length <= 8 || i % Math.ceil(points.length / 8) === 0) && (
            <text
              x={px(i)}
              y={H - 6}
              textAnchor="middle"
              fontSize={9}
              fill="var(--ink-3)"
            >
              {fmtDate(p.date)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
