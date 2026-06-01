import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { sets, workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { withErrorHandling } from "@/lib/api";

const SetInput = z.object({
  exerciseId: z.string().optional().nullable(),
  exerciseName: z.string(),
  setNumber: z.number().int().positive(),
  weight: z.number().optional().nullable(),
  reps: z.number().int().optional().nullable(),
  rpe: z.number().optional().nullable(),
});

const BatchBody = z.object({
  workoutId: z.string(),
  sets: z.array(SetInput),
});

// POST /api/sets/batch — upsert multiple sets in one request
export const POST = withErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();

  const body = await req.json().catch(() => null);
  const parsed = BatchBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { workoutId, sets: inputSets } = parsed.data;

  // Verify ownership
  const [workout] = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, user.id)));

  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  if (inputSets.length === 0) {
    return NextResponse.json([]);
  }

  // Insert all completed sets in one statement
  const rows = await db
    .insert(sets)
    .values(
      inputSets.map((s) => ({
        workoutId,
        exerciseId: s.exerciseId ?? null,
        exerciseName: s.exerciseName,
        setNumber: s.setNumber,
        weight: s.weight != null ? String(s.weight) : null,
        reps: s.reps ?? null,
        rpe: s.rpe != null ? String(s.rpe) : null,
      }))
    )
    .returning();

  return NextResponse.json(rows, { status: 201 });
});
