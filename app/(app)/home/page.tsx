"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { HeroWorkoutCard } from "@/components/dashboard/HeroWorkoutCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { CoachCard } from "@/components/dashboard/CoachCard";
import { RecentSessions } from "@/components/dashboard/RecentSessions";
import { CheckInButton } from "@/components/dashboard/CheckInButton";
import { Greeting } from "@/components/dashboard/Greeting";
import { AdjustWorkoutModal } from "@/components/workout/AdjustWorkoutModal";
import { STATS, TODAY_WORKOUT, AdjustedWorkout } from "@/data/sample";
import type { AdjustResponse, AdjustReason } from "@/lib/adjust-queries";

export default function HomePage() {
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustedWorkout, setAdjustedWorkout] = useState<AdjustedWorkout | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [heroFlash, setHeroFlash] = useState(false);

  const handleApply = useCallback(
    (result: AdjustResponse, reason: AdjustReason) => {
      setAdjustedWorkout(result as AdjustedWorkout);
      const msgs: Record<string, string> = {
        sick: "Switched to recovery session — keep HR low",
        sore_chest: "Chest volume reduced 60% · Shoulder emphasis",
        swap_pull: "Swapped to Pull Day · week rebalanced",
        swap_legs: "Swapped to Leg Day · week rebalanced",
        short_time: "Trimmed to 30 min · compounds preserved",
      };
      setBanner(msgs[reason] ?? "Workout adjusted");
      setHeroFlash(true);
      setAdjustOpen(false);
      setTimeout(() => setHeroFlash(false), 1000);
    },
    []
  );

  // Build a workout shape compatible with HeroWorkoutCard
  const displayWorkout = adjustedWorkout
    ? {
        ...TODAY_WORKOUT,
        title: adjustedWorkout.title,
        focus: adjustedWorkout.focus,
        durationMin: adjustedWorkout.duration,
        exerciseCount: adjustedWorkout.exercises.length,
        exercises: adjustedWorkout.exercises.map((ex) => ({
          id: String(ex.id),
          name: ex.name,
        })),
        aiTuned: true,
        aiTunedReason: adjustedWorkout.reasonLabel,
      }
    : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Greeting />

        {/* Action bar */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <CheckInButton />
          <button
            onClick={() => setAdjustOpen(true)}
            style={{
              background: "var(--surface)",
              color: "var(--ink-2)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "inherit",
            }}
          >
            ✨ Adjust with AI
          </button>
          <Link
            href="/workout"
            style={{
              background: "var(--ink)",
              color: "var(--bg)",
              borderRadius: 20,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ▶ Start workout
          </Link>
        </div>
      </div>

      {/* Success banner */}
      {banner && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            background: "var(--success-soft)",
            border: "1px solid var(--success)",
            borderRadius: 12,
            padding: "12px 18px",
            fontSize: 13,
            color: "var(--success)",
          }}
        >
          <span>
            <strong>✓ Workout updated.</strong> {banner}
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <Link
              href="/workout"
              style={{
                fontSize: 12,
                color: "var(--success)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Start it →
            </Link>
            <button
              onClick={() => setBanner(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--success)",
                fontSize: 16,
                lineHeight: 1,
                padding: 2,
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Hero workout card */}
      <HeroWorkoutCard
        workout={displayWorkout}
        onAdjust={() => setAdjustOpen(true)}
        aiTuned={!!adjustedWorkout}
        aiTunedReason={adjustedWorkout?.reasonLabel}
        flash={heroFlash}
      />

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        {STATS.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Coach insights + Recent sessions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          alignItems: "start",
        }}
      >
        {/* Coach card */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 500,
                letterSpacing: "-0.015em",
                color: "var(--ink)",
                margin: 0,
              }}
            >
              Coach insights
            </h2>
            <Link
              href="/coach"
              style={{ fontSize: 13, color: "var(--ink-3)", textDecoration: "none" }}
            >
              Open coach →
            </Link>
          </div>
          <CoachCard />
        </div>

        {/* Recent sessions */}
        <div>
          <div style={{ marginBottom: 12 }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 500,
                letterSpacing: "-0.015em",
                color: "var(--ink)",
                margin: 0,
              }}
            >
              Recent sessions
            </h2>
          </div>
          <RecentSessions />
        </div>
      </div>

      {/* Adjust modal */}
      <AdjustWorkoutModal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        onApply={handleApply}
      />
    </div>
  );
}
