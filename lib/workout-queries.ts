"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Workout {
  id: string;
  userId: string;
  programId: string | null;
  startedAt: string;
  endedAt: string | null;
  title: string | null;
  focus: string | null;
  notes: string | null;
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

/** Fetch the 10 most recent finished workouts. */
export function useRecentWorkouts() {
  return useQuery<Workout[]>({
    queryKey: ["workouts"],
    queryFn: async () => {
      const res = await fetch("/api/workouts");
      if (!res.ok) throw new Error("Failed to fetch workouts");
      return res.json();
    },
    staleTime: 60_000,
  });
}

/** Create a new workout session. */
export function useCreateWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; focus: string; programId?: string }) => {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create workout");
      return res.json() as Promise<Workout>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  });
}

/** Finish a workout (set endedAt). */
export function useFinishWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const res = await fetch(`/api/workouts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endedAt: new Date().toISOString(), notes }),
      });
      if (!res.ok) throw new Error("Failed to finish workout");
      return res.json() as Promise<Workout>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  });
}

/** Batch-persist set completions. */
export function useBatchSets() {
  return useMutation({
    mutationFn: async (body: {
      workoutId: string;
      sets: Array<{
        exerciseId?: string | null;
        exerciseName: string;
        setNumber: number;
        weight?: number | null;
        reps?: number | null;
        rpe?: number | null;
      }>;
    }) => {
      const res = await fetch("/api/sets/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save sets");
      return res.json();
    },
  });
}
