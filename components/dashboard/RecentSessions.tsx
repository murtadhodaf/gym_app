"use client";

import { useRecentWorkouts, type Workout } from "@/lib/workout-queries";
import { RECENT } from "@/data/sample";
import type { RecentSession } from "@/data/sample";
import { ActivityRow } from "./ActivityRow";

function workoutToSession(w: Workout): RecentSession {
  const date = new Date(w.startedAt).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return {
    id: w.id,
    date,
    title: w.title ?? "Workout",
    sub: w.focus ?? "",
    volumeKg: 0, // Volume aggregation comes in Phase 10
  };
}

export function RecentSessions() {
  const { data: workouts, isLoading } = useRecentWorkouts();

  // Use real DB data if available, otherwise sample data
  const sessions: RecentSession[] =
    workouts && workouts.length > 0
      ? workouts.slice(0, 5).map(workoutToSession)
      : RECENT;

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
      {isLoading ? (
        <div
          style={{
            padding: "20px 20px",
            color: "var(--ink-3)",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          Loading…
        </div>
      ) : (
        sessions.map((session, i) => (
          <ActivityRow key={session.id} session={session} isLast={i === sessions.length - 1} />
        ))
      )}
    </div>
  );
}
