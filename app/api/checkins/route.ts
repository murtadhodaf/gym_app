import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { dailyCheckins, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { withErrorHandling } from "@/lib/api";

const CheckInSchema = z.object({
  energy: z.number().int().min(1).max(5),
  soreParts: z.array(z.enum(["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"])).default([]),
  sick: z.boolean().default(false),
  focusChange: z
    .enum(["same", "push_harder", "lighter", "swap_pull", "swap_legs", "mobility"])
    .default("same"),
});

// POST /api/checkins — create or update today's check-in
export const POST = withErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();

  // Ensure user row exists
  await db
    .insert(users)
    .values({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? "",
      name: user.fullName,
    })
    .onConflictDoNothing();

  const body = await req.json().catch(() => ({}));
  const parsed = CheckInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const { energy, soreParts, sick, focusChange } = parsed.data;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const [checkin] = await db
    .insert(dailyCheckins)
    .values({
      userId: user.id,
      date: today,
      energy,
      sorePartsJson: soreParts,
      sick,
      focusChange,
    })
    .onConflictDoUpdate({
      target: [dailyCheckins.userId, dailyCheckins.date],
      set: {
        energy,
        sorePartsJson: soreParts,
        sick,
        focusChange,
      },
    })
    .returning();

  return NextResponse.json(checkin, { status: 201 });
});

// GET /api/checkins — list recent check-ins (optional ?limit=N)
export const GET = withErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "7"), 30);

  const rows = await db
    .select()
    .from(dailyCheckins)
    .where(eq(dailyCheckins.userId, user.id))
    .orderBy(desc(dailyCheckins.createdAt))
    .limit(limit);

  return NextResponse.json(rows);
});
