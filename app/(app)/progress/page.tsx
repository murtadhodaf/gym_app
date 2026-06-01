"use client";

import { useState } from "react";
import {
  useProgressStats,
  useVolumeHistory,
  useTopExercises,
  useStrengthHistory,
} from "@/lib/progress-queries";
import { StatGrid } from "@/components/progress/StatGrid";
import { VolumeChart } from "@/components/progress/VolumeChart";
import { StrengthChart } from "@/components/progress/StrengthChart";

const CARD: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: "20px 22px",
};

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: "-0.015em",
  color: "var(--ink)",
  margin: 0,
  marginBottom: 16,
};

const RANGE_BTN = (active: boolean): React.CSSProperties => ({
  background: active ? "var(--ink)" : "transparent",
  color: active ? "var(--bg)" : "var(--ink-3)",
  border: `1px solid ${active ? "var(--ink)" : "var(--border)"}`,
  borderRadius: 20,
  padding: "5px 12px",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all 0.15s",
});

function Skeleton({ h = 20, w = "100%" }: { h?: number; w?: string }) {
  return (
    <div
      style={{
        height: h,
        width: w,
        background: "var(--border)",
        borderRadius: 6,
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

export default function ProgressPage() {
  const [volumeWeeks, setVolumeWeeks] = useState(12);
  const [strengthWeeks, setStrengthWeeks] = useState(12);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const statsQ = useProgressStats();
  const volumeQ = useVolumeHistory(volumeWeeks);
  const topExQ = useTopExercises();
  const activeExercise =
    selectedExercise ?? topExQ.data?.topExercises[0] ?? null;
  const strengthQ = useStrengthHistory(activeExercise, strengthWeeks);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page header */}
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
          Progress
        </h1>
        <p style={{ color: "var(--ink-3)", fontSize: 13, margin: 0 }}>
          Your training data at a glance.
        </p>
      </div>

      {/* Stats grid */}
      {statsQ.isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ ...CARD, height: 100 }}>
              <Skeleton h={16} w="50%" />
            </div>
          ))}
        </div>
      ) : statsQ.error ? (
        <div style={{ color: "var(--coral)", fontSize: 13 }}>
          Could not load stats — make sure your database is connected.
        </div>
      ) : statsQ.data ? (
        <StatGrid stats={statsQ.data} />
      ) : null}

      {/* Volume chart */}
      <div style={CARD}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2 style={{ ...SECTION_TITLE, marginBottom: 0 }}>Weekly Volume</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {([4, 8, 12] as const).map((w) => (
              <button
                key={w}
                style={RANGE_BTN(volumeWeeks === w)}
                onClick={() => setVolumeWeeks(w)}
              >
                {w}w
              </button>
            ))}
          </div>
        </div>

        {volumeQ.isLoading ? (
          <Skeleton h={160} />
        ) : volumeQ.data ? (
          <VolumeChart weeks={volumeQ.data.weeks} />
        ) : null}

        <p style={{ fontSize: 11, color: "var(--ink-3)", margin: "10px 0 0", textAlign: "right" }}>
          kg × reps total per ISO week
        </p>
      </div>

      {/* Strength progression */}
      <div style={CARD}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <h2 style={{ ...SECTION_TITLE, marginBottom: 0 }}>Strength Progression</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {([4, 8, 12] as const).map((w) => (
              <button
                key={w}
                style={RANGE_BTN(strengthWeeks === w)}
                onClick={() => setStrengthWeeks(w)}
              >
                {w}w
              </button>
            ))}
          </div>
        </div>

        {/* Exercise selector */}
        {topExQ.data && topExQ.data.topExercises.length > 0 ? (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {topExQ.data.topExercises.slice(0, 6).map((ex) => (
              <button
                key={ex}
                style={{
                  ...RANGE_BTN(activeExercise === ex),
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                }}
                onClick={() => setSelectedExercise(ex)}
              >
                {ex}
              </button>
            ))}
          </div>
        ) : topExQ.isLoading ? (
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} h={30} w="80px" />
            ))}
          </div>
        ) : null}

        {strengthQ.isLoading ? (
          <Skeleton h={150} />
        ) : strengthQ.data ? (
          <StrengthChart
            points={strengthQ.data.points}
            exercise={strengthQ.data.exercise}
          />
        ) : activeExercise === null ? (
          <div
            style={{
              height: 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-3)",
              fontSize: 13,
            }}
          >
            No exercises logged yet. Finish a workout to see strength trends.
          </div>
        ) : null}

        <p style={{ fontSize: 11, color: "var(--ink-3)", margin: "10px 0 0", textAlign: "right" }}>
          Estimated 1RM via Epley formula (kg)
        </p>
      </div>

      {/* Personal records */}
      <PRSection />
    </div>
  );
}

function PRSection() {
  const topExQ = useTopExercises();
  const topEx = topExQ.data?.topExercises[0] ?? null;
  const strengthQ = useStrengthHistory(topEx, 52);

  if (!strengthQ.data || strengthQ.data.points.length === 0) return null;

  const allPoints = strengthQ.data.points;
  const best = allPoints.reduce(
    (prev, curr) => (curr.e1rm > prev.e1rm ? curr : prev),
    allPoints[0]
  );

  return (
    <div style={CARD}>
      <h2 style={SECTION_TITLE}>Personal Records</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "14px 16px",
          }}
        >
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 4 }}>
            Est. 1RM — {topEx}
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
            }}
          >
            {best.e1rm} kg
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
            {best.weight}kg × {best.reps} reps · {best.date}
          </div>
        </div>
      </div>
    </div>
  );
}
