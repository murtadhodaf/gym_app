import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api";
import { z } from "zod";
import { ADJUSTED_WORKOUTS, ADJUST_RATIONALE } from "@/data/sample";

// ── Zod schemas ────────────────────────────────────────────────────────────────

const AdjustRequestSchema = z.object({
  reason: z.enum(["sick", "sore_chest", "swap_pull", "swap_legs", "short_time"]),
  soreParts: z
    .array(z.enum(["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"]))
    .optional(),
  swapTarget: z.string().optional(),
});

const AdjustResponseSchema = z.object({
  title: z.string().max(40),
  focus: z.string().max(60),
  duration: z.number().min(10).max(180),
  intensity: z.number().min(1).max(10),
  reasonLabel: z.string().max(60),
  exercises: z
    .array(
      z.object({
        id: z.number(),
        name: z.string().max(60),
        sets: z.number().min(1).max(8),
        reps: z.string().max(20),
        prev: z.string().max(40),
        change: z
          .enum(["kept", "added", "removed", "reduced", "added_volume"])
          .optional(),
        note: z.string().max(120).optional(),
      })
    )
    .min(3)
    .max(10),
  rationale: z.array(z.string().max(200)).min(2).max(4),
});

type AdjustReason = z.infer<typeof AdjustRequestSchema>["reason"];

// ── Fallback: deterministic mock ───────────────────────────────────────────────

function buildMockResponse(reason: AdjustReason) {
  const mock = ADJUSTED_WORKOUTS[reason] ?? ADJUSTED_WORKOUTS["sick"];
  const rationale = ADJUST_RATIONALE[reason] ?? ADJUST_RATIONALE["sick"];
  return {
    ...mock,
    rationale,
    exercises: mock.exercises.map((ex) => ({
      ...ex,
      id: typeof ex.id === "string" ? parseInt(ex.id) : ex.id,
    })),
  };
}

// ── Real AI call (Anthropic) ───────────────────────────────────────────────────

async function callAnthropicAdjust(
  reason: AdjustReason,
  soreParts?: string[]
): Promise<z.infer<typeof AdjustResponseSchema>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("No ANTHROPIC_API_KEY");

  const systemPrompt = `You are Forma's adaptive training engine. Given a user's planned workout and how
they're feeling today, you produce a re-tuned version of today's session.

Principles:
- Sickness → swap to mobility / Z1 cardio. Keep HR < 120 bpm.
- Soreness → reduce volume on sore muscles by 40-60%. Compensate by adding
  1 set to nearby muscles that are recovered AND lagging in monthly volume.
- Swapping muscle groups → recalibrate using last-trained-date. Don't pick a
  muscle group trained in the last 48h.
- Time-limited → preserve compound lifts. Superset accessories.
- Always retain the user's id field for exercises that are kept or modified.
  New exercises get a fresh id (max existing + 1, 2, …).

You return ONLY valid JSON matching the response schema. No prose, no markdown.`;

  const userMessage = `Today's planned workout: Push Day (Chest · Shoulders · Triceps, 52 min, 6 exercises)

Reason for adjustment: ${reason}${soreParts?.length ? `\nSore muscle groups: ${soreParts.join(", ")}` : ""}

Generate an adjusted workout. The rationale should explain decisions in plain, encouraging language.`;

  const body = {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);

  const data = await res.json();
  const text = data.content?.[0]?.text ?? "";

  // Extract JSON from response (handle possible markdown code fences)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in response");

  return AdjustResponseSchema.parse(JSON.parse(jsonMatch[0]));
}

// ── Route handler ─────────────────────────────────────────────────────────────

export const POST = withErrorHandling(async (req: NextRequest) => {
  await requireUser();

  const body = await req.json().catch(() => ({}));
  const parsed = AdjustRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { reason, soreParts } = parsed.data;

  // Try real AI first; fall back to mock on any error
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const result = await callAnthropicAdjust(reason, soreParts);
      return NextResponse.json(result);
    } catch (err) {
      console.warn("[adjust] AI call failed, falling back to mock:", err);
      // fall through to deterministic fallback
    }
  }

  // Deterministic fallback — always works, no network dependency
  return NextResponse.json(buildMockResponse(reason));
});
