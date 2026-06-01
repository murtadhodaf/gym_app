import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-surface text-ink-2 border border-border hover:bg-surface-2 hover:text-ink",
        primary: "bg-ink text-bg hover:opacity-90",
        accent: "bg-accent text-accent-ink border border-accent-2 font-semibold hover:bg-accent-2",
        ghost: "bg-transparent text-ink-2 hover:bg-surface hover:text-ink",
      },
      size: {
        sm: "h-8 px-3.5 text-[13px]",
        default: "h-9 px-[14px] py-[9px] text-[13.5px]",
        lg: "h-[42px] px-5 text-[14px]",
        xl: "h-12 px-6 text-[15px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
