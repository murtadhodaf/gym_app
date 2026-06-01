"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type SorePart = "Chest" | "Back" | "Shoulders" | "Arms" | "Legs" | "Core";
type FocusChange = "same" | "push_harder" | "lighter" | "swap_pull" | "swap_legs" | "mobility";

interface CheckInData {
  energy: number;
  soreParts: SorePart[];
  sick: boolean;
  focusChange: FocusChange;
}

interface CheckInModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitted?: (data: CheckInData) => void;
}

const SORE_PARTS: SorePart[] = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"];
const ENERGY_LABELS = ["", "Drained", "Low", "Okay", "Good", "Fired up"];
const FOCUS_OPTIONS: { value: FocusChange; label: string }[] = [
  { value: "same", label: "Same plan" },
  { value: "push_harder", label: "Push harder" },
  { value: "lighter", label: "Lighter day" },
  { value: "swap_pull", label: "Swap → Pull" },
  { value: "swap_legs", label: "Swap → Legs" },
  { value: "mobility", label: "Mobility" },
];

function energyColor(level: number): string {
  if (level <= 2) return "var(--coral)";
  if (level >= 4) return "var(--success)";
  return "var(--ink)";
}

/**
 * Outer shell — only handles open/close.
 * Inner form is remounted via `key={open}` so all useState resets for free
 * without any setState-in-effect anti-patterns.
 */
export function CheckInModal({ open, onClose, onSubmitted }: CheckInModalProps) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(14,14,12,0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <CheckInForm key="modal-form" onClose={onClose} onSubmitted={onSubmitted} />
    </div>
  );
}

/** Inner form — always mounted fresh when the modal opens. */
function CheckInForm({ onClose, onSubmitted }: Omit<CheckInModalProps, "open">) {
  const queryClient = useQueryClient();
  const [energy, setEnergy] = useState(3);
  const [soreParts, setSoreParts] = useState<SorePart[]>([]);
  const [sick, setSick] = useState(false);
  const [focusChange, setFocusChange] = useState<FocusChange>("same");

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: CheckInData) => {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save check-in");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["checkin-today"] });
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      onSubmitted?.(variables);
      onClose();
    },
  });

  function toggleSorePart(part: SorePart) {
    setSoreParts((prev) =>
      prev.includes(part) ? prev.filter((p) => p !== part) : [...prev, part]
    );
  }

  function handleSubmit() {
    mutate({ energy, soreParts, sick, focusChange });
  }

  return (
    // Modal content — backdrop is rendered by the outer CheckInModal shell
    <div
      onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: 20,
          width: "100%",
          maxWidth: 520,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "var(--ink-3)", textTransform: "uppercase", margin: 0 }}>
              Daily check-in
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--ink)", margin: "4px 0 0" }}>
              How are you feeling?
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "var(--ink-3)",
            }}
          >
            ×
          </button>
        </div>

        {/* Q1: Energy */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>
            Energy level
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((level) => {
              const active = energy === level;
              const color = energyColor(level);
              return (
                <button
                  key={level}
                  onClick={() => setEnergy(level)}
                  style={{
                    padding: "10px 4px 8px",
                    borderRadius: 10,
                    border: `1.5px solid ${active ? color : "var(--border)"}`,
                    background: active ? (level <= 2 ? "var(--coral-soft)" : level >= 4 ? "var(--success-soft)" : "var(--surface-2)") : "var(--surface-2)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1 }}>
                    {level === 1 ? "😴" : level === 2 ? "😔" : level === 3 ? "😐" : level === 4 ? "😊" : "🔥"}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: active ? color : "var(--ink-3)", letterSpacing: "0.02em" }}>
                    {ENERGY_LABELS[level]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--line)" }} />

        {/* Q2: Soreness */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>
            Soreness <span style={{ fontWeight: 400, color: "var(--ink-3)" }}>— select all that apply</span>
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {SORE_PARTS.map((part) => {
              const selected = soreParts.includes(part);
              return (
                <button
                  key={part}
                  onClick={() => toggleSorePart(part)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${selected ? "var(--coral)" : "var(--border)"}`,
                    background: selected ? "var(--coral-soft)" : "var(--surface-2)",
                    color: selected ? "var(--coral)" : "var(--ink-2)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {part}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--line)" }} />

        {/* Q3: Sick */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)", margin: 0 }}>Feeling sick?</p>
            <p style={{ fontSize: 12, color: "var(--ink-3)", margin: "2px 0 0" }}>AI will suggest a recovery session</p>
          </div>
          <button
            onClick={() => setSick((v) => !v)}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              border: "none",
              background: sick ? "var(--coral)" : "var(--border)",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                left: sick ? 25 : 3,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "white",
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--line)" }} />

        {/* Q4: Focus change */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>
            Today&apos;s focus
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {FOCUS_OPTIONS.map((opt) => {
              const active = focusChange === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setFocusChange(opt.value)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 20,
                    border: `1.5px solid ${active ? "var(--ink)" : "var(--border)"}`,
                    background: active ? "var(--ink)" : "var(--surface-2)",
                    color: active ? "var(--bg)" : "var(--ink-2)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 4,
          }}
        >
          <p style={{ fontSize: 12, color: "var(--ink-3)", margin: 0 }}>
            AI will tune sets, weights, and tempo.
          </p>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            style={{
              background: "var(--accent)",
              color: "var(--accent-ink)",
              border: "none",
              borderRadius: 20,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
              fontFamily: "inherit",
              transition: "opacity 0.15s",
            }}
          >
            {isPending ? "Saving…" : "Apply"}
          </button>
        </div>
      </div>
  );
}
