"use client";

import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHead } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { ProgramLibrary, ProgramRow } from "./program-library";
import { DayDrawer, ProgramDayData } from "./day-drawer";
import { parseProgramMarkdown } from "@/lib/parse-program-markdown";

// ── Types ─────────────────────────────────────────────────────────────────────

type Goals = "muscle" | "fat" | "strength" | "endurance" | "mobility";

const GOAL_OPTIONS: { id: Goals; label: string }[] = [
  { id: "muscle", label: "Build muscle" },
  { id: "fat", label: "Lose fat" },
  { id: "strength", label: "Gain strength" },
  { id: "endurance", label: "Improve endurance" },
  { id: "mobility", label: "Mobility" },
];

const AI_STEPS = [
  "Analyzing body composition…",
  "Calculating recovery capacity…",
  "Selecting training split…",
  "Optimizing exercise selection…",
  "Programming progressive overload…",
];

const IMPORT_STEPS = [
  "Reading program file…",
  "Parsing training schedule…",
  "Adapting to your profile…",
  "Finalizing structure…",
];

type Stage = "preview" | "form" | "thinking";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDaysFromProgram(prog: ProgramRow): ProgramDayData[] {
  const data = prog.daysJson as
    | { days: ProgramDayData[] }
    | ProgramDayData[]
    | null;
  if (!data) return [];
  return Array.isArray(data) ? data : (data.days ?? []);
}

function getRationale(prog: ProgramRow): string[] {
  const data = prog.daysJson as { rationale?: string[] } | null;
  return data?.rationale ?? [];
}

function getForecast(prog: ProgramRow): Record<string, string> {
  const data = prog.daysJson as { forecast?: Record<string, string> } | null;
  return data?.forecast ?? {};
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ProgramClient() {
  const qc = useQueryClient();

  // ── State ────────────────────────────────────────────────────────────────
  const [stage, setStage] = useState<Stage>("preview");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<ProgramDayData | null>(null);
  const [thinkStep, setThinkStep] = useState(0);
  const [thinkSteps, setThinkSteps] = useState(AI_STEPS);
  const [importError, setImportError] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    height: 178,
    weight: 74,
    bodyFatPct: 16,
    age: 28,
    sex: "M" as "M" | "F" | "other",
    experience: "Intermediate" as "Beginner" | "Intermediate" | "Advanced",
    daysPerWeek: 5 as 3 | 4 | 5 | 6,
    timePerSession: 60 as 30 | 45 | 60 | 90,
    equipment: "Full gym" as "Full gym" | "Home gym" | "Dumbbells only" | "Bodyweight",
    goals: ["muscle"] as Goals[],
    injuryHistory: "",
  });

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: programList = [], isLoading } = useQuery<ProgramRow[]>({
    queryKey: ["programs"],
    queryFn: () => fetch("/api/programs").then((r) => r.json()),
  });

  // Selected program (fallback to active, then first)
  const selectedProgram =
    programList.find((p) => p.id === selectedId) ??
    programList.find((p) => p.isActive) ??
    programList[0] ??
    null;

  const days = selectedProgram ? getDaysFromProgram(selectedProgram) : [];
  const rationale = selectedProgram ? getRationale(selectedProgram) : [];
  const forecast = selectedProgram ? getForecast(selectedProgram) : {};

  // ── Mutations ─────────────────────────────────────────────────────────────
  const generateMutation = useMutation({
    mutationFn: async (inputs: typeof form) => {
      const res = await fetch("/api/programs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Generation failed");
      }
      return res.json() as Promise<ProgramRow>;
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["programs"] });
      setSelectedId(row.id);
      setStage("preview");
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/programs/${id}/activate`, { method: "PATCH" });
      if (!res.ok) throw new Error("Activate failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programs"] });
      setActivatingId(null);
    },
    onError: () => setActivatingId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["programs"] });
      if (selectedId === id) setSelectedId(null);
    },
  });

  // ── Thinking animation ────────────────────────────────────────────────────
  const runThinking = useCallback(
    (steps: string[], onDone: () => void) => {
      setThinkSteps(steps);
      setThinkStep(0);
      setStage("thinking");
      let i = 0;
      const tick = setInterval(() => {
        i++;
        setThinkStep(i);
        if (i >= steps.length) {
          clearInterval(tick);
          setTimeout(onDone, 400);
        }
      }, 700);
    },
    []
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleGenerate = () => {
    runThinking(AI_STEPS, () => {
      generateMutation.mutate(form, {
        onError: () => setStage("form"),
      });
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseProgramMarkdown(text);

      if (parsed.trainedCount === 0) {
        setImportError("No recognizable training days found. Make sure your .md file mentions days like Mon, Tue, etc.");
        return;
      }

      const name = file.name.replace(/\.(md|markdown)$/i, "");

      runThinking(IMPORT_STEPS, async () => {
        try {
          const res = await fetch("/api/programs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source: "upload", name, sourceText: text }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            setImportError(err.error ?? "Import failed");
            setStage("preview");
            return;
          }
          const row = await res.json() as ProgramRow;
          qc.invalidateQueries({ queryKey: ["programs"] });
          setSelectedId(row.id);
          setStage("preview");
        } catch {
          setImportError("Import failed. Please try again.");
          setStage("preview");
        }
      });
    };
    reader.readAsText(file);
    // reset input
    e.target.value = "";
  };

  const handleActivate = (id: string) => {
    setActivatingId(id);
    activateMutation.mutate(id);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>
            Your <em style={{ fontFamily: "var(--font-instrument)", fontStyle: "italic", fontWeight: 400 }}>program</em>
          </h1>
          {selectedProgram && (
            <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>
              {selectedProgram.summary} · {selectedProgram.weeks} weeks
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept=".md,.markdown,text/markdown,text/plain"
            style={{ display: "none" }}
            onChange={handleFileImport}
          />
          <Button variant="default" size="default" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={15} />
            Import .md
          </Button>
          <Button variant="default" size="default" onClick={() => setStage("form")}>
            <Icon name="edit" size={15} />
            Rebuild with AI
          </Button>
          {selectedProgram && !selectedProgram.isActive && (
            <Button
              variant="accent"
              size="default"
              onClick={() => handleActivate(selectedProgram.id)}
              disabled={activatingId === selectedProgram.id}
            >
              <Icon name="check" size={15} />
              Set active
            </Button>
          )}
          {selectedProgram?.isActive && (
            <Button variant="primary" size="default" disabled>
              <Icon name="check" size={15} />
              Active
            </Button>
          )}
        </div>
      </div>

      {/* Import error */}
      {importError && (
        <div style={{
          padding: "12px 16px",
          borderRadius: 10,
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          color: "#B91C1C",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <Icon name="info" size={15} />
          {importError}
          <button onClick={() => setImportError(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#B91C1C" }}>
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      {/* ── Form stage ───────────────────────────────────────────────────── */}
      {stage === "form" && (
        <Card>
          <CardHead>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)" }}>Step 1 of 1</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", marginTop: 4 }}>Tell Forma about your body &amp; goals</h3>
            </div>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              padding: "4px 10px",
              borderRadius: 999,
              background: "var(--accent)",
              color: "var(--accent-ink)",
              fontWeight: 600,
            }}>
              <Icon name="sparkles" size={12} />
              AI analyzes 14 data points
            </span>
          </CardHead>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
            {[
              { label: "Height (cm)", key: "height", type: "number" },
              { label: "Weight (kg)", key: "weight", type: "number" },
              { label: "Body fat (%)", key: "bodyFatPct", type: "number" },
              { label: "Age", key: "age", type: "number" },
            ].map(({ label, key, type }) => (
              <label key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500 }}>{label}</span>
                <input
                  type={type}
                  value={form[key as keyof typeof form] as number}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: +e.target.value }))}
                  style={{
                    height: 38,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    padding: "0 10px",
                    fontSize: 14,
                    color: "var(--ink)",
                    outline: "none",
                  }}
                />
              </label>
            ))}

            {/* Selects */}
            {[
              { label: "Sex", key: "sex", options: [{ v: "M", l: "Male" }, { v: "F", l: "Female" }, { v: "other", l: "Other" }] },
              { label: "Experience", key: "experience", options: [{ v: "Beginner", l: "Beginner" }, { v: "Intermediate", l: "Intermediate" }, { v: "Advanced", l: "Advanced" }] },
              { label: "Days / week", key: "daysPerWeek", options: [{ v: "3", l: "3 days" }, { v: "4", l: "4 days" }, { v: "5", l: "5 days" }, { v: "6", l: "6 days" }] },
              { label: "Time / session", key: "timePerSession", options: [{ v: "30", l: "30 min" }, { v: "45", l: "45 min" }, { v: "60", l: "60 min" }, { v: "90", l: "90 min" }] },
              { label: "Equipment", key: "equipment", options: [{ v: "Full gym", l: "Full gym" }, { v: "Home gym", l: "Home gym" }, { v: "Dumbbells only", l: "Dumbbells only" }, { v: "Bodyweight", l: "Bodyweight" }] },
            ].map(({ label, key, options }) => (
              <label key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500 }}>{label}</span>
                <select
                  value={String(form[key as keyof typeof form])}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const val = ["daysPerWeek", "timePerSession"].includes(key) ? +raw : raw;
                    setForm((f) => ({ ...f, [key]: val }));
                  }}
                  style={{
                    height: 38,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    padding: "0 10px",
                    fontSize: 14,
                    color: "var(--ink)",
                    outline: "none",
                  }}
                >
                  {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </label>
            ))}

            {/* Goals chips */}
            <label style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: "1 / -1" }}>
              <span style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500 }}>Goals (pick any)</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {GOAL_OPTIONS.map(({ id, label }) => {
                  const selected = form.goals.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          goals: selected
                            ? f.goals.filter((g) => g !== id)
                            : [...f.goals, id],
                        }))
                      }
                      style={{
                        padding: "6px 14px",
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 500,
                        border: "1px solid var(--border)",
                        background: selected ? "var(--accent)" : "var(--surface)",
                        color: selected ? "var(--accent-ink)" : "var(--ink-2)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </label>

            {/* Injury history */}
            <label style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: "1 / -1" }}>
              <span style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500 }}>Injury history (optional)</span>
              <input
                type="text"
                placeholder="e.g. right shoulder impingement"
                value={form.injuryHistory}
                onChange={(e) => setForm((f) => ({ ...f, injuryHistory: e.target.value }))}
                style={{
                  height: 38,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  padding: "0 10px",
                  fontSize: 14,
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
            <Button variant="ghost" onClick={() => setStage("preview")}>Cancel</Button>
            <Button
              variant="accent"
              size="lg"
              onClick={handleGenerate}
              disabled={form.goals.length === 0}
            >
              <Icon name="sparkles" size={16} />
              Generate program
            </Button>
          </div>
        </Card>
      )}

      {/* ── Thinking stage ────────────────────────────────────────────────── */}
      {stage === "thinking" && (
        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", gap: 28 }}>
          {/* Animated orb */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "conic-gradient(from 0deg, var(--accent), var(--accent-2), var(--accent))",
              animation: "spin 2s linear infinite",
              boxShadow: "0 0 32px var(--accent)",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 340 }}>
            {thinkSteps.map((step, i) => {
              const done = thinkStep > i + 1;
              const active = thinkStep === i + 1;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                    color: done ? "var(--ink)" : active ? "var(--accent-2)" : "var(--ink-3)",
                    fontWeight: active ? 600 : 400,
                    transition: "all 0.3s",
                  }}
                >
                  <span style={{ width: 16, textAlign: "center", fontFamily: "monospace" }}>
                    {done ? "✓" : active ? "▸" : "·"}
                  </span>
                  {step}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Preview stage ─────────────────────────────────────────────────── */}
      {stage === "preview" && (
        <>
          {/* Program library */}
          {isLoading ? (
            <Card style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "var(--ink-3)", fontSize: 13 }}>Loading programs…</span>
            </Card>
          ) : (
            <ProgramLibrary
              programs={programList}
              selectedId={selectedProgram?.id ?? null}
              onSelect={setSelectedId}
              onActivate={handleActivate}
              onDelete={(id) => deleteMutation.mutate(id)}
              activating={activatingId}
            />
          )}

          {/* Calendar */}
          {selectedProgram && days.length > 0 && (
            <Card>
              <CardHead>
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)" }}>
                    {selectedProgram.weeks} weeks · {selectedProgram.isActive ? "Active program" : "Preview"}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginTop: 4 }}>Schedule</h3>
                </div>
              </CardHead>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                {days.map((d, i) => {
                  const isRest = d.workout === "Rest";
                  return (
                    <button
                      key={i}
                      onClick={() => !isRest && setActiveDay(d)}
                      style={{
                        borderRadius: 10,
                        padding: "10px 6px",
                        textAlign: "center",
                        background: isRest ? "var(--surface)" : "var(--surface-2)",
                        border: "1px solid var(--border)",
                        cursor: isRest ? "default" : "pointer",
                        opacity: isRest ? 0.6 : 1,
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase" }}>{d.day}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", marginTop: 4 }}>{d.workout}</div>
                      {d.tag && (
                        <div style={{
                          fontSize: 9,
                          color: "var(--ink-3)",
                          marginTop: 4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "100%",
                        }}>
                          {d.tag}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Rationale + Forecast */}
          {selectedProgram && (rationale.length > 0 || Object.keys(forecast).length > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {rationale.length > 0 && (
                <Card>
                  <CardHead>
                    <div>
                      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)" }}>AI rationale</div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginTop: 4 }}>Why this program?</h3>
                    </div>
                    <Icon name="sparkles" size={18} style={{ color: "var(--accent-2)" }} />
                  </CardHead>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "var(--ink-2)", fontSize: 13, lineHeight: 1.65 }}>
                    {rationale.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </Card>
              )}

              {Object.keys(forecast).length > 0 && (
                <Card>
                  <CardHead>
                    <div>
                      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)" }}>Expected outcomes</div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginTop: 4 }}>4-week forecast</h3>
                    </div>
                  </CardHead>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {[
                      { key: "weightDelta", label: "Weight" },
                      { key: "bodyFatDelta", label: "Body fat" },
                      { key: "benchDelta", label: "Bench press" },
                      { key: "squatDelta", label: "Squat" },
                    ].map(({ key, label }) =>
                      forecast[key] ? (
                        <div key={key}>
                          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)" }}>{label}</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "var(--ink)", marginTop: 4 }}>{forecast[key]}</div>
                        </div>
                      ) : null
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && programList.length === 0 && (
            <Card style={{ padding: 40, textAlign: "center" }}>
              <Icon name="sparkles" size={36} style={{ color: "var(--accent-2)", marginBottom: 16 }} />
              <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)" }}>No programs yet</h3>
              <p style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 8 }}>
                Generate a personalized AI program or import a .md file to get started.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
                <Button variant="default" onClick={() => fileRef.current?.click()}>
                  <Icon name="upload" size={15} /> Import .md
                </Button>
                <Button variant="accent" onClick={() => setStage("form")}>
                  <Icon name="sparkles" size={15} /> Generate with AI
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Day drawer */}
      <DayDrawer day={activeDay} onClose={() => setActiveDay(null)} />
    </div>
  );
}
