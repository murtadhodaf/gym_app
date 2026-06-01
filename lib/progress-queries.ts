"use client";

import { useQuery } from "@tanstack/react-query";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ProgressStats {
  totalWorkouts: number;
  workoutsThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  avgWorkoutsPerWeek: number;
  totalVolumeKg: number;
  volumeThisMonth: number;
}

export interface VolumeWeek {
  week: string;          // "2025-W20"
  volumeKg: number;
  workoutCount: number;
}

export interface StrengthPoint {
  date: string;          // "YYYY-MM-DD"
  e1rm: number;
  weight: number;
  reps: number;
}

export interface CoachInsight {
  id: string;
  icon: string;
  title: string;
  detail: string;
  confidence: number;
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useProgressStats() {
  return useQuery<ProgressStats>({
    queryKey: ["progress", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/progress/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useVolumeHistory(weeks = 12) {
  return useQuery<{ weeks: VolumeWeek[] }>({
    queryKey: ["progress", "volume", weeks],
    queryFn: async () => {
      const res = await fetch(`/api/progress/volume?weeks=${weeks}`);
      if (!res.ok) throw new Error("Failed to fetch volume");
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useTopExercises() {
  return useQuery<{ topExercises: string[] }>({
    queryKey: ["progress", "strength", "top"],
    queryFn: async () => {
      const res = await fetch("/api/progress/strength");
      if (!res.ok) throw new Error("Failed to fetch exercises");
      return res.json();
    },
    staleTime: 300_000,
  });
}

export function useStrengthHistory(exercise: string | null, weeks = 12) {
  return useQuery<{ exercise: string; points: StrengthPoint[] }>({
    queryKey: ["progress", "strength", exercise, weeks],
    queryFn: async () => {
      const res = await fetch(
        `/api/progress/strength?exercise=${encodeURIComponent(exercise!)}&weeks=${weeks}`
      );
      if (!res.ok) throw new Error("Failed to fetch strength");
      return res.json();
    },
    enabled: !!exercise,
    staleTime: 60_000,
  });
}

export function useCoachInsights() {
  return useQuery<CoachInsight[]>({
    queryKey: ["coach", "insights"],
    queryFn: async () => {
      const res = await fetch("/api/coach/insights");
      if (!res.ok) throw new Error("Failed to fetch insights");
      return res.json();
    },
    staleTime: 300_000,
  });
}
