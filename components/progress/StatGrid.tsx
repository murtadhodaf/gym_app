"use client";

import { ProgressStats } from "@/lib/progress-queries";

interface Props {
  stats: ProgressStats;
}

interface StatItem {
  icon: string;
  label: string;
  value: string;
  sub: string;
}

export function StatGrid({ stats }: Props) {
  const items: StatItem[] = [
    {
      icon: "🏋️",
      label: "Total Workouts",
      value: String(stats.totalWorkouts),
      sub: `${stats.workoutsThisMonth} this month`,
    },
    {
      icon: "🔥",
      label: "Current Streak",
      value: `${stats.currentStreak}d`,
      sub: `Best: ${stats.longestStreak}d`,
    },
    {
      icon: "📅",
      label: "Avg / Week",
      value: `${stats.avgWorkoutsPerWeek}`,
      sub: "Last 12 weeks",
    },
    {
      icon: "⚡",
      label: "Total Volume",
      value: `${(stats.totalVolumeKg / 1000).toFixed(0)}k`,
      sub: `${(stats.volumeThisMonth / 1000).toFixed(1)}k kg this month`,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {item.value}
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-2)", marginBottom: 2 }}>
            {item.label}
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{item.sub}</div>
        </div>
      ))}
    </div>
  );
}
