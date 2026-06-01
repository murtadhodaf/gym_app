import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { programs } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { withErrorHandling } from "@/lib/api";

// PATCH /api/programs/[id]/activate — atomically flip isActive for this user
export const PATCH = withErrorHandling(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await params;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(programs)
      .where(and(eq(programs.id, id), eq(programs.userId, user.id)));

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Atomic: deactivate all → activate target
    await db.transaction(async (tx) => {
      await tx
        .update(programs)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(programs.userId, user.id));

      await tx
        .update(programs)
        .set({ isActive: true, updatedAt: new Date() })
        .where(and(eq(programs.id, id), eq(programs.userId, user.id)));
    });

    return NextResponse.json({ ok: true, id });
  }
);
