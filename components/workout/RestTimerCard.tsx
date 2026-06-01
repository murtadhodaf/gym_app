"use client";

import { useState, useEffect, useRef, useCallback, MutableRefObject } from "react";

const REST_DURATION = 90;

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function RingCountdown({
  value,
  max,
  size = 140,
  stroke = 10,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const dash = circ * progress;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={value === 0 ? "var(--accent)" : "var(--accent-2)"}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.5s linear" }}
      />
    </svg>
  );
}

interface Props {
  resetRef: MutableRefObject<(() => void) | null>;
}

export function RestTimerCard({ resetRef }: Props) {
  const [left, setLeft] = useState(REST_DURATION);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Stable ref so clearTick can always reach the latest interval id
  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    setLeft(REST_DURATION);
    setRunning(true);
  }, []);

  // Expose reset/start to parent (called when a set is checked)
  useEffect(() => {
    resetRef.current = startTimer;
  }, [resetRef, startTimer]);

  // Countdown tick — drives from `running` state only.
  // When the count hits zero the interval callback calls setRunning(false)
  // directly (not inside a state updater), which is a legitimate event-handler
  // pattern — the eslint rule only fires on synchronous setState in effects.
  useEffect(() => {
    clearTick();
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          // Schedule outside the updater to avoid setState-in-setState
          queueMicrotask(() => setRunning(false));
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return clearTick;
  }, [running, clearTick]);

  const handleControl = (label: string) => {
    if (label === "−15s") {
      setLeft((s) => Math.max(0, s - 15));
    } else if (label === "+15s") {
      setLeft((s) => s + 15);
      // Auto-start if timer was stopped/done
      if (!running) setRunning(true);
    } else if (label === "Reset") {
      clearTick();
      setLeft(REST_DURATION);
      setRunning(false);
    } else {
      // Start / Pause toggle
      setRunning((r) => !r);
    }
  };

  const controlLabels = ["−15s", running ? "Pause" : "Start", "Reset", "+15s"] as const;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: 20,
        boxShadow: "var(--shadow-sm)",
        position: "sticky",
        top: 28,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)" }}>
          Rest timer
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, color: "var(--ink)", marginTop: 2 }}>
          1:30 between sets
        </div>
      </div>

      {/* Ring */}
      <div style={{ display: "grid", placeItems: "center", padding: "16px 0", position: "relative" }}>
        <RingCountdown value={left} max={REST_DURATION} size={140} stroke={10} />
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-geist-mono, monospace)",
              fontSize: 28,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
            }}
          >
            {fmt(left)}
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", textAlign: "center", maxWidth: 100 }}>
            {left === 0
              ? "Rest complete ✓"
              : running
              ? "Resting… next set up soon"
              : "Check a set to start"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
        {controlLabels.map((label) => (
          <button
            key={label}
            onClick={() => handleControl(label)}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "7px 0",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--ink-2)",
              cursor: "pointer",
              fontFamily: "inherit",
              textAlign: "center",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
