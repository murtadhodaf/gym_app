"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckInModal } from "./CheckInModal";

interface DailyCheckin {
  id: string;
  date: string;
  energy: number;
  sorePartsJson: string[];
  sick: boolean;
  focusChange: string;
}

const ENERGY_LABELS = ["", "Drained", "Low", "Okay", "Good", "Fired up"];

export function CheckInButton() {
  const [open, setOpen] = useState(false);

  const { data: todayCheckin, isLoading } = useQuery<DailyCheckin | null>({
    queryKey: ["checkin-today"],
    queryFn: async () => {
      const res = await fetch("/api/checkins/today");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 5 * 60_000,
  });

  const alreadyCheckedIn = !!todayCheckin;

  return (
    <>
      {alreadyCheckedIn ? (
        // Summary chip — shows today's check-in and lets user re-open to update
        <button
          onClick={() => setOpen(true)}
          title="Update today's check-in"
          style={{
            background: "var(--success-soft)",
            color: "var(--success)",
            border: "1.5px solid var(--success)",
            borderRadius: 20,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "inherit",
            opacity: isLoading ? 0 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <span>✓</span>
          <span>
            Checked in · {ENERGY_LABELS[todayCheckin.energy ?? 3]}
            {todayCheckin.sick ? " · Sick" : ""}
          </span>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "var(--surface)",
            color: "var(--ink-2)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "inherit",
            opacity: isLoading ? 0 : 1,
            transition: "opacity 0.2s",
          }}
        >
          Daily check-in
        </button>
      )}

      <CheckInModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
