import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium border",
  {
    variants: {
      variant: {
        default: "bg-surface-2 text-ink-2 border-border",
        accent: "bg-accent text-accent-ink border-accent-2",
        coral: "bg-coral-soft text-coral border-transparent",
        success: "bg-success-soft text-success border-transparent",
        info: "bg-info-soft text-info border-transparent",
        selected: "bg-ink text-bg border-ink",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {}

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(chipVariants({ variant, className }))} {...props} />
  )
);
Chip.displayName = "Chip";

export { Chip, chipVariants };
