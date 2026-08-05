import { forwardRef, useState } from "react";
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  showCharacterCount?: boolean;
  maxLength?: number;
  isPassword?: boolean;
  icon?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, showCharacterCount, maxLength, isPassword, icon, error, className = "", value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex items-center justify-between px-1">
          <label className="text-[11px] font-semibold text-white/80 tracking-wider capitalize">
            {label}
          </label>
          {showCharacterCount && maxLength && (
            <span className="text-[11px] font-medium text-white/30">
              {charCount}/{maxLength}
            </span>
          )}
        </div>
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#609fda]/50 transition-colors pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={isPassword ? (showPassword ? "text" : "password") : props.type || "text"}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            className={`w-full bg-[#121212] border rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 transition-all shadow-inner ${error ? "border-red-400/30 focus:border-red-400/50 focus:ring-red-400/10" : "border-white/5 focus:border-[#609fda]/30 focus:ring-[#609fda]/30"} ${isPassword ? "pr-11" : ""} ${icon ? "pl-11" : ""} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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

Input.displayName = "Input";

export default Input;
