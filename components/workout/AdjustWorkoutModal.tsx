"use client";

import { useState, useCallback } from "react";
import { useAdjustWorkout, AdjustReason, AdjustResponse } from "@/lib/adjust-queries";
import { THINKING_STEPS, ADJUST_RATIONALE, TODAY_WORKOUT } from "@/data/sample";

type Step = "reason" | "thinking" | "diff";

type SorePart = "Chest" | "Back" | "Shoulders" | "Arms" | "Legs" | "Core";
const SORE_PARTS: SorePart[] = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"];

interface ReasonCard {
  id: AdjustReason;
  icon: string;
  iconColor: string;
  title: string;
  sub: string;
  extra: string;
}

const REASON_CARDS: ReasonCard[] = [
  {
    id: "sick",
    icon: "🩹",
    iconColor: "var(--coral)",
    title: "I'm feeling sick",
    sub: "Switch to a recovery session",
    extra: "Forma will keep your HR under 120 bpm with mobility + Z1 movement.",
  },
  {
    id: "sore_chest",
    icon: "🫀",
    iconColor: "var(--info)",
    title: "I'm sore",
    sub: "Reduce volume on sore muscles",
    extra: "Pick the muscle groups that feel sore — Forma will rebalance volume.",
  },
  {
    id: "swap_pull",
    icon: "🔄",
    iconColor: "var(--success)",
    title: "Change muscle group",
    sub: "Swap today for a different split",
    extra: "Forma will rebalance the rest of your week so weekly volume stays on target.",
  },
  {
    id: "short_time",
    icon: "⏱",
    iconColor: "var(--ink-2)",
    title: "Low energy / short on time",
    sub: "Trim to a 30-min session",
    extra: "Compounds preserved, accessories combined into supersets.",
  },
];

const CHANGE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  added: { label: "+ New", color: "var(--success)", bg: "var(--success-soft)" },
  removed: { label: "− Removed", color: "var(--coral)", bg: "var(--coral-soft)" },
  reduced: { label: "↓ Reduced", color: "var(--info)", bg: "var(--info-soft)" },
  added_volume: { label: "↑ More", color: "var(--success)", bg: "var(--success-soft)" },
};

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (workout: AdjustResponse, reason: AdjustReason) => void;
}

/**
 * Outer shell — renders nothing when closed; mounts a fresh AdjustWorkoutInner
 * via key change when opened. This ensures all useState resets without any
 * setState-in-effect anti-patterns.
 */
export function AdjustWorkoutModal({ open, onClose, onApply }: Props) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <AdjustWorkoutInner key="adjust-inner" onClose={onClose} onApply={onApply} />
    </div>
  );
}

/** Inner form — always mounted fresh. */
function AdjustWorkoutInner({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (workout: AdjustResponse, reason: AdjustReason) => void;
}) {
  const [step, setStep] = useState<Step>("reason");
  const [reason, setReason] = useState<AdjustReason | null>(null);
  const [soreParts, setSoreParts] = useState<SorePart[]>([]);
  const [swapTarget, setSwapTarget] = useState<AdjustReason>("swap_pull");
  const [thinkStep, setThinkStep] = useState(0);
  const [result, setResult] = useState<AdjustResponse | null>(null);

  const adjustMutation = useAdjustWorkout();

  // Reset state — called when user wants to try another reason from diff screen
  const resetState = useCallback(() => {
    setStep("reason");
    setReason(null);
    setSoreParts([]);
    setSwapTarget("swap_pull");
    setThinkStep(0);
    setResult(null);
  }, []);

  const getEffectiveReason = (): AdjustReason => {
    if (reason === "swap_pull") return swapTarget;
    return reason!;
  };

  const startThinking = async () => {
    if (!reason) return;
    const effectiveReason = getEffectiveReason();
    const steps = THINKING_STEPS[effectiveReason] ?? THINKING_STEPS["default"];
    setStep("thinking");
    setThinkStep(0);

    // Animate steps while mutation fires in background
    let i = 0;
    const tick = setInterval(() => {
      i++;
      setThinkStep(i);
      if (i >= steps.length) clearInterval(tick);
    }, 480);

    try {
      const adjusted = await adjustMutation.mutateAsync({
        reason: effectiveReason,
        soreParts: reason === "sore_chest" ? soreParts : undefined,
      });
      // Ensure minimum 2s "thinking" feel
      await new Promise((r) => setTimeout(r, Math.max(0, steps.length * 480 + 400)));
      setResult(adjusted);
      setStep("diff");
    } catch {
      clearInterval(tick);
      onClose();
    }
  };

  const toggleSore = (p: SorePart) =>
    setSoreParts((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );

  const rationale =
    result?.rationale ??
    ADJUST_RATIONALE[getEffectiveReason() ?? "sick"] ??
    [];

  const currentWorkout = TODAY_WORKOUT;
  const thinkingSteps =
    THINKING_STEPS[getEffectiveReason()] ?? THINKING_STEPS["default"];

  return (
    // Modal content — backdrop rendered by outer AdjustWorkoutModal shell
    <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-lg)",
          width: "100%",
          maxWidth: 680,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── STEP 1: Reason picker ──────────────────────────────────────── */}
        {step === "reason" && (
          <>
            <div
              style={{
                padding: "20px 24px 16px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    letterSpacing: "-0.018em",
                    margin: 0,
                  }}
                >
                  Adjust today&apos;s{" "}
                  <em
                    style={{
                      fontFamily: "var(--font-instrument)",
                      fontStyle: "italic",
                    }}
                  >
                    workout
                  </em>
                </h3>
                <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
                  Forma will re-plan your session in seconds based on how you feel.
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--ink-3)",
                  fontSize: 20,
                  lineHeight: 1,
                  padding: 4,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto" }}>
              {/* Reason grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {REASON_CARDS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setReason(r.id)}
                    style={{
                      background: reason === r.id ? "var(--surface-2)" : "var(--surface)",
                      border: `1.5px solid ${reason === r.id ? "var(--ink)" : "var(--border)"}`,
                      borderRadius: "var(--radius)",
                      padding: "16px 18px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "border-color 0.15s, background 0.15s",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "var(--surface-2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        marginBottom: 4,
                      }}
                    >
                      {r.icon}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500 }}>
                      {r.sub}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.4, marginTop: 2 }}>
                      {r.extra}
                    </div>
                  </button>
                ))}
              </div>

              {/* Sore body map */}
              {reason === "sore_chest" && (
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--ink-2)",
                      marginBottom: 8,
                    }}
                  >
                    Which muscles feel sore?
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {SORE_PARTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => toggleSore(p)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 999,
                          border: `1px solid ${soreParts.includes(p) ? "var(--ink)" : "var(--border)"}`,
                          background: soreParts.includes(p)
                            ? "var(--ink)"
                            : "var(--surface)",
                          color: soreParts.includes(p)
                            ? "var(--bg)"
                            : "var(--ink-2)",
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Swap target chips */}
              {reason === "swap_pull" && (
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--ink-2)",
                      marginBottom: 8,
                    }}
                  >
                    What do you want to train instead?
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(
                      [
                        { id: "swap_pull" as AdjustReason, label: "Pull (Back · Biceps)" },
                        { id: "swap_legs" as AdjustReason, label: "Legs" },
                        { id: "short_time" as AdjustReason, label: "Lighter upper body" },
                      ] as { id: AdjustReason; label: string }[]
                    ).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setSwapTarget(o.id)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 999,
                          border: `1px solid ${swapTarget === o.id ? "var(--ink)" : "var(--border)"}`,
                          background:
                            swapTarget === o.id ? "var(--ink)" : "var(--surface)",
                          color:
                            swapTarget === o.id ? "var(--bg)" : "var(--ink-2)",
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--ink-3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                ✨ Forma factors recovery, weekly volume, and your last 7 sessions.
              </span>
              <button
                onClick={startThinking}
                disabled={!reason}
                style={{
                  background: reason ? "var(--accent)" : "var(--surface-2)",
                  color: reason ? "var(--accent-ink)" : "var(--ink-3)",
                  border: "none",
                  borderRadius: 20,
                  padding: "9px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: reason ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
              >
                Re-plan with AI →
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: Thinking ──────────────────────────────────────────── */}
        {step === "thinking" && (
          <>
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--line)" }}>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  letterSpacing: "-0.018em",
                  margin: 0,
                }}
              >
                Forma is{" "}
                <em
                  style={{
                    fontFamily: "var(--font-instrument)",
                    fontStyle: "italic",
                  }}
                >
                  thinking
                </em>
                …
              </h3>
              <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
                Analyzing your recovery and weekly volume.
              </div>
            </div>
            <div
              style={{
                padding: "40px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 28,
              }}
            >
              {/* Animated orb */}
              <div
                className="animate-orb-pulse"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 40% 38%, var(--accent) 0%, var(--ink) 100%)",
                  boxShadow: "0 0 40px rgba(209,232,0,0.35)",
                }}
              />

              {/* Step list */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  width: "100%",
                  maxWidth: 340,
                }}
              >
                {thinkingSteps.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 13,
                      color:
                        thinkStep > i
                          ? "var(--success)"
                          : thinkStep === i
                          ? "var(--ink)"
                          : "var(--ink-3)",
                      fontWeight: thinkStep === i ? 600 : 400,
                      transition: "color 0.3s",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-geist-mono, monospace)",
                        fontSize: 12,
                        width: 14,
                        flexShrink: 0,
                        color:
                          thinkStep > i
                            ? "var(--success)"
                            : thinkStep === i
                            ? "var(--accent-2)"
                            : "var(--ink-3)",
                      }}
                    >
                      {thinkStep > i ? "✓" : thinkStep === i ? "▸" : "·"}
                    </span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── STEP 3: Diff preview ─────────────────────────────────────── */}
        {step === "diff" && result && (
          <>
            <div
              style={{
                padding: "20px 24px 16px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    letterSpacing: "-0.018em",
                    margin: 0,
                  }}
                >
                  Here&apos;s your{" "}
                  <em
                    style={{
                      fontFamily: "var(--font-instrument)",
                      fontStyle: "italic",
                    }}
                  >
                    adjusted
                  </em>{" "}
                  workout
                </h3>
                <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
                  {result.reasonLabel} · Apply now or tweak further.
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--ink-3)",
                  fontSize: 20,
                  lineHeight: 1,
                  padding: 4,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "20px 24px", flex: 1, overflowY: "auto", maxHeight: "62vh" }}>
              {/* Before → After summary */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 18px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  marginBottom: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--ink-3)",
                      marginBottom: 4,
                    }}
                  >
                    Before
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      textDecoration: "line-through",
                      color: "var(--ink-3)",
                    }}
                  >
                    {currentWorkout.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2, fontFamily: "var(--font-geist-mono, monospace)" }}>
                    {currentWorkout.durationMin} min · {currentWorkout.exercises.length} ex
                  </div>
                </div>

                <div style={{ color: "var(--ink-3)", fontSize: 16 }}>→</div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--success)",
                      marginBottom: 4,
                    }}
                  >
                    After · AI re-tuned
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
                    {result.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2, fontFamily: "var(--font-geist-mono, monospace)" }}>
                    {result.duration} min · {result.exercises.length} ex · {result.focus}
                  </div>
                </div>
              </div>

              {/* Exercise diff list */}
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  marginBottom: 16,
                }}
              >
                {result.exercises.map((ex, idx) => {
                  const marker = ex.change ? CHANGE_LABELS[ex.change] : null;
                  return (
                    <div
                      key={ex.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "80px 1fr auto",
                        gap: 12,
                        padding: "11px 16px",
                        borderTop: idx === 0 ? "none" : "1px solid var(--line)",
                        alignItems: "center",
                        background: marker ? marker.bg + "55" : "transparent",
                      }}
                    >
                      {/* Marker */}
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: marker ? marker.bg : "var(--surface-2)",
                          color: marker ? marker.color : "var(--ink-3)",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {marker ? marker.label : "Kept"}
                      </span>

                      {/* Name + note */}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                          {ex.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--ink-3)",
                            fontFamily: "var(--font-geist-mono, monospace)",
                            marginTop: 1,
                          }}
                        >
                          {ex.sets} × {ex.reps}
                        </div>
                        {ex.note && (
                          <div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 2 }}>
                            {ex.note}
                          </div>
                        )}
                      </div>

                      {/* Prev */}
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--ink-3)",
                          fontFamily: "var(--font-geist-mono, monospace)",
                          textAlign: "right",
                        }}
                      >
                        {ex.prev}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rationale box */}
              <div
                style={{
                  padding: "14px 16px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--ink-2)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 10,
                  }}
                >
                  ✨ Why Forma made this change
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {rationale.map((r, i) => (
                    <li
                      key={i}
                      style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <button
                onClick={resetState}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--ink-3)",
                  fontSize: 13,
                  fontFamily: "inherit",
                  padding: "8px 0",
                }}
              >
                ← Try another reason
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={onClose}
                  style={{
                    background: "var(--surface)",
                    color: "var(--ink-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Save &amp; don&apos;t apply
                </button>
                <button
                  onClick={() => onApply(result, getEffectiveReason())}
                  style={{
                    background: "var(--accent)",
                    color: "var(--accent-ink)",
                    border: "none",
                    borderRadius: 20,
                    padding: "8px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "inherit",
                  }}
                >
                  ✓ Apply to today
                </button>
              </div>
            </div>
          </>
        )}
      </div>
  );
}
