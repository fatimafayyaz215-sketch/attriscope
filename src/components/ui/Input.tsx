"use client";

import { InputHTMLAttributes, forwardRef, ReactNode, useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:        string;
  error?:        string;
  hint?:         string;
  leftIcon?:     ReactNode;
  rightElement?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className, id, ...props }, ref) => {
    const autoId  = useId();
    const inputId = id ?? autoId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold tracking-widest uppercase text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {/* Left icon */}
          {leftIcon && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 text-[var(--color-text-muted)]"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              "w-full h-11 bg-white border rounded-[var(--radius-lg)]",
              "text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
              "transition-all duration-150 outline-none",
              /* default border */
              "border-[var(--color-border)]",
              /* focus */
              "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20",
              /* error */
              error && "border-[var(--color-error)] focus:ring-[var(--color-error)]/20",
              /* padding adjustments for icons */
              leftIcon    ? "pl-10" : "pl-4",
              rightElement ? "pr-10" : "pr-4",
              className
            )}
            {...props}
          />

          {/* Right element (e.g. password toggle) */}
          {rightElement && (
            <span className="absolute right-3 flex items-center">
              {rightElement}
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-[var(--color-error)]">
            {error}
          </p>
        )}

        {/* Hint */}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-[var(--color-text-muted)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
