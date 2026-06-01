"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  tempo?: string;
  notes?: string;
};

export type ProgramDayData = {
  day: string;
  workout: string;
  tag: string | null;
  exercises: Exercise[];
};

interface DayDrawerProps {
  day: ProgramDayData | null;
  onClose: () => void;
}

export function DayDrawer({ day, onClose }: DayDrawerProps) {
  if (!day) return null;

  const isRest = day.workout === "Rest";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 40,
          backdropFilter: "blur(2px)",
        }}
      />
      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: 420,
          background: "var(--bg)",
          borderLeft: "1px solid var(--border)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)" }}>{day.day}</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)", marginTop: 2 }}>
              {day.workout}
              {day.tag && <span style={{ fontWeight: 400, color: "var(--ink-2)", fontSize: 14 }}> · {day.tag}</span>}
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="close" size={16} />
          </Button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {isRest ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
              <Icon name="moon" size={40} style={{ color: "var(--ink-3)" }} />
              <p style={{ color: "var(--ink-2)", fontSize: 14, textAlign: "center" }}>Rest day — focus on recovery, sleep, and mobility work.</p>
            </div>
          ) : day.exercises.length === 0 ? (
            <p style={{ color: "var(--ink-3)", fontSize: 13 }}>No exercise detail available for uploaded programs.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {day.exercises.map((ex, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 16px",
                    background: "var(--surface)",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)", marginBottom: 6 }}>{ex.name}</div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{ex.sets} sets × {ex.reps} reps</span>
                    <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Rest {ex.restSec}s</span>
                    {ex.tempo && <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Tempo {ex.tempo}</span>}
                  </div>
                  {ex.notes && (
                    <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>{ex.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
