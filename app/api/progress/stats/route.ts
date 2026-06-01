import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { workouts, sets } from "@/db/schema";
import { and, eq, gte, isNotNull, sql, count, sum } from "drizzle-orm";
import { withErrorHandling } from "@/lib/api";

/**
 * GET /api/progress/stats
 * Returns summary stats for the current user:
 * - totalWorkouts (all time)
 * - workoutsThisMonth
 * - currentStreak (consecutive days with a workout ending in today/yesterday)
 * - longestStreak
 * - avgWorkoutsPerWeek (last 12 weeks)
 * - totalVolumeKg (all time)
 * - totalVolumeThisMonth
 */
export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const uid = user.id;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const twelveWeeksAgo = new Date(now.getTime() - 84 * 24 * 60 * 60 * 1000).toISOString();

  // ── All-time finished workouts ──────────────────────────────────────────────
  const [{ total }] = await db
    .select({ total: count() })
    .from(workouts)
    .where(and(eq(workouts.userId, uid), isNotNull(workouts.endedAt)));

  // ── Workouts this month ────────────────────────────────────────────────────
  const [{ thisMonth }] = await db
    .select({ thisMonth: count() })
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, uid),
        isNotNull(workouts.endedAt),
        gte(workouts.startedAt, new Date(monthStart))
      )
    );

  // ── All workout dates (for streak calc) ────────────────────────────────────
  const workoutDates = await db
    .select({
      day: sql<string>`to_char(${workouts.startedAt}, 'YYYY-MM-DD')`,
    })
    .from(workouts)
    .where(and(eq(workouts.userId, uid), isNotNull(workouts.endedAt)))
    .groupBy(sql`to_char(${workouts.startedAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${workouts.startedAt}, 'YYYY-MM-DD') DESC`);

  const daySet = new Set(workoutDates.map((r) => r.day));
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);

  // Current streak
  let currentStreak = 0;
  let cursor = daySet.has(today) ? today : daySet.has(yesterday) ? yesterday : null;
  while (cursor && daySet.has(cursor)) {
    currentStreak++;
    const prev = new Date(new Date(cursor).getTime() - 86400000).toISOString().slice(0, 10);
    cursor = prev;
  }

  // Longest streak (O(n) over sorted dates)
  const sortedDays = Array.from(daySet).sort();
  let longest = 0;
  let run = 0;
  let prevDay: string | null = null;
  for (const d of sortedDays) {
    if (prevDay) {
      const diff = (new Date(d).getTime() - new Date(prevDay).getTime()) / 86400000;
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prevDay = d;
  }

  // ── Avg workouts per week (last 12w) ───────────────────────────────────────
  const [{ recent }] = await db
    .select({ recent: count() })
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, uid),
        isNotNull(workouts.endedAt),
        gte(workouts.startedAt, new Date(twelveWeeksAgo))
      )
    );
  // Round to 1 decimal — e.g. 3.5 workouts/week, not an integer
  const avgPerWeek = Math.round((Number(recent) / 12) * 10) / 10;

  // ── Total volume all-time & this month ─────────────────────────────────────
  const allSetsJoined = await db
    .select({ vol: sum(sql<number>`${sets.weight} * ${sets.reps}`) })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .where(eq(workouts.userId, uid));

  const totalVolumeKg = Math.round(Number(allSetsJoined[0]?.vol ?? 0));

  const monthSetsJoined = await db
    .select({ vol: sum(sql<number>`${sets.weight} * ${sets.reps}`) })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .where(
      and(eq(workouts.userId, uid), gte(workouts.startedAt, new Date(monthStart)))
    );

  const volumeThisMonth = Math.round(Number(monthSetsJoined[0]?.vol ?? 0));

  return NextResponse.json({
    totalWorkouts: Number(total),
    workoutsThisMonth: Number(thisMonth),
    currentStreak,
    longestStreak: longest,
    avgWorkoutsPerWeek: avgPerWeek,
    totalVolumeKg,
    volumeThisMonth,
  });
});
