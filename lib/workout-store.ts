"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ExerciseDef {
  id: string;
  name: string;
  sets: number;
  reps: string;   // e.g. "8-12"
  prev: string;   // e.g. "80 kg"
}

export interface SetState {
  weight: string;
  reps: string;
  done: boolean;
}

export interface WorkoutStore {
  // Session identity
  workoutId: string | null;
  title: string;
  focus: string;
  exercises: ExerciseDef[];

  // Live state
  startedAt: number | null;      // Date.now() when started
  elapsedSec: number;
  isPaused: boolean;
  activeExerciseId: string | null;

  // Set data: Record<exerciseId, SetState[]>
  setData: Record<string, SetState[]>;

  // Actions
  startWorkout: (params: {
    workoutId: string;
    title: string;
    focus: string;
    exercises: ExerciseDef[];
  }) => void;
  tick: () => void;
  togglePause: () => void;
  setActiveExercise: (id: string) => void;
  updateSet: (exerciseId: string, setIdx: number, patch: Partial<SetState>) => void;
  toggleSetDone: (exerciseId: string, setIdx: number) => void;
  reset: () => void;
}

const initialSetData = (exercises: ExerciseDef[]): Record<string, SetState[]> => {
  const data: Record<string, SetState[]> = {};
  for (const ex of exercises) {
    const prevWeight = parseFloat(ex.prev) || 0;
    const defaultReps = ex.reps.split(/[-–]/)[0] ?? "8";
    data[ex.id] = Array.from({ length: ex.sets }, () => ({
      weight: prevWeight > 0 ? String(prevWeight) : "",
      reps: defaultReps,
      done: false,
    }));
  }
  return data;
};

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      workoutId: null,
      title: "",
      focus: "",
      exercises: [],
      startedAt: null,
      elapsedSec: 0,
      isPaused: false,
      activeExerciseId: null,
      setData: {},

      startWorkout: ({ workoutId, title, focus, exercises }) => {
        set({
          workoutId,
          title,
          focus,
          exercises,
          startedAt: Date.now(),
          elapsedSec: 0,
          isPaused: false,
          activeExerciseId: exercises[0]?.id ?? null,
          setData: initialSetData(exercises),
        });
      },

      // tick uses set's updater form exclusively — no get() call — so the
      // function reference is stable across re-renders and the interval in
      // WorkoutShell doesn't restart on every render.
      tick: () =>
        set((s) => (s.isPaused ? {} : { elapsedSec: s.elapsedSec + 1 })),

      togglePause: () => set((s) => ({ isPaused: !s.isPaused })),

      setActiveExercise: (id) => set({ activeExerciseId: id }),

      updateSet: (exerciseId, setIdx, patch) => {
        set((s) => {
          const cur = s.setData[exerciseId] ?? [];
          const updated = [...cur];
          updated[setIdx] = { ...updated[setIdx], ...patch };
          return { setData: { ...s.setData, [exerciseId]: updated } };
        });
      },

      toggleSetDone: (exerciseId, setIdx) => {
        const { setData, updateSet } = get();
        const cur = setData[exerciseId]?.[setIdx];
        if (cur) updateSet(exerciseId, setIdx, { done: !cur.done });
      },

      reset: () =>
        set({
          workoutId: null,
          title: "",
          focus: "",
          exercises: [],
          startedAt: null,
          elapsedSec: 0,
          isPaused: false,
          activeExerciseId: null,
          setData: {},
        }),
    }),
    {
      name: "forma-workout-session",
      // Only persist the bare minimum to survive a refresh
      partialize: (s) => ({
        workoutId: s.workoutId,
        title: s.title,
        focus: s.focus,
        exercises: s.exercises,
        startedAt: s.startedAt,
        elapsedSec: s.elapsedSec,
        isPaused: s.isPaused,
        activeExerciseId: s.activeExerciseId,
        setData: s.setData,
      }),
    }
  )
);
