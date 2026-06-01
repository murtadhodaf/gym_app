import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { workouts, sets } from "@/db/schema";
import { and, eq, gte, sql, sum } from "drizzle-orm";
import { withErrorHandling } from "@/lib/api";

/**
 * GET /api/progress/volume?weeks=12
 * Returns weekly total volume (kg × reps) for the last N weeks.
 * Shape: { weeks: [{ week: "2025-W20", volumeKg: 42800, workoutCount: 3 }] }
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const weeks = Math.min(parseInt(searchParams.get("weeks") ?? "12"), 26);

  const since = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      week: sql<string>`to_char(date_trunc('week', ${workouts.startedAt}), 'IYYY-"W"IW')`,
      volumeKg: sum(sql<number>`${sets.weight} * ${sets.reps}`),
      workoutCount: sql<number>`count(distinct ${workouts.id})`,
    })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .where(and(eq(workouts.userId, user.id), gte(workouts.startedAt, since)))
    .groupBy(sql`date_trunc('week', ${workouts.startedAt})`)
    .orderBy(sql`date_trunc('week', ${workouts.startedAt}) ASC`);

  return NextResponse.json({
    weeks: rows.map((r) => ({
      week: r.week,
      volumeKg: Math.round(Number(r.volumeKg ?? 0)),
      workoutCount: Number(r.workoutCount),
    })),
  });
});
