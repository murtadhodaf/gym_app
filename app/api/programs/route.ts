import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { programs, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { withErrorHandling } from "@/lib/api";
import { parseProgramMarkdown, validateParsedProgram } from "@/lib/parse-program-markdown";
import { z } from "zod";

// GET /api/programs — list all programs for the current user
export const GET = withErrorHandling(async () => {
  const user = await requireUser();

  const rows = await db
    .select()
    .from(programs)
    .where(eq(programs.userId, user.id))
    .orderBy(desc(programs.createdAt));

  return NextResponse.json(rows);
});

// POST /api/programs — create from .md upload
const UploadSchema = z.object({
  source: z.literal("upload"),
  name: z.string().min(1).max(120),
  sourceText: z.string().min(1).max(100_000),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();

  // Upsert user row
  await db
    .insert(users)
    .values({ id: user.id, email: user.emailAddresses[0]?.emailAddress ?? "", name: user.fullName })
    .onConflictDoNothing();

  const body = await req.json();
  const parsed = UploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const { name, sourceText } = parsed.data;

  // Re-parse server-side and validate
  const programData = parseProgramMarkdown(sourceText);
  try {
    validateParsedProgram(programData);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid program" },
      { status: 422 }
    );
  }

  const [row] = await db
    .insert(programs)
    .values({
      userId: user.id,
      source: "upload",
      name: name.slice(0, 120),
      summary: programData.summary.slice(0, 300),
      weeks: programData.weeks,
      isActive: false,
      daysJson: programData.days,
      sourceText,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
});
