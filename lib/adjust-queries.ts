"use client";

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { ADJUSTED_WORKOUTS } from "@/data/sample";

// ── Zod schema ─────────────────────────────────────────────────────────────────
export const AdjustResponseSchema = z.object({
  title: z.string().max(40),
  focus: z.string().max(60),
  duration: z.number().min(10).max(180),
  intensity: z.number().min(1).max(10),
  reasonLabel: z.string().max(60),
  exercises: z
    .array(
      z.object({
        id: z.number(),
        name: z.string().max(60),
        sets: z.number().min(1).max(8),
        reps: z.string().max(20),
        prev: z.string().max(40),
        change: z
          .enum(["kept", "added", "removed", "reduced", "added_volume"])
          .optional(),
        note: z.string().max(120).optional(),
      })
    )
    .min(3)
    .max(10),
  rationale: z.array(z.string().max(200)).min(2).max(4),
});

export type AdjustResponse = z.infer<typeof AdjustResponseSchema>;

export type AdjustReason = "sick" | "sore_chest" | "swap_pull" | "swap_legs" | "short_time";

export interface AdjustRequest {
  reason: AdjustReason;
  soreParts?: string[];
  swapTarget?: string;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Returns a mock result for a given reason (with simulated delay). */
async function mockAdjust(reason: AdjustReason): Promise<AdjustResponse> {
  await sleep(2400); // simulate AI thinking
  const mock = ADJUSTED_WORKOUTS[reason] ?? ADJUSTED_WORKOUTS["sick"];
  // Attach a default rationale
  const rationaleMap: Record<string, string[]> = {
    sick: [
      "Pushing through illness typically adds 3–5 days to total recovery time.",
      "Light Z1 movement preserves training adaptations without taxing the immune system.",
    ],
    sore_chest: [
      "Chest soreness at 4/5 — full volume would interfere with protein synthesis recovery.",
      "Shoulders and triceps are fully recovered; lagging in 30-day volume vs chest.",
      "Face pulls added to restore posterior shoulder balance.",
    ],
    swap_pull: [
      "Back was last trained 5 days ago — within the 48–72h optimal frequency window.",
      "Total weekly volume per muscle remains within target range.",
    ],
    swap_legs: [
      "Lower body last trained 6 days ago — exceeding the 72h re-stimulation window.",
      "Push Day moves to Wednesday; weekly volume targets unchanged.",
    ],
    short_time: [
      "Compound lifts retained — accessories combined into supersets.",
      "Volume preserved at 85% of original.",
    ],
  };
  return {
    ...mock,
    rationale: rationaleMap[reason] ?? rationaleMap["sick"],
    exercises: mock.exercises.map((ex) => ({
      ...ex,
      change: ex.change ?? undefined,
    })),
  };
}

/** Hook: calls /api/workouts/adjust (or mock if NEXT_PUBLIC_USE_MOCK_AI=true). */
export function useAdjustWorkout() {
  return useMutation({
    mutationFn: async (req: AdjustRequest): Promise<AdjustResponse> => {
      const useMock =
        process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" ||
        !process.env.NEXT_PUBLIC_USE_MOCK_AI; // default to mock until real key configured

      if (useMock) {
        return mockAdjust(req.reason);
      }

      const res = await fetch("/api/workouts/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });

      if (!res.ok) {
        // Fall back to mock on server error
        return mockAdjust(req.reason);
      }

      const json = await res.json();
      const parsed = AdjustResponseSchema.safeParse(json);
      if (!parsed.success) {
        console.warn("[adjust] Zod validation failed, falling back to mock", parsed.error);
        return mockAdjust(req.reason);
      }
      return parsed.data;
    },
  });
}
