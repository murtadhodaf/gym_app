import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { programs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { withErrorHandling } from "@/lib/api";

// DELETE /api/programs/[id] — remove an uploaded program (not the active seeded one)
export const DELETE = withErrorHandling(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await params;

    const [existing] = await db
      .select()
      .from(programs)
      .where(and(eq(programs.id, id), eq(programs.userId, user.id)));

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db
      .delete(programs)
      .where(and(eq(programs.id, id), eq(programs.userId, user.id)));

    return NextResponse.json({ ok: true });
  }
);
