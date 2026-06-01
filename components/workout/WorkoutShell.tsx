"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkoutStore } from "@/lib/workout-store";
import { useCreateWorkout, useFinishWorkout, useBatchSets } from "@/lib/workout-queries";
import { TODAY_WORKOUT } from "@/data/sample";
import { ExerciseCard } from "./ExerciseCard";
import { RestTimerCard } from "./RestTimerCard";
import { LiveCoachCard } from "./LiveCoachCard";

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function WorkoutShell() {
  const router = useRouter();
  const store = useWorkoutStore();
  const createWorkout = useCreateWorkout();
  const finishWorkout = useFinishWorkout();
  const batchSets = useBatchSets();
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerResetRef = useRef<(() => void) | null>(null);
  const isSaving = useRef(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Auto-start: only if no active session in persisted store ───────────────
  // workoutId is hydrated from localStorage via zustand persist before this effect runs
  useEffect(() => {
    if (store.workoutId) return; // Session already exists (page refresh) — restore, don't re-create

    createWorkout.mutate(
      { title: TODAY_WORKOUT.title, focus: TODAY_WORKOUT.focus },
      {
        onSuccess: (workout) => {
          store.startWorkout({
            workoutId: workout.id,
            title: TODAY_WORKOUT.title,
            focus: TODAY_WORKOUT.focus,
            exercises: TODAY_WORKOUT.exercises.map((ex) => ({
              id: ex.id,
              name: ex.name,
              sets: 4,
              reps: "8–12",
              prev: "80 kg",
            })),
          });
        },
      }
    );
    // Only run once on mount — store.workoutId check is the guard
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Session timer — respects isPaused ─────────────────────────────────────
  // store.tick is now a stable reference (no get() inside — see workout-store.ts),
  // so this effect only re-runs when isPaused changes, not on every render.
  const isPaused = store.isPaused;
  const tick = store.tick;
  useEffect(() => {
    if (isPaused) {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }
    tickRef.current = setInterval(tick, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
    // tick is stable — zustand store actions don't change identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  // ── Finish workout — guarded against double-submit ─────────────────────────
  const handleFinish = useCallback(async () => {
    if (!store.workoutId || isSaving.current) return;
    isSaving.current = true;
    setSaveError(null);

    // Collect all completed sets
    const doneSets: Parameters<typeof batchSets.mutate>[0]["sets"] = [];
    for (const ex of store.exercises) {
      const rows = store.setData[ex.id] ?? [];
      rows.forEach((row, idx) => {
        if (row.done) {
          doneSets.push({
            exerciseName: ex.name,
            setNumber: idx + 1,
            weight: row.weight ? parseFloat(row.weight) : null,
            reps: row.reps ? parseInt(row.reps) : null,
          });
        }
      });
    }

    try {
      // Persist sets first — if this fails we keep session alive
      if (doneSets.length > 0) {
        await batchSets.mutateAsync({ workoutId: store.workoutId, sets: doneSets });
      }
      await finishWorkout.mutateAsync({ id: store.workoutId });
      store.reset();
      router.push("/home");
    } catch (err) {
      console.error("Failed to finish workout:", err);
      setSaveError("Gagal menyimpan. Coba lagi.");
      isSaving.current = false;
    }
  }, [store, batchSets, finishWorkout, router]);

  const completedCount = store.exercises.filter((ex) => {
    const rows = store.setData[ex.id] ?? [];
    return rows.length > 0 && rows.every((r) => r.done);
  }).length;

  // Volume = weight × reps per completed set
  const totalVolume = Object.values(store.setData)
    .flat()
    .filter((r) => r.done)
    .reduce((acc, r) => {
      const w = parseFloat(r.weight) || 0;
      const reps = parseInt(r.reps) || 0;
      return acc + w * reps;
    }, 0);

  const isFinishing = finishWorkout.isPending || batchSets.isPending;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Error banner */}
      {saveError && (
        <div
          style={{
            background: "var(--coral-soft)",
            color: "var(--coral)",
            border: "1px solid var(--coral)",
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: 13,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {saveError}
          <button
            onClick={() => setSaveError(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--coral)", fontSize: 16 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 500,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            {store.title
              ? (() => {
                  const parts = store.title.split(" ");
                  return (
                    <>
                      {parts[0]}{" "}
                      <em
                        style={{
                          fontFamily: "var(--font-instrument)",
                          fontStyle: "italic",
                          fontWeight: 400,
                        }}
                      >
                        {parts.slice(1).join(" ")}
                      </em>
                    </>
                  );
                })()
              : "Workout"}
          </h1>
          <p style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>
            {store.focus}
            {store.exercises.length > 0 &&
              ` · ${completedCount}/${store.exercises.length} exercises complete`}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <button
            onClick={store.togglePause}
            disabled={isFinishing}
            style={{
              background: "var(--surface)",
              color: "var(--ink-2)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 500,
              cursor: isFinishing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "inherit",
              opacity: isFinishing ? 0.5 : 1,
            }}
          >
            {store.isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
          <button
            onClick={handleFinish}
            disabled={isFinishing}
            style={{
              background: "var(--ink)",
              color: "var(--bg)",
              border: "none",
              borderRadius: 20,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 500,
              cursor: isFinishing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "inherit",
              opacity: isFinishing ? 0.6 : 1,
            }}
          >
            ✓ {isFinishing ? "Saving…" : "Finish"}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left col */}
        <div>
          {/* Timer banner */}
          <div
            style={{
              background: "var(--ink)",
              color: "var(--bg)",
              borderRadius: "var(--radius)",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(242,239,229,0.6)",
                  marginBottom: 4,
                }}
              >
                Session time
              </div>
              <div
                style={{
                  fontFamily: "var(--font-geist-mono, monospace)",
                  fontSize: 36,
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                }}
              >
                {fmt(store.elapsedSec)}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(242,239,229,0.6)",
                  marginBottom: 4,
                }}
              >
                Volume so far
              </div>
              <div
                style={{
                  fontFamily: "var(--font-geist-mono, monospace)",
                  fontSize: 36,
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                }}
              >
                {totalVolume > 0 ? totalVolume.toLocaleString() : "—"}{" "}
                <span style={{ fontSize: 14, color: "rgba(242,239,229,0.6)" }}>kg</span>
              </div>
            </div>
          </div>

          {/* Exercise cards */}
          {store.exercises.length === 0 ? (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: 40,
                textAlign: "center",
                color: "var(--ink-3)",
                fontSize: 13,
              }}
            >
              {createWorkout.isPending ? "Starting session…" : "Loading session…"}
            </div>
          ) : (
            store.exercises.map((ex, idx) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                index={idx}
                isActive={store.activeExerciseId === ex.id}
                setData={store.setData[ex.id] ?? []}
                onClick={() => store.setActiveExercise(ex.id)}
                onToggleSet={(setIdx) => {
                  store.toggleSetDone(ex.id, setIdx);
                  if (restTimerResetRef.current) restTimerResetRef.current();
                }}
                onUpdateSet={(setIdx, patch) => store.updateSet(ex.id, setIdx, patch)}
              />
            ))
          )}
        </div>

        {/* Right col — sticky */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <RestTimerCard resetRef={restTimerResetRef} />
          <LiveCoachCard />
        </div>
      </div>
    </div>
  );
}
