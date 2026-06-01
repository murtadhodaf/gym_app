import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { dailyCheckins } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { withErrorHandling } from "@/lib/api";

// GET /api/checkins/today — returns today's check-in or null
export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const today = new Date().toISOString().slice(0, 10);

  const [checkin] = await db
    .select()
    .from(dailyCheckins)
    .where(and(eq(dailyCheckins.userId, user.id), eq(dailyCheckins.date, today)))
    .limit(1);

  return NextResponse.json(checkin ?? null);
});
