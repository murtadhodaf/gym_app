"use client";

import { useQuery } from "@tanstack/react-query";

type ProgramDay = {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  workout: string;
  tag: string | null;
  exercises: Array<{ name: string; sets: number; reps: string; restSec: number }>;
};

type ProgramRow = {
  id: string;
  name: string;
  summary: string | null;
  weeks: number;
  isActive: boolean;
  daysJson: unknown;
};

const SHORT_DAYS: Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"> = [
  "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
];

function getDays(daysJson: unknown): ProgramDay[] {
  const data = daysJson as { days?: ProgramDay[] } | ProgramDay[] | null;
  if (!data) return [];
  return Array.isArray(data) ? data : (data.days ?? []);
}

/** Returns a HeroWorkoutCard-compatible shape from today's active program day, or null. */
export function useActiveProgramWorkout() {
  const { data: programs } = useQuery<ProgramRow[]>({
    queryKey: ["programs"],
    queryFn: () => fetch("/api/programs").then((r) => r.json()),
    staleTime: 60_000,
  });

  const active = programs?.find((p) => p.isActive);
  if (!active) return null;

  const days = getDays(active.daysJson);
  if (!days.length) return null;

  // 0 = Mon ... 6 = Sun in our array, but JS Date.getDay() 0 = Sun
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon...
  const idx = jsDay === 0 ? 6 : jsDay - 1; // convert to Mon=0 index
  const todayEntry = days[idx] ?? days.find((d) => d.day === SHORT_DAYS[idx]);

  if (!todayEntry || todayEntry.workout === "Rest") {
    // Rest day
    return {
      title: "Rest Day",
      focus: "Recovery",
      durationMin: 0,
      exerciseCount: 0,
      exercises: [],
      isRest: true,
      programName: active.name,
    };
  }

  return {
    title: todayEntry.workout,
    focus: todayEntry.tag ?? todayEntry.workout,
    durationMin: 60,
    exerciseCount: todayEntry.exercises.length,
    exercises: todayEntry.exercises.map((ex, i) => ({ id: String(i), name: ex.name })),
    isRest: false,
    programName: active.name,
    aiTuned: false,
    aiTunedReason: "",
  };
}
