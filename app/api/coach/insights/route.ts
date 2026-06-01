import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { coachInsights, workouts, sets, dailyCheckins } from "@/db/schema";
import { and, eq, gte, desc, sql, sum } from "drizzle-orm";
import { withErrorHandling } from "@/lib/api";

/**
 * GET /api/coach/insights
 * Returns today's coach insights (cached in DB) or generates them fresh.
 *
 * POST /api/coach/insights
 * Force-regenerate insights for today (invalidates cache).
 */

const TODAY = new Date().toISOString().slice(0, 10);

async function generateInsights(userId: string) {
  // Gather context: last 14 days workouts
  const since14 = new Date(Date.now() - 14 * 86400000);

  const recentWorkouts = await db
    .select({ id: workouts.id, title: workouts.title, startedAt: workouts.startedAt })
    .from(workouts)
    .where(and(eq(workouts.userId, userId), gte(workouts.startedAt, since14)))
    .orderBy(desc(workouts.startedAt))
    .limit(10);

  // Volume last 7 days
  const since7 = new Date(Date.now() - 7 * 86400000);
  const [volResult] = await db
    .select({ vol: sum(sql<number>`${sets.weight} * ${sets.reps}`) })
    .from(sets)
    .innerJoin(workouts, eq(sets.workoutId, workouts.id))
    .where(and(eq(workouts.userId, userId), gte(workouts.startedAt, since7)));
  const weekVol = Math.round(Number(volResult?.vol ?? 0));

  // Last check-in
  const [lastCheckin] = await db
    .select()
    .from(dailyCheckins)
    .where(eq(dailyCheckins.userId, userId))
    .orderBy(desc(dailyCheckins.createdAt))
    .limit(1);

  // Workout count this week
  const weekCount = recentWorkouts.filter(
    (w) => new Date(w.startedAt).getTime() > since7.getTime()
  ).length;

  // Build insights deterministically based on context
  const insights: Array<{ id: string; icon: string; title: string; detail: string; confidence: number }> = [];

  // Insight 1: Volume-based
  if (weekVol > 30000) {
    insights.push({
      id: "volume-high",
      icon: "⚡",
      title: "Strong volume week",
      detail: `You've moved ${(weekVol / 1000).toFixed(1)}k kg this week — top 20% for you. Recovery nutrition matters now.`,
      confidence: 88,
    });
  } else if (weekVol > 0 && weekVol < 10000) {
    insights.push({
      id: "volume-low",
      icon: "📈",
      title: "Volume below target",
      detail: `Only ${(weekVol / 1000).toFixed(1)}k kg moved this week. Add one session to stay on track.`,
      confidence: 82,
    });
  } else if (weekVol === 0) {
    insights.push({
      id: "volume-zero",
      icon: "🏃",
      title: "No sessions logged this week",
      detail: "Log your first session to start tracking progress. Even a 30-min workout counts.",
      confidence: 95,
    });
  } else {
    insights.push({
      id: "volume-ok",
      icon: "✅",
      title: "On track this week",
      detail: `${(weekVol / 1000).toFixed(1)}k kg total — solid effort. Keep consistency going into next week.`,
      confidence: 79,
    });
  }

  // Insight 2: Frequency
  if (weekCount >= 4) {
    insights.push({
      id: "freq-high",
      icon: "🔥",
      title: "High training frequency",
      detail: `${weekCount} sessions this week. Make sure you have at least one rest day — CNS recovery is part of the gains.`,
      confidence: 85,
    });
  } else if (weekCount === 0) {
    insights.push({
      id: "freq-zero",
      icon: "📅",
      title: "Start your week strong",
      detail: "No sessions yet this week. Aim for 3–4 to hit your target frequency.",
      confidence: 90,
    });
  } else {
    insights.push({
      id: "freq-ok",
      icon: "💪",
      title: `${weekCount} session${weekCount > 1 ? "s" : ""} this week`,
      detail: weekCount === 1
        ? "Good start. 2–3 more sessions this week will keep muscle protein synthesis elevated."
        : "Good frequency. Stay consistent to maximise the cumulative adaptation effect.",
      confidence: 80,
    });
  }

  // Insight 3: Check-in based
  if (lastCheckin) {
    const energy = lastCheckin.energy ?? 3;
    const sick = lastCheckin.sick;
    const soreParts = (lastCheckin.sorePartsJson as string[] | null) ?? [];

    if (sick) {
      insights.push({
        id: "checkin-sick",
        icon: "🤒",
        title: "Recovery mode recommended",
        detail: "You reported feeling sick. Light mobility work or rest will speed up recovery faster than a full session.",
        confidence: 93,
      });
    } else if (energy <= 2) {
      insights.push({
        id: "checkin-lowenergy",
        icon: "😴",
        title: "Low energy reported",
        detail: "Energy at 2/5 — consider a shorter, lower-intensity session today. Prioritise sleep (8h target) tonight.",
        confidence: 87,
      });
    } else if (soreParts.length >= 2) {
      insights.push({
        id: "checkin-sore",
        icon: "🧊",
        title: `${soreParts.slice(0, 2).join(" & ")} soreness noted`,
        detail: `You reported soreness in ${soreParts.join(", ")}. Adjust today's session to avoid those muscle groups.`,
        confidence: 84,
      });
    } else if (energy >= 4) {
      insights.push({
        id: "checkin-great",
        icon: "🚀",
        title: "Energy levels high",
        detail: "You're feeling great today — good day to push intensity or attempt a PR.",
        confidence: 83,
      });
    }
  } else {
    insights.push({
      id: "checkin-missing",
      icon: "📋",
      title: "Log your daily check-in",
      detail: "Daily check-ins help Forma personalise your workouts. Takes 30 seconds — do it before your session.",
      confidence: 91,
    });
  }

  // Insight 4: Workout variety (last 14 days)
  const titles = recentWorkouts.map((w) => w.title?.toLowerCase() ?? "");
  const hasPull = titles.some((t) => t.includes("pull") || t.includes("back"));
  const hasLegs = titles.some((t) => t.includes("leg") || t.includes("squat"));

  if (recentWorkouts.length >= 3 && !hasLegs) {
    insights.push({
      id: "variety-legs",
      icon: "🦵",
      title: "Leg day overdue",
      detail: "No lower-body session in the last 14 days. Quads & hamstrings need stimulus for balanced development.",
      confidence: 86,
    });
  } else if (recentWorkouts.length >= 3 && !hasPull) {
    insights.push({
      id: "variety-pull",
      icon: "💪",
      title: "Add a pull session",
      detail: "Back & biceps haven't been trained recently. Imbalanced push/pull ratio can lead to shoulder issues.",
      confidence: 82,
    });
  }

  return insights.slice(0, 4); // max 4 insights
}

export const GET = withErrorHandling(async () => {
  const user = await requireUser();

  // Check cache
  const [cached] = await db
    .select()
    .from(coachInsights)
    .where(and(eq(coachInsights.userId, user.id), eq(coachInsights.date, TODAY)))
    .limit(1);

  if (cached) {
    return NextResponse.json(cached.payloadJson);
  }

  // Generate fresh
  const insights = await generateInsights(user.id);

  // Cache in DB
  await db
    .insert(coachInsights)
    .values({ userId: user.id, date: TODAY, payloadJson: insights })
    .onConflictDoUpdate({
      target: [coachInsights.userId, coachInsights.date],
      set: { payloadJson: insights, createdAt: new Date() },
    });

  return NextResponse.json(insights);
});

// Force refresh
export const POST = withErrorHandling(async () => {
  const user = await requireUser();

  const insights = await generateInsights(user.id);

  await db
    .insert(coachInsights)
    .values({ userId: user.id, date: TODAY, payloadJson: insights })
    .onConflictDoUpdate({
      target: [coachInsights.userId, coachInsights.date],
      set: { payloadJson: insights, createdAt: new Date() },
    });

  return NextResponse.json(insights);
});
