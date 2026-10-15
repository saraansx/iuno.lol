"use client";

import React, {  useState  } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import FloatingInput from "@/components/ui/floating-input-base";
import Button from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { register } from "@/actions/register";
import { resendVerification } from "@/actions/resend-verification";
import { checkAvailability } from "@/actions/check-availability";
import TurnstileVerification from "@/components/auth/TurnstileVerification";
import { sanitizeNextPath } from "@/lib/auth/redirect";

interface RegisterFormProps {
  onSuccessStateChange?: (success: boolean) => void;
}

const RegisterForm = ({ onSuccessStateChange }: RegisterFormProps) => {
  const searchParams = useSearchParams();
  const redirectTo = sanitizeNextPath(searchParams.get("next"));
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState(searchParams.get("username") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tosAccepted, setTosAccepted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [showTurnstileModal, setShowTurnstileModal] = useState(false);
  const [pendingDiscord, setPendingDiscord] = useState(false);
  const [pendingResend, setPendingResend] = useState(false);
  const [countdown, setCountdown] = useState(0);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSetSuccess = (val: string | undefined) => {
    setSuccess(val);
    onSuccessStateChange?.(!!val);
  };

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

  const validateStep = () => {
    const newErrors: { [key: string]: string } = {};
    if (step === 1) {
      const cleanUsername = username.trim().toLowerCase();
      if (!cleanUsername) {
        newErrors.username = "Username cannot be empty.";
      } else if (cleanUsername.length < 2 || cleanUsername.length > 32) {
        newErrors.username = "Username must be between 2 and 32 characters.";
      } else if (!/^[a-z0-9_.]+$/.test(cleanUsername)) {
        newErrors.username = "Only letters, numbers, underscores, and dots allowed.";
      }
      if (!email) newErrors.email = "Email cannot be empty.";
    } else if (step === 2) {
      if (!password) {
        newErrors.password = "Password cannot be empty.";
      } else if (strength < 4) {
        newErrors.password = "Please meet all password requirements.";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    } else if (step === 3) {
      if (!tosAccepted) newErrors.tos = "You must accept the Terms of Service.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, 3));
    }
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

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

  const handleTurnstileSuccess = (token: string) => {
    document.cookie = "turnstile_cleared=true; max-age=1800; path=/";
    setShowTurnstileModal(false);
    setError("");
    handleSetSuccess("");

    if (pendingResend) {
      setPendingResend(false);
      startTransition(() => {
        resendVerification(email, token)
          .then((data) => {
            if (data.error) setError(data.error);
            if (data.success) {
              handleSetSuccess(data.success);
              setCountdown(60);
            }
          });
      });
      return;
    }

    if (pendingDiscord) {
      setPendingDiscord(false);
      const nextParam =
        redirectTo === "/dashboard" ? "" : `&next=${encodeURIComponent(redirectTo)}`;
      window.location.href = `/api/auth/discord${nextParam}`;
      return;
    }

    startTransition(() => {
      register({ username, email, password, turnstileToken: token })
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }
          if (data.success) {
            handleSetSuccess(data.success);
            setCountdown(60);
          }
        });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      if (step === 1) {
        if (!validateStep()) return;
        startTransition(() => {
          checkAvailability({ username, email })
            .then((data) => {
              if (data.error) {
                const newErrors: { [key: string]: string } = {};
                if (data.field === "email") {
                  newErrors.email = data.error;
                } else if (data.field === "username") {
                  newErrors.username = data.error;
                } else {
                  setError(data.error);
                }
                setErrors(newErrors);
              } else {
                setError("");
                setErrors({});
                setStep((s) => Math.min(s + 1, 3));
              }
            });
        });
        return;
      }
      nextStep();
      return;
    }
    if (validateStep()) {
      setShowTurnstileModal(true);
    }
  };

  const renderStep1 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full flex flex-col gap-5"
    >
      <FloatingInput
        id="username"
        label="Username"
        value={username}
        onChange={(e) => handleInputChange("username", e.target.value.toLowerCase().trim(), setUsername)}
        maxLength={32}
        showCharacterCount
        error={errors.username}
        autoComplete="username"
      />

      <FloatingInput
        id="email"
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => handleInputChange("email", e.target.value, setEmail)}
        error={errors.email}
        autoComplete="email"
      />

      <Button onClick={handleSubmit} disabled={isPending} className="mt-2 flex items-center justify-center gap-2">
        {isPending ? "Checking..." : "Next Step"} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </Button>
      {error && <p className="text-red-400 text-sm -mt-2">{error}</p>}

      <div className="flex items-center gap-3 -my-1" aria-hidden="true">
        <span className="h-px flex-1 bg-white/5" />
        <span className="text-[11px] text-white/25">or</span>
        <span className="h-px flex-1 bg-white/5" />
      </div>

      {}
      <button
        type="button"
        onClick={() => {
          setPendingDiscord(true);
          setShowTurnstileModal(true);
        }}
        className="w-full bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-white py-3 rounded-xl font-normal text-sm transition-all flex items-center justify-center gap-3 group/discord cursor-pointer shadow-[0_0_15px_rgba(88,101,242,0.1)]"
      >
        <svg className="group-hover/discord:scale-110 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01a10.174 10.174 0 0 0 .372.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/></svg>
        Sign up with Discord
      </button>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <FloatingInput
          id="password"
          label="Create Password"
          isPassword
          maxLength={128}
          value={password}
          onChange={(e) => handleInputChange("password", e.target.value, setPassword)}
          error={errors.password}
          autoComplete="new-password"
        />

        <FloatingInput
          id="confirm-password"
          label="Confirm Password"
          isPassword
          maxLength={128}
          value={confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value, setConfirmPassword)}
          error={errors.confirmPassword}
          autoComplete="new-password"
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

      <div className="flex gap-3 mt-2">
        <button 
          onClick={prevStep}
          className="p-3.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 text-white/50 transition-all cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <Button onClick={handleSubmit} className="flex items-center justify-center gap-2">
          Continue <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </Button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input 
              type="checkbox" 
              className="peer sr-only"
              checked={tosAccepted}
              onChange={() => handleInputChange("tos", !tosAccepted, setTosAccepted)}
            />
            <div className={`w-5 h-5 border rounded-md bg-white/2 transition-all shadow-inner ${errors.tos ? "border-red-400/30" : "border-white/10 peer-checked:bg-[#5b6cf5]/20 peer-checked:border-[#5b6cf5]/50"}`} />
            <svg className="absolute w-3.5 h-3.5 text-[#5b6cf5] opacity-0 peer-checked:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <span className="text-xs text-white/70 font-medium group-hover:text-white transition-colors">
            I accept the{" "}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[#5b6cf5] font-semibold hover:underline underline-offset-2"
            >
              Terms of Service
            </Link>
          </span>
        </label>
        {errors.tos && (
          <p className="text-[12px] text-red-400/60 font-medium px-1 animate-in fade-in slide-in-from-top-1">
            {errors.tos}
          </p>
        )}
      </div>

      <div className="flex gap-3 mt-2">
        <button 
          onClick={prevStep}
          className="p-3.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 text-white/50 transition-all cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <Button 
          onClick={handleSubmit} 
          disabled={!tosAccepted || isPending}
          className="flex items-center justify-center gap-2"
        >
          {isPending ? "Sending Email..." : "Finalize Account"} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </Button>
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </motion.div>
  );

  const handleResend = () => {
    setError("");
    setPendingResend(true);
    setShowTurnstileModal(true);
  };

  const renderSuccess = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center gap-5 py-2"
    >
      <div className="w-12 h-12 bg-white/3 border border-white/5 rounded-full flex items-center justify-center mb-1">
        <svg className="text-[#5b6cf5]/60" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      </div>

      <div className="space-y-1.5">
        <h2 className="text-[17px] font-medium text-white/90 tracking-tight">Check your email</h2>
        <p className="text-white/40 text-[13px] font-light leading-relaxed max-w-60 mx-auto">
          We&apos;ve sent a link to <span className="text-white/70 font-normal">{email}</span> to verify your account.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 mt-4">
        <div className="w-24 h-px bg-white/3 relative overflow-hidden rounded-full">
          <motion.div 
            animate={{ 
              x: ["-100%", "200%"],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-y-0 w-12 bg-linear-to-r from-transparent via-[#5b6cf5]/30 to-transparent"
          />
        </div>
        <span className="text-[9px] text-white/15 uppercase tracking-[0.4em] font-light italic">
          {isPending ? "Sending..." : "Awaiting verify"}
        </span>
      </div>

      <button 
        onClick={handleResend} 
        disabled={isPending || countdown > 0}
        className={`text-[11px] transition-colors mt-1 group ${
          countdown > 0 
            ? "text-white/10 cursor-not-allowed" 
            : "text-white/30 hover:text-white/50 cursor-pointer"
        }`}
      >
        {countdown > 0 
          ? `Resend link in ${countdown}s` 
          : <>Didn&apos;t get it? <span className="underline underline-offset-4 group-hover:text-[#5b6cf5] transition-colors">Resend link</span></>
        }
      </button>
    </motion.div>
  );

  return (
    <div className="w-full flex flex-col gap-6">
      <TurnstileVerification
        isOpen={showTurnstileModal}
        onClose={() => setShowTurnstileModal(false)}
        onSuccess={handleTurnstileSuccess}
      />

      {!success && (
        <div className="flex gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden relative">
              <motion.div 
                initial={false}
                animate={{ 
                  width: step >= s ? "100%" : "0%",
                  opacity: step === s ? 1 : step > s ? 0.5 : 0
                }}
                className="absolute inset-0 bg-[#5b6cf5] shadow-[0_0_10px_rgba(91,108,245,0.5)]"
              />
            </div>
          ))}
        </div>
      )}

      {success ? renderSuccess() : (
        <>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </>
      )}
    </div>
  );
};

export default RegisterForm;
