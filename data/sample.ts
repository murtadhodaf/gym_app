// Phase 4–7 — hard-coded seed data for the static dashboard + AI adjust mock data

export const TODAY_WORKOUT = {
  title: "Push Day",
  focus: "Chest · Shoulders · Triceps",
  durationMin: 52,
  exerciseCount: 6,
  aiTuned: false,
  aiTunedReason: "",
  exercises: [
    { id: "1", name: "Bench Press" },
    { id: "2", name: "Incline DB Press" },
    { id: "3", name: "Shoulder Press" },
    { id: "4", name: "Lateral Raises" },
    { id: "5", name: "Tricep Dips" },
    { id: "6", name: "Cable Pushdown" },
  ],
};

export type DeltaDirection = "up" | "down" | "none";
export type StatVisual = "sparkline" | "ring" | "none";

export interface StatData {
  id: string;
  icon: string;
  label: string;
  value: string;
  unit: string;
  delta: string;
  deltaDir: DeltaDirection;
  deltaColor: "success" | "coral" | "ink-3";
  visual: StatVisual;
  sparkPoints?: number[];
  ringValue?: number;
}

export const STATS: StatData[] = [
  {
    id: "volume",
    icon: "⚡",
    label: "Weekly Volume",
    value: "42.8",
    unit: "k kg",
    delta: "+12% vs last week",
    deltaDir: "up",
    deltaColor: "success",
    visual: "sparkline",
    sparkPoints: [28, 31, 27, 35, 33, 38, 42.8],
  },
  {
    id: "recovery",
    icon: "🫀",
    label: "Recovery",
    value: "78",
    unit: "/100",
    delta: "Above baseline",
    deltaDir: "up",
    deltaColor: "success",
    visual: "ring",
    ringValue: 78,
  },
  {
    id: "bodyfat",
    icon: "📉",
    label: "Body Fat",
    value: "16.4",
    unit: "%",
    delta: "−0.8% in 30d",
    deltaDir: "down",
    deltaColor: "coral",
    visual: "sparkline",
    sparkPoints: [17.8, 17.5, 17.2, 17.0, 16.8, 16.6, 16.4],
  },
  {
    id: "streak",
    icon: "🔥",
    label: "Streak",
    value: "14",
    unit: "days",
    delta: "Personal best",
    deltaDir: "up",
    deltaColor: "success",
    visual: "none",
  },
];

export interface CoachRecommendation {
  id: string;
  icon: string;
  title: string;
  detail: string;
  confidence: number; // 0–100
}

export const COACH_INSIGHTS: CoachRecommendation[] = [
  {
    id: "1",
    icon: "💪",
    title: "Increase bench volume",
    detail: "Your chest responds well to higher volume. Add 1 working set this week.",
    confidence: 91,
  },
  {
    id: "2",
    icon: "😴",
    title: "Prioritise sleep tonight",
    detail: "Recovery score dipped after < 7 h sleep. Aim for 8 h before tomorrow's pull session.",
    confidence: 87,
  },
  {
    id: "3",
    icon: "🥗",
    title: "Protein target on track",
    detail: "You've hit 160 g/day for 5 days straight. Keep it up to support the hypertrophy block.",
    confidence: 78,
  },
];

export interface RecentSession {
  id: string;
  date: string; // e.g. "Mon 26 May"
  title: string;
  sub: string;
  volumeKg: number;
}

export const RECENT: RecentSession[] = [
  {
    id: "1",
    date: "Mon 26 May",
    title: "Push Day",
    sub: "Chest · Shoulders · Triceps",
    volumeKg: 4200,
  },
  {
    id: "2",
    date: "Sat 24 May",
    title: "Pull Day",
    sub: "Back · Biceps · Rear Delts",
    volumeKg: 3850,
  },
  {
    id: "3",
    date: "Thu 22 May",
    title: "Leg Day",
    sub: "Quads · Hamstrings · Glutes",
    volumeKg: 5100,
  },
  {
    id: "4",
    date: "Tue 20 May",
    title: "Push Day",
    sub: "Chest · Shoulders · Triceps",
    volumeKg: 3920,
  },
];

// ── Phase 7 — AI Adjust mock data ─────────────────────────────────────────────

export type ExerciseChange = "kept" | "added" | "removed" | "reduced" | "added_volume";

export interface AdjustedExercise {
  id: number;
  name: string;
  sets: number;
  reps: string;
  prev: string;
  change?: ExerciseChange;
  note?: string;
}

export interface AdjustedWorkout {
  title: string;
  focus: string;
  duration: number;
  intensity: number;
  reasonLabel: string;
  exercises: AdjustedExercise[];
}

export const ADJUSTED_WORKOUTS: Record<string, AdjustedWorkout> = {
  sick: {
    title: "Light Recovery",
    focus: "Mobility · Z1 only",
    duration: 28,
    intensity: 2,
    reasonLabel: "Switched from Push Day",
    exercises: [
      { id: 1, name: "Foam Roll – Full Body", sets: 1, reps: "8 min", prev: "—", change: "added" },
      { id: 2, name: "Cat-Cow Flow", sets: 3, reps: "10", prev: "—", change: "added" },
      { id: 3, name: "World's Greatest Stretch", sets: 2, reps: "6/side", prev: "—", change: "added" },
      { id: 4, name: "Banded Pull-Apart", sets: 3, reps: "15", prev: "Band light", change: "added" },
      { id: 5, name: "Easy Walk", sets: 1, reps: "12 min", prev: "Z2 pace", change: "added" },
    ],
  },
  sore_chest: {
    title: "Push Day (Adjusted)",
    focus: "Shoulders · Triceps emphasis",
    duration: 44,
    intensity: 6,
    reasonLabel: "Chest volume reduced 60%",
    exercises: [
      { id: 1, name: "Barbell Bench Press", sets: 2, reps: "8–10", prev: "72.5 kg × 7", change: "reduced", note: "4 sets → 2, drop weight 10%" },
      { id: 3, name: "Seated Shoulder Press", sets: 4, reps: "8–10", prev: "22 kg × 8", change: "added_volume", note: "+1 set vs planned" },
      { id: 4, name: "Cable Lateral Raise", sets: 4, reps: "12–15", prev: "8 kg × 14" },
      { id: 5, name: "Triceps Rope Pushdown", sets: 4, reps: "10–12", prev: "30 kg × 11", change: "added_volume", note: "+1 set" },
      { id: 6, name: "Overhead Cable Extension", sets: 3, reps: "10–12", prev: "22 kg × 12" },
      { id: 7, name: "Face Pull", sets: 3, reps: "15", prev: "—", change: "added", note: "New — postural balance" },
    ],
  },
  swap_pull: {
    title: "Pull Day",
    focus: "Back · Biceps",
    duration: 50,
    intensity: 7,
    reasonLabel: "Swapped from Push Day",
    exercises: [
      { id: 1, name: "Pull-Up", sets: 4, reps: "6–8", prev: "BW × 8", change: "added" },
      { id: 2, name: "Barbell Row", sets: 4, reps: "8–10", prev: "65 kg × 9", change: "added" },
      { id: 3, name: "Lat Pulldown", sets: 3, reps: "10–12", prev: "55 kg × 11", change: "added" },
      { id: 4, name: "Seated Cable Row", sets: 3, reps: "10–12", prev: "60 kg × 10", change: "added" },
      { id: 5, name: "Hammer Curl", sets: 3, reps: "10–12", prev: "14 kg × 11", change: "added" },
      { id: 6, name: "Incline DB Curl", sets: 3, reps: "10–12", prev: "10 kg × 10", change: "added" },
    ],
  },
  swap_legs: {
    title: "Leg Day",
    focus: "Quads · Glutes",
    duration: 58,
    intensity: 8,
    reasonLabel: "Swapped from Push Day",
    exercises: [
      { id: 1, name: "Back Squat", sets: 4, reps: "5–7", prev: "100 kg × 6", change: "added" },
      { id: 2, name: "Romanian Deadlift", sets: 3, reps: "8–10", prev: "90 kg × 8", change: "added" },
      { id: 3, name: "Bulgarian Split Squat", sets: 3, reps: "10/side", prev: "16 kg × 10", change: "added" },
      { id: 4, name: "Leg Press", sets: 3, reps: "12–15", prev: "180 kg × 13", change: "added" },
      { id: 5, name: "Standing Calf Raise", sets: 4, reps: "12–15", prev: "60 kg × 14", change: "added" },
    ],
  },
  short_time: {
    title: "Push Day (30 min)",
    focus: "Chest · Shoulders",
    duration: 30,
    intensity: 7,
    reasonLabel: "Trimmed to fit your time",
    exercises: [
      { id: 1, name: "Barbell Bench Press", sets: 3, reps: "6–8", prev: "72.5 kg × 7", change: "reduced", note: "4 sets → 3" },
      { id: 3, name: "Seated Shoulder Press", sets: 3, reps: "8–10", prev: "22 kg × 8" },
      { id: 5, name: "Triceps Pushdown + Lateral Raise (Superset)", sets: 3, reps: "12 / 15", prev: "—", change: "added", note: "Combined to save time" },
    ],
  },
};

export const ADJUST_RATIONALE: Record<string, string[]> = {
  sick: [
    "Pushing through illness typically adds 3–5 days to total recovery time.",
    "Light Z1 movement (HR < 120) preserves training adaptations without taxing the immune system.",
    "Strength work resumes once symptoms clear for 24h.",
  ],
  sore_chest: [
    "Chest soreness at 4/5 — full volume would interfere with protein synthesis recovery.",
    "Shoulders and triceps are fully recovered; lagging in 30-day volume vs chest.",
    "Face pulls added to restore posterior shoulder balance.",
  ],
  swap_pull: [
    "Back was last trained 5 days ago — within the 48–72h optimal frequency window.",
    "Tomorrow's planned Pull Day moves to Wednesday; recovery still hits 48h minimum.",
    "Total weekly volume per muscle remains within target range.",
  ],
  swap_legs: [
    "Lower body last trained 6 days ago — exceeding the optimal 72h re-stimulation window.",
    "Push Day moves to Wednesday; weekly volume targets unchanged.",
    "Calories adjusted to +200 kcal for high-output day.",
  ],
  short_time: [
    "Compound lifts retained — single-joint accessories combined into supersets.",
    "Volume preserved at 85% of original; expected strength impact: < 1%.",
    "If under 25 min, Forma suggests rescheduling instead.",
  ],
};

export const THINKING_STEPS: Record<string, string[]> = {
  sick: ["Reading symptoms…", "Checking immune-response data…", "Selecting Z1 mobility flow…", "Rescheduling Push Day to Thursday…"],
  sore_chest: ["Reading soreness report…", "Checking 30-day muscle volume balance…", "Reducing chest sets 60%…", "Boosting shoulder + triceps emphasis…"],
  swap_pull: ["Checking last back session…", "Verifying 48h recovery window…", "Selecting Pull Day exercises…", "Rebalancing this week's volume…"],
  swap_legs: ["Checking lower-body recovery…", "Verifying CNS readiness…", "Selecting heavy-lift block…", "Adjusting fuel recommendation…"],
  short_time: ["Reading available time…", "Preserving compound lifts…", "Pairing accessories into supersets…", "Reducing rest to 90s…"],
  default: ["Analyzing your last 7 sessions…", "Re-tuning today's session…", "Done."],
};
