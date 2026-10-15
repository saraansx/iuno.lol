"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { newPassword } from "@/actions/new-password";
import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const NewPasswordForm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const getStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getStrength(password);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!password) {
      newErrors.password = "Password cannot be empty.";
    } else if (strength < 4) {
      newErrors.password = "Please meet all password requirements.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = <T,>(field: string, value: T, setter: (v: T) => void) => {
    setter(value);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setError("");
      setSuccess("");
      if (!token) {
        setError("Missing token!");
        return;
      }
      startTransition(() => {
        newPassword(token, password).then((data) => {
          if (data.error) setError(data.error);
          if (data.success) {
            setSuccess(data.success);
            setPassword("");
            setConfirmPassword("");
          }
        });
      });
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col items-center text-center"
      >
        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <svg className="text-emerald-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        
        <h1 className="text-xl font-medium text-white mb-2">Password Updated</h1>
        <p className="text-white/40 text-sm leading-relaxed max-w-70 mb-8">
          Your password has been successfully reset. You can now log in with your new credentials.
        </p>

        <Link 
          href="/signin" 
          className="text-xs font-medium text-[#5b6cf5] hover:text-[#5b6cf5]/80 transition-all flex items-center gap-2 group"
        >
          <svg className="group-hover:-translate-x-0.5 transition-transform" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-2xl font-normal text-white mb-2 tracking-tight">Reset Password</h1>
        <p className="text-white/60 text-sm font-normal mb-0">
          Please choose a new, strong password.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col gap-5"
      >
      <div className="flex flex-col gap-2">
        <Input
          label="New Password"
          isPassword
          maxLength={128}
          value={password}
          onChange={(e) => handleInputChange("password", e.target.value, setPassword)}
          placeholder="••••••••••••"
          error={errors.password}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
        />

        <Input
          label="Confirm New Password"
          isPassword
          maxLength={128}
          value={confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value, setConfirmPassword)}
          placeholder="••••••••••••"
          error={errors.confirmPassword}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>}
        />
        
        <div className="flex items-center gap-3 px-1 mt-1">
          <div className="flex-1 flex gap-1 h-1">
            {[1, 2, 3, 4].map((level) => {
              const isActive = strength >= level;
              let bgColor = "bg-white/5";
              
              if (isActive) {
                if (strength === 1) bgColor = "bg-red-400/60";
                else if (strength <= 3) bgColor = "bg-yellow-500/60";
                else bgColor = "bg-[#5b6cf5]/60";
              }

              return (
                <div 
                  key={level}
                  className={`flex-1 rounded-full transition-all duration-500 ${bgColor} ${
                    isActive && strength === 4 ? "shadow-[0_0_8px_rgba(91,108,245,0.3)]" : ""
                  }`}
                />
              );
            })}
          </div>
          <p className={`text-[11px] font-semibold uppercase tracking-tight transition-all duration-300 ${strength > 0 ? "opacity-100" : "opacity-0"}`}>
            {strength === 1 && <span className="text-red-400/60">Weak</span>}
            {strength <= 3 && strength > 1 && <span className="text-yellow-500/60">Medium</span>}
            {strength === 4 && <span className="text-[#5b6cf5]">Strong</span>}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 px-1 mt-3">
          {[
            { label: "8+ characters", met: password.length >= 8 },
            { label: "Uppercase", met: /[A-Z]/.test(password) },
            { label: "Number", met: /[0-9]/.test(password) },
            { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
          ].map((req, i) => (
            <div key={i} className="flex items-center gap-2.5 group/req">
              <div className={`flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-300 ${
                req.met 
                  ? "bg-[#5b6cf5]/10 border-[#5b6cf5]/40 text-[#5b6cf5]" 
                  : "bg-white/2 border-white/5 text-white/10"
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <span className={`text-[11px] transition-colors duration-300 ${req.met ? "text-white/70" : "text-white/20"}`}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={isPending} className="mt-2 flex items-center justify-center gap-2">
        {isPending ? "Resetting..." : "Reset Password"} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </Button>
      {error && <p className="text-red-400 text-[10px] text-center mt-1">{error}</p>}
      </motion.div>
    </div>
  );
};

export default NewPasswordForm;
