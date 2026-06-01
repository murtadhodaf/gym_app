import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { workouts, sets } from "@/db/schema";
import { and, eq, gte, sql, max, desc } from "drizzle-orm";
import { withErrorHandling } from "@/lib/api";

/**
 * GET /api/progress/strength?exercise=Bench+Press&weeks=12
 *
 * Returns the estimated 1RM progression over time for a given exercise.
 * If no exercise param, returns top-5 most-logged exercises.
 *
 * Epley formula: 1RM ≈ weight × (1 + reps/30)
 *
 * Shape (with exercise param):
 * { exercise, points: [{ date: "YYYY-MM-DD", e1rm: 105, weight: 100, reps: 5 }] }
 *
 * Shape (without exercise param):
 * { topExercises: ["Bench Press", "Squat", ...] }
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const exercise = searchParams.get("exercise");
  const weeks = Math.min(parseInt(searchParams.get("weeks") ?? "12"), 52);

  const since = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);

  if (!exercise) {
    // Return top exercises by log frequency
    const top = await db
      .select({
        name: sets.exerciseName,
        cnt: sql<number>`count(*)`,
      })
      .from(sets)
      .innerJoin(workouts, eq(sets.workoutId, workouts.id))
      .where(eq(workouts.userId, user.id))
      .groupBy(sets.exerciseName)
      .orderBy(desc(sql`count(*)`))
      .limit(8);

    return NextResponse.json({ topExercises: top.map((r) => r.name) });
  }

  // Best set per day for given exercise
  const rows = await db
    .select({
      date: sql<string>`to_char(${workouts.startedAt}, 'YYYY-MM-DD')`,
      weight: max(sets.weight),
      reps: sets.reps,
    })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .where(
      and(
        eq(workouts.userId, user.id),
        eq(sets.exerciseName, exercise),
        gte(workouts.startedAt, since)
      )
    )
    .groupBy(
      sql`to_char(${workouts.startedAt}, 'YYYY-MM-DD')`,
      sets.reps
    )
    .orderBy(sql`to_char(${workouts.startedAt}, 'YYYY-MM-DD') ASC`);

  const points = rows
    .filter((r) => r.weight != null && r.reps != null && Number(r.reps) > 0)
    .map((r) => {
      const w = Number(r.weight);
      const reps = Number(r.reps);
      const e1rm = Math.round(w * (1 + reps / 30));
      return { date: r.date, e1rm, weight: w, reps };
    });

  return NextResponse.json({ exercise, points });
});
