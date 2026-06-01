import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { workouts, users } from "@/db/schema";
import { and, eq, desc, isNotNull } from "drizzle-orm";
import { withErrorHandling } from "@/lib/api";

// POST /api/workouts — create a new workout session
export const POST = withErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();

  // Ensure user row exists (upsert)
  await db
    .insert(users)
    .values({ id: user.id, email: user.emailAddresses[0]?.emailAddress ?? "", name: user.fullName })
    .onConflictDoNothing();

  const body = await req.json().catch(() => ({}));
  // Sanitize & cap lengths to prevent oversized inserts
  const title: string = String(body.title ?? "Workout").slice(0, 120);
  const focus: string = String(body.focus ?? "").slice(0, 200);
  const programId: string | undefined =
    typeof body.programId === "string" ? body.programId.slice(0, 36) : undefined;

  const [workout] = await db
    .insert(workouts)
    .values({
      userId: user.id,
      title,
      focus,
      programId: programId ?? null,
    })
    .returning();

  return NextResponse.json(workout, { status: 201 });
});

// GET /api/workouts — list recent workouts for the user
export const GET = withErrorHandling(async () => {
  const user = await requireUser();

  const recent = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.userId, user.id), isNotNull(workouts.endedAt)))
    .orderBy(desc(workouts.startedAt))
    .limit(10);

  return NextResponse.json(recent);
});
