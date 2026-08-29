"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useState } from "react";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isPassword?: boolean;
  error?: string;
  showCharacterCount?: boolean;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, className, isPassword, error, showCharacterCount, type, onChange, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(() => Boolean(props.value));
    const [showPassword, setShowPassword] = useState(false);

    const charCount = typeof props.value === "string" ? props.value.length : 0;

    const floated = focused || hasValue;
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : (type ?? "text");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div className="relative">
          <input
            ref={ref}
            type={resolvedType}
            placeholder=" "
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              setHasValue(e.target.value !== "");
              onBlur?.(e);
            }}
            onChange={(e) => {
              setHasValue(e.target.value !== "");
              onChange?.(e);
            }}
            className={cn(
              "peer w-full px-4 py-3 border rounded-xl bg-transparent text-sm text-white outline-none transition-all duration-200",
              "placeholder:text-white/30",
              error
                ? "border-red-400/30 focus:border-red-400/50"
                : "border-white/5 hover:border-white/10 focus:border-[#609fda]/40",
              isPassword && "pr-11",
              className
            )}
            {...props}
          />
          <label
            htmlFor={props.id}
            className={cn(
              "absolute left-4 top-3 text-sm text-white/40 transition-all duration-200 pointer-events-none select-none",
              floated && "-top-2.5 left-3 text-xs px-1 bg-[#121212] text-white/40",
              focused && "text-[#609fda]",
              error && (floated ? "text-red-400" : "text-red-400/70")
            )}
          >
            {label}
          </label>
          {showCharacterCount && props.maxLength && (
            <span
              className={cn(
                "absolute -top-2.5 right-3 text-[10px] font-medium text-white/30 transition-opacity duration-200 pointer-events-none select-none",
                floated ? "opacity-100" : "opacity-0"
              )}
            >
              {charCount}/{props.maxLength}
            </span>
          )}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors focus:outline-none"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-[12px] text-red-400/60 font-medium px-1 mt-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export default FloatingInput;
