import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full px-3.5 py-2.5 bg-surface border border-border rounded-[10px]",
          "text-[14px] text-ink outline-none placeholder:text-ink-3",
          "transition-[border,box-shadow] duration-[120ms]",
          "focus:border-ink focus:shadow-[0_0_0_3px_var(--accent)]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
