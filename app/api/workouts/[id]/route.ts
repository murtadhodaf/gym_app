import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { withErrorHandling } from "@/lib/api";

// PATCH /api/workouts/[id] — finish a workout (set endedAt, notes)
export const PATCH = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const user = await requireUser();
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const endedAt: string | undefined = body.endedAt;
  const notes: string | undefined = body.notes;

  const [updated] = await db
    .update(workouts)
    .set({
      endedAt: endedAt ? new Date(endedAt) : new Date(),
      ...(notes !== undefined && { notes }),
    })
    .where(and(eq(workouts.id, id), eq(workouts.userId, user.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
});

// GET /api/workouts/[id] — fetch a single workout with its sets
export const GET = withErrorHandling(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const user = await requireUser();
  const { id } = await params;

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, id), eq(workouts.userId, user.id)));

  if (!workout) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(workout);
});
