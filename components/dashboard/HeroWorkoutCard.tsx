"use client";

import Link from "next/link";
import { TODAY_WORKOUT } from "@/data/sample";

// Explicit interface so adjusted workouts (with extra fields) are also accepted
interface WorkoutShape {
  title: string;
  focus: string;
  durationMin: number;
  exerciseCount: number;
  aiTuned?: boolean;
  aiTunedReason?: string;
  exercises: Array<{ id: string; name: string }>;
}

interface HeroWorkoutCardProps {
  workout?: WorkoutShape;
  onAdjust?: () => void;
  aiTuned?: boolean;
  aiTunedReason?: string;
  flash?: boolean;
}

export function HeroWorkoutCard({
  workout = TODAY_WORKOUT,
  onAdjust,
  aiTuned,
  aiTunedReason,
  flash,
}: HeroWorkoutCardProps) {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const visibleExercises = workout.exercises.slice(0, 4);
  const extraCount = workout.exercises.length - 4;

  return (
    <div
      style={{
        background: "var(--ink)",
        borderRadius: 20,
        padding: "28px 28px 24px",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 24,
        position: "relative",
        overflow: "hidden",
        outline: flash ? "2.5px solid var(--accent)" : "none",
        transition: "outline 0.3s",
      }}
      className={flash ? "animate-hero-flash" : undefined}
    >
      {/* Lime radial overlay top-right */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "60%",
          height: "100%",
          background:
            "radial-gradient(ellipse at 88% 0%, rgba(215,242,82,0.18) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Left column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* TODAY label */}
        <div
          style={{
            color: "var(--accent)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent)",
              display: "inline-block",
            }}
          />
          TODAY · {today.toUpperCase()}
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: 42,
            fontWeight: 400,
            letterSpacing: "-0.03em",
            lineHeight: 1.02,
            color: "var(--bg)",
            margin: 0,
          }}
        >
          {(() => {
            const words = workout.title.split(" ");
            return words.map((word, i) =>
              i === words.length - 1 ? (
                <em key={i}>{word}</em>
              ) : (
                <span key={i}>{word} </span>
              )
            );
          })()}
        </h2>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginTop: 6,
            color: "rgba(242,239,229,0.65)",
            fontSize: 13,
          }}
        >
          <span>🎯 {workout.focus}</span>
          <span>⏱ {workout.durationMin} min</span>
          <span>🏋 {workout.exerciseCount} exercises</span>
        </div>

        {/* AI tuned chip */}
        {(aiTuned || workout.aiTuned) && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(215,242,82,0.15)",
              border: "1px solid rgba(215,242,82,0.3)",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11,
              color: "var(--accent)",
              fontWeight: 500,
              width: "fit-content",
            }}
          >
            ✨ AI-tuned: {aiTunedReason ?? workout.aiTunedReason}
          </div>
        )}

        {/* Exercise pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          {visibleExercises.map((ex) => (
            <span
              key={ex.id}
              style={{
                background: "rgba(242,239,229,0.1)",
                border: "1px solid rgba(242,239,229,0.12)",
                borderRadius: 20,
                padding: "5px 11px",
                fontSize: 12,
                color: "rgba(242,239,229,0.8)",
                fontWeight: 400,
              }}
            >
              {ex.name}
            </span>
          ))}
          {extraCount > 0 && (
            <span
              style={{
                background: "rgba(242,239,229,0.08)",
                border: "1px solid rgba(242,239,229,0.1)",
                borderRadius: 20,
                padding: "5px 11px",
                fontSize: 12,
                color: "rgba(242,239,229,0.5)",
              }}
            >
              +{extraCount} more
            </span>
          )}
        </div>
      </div>

      {/* Right column — CTA */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-end",
          minWidth: 160,
          gap: 12,
        }}
      >
        {/* Adjust with AI pill */}
        <button
          onClick={onAdjust}
          style={{
            background: "rgba(242,239,229,0.1)",
            border: "1px solid rgba(242,239,229,0.15)",
            borderRadius: 20,
            padding: "7px 14px",
            fontSize: 12,
            color: "rgba(242,239,229,0.75)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          ✨ Adjust with AI
        </button>

        {/* Start workout */}
        <Link
          href="/workout"
          style={{
            background: "var(--accent)",
            color: "var(--accent-ink)",
            borderRadius: 12,
            padding: "16px 24px",
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
            whiteSpace: "nowrap",
          }}
        >
          ▶ Start workout
        </Link>
      </div>
    </div>
  );
}
