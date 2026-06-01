/**
 * Deterministic .md program parser — no LLM, runs client-side AND server-side.
 *
 * Contract (from PHASES.md):
 *  - Title/summary from first #/##/### heading (fallback: first non-empty line)
 *  - `weeks` from any "N weeks" / "Week N of M" match (capped at 16)
 *  - For each Mon–Sun: find a line mentioning the day, strip list/table markers,
 *    take the workout after the first separator (: - – — |), tag from parens or
 *    second separator. "Rest"/"Off" → rest day.
 *  - Returns { summary, weeks, days[7], imported: true, trainedCount }
 *  - Reject if trainedCount === 0
 */

export type ProgramDay = {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  workout: string;
  tag: string | null;
  exercises: never[]; // uploaded programs have no exercise detail
};

export type ParsedProgram = {
  summary: string;
  weeks: number;
  days: ProgramDay[];
  imported: true;
  trainedCount: number;
};

const DAYS: Array<{ short: ProgramDay["day"]; patterns: RegExp }> = [
  { short: "Mon", patterns: /\bmon(day)?\b/i },
  { short: "Tue", patterns: /\btue(sday)?\b/i },
  { short: "Wed", patterns: /\bwed(nesday)?\b/i },
  { short: "Thu", patterns: /\bthu(rsday)?\b/i },
  { short: "Fri", patterns: /\bfri(day)?\b/i },
  { short: "Sat", patterns: /\bsat(urday)?\b/i },
  { short: "Sun", patterns: /\bsun(day)?\b/i },
];

/** Strip markdown list/table/heading markers from the start of a line */
function stripMarkers(line: string): string {
  return line.replace(/^[\s\-*>|#+]+/, "").trim();
}

/** Split on the first separator: : - – — | */
function splitOnSeparator(s: string): [string, string | null] {
  const match = s.match(/^(.*?)[\s]*[:–—|]\s*(.*)/);
  if (match) return [match[1].trim(), match[2].trim() || null];
  // also try " - " (hyphen surrounded by spaces)
  const hyphen = s.match(/^(.*?)\s+-\s+(.*)/);
  if (hyphen) return [hyphen[1].trim(), hyphen[2].trim() || null];
  return [s.trim(), null];
}

/** Extract tag from parentheses, e.g. "Push (Chest · Shoulders)" → "Chest · Shoulders" */
function extractTag(s: string): { workout: string; tag: string | null } {
  const paren = s.match(/^(.*?)\s*\(([^)]+)\)\s*(.*)$/);
  if (paren) {
    const workout = (paren[1] + (paren[3] ? " " + paren[3] : "")).trim();
    return { workout, tag: paren[2].trim() };
  }
  return { workout: s, tag: null };
}

export function parseProgramMarkdown(text: string): ParsedProgram {
  const lines = text.split("\n");

  // ── Summary ──────────────────────────────────────────────────────────────
  let summary = "";
  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.*)/);
    if (headingMatch) { summary = headingMatch[1].trim(); break; }
  }
  if (!summary) {
    for (const line of lines) {
      const t = line.trim();
      if (t) { summary = t; break; }
    }
  }
  summary = summary.slice(0, 200);

  // ── Weeks ─────────────────────────────────────────────────────────────────
  let weeks = 4;
  for (const line of lines) {
    const m1 = line.match(/(\d+)\s+weeks?/i);
    const m2 = line.match(/week\s+\d+\s+of\s+(\d+)/i);
    const m = m1 ?? m2;
    if (m) {
      weeks = Math.min(parseInt(m[1], 10), 16);
      break;
    }
  }

  // ── Days ─────────────────────────────────────────────────────────────────
  // Build a map of day → last matching line
  const dayLines: Map<string, string> = new Map();

  for (const line of lines) {
    for (const { short, patterns } of DAYS) {
      if (patterns.test(line)) {
        dayLines.set(short, line);
        break; // one day per line
      }
    }
  }

  const days: ProgramDay[] = DAYS.map(({ short }) => {
    const raw = dayLines.get(short);
    if (!raw) return { day: short, workout: "Rest", tag: null, exercises: [] };

    const stripped = stripMarkers(raw);
    const [, afterSep] = splitOnSeparator(stripped);
    const workoutRaw = afterSep ?? stripped;

    // Check for rest
    if (/\b(rest|off|recovery)\b/i.test(workoutRaw)) {
      return { day: short, workout: "Rest", tag: null, exercises: [] };
    }

    const { workout, tag: parenTag } = extractTag(workoutRaw);

    // Try to extract tag from a second separator if no paren tag
    let finalTag = parenTag;
    if (!finalTag) {
      const [w2, t2] = splitOnSeparator(workout);
      if (t2) {
        return { day: short, workout: w2, tag: t2, exercises: [] };
      }
    }

    return { day: short, workout: workout.slice(0, 80), tag: finalTag?.slice(0, 80) ?? null, exercises: [] };
  });

  const trainedCount = days.filter((d) => d.workout !== "Rest").length;

  return { summary, weeks, days, imported: true, trainedCount };
}

/** Server-side validation: re-parse and enforce constraints. Throws on failure. */
export function validateParsedProgram(parsed: ParsedProgram): void {
  if (parsed.trainedCount === 0) {
    throw new Error("No recognizable training days found in this .md file.");
  }
  if (parsed.days.length !== 7) {
    throw new Error("Program must have exactly 7 day entries.");
  }
  if (parsed.weeks < 1 || parsed.weeks > 16) {
    throw new Error("weeks must be between 1 and 16.");
  }
}
