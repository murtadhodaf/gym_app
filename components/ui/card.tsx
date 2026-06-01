import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("bg-surface border border-border rounded-[14px] p-5 shadow-[var(--shadow-sm)]", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHead = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-start justify-between gap-3 mb-4", className)} {...props} />
  )
);
CardHead.displayName = "CardHead";

const StatLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-[11px] uppercase tracking-[0.08em] text-ink-3 font-medium", className)} {...props} />
  )
);
StatLabel.displayName = "StatLabel";

const StatValue = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("font-mono text-[30px] leading-none tracking-[-0.025em] text-ink", className)} {...props} />
  )
);
StatValue.displayName = "StatValue";

export { Card, CardHead, StatLabel, StatValue };
