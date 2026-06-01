import { pgTable, text, timestamp, boolean, integer, numeric, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";

// ── Users ─────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(),          // Clerk user ID
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Programs ──────────────────────────────────────────────────────────────────
export const programs = pgTable(
  "programs",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    source: text("source", { enum: ["ai", "upload"] }).notNull().default("ai"),
    name: text("name").notNull(),
    summary: text("summary"),
    weeks: integer("weeks").notNull().default(4),
    isActive: boolean("is_active").notNull().default(false),
    daysJson: jsonb("days_json"),
    sourceText: text("source_text"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxProgramsUser: index("idx_programs_user").on(t.userId),
    // NOTE: partial unique index "one_active_program" must be created via raw SQL migration:
    // CREATE UNIQUE INDEX one_active_program ON programs (user_id) WHERE is_active;
  })
);

// ── Exercises catalog ──────────────────────────────────────────────────────────
export const exercises = pgTable(
  "exercises",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    primaryMuscle: text("primary_muscle"),
    equipment: text("equipment"),
  },
  (t) => ({
    idxExercisesMuscle: index("idx_exercises_muscle").on(t.primaryMuscle),
  })
);

// ── Workouts ───────────────────────────────────────────────────────────────────
export const workouts = pgTable(
  "workouts",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    programId: text("program_id").references(() => programs.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    title: text("title"),
    focus: text("focus"),
    notes: text("notes"),
  },
  (t) => ({
    idxWorkoutsUserStarted: index("idx_workouts_user_started").on(t.userId, t.startedAt),
  })
);

// ── Sets ───────────────────────────────────────────────────────────────────────
export const sets = pgTable(
  "sets",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    workoutId: text("workout_id").notNull().references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id").references(() => exercises.id, { onDelete: "set null" }),
    exerciseName: text("exercise_name").notNull(), // denormalized snapshot
    setNumber: integer("set_number").notNull(),
    weight: numeric("weight"),
    reps: integer("reps"),
    rpe: numeric("rpe"),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxSetsWorkout: index("idx_sets_workout").on(t.workoutId),
    idxSetsExerciseTime: index("idx_sets_exercise_time").on(t.exerciseId, t.completedAt),
  })
);

// ── Daily check-ins ────────────────────────────────────────────────────────────
export const dailyCheckins = pgTable(
  "daily_checkins",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD
    energy: integer("energy"),   // 1–5
    sorePartsJson: jsonb("sore_parts_json"),
    sick: boolean("sick").notNull().default(false),
    focusChange: text("focus_change", {
      enum: ["same", "push_harder", "lighter", "swap_pull", "swap_legs", "mobility"],
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqCheckinPerDay: uniqueIndex("uniq_checkin_per_day").on(t.userId, t.date),
  })
);

// ── Coach insights (AI cache) ──────────────────────────────────────────────────
export const coachInsights = pgTable(
  "coach_insights",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD
    payloadJson: jsonb("payload_json").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqInsightPerDay: uniqueIndex("uniq_insight_per_day").on(t.userId, t.date),
  })
);

// ── AI cache (general deterministic input → output cache) ─────────────────────
export const aiCache = pgTable("ai_cache", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(), // sha256(model+promptVersion+normalizedInput)
  payloadJson: jsonb("payload_json").notNull(),
  model: text("model"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});
