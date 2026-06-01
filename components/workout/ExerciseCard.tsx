"use client";

import type { ExerciseDef, SetState } from "@/lib/workout-store";

interface Props {
  exercise: ExerciseDef;
  index: number;
  isActive: boolean;
  setData: SetState[];
  onClick: () => void;
  onToggleSet: (setIdx: number) => void;
  onUpdateSet: (setIdx: number, patch: Partial<SetState>) => void;
}

export function ExerciseCard({
  exercise,
  index,
  isActive,
  setData,
  onClick,
  onToggleSet,
  onUpdateSet,
}: Props) {
  const allDone = setData.length > 0 && setData.every((s) => s.done);
  const doneSets = setData.filter((s) => s.done).length;

  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: `1px solid ${isActive ? "var(--ink)" : "var(--border)"}`,
        borderRadius: "var(--radius)",
        padding: 20,
        marginBottom: 12,
        cursor: "pointer",
        boxShadow: isActive ? "var(--shadow-md)" : "var(--shadow-sm)",
        opacity: allDone && !isActive ? 0.55 : 1,
        transition: "border-color 0.18s, box-shadow 0.18s, opacity 0.18s",
      }}
    >
      {/* Exercise header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: isActive ? 14 : 0,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, color: "var(--ink)" }}>
            {index + 1}. {exercise.name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-3)",
              marginTop: 2,
              fontFamily: "var(--font-geist-mono, monospace)",
            }}
          >
            {exercise.sets} sets × {exercise.reps} reps · prev {exercise.prev}
          </div>
        </div>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "3px 10px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            flexShrink: 0,
            ...(allDone
              ? { background: "var(--success-soft)", color: "var(--success)" }
              : isActive
              ? { background: "var(--accent)", color: "var(--accent-ink)" }
              : { background: "var(--surface-2)", color: "var(--ink-3)" }),
          }}
        >
          {allDone ? "Done" : isActive ? `${doneSets}/${exercise.sets}` : "Up next"}
        </span>
      </div>

      {/* Set rows — only when active */}
      {isActive && (
        <div onClick={(e) => e.stopPropagation()}>
          {setData.map((row, sIdx) => (
            <SetRow
              key={sIdx}
              index={sIdx}
              row={row}
              onToggle={() => onToggleSet(sIdx)}
              onUpdate={(patch) => onUpdateSet(sIdx, patch)}
            />
          ))}

          {/* Form tip on first exercise */}
          {index === 0 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 12px",
                background: "var(--info-soft)",
                color: "var(--info)",
                borderRadius: 10,
                fontSize: 12,
                marginTop: 12,
                alignItems: "flex-start",
              }}
            >
              <span style={{ marginTop: 1, flexShrink: 0 }}>ℹ</span>
              <span>
                <strong>Form cue:</strong> Keep elbows tucked ~75° at the bottom — protects the
                shoulder at depth.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Set row ────────────────────────────────────────────────────────────────────

function SetRow({
  index,
  row,
  onToggle,
  onUpdate,
}: {
  index: number;
  row: SetState;
  onToggle: () => void;
  onUpdate: (patch: Partial<SetState>) => void;
}) {
  const inputStyle = (done: boolean): React.CSSProperties => ({
    width: "100%",
    border: "1px solid var(--border)",
    background: done ? "var(--success-soft)" : "var(--surface-2)",
    padding: "6px 10px",
    borderRadius: 8,
    fontFamily: "var(--font-geist-mono, monospace)",
    fontSize: 13,
    color: "var(--ink)",
    outline: "none",
    transition: "background 0.15s, border-color 0.15s",
  });

  return (
    <div
      style={{
        display: "grid",
        // set# | weight input | reps input | ✓
        gridTemplateColumns: "28px 1fr 1fr 36px",
        gap: 10,
        alignItems: "center",
        padding: "8px 0",
        borderTop: index === 0 ? "none" : "1px solid var(--line)",
      }}
    >
      {/* Set number */}
      <span
        style={{
          fontFamily: "var(--font-geist-mono, monospace)",
          color: "var(--ink-3)",
          fontSize: 12,
          textAlign: "center",
        }}
      >
        {index + 1}
      </span>

      {/* Weight input */}
      <div style={{ position: "relative" }}>
        <input
          type="number"
          value={row.weight}
          min={0}
          step={0.5}
          onChange={(e) => onUpdate({ weight: e.target.value })}
          placeholder="kg"
          style={inputStyle(row.done)}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
        <span
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 10,
            color: "var(--ink-3)",
            pointerEvents: "none",
          }}
        >
          kg
        </span>
      </div>

      {/* Reps input */}
      <div style={{ position: "relative" }}>
        <input
          type="number"
          value={row.reps}
          min={0}
          step={1}
          onChange={(e) => onUpdate({ reps: e.target.value })}
          placeholder="reps"
          style={inputStyle(row.done)}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
        <span
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 10,
            color: "var(--ink-3)",
            pointerEvents: "none",
          }}
        >
          reps
        </span>
      </div>

      {/* Done check */}
      <button
        onClick={onToggle}
        title={row.done ? "Mark undone" : "Mark done"}
        style={{
          width: 36,
          height: 36,
          border: `1px solid ${row.done ? "var(--accent-2)" : "var(--border)"}`,
          background: row.done ? "var(--accent)" : "var(--surface)",
          borderRadius: 8,
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          color: row.done ? "var(--accent-ink)" : "var(--ink-3)",
          fontSize: 15,
          fontWeight: 600,
          transition: "background 0.15s, border-color 0.15s",
          flexShrink: 0,
        }}
      >
        ✓
      </button>
    </div>
  );
}
