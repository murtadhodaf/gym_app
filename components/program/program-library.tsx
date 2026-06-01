"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";

export type ProgramRow = {
  id: string;
  source: "ai" | "upload";
  name: string;
  summary: string | null;
  weeks: number;
  isActive: boolean;
  daysJson: unknown;
  createdAt: string;
};

interface ProgramLibraryProps {
  programs: ProgramRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
  activating: string | null;
}

function trainingDaysCount(daysJson: unknown): number {
  const data = daysJson as { days?: Array<{ workout: string }> } | Array<{ workout: string }> | null;
  if (!data) return 0;
  const days = Array.isArray(data) ? data : data.days;
  if (!days) return 0;
  return days.filter((d) => d.workout !== "Rest").length;
}

export function ProgramLibrary({
  programs,
  selectedId,
  onSelect,
  onActivate,
  onDelete,
  activating,
}: ProgramLibraryProps) {
  if (programs.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <Icon name="calendar" size={32} style={{ color: "var(--ink-3)" }} />
        <p style={{ color: "var(--ink-2)", fontSize: 14 }}>No programs yet. Generate one with AI or import a .md file.</p>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-3)", fontWeight: 600 }}>My programs</span>
      </div>
      <div>
        {programs.map((prog, i) => {
          const isSelected = prog.id === selectedId;
          const days = trainingDaysCount(prog.daysJson);
          return (
            <div
              key={prog.id}
              onClick={() => onSelect(prog.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 20px",
                borderBottom: i < programs.length - 1 ? "1px solid var(--border)" : undefined,
                background: isSelected ? "var(--surface-2)" : "transparent",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              {/* Source icon */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: prog.source === "ai" ? "var(--accent)" : "var(--surface)",
                  border: "1px solid var(--border)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon
                  name={prog.source === "ai" ? "sparkles" : "upload"}
                  size={15}
                  style={{ color: prog.source === "ai" ? "var(--accent-ink)" : "var(--ink-2)" }}
                />
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{prog.name}</span>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "1px 6px",
                      borderRadius: 999,
                      fontWeight: 600,
                      background: prog.source === "ai" ? "var(--accent)" : "var(--surface)",
                      color: prog.source === "ai" ? "var(--accent-ink)" : "var(--ink-2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {prog.source === "ai" ? "AI" : "Uploaded"}
                  </span>
                  {prog.isActive && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "1px 6px",
                        borderRadius: 999,
                        fontWeight: 600,
                        background: "var(--ink)",
                        color: "var(--bg)",
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {prog.summary ?? "—"} · {days} days/wk · {prog.weeks} weeks
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                {!prog.isActive && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onActivate(prog.id)}
                    disabled={activating === prog.id}
                  >
                    {activating === prog.id ? "…" : "Set active"}
                  </Button>
                )}
                {prog.source === "upload" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(prog.id)}
                    title="Remove program"
                  >
                    <Icon name="trash" size={14} />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
