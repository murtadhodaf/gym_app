"use client";

// Hard-coded for Phase 5; replaced with real AI in Phase 8
export function LiveCoachCard() {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: 20,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)" }}>
            Live coach
          </div>
          <div style={{ fontSize: 16, fontWeight: 500, color: "var(--ink)", marginTop: 2 }}>
            Suggestions
          </div>
        </div>
        <span style={{ color: "var(--accent-2)", fontSize: 18 }}>✦</span>
      </div>

      <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55, margin: 0 }}>
        Your bar speed on set 2 looked a little slow — consider dropping weight by 2.5 kg on the
        remaining sets to hit your rep target cleanly.
      </p>

      <button
        style={{
          marginTop: 12,
          width: "100%",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "9px 0",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--ink-2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontFamily: "inherit",
        }}
        onClick={() => alert("AI Coach coming in Phase 8 ✦")}
      >
        ✓ Apply suggestion
      </button>
    </div>
  );
}
