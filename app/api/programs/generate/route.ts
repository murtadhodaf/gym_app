import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { programs, users } from "@/db/schema";
import { withErrorHandling } from "@/lib/api";
import { callAnthropic, parseJsonResponse } from "@/lib/anthropic";
import { z } from "zod";

const SYSTEM_PROMPT = `You are Forma's program design engine. Given body composition, equipment, and goals, you design a 4-week training program.

Programming rules:
- Beginners (< 1 year): full-body 3×/week, focus on movement quality.
- Intermediate: 4-5 day split. Each muscle hit 2×/week minimum.
- Advanced: 5-6 day split. Specialization allowed.

Volume targets (sets per muscle per week, weighted by goal):
- Hypertrophy: 12-22 sets
- Strength: 8-12 sets, higher intensity
- Endurance: lower weight, higher reps, supersets

Progressive overload: +2.5kg or +1 rep weekly. Deload at week 4 (reduce volume 40%).

Goal weighting:
- "muscle" → hypertrophy block. Push/Pull/Legs.
- "fat" → maintain strength, add 1-2 cardio sessions.
- "strength" → Upper/Lower with low-rep heavy work.
- "endurance" → 3 lifting + 2-3 cardio.
- "mobility" → built into warmups + 1 dedicated day.

Rest day placement: never 3+ training days in a row.

You return ONLY valid JSON matching the response schema. No prose, no markdown fences.`;

const InputSchema = z.object({
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(300),
  bodyFatPct: z.number().min(3).max(60),
  age: z.number().min(13).max(100),
  sex: z.enum(["M", "F", "other"]).optional(),
  experience: z.enum(["Beginner", "Intermediate", "Advanced"]),
  daysPerWeek: z.union([z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  timePerSession: z.union([z.literal(30), z.literal(45), z.literal(60), z.literal(90)]),
  equipment: z.enum(["Full gym", "Home gym", "Dumbbells only", "Bodyweight"]),
  goals: z.array(z.enum(["muscle", "fat", "strength", "endurance", "mobility"])).min(1),
  injuryHistory: z.string().max(500).optional(),
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const POST = withErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();

  // Upsert user row
  await db
    .insert(users)
    .values({ id: user.id, email: user.emailAddresses[0]?.emailAddress ?? "", name: user.fullName })
    .onConflictDoNothing();

  const body = await req.json();
  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid inputs", issues: parsed.error.issues }, { status: 400 });
  }

  const input = parsed.data;

  const userMessage = `User profile:
- Height: ${input.height} cm, Weight: ${input.weight} kg, Body fat: ${input.bodyFatPct}%
- Age: ${input.age}, Sex: ${input.sex ?? "not specified"}
- Experience: ${input.experience}
- Days per week: ${input.daysPerWeek}, Time per session: ${input.timePerSession} min
- Equipment: ${input.equipment}
- Goals: ${input.goals.join(", ")}
${input.injuryHistory ? `- Injury history: ${input.injuryHistory}` : ""}

Generate a 4-week training program. Return JSON with this exact schema:
{
  "summary": "string — one-line program description",
  "weeks": 4,
  "days": [
    {
      "day": "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun",
      "workout": "Push"|"Pull"|"Legs"|"Rest"|"Cardio"|etc,
      "tag": "Chest · Shoulders" or null,
      "exercises": [
        { "name": "string", "sets": number, "reps": "string e.g. 8-10", "restSec": number, "tempo": "string optional", "notes": "string optional" }
      ]
    }
  ],
  "rationale": ["string", "string", "string"],
  "forecast": {
    "weightDelta": "+0.6 kg lean",
    "bodyFatDelta": "-0.4%",
    "benchDelta": "+5 kg",
    "squatDelta": "+7.5 kg"
  }
}`;

  const aiText = await callAnthropic(
    [{ role: "user", content: userMessage }],
    { system: SYSTEM_PROMPT, maxTokens: 4096, model: "claude-haiku-4-5-20251001" }
  );

  let programData: {
    summary: string;
    weeks: number;
    days: Array<{ day: string; workout: string; tag: string | null; exercises: unknown[] }>;
    rationale: string[];
    forecast: Record<string, string>;
  };

  try {
    programData = parseJsonResponse(aiText);
  } catch {
    return NextResponse.json({ error: "AI returned invalid JSON. Please try again." }, { status: 502 });
  }

  // Validate structure
  if (!programData.days || programData.days.length !== 7) {
    return NextResponse.json({ error: "AI returned incomplete program. Please try again." }, { status: 502 });
  }

  // Ensure all 7 days are present (fill missing with Rest)
  const dayMap = new Map(programData.days.map((d) => [d.day, d]));
  const normalizedDays = DAYS.map((day) =>
    dayMap.get(day) ?? { day, workout: "Rest", tag: null, exercises: [] }
  );

  const trainName = `${input.daysPerWeek}-day ${input.experience.toLowerCase()} program`;

  const [row] = await db
    .insert(programs)
    .values({
      userId: user.id,
      source: "ai",
      name: programData.summary?.slice(0, 120) ?? trainName,
      summary: programData.summary?.slice(0, 300) ?? trainName,
      weeks: 4,
      isActive: false,
      daysJson: {
        days: normalizedDays,
        rationale: programData.rationale ?? [],
        forecast: programData.forecast ?? {},
      },
      sourceText: null,
    })
    .returning();

  return NextResponse.json(
    {
      ...row,
      days: normalizedDays,
      rationale: programData.rationale ?? [],
      forecast: programData.forecast ?? {},
    },
    { status: 201 }
  );
});
