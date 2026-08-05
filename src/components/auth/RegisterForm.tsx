"use client";

import React, {  useState  } from "react";
import { motion } from "framer-motion";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { register } from "@/actions/register";
import { resendVerification } from "@/actions/resend-verification";
import { checkAvailability } from "@/actions/check-availability";
import TurnstileVerification from "@/components/auth/TurnstileVerification";

interface RegisterFormProps {
  onSuccessStateChange?: (success: boolean) => void;
}

const RegisterForm = ({ onSuccessStateChange }: RegisterFormProps) => {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState(searchParams.get("username") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("");
  const [tosAccepted, setTosAccepted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [showTurnstileModal, setShowTurnstileModal] = useState(false);
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
      } else if (cleanUsername.length < 3 || cleanUsername.length > 32) {
        newErrors.username = "Username must be between 3 and 32 characters.";
      } else if (!/^[a-z0-9_.]+$/.test(cleanUsername)) {
        newErrors.username = "Only letters, numbers, underscores, and dots allowed.";
      } else if (!/^[a-z0-9]$/.test(cleanUsername.slice(-1))) {
        newErrors.username = "Username must end with a letter or number.";
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

    startTransition(() => {
      register({ username, email, password, affiliateCode, turnstileToken: token })
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
                const msg = data.error.toLowerCase();
                if (msg.includes('email')) {
                  newErrors.email = data.error;
                } else if (msg.includes('username')) {
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
      <Input
        label="Username"
        value={username}
        onChange={(e) => handleInputChange("username", e.target.value.toLowerCase().trim(), setUsername)}
        maxLength={32}
        showCharacterCount
        placeholder="username"
        error={errors.username}
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
      />

      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => handleInputChange("email", e.target.value, setEmail)}
        placeholder="email@example.com"
        error={errors.email}
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
      />

      <Button onClick={handleSubmit} disabled={isPending} className="mt-2 flex items-center justify-center gap-2">
        {isPending ? "Checking..." : "Next Step"} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </Button>
      {error && <p className="text-red-400 text-sm -mt-2">{error}</p>}
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <Input
          label="Create Password"
          isPassword
          value={password}
          onChange={(e) => handleInputChange("password", e.target.value, setPassword)}
          placeholder="••••••••••••"
          error={errors.password}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
        />

        <Input
          label="Confirm Password"
          isPassword
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
                else bgColor = "bg-[#609fda]/60";
              }

              return (
                <div 
                  key={level}
                  className={`flex-1 rounded-full transition-all duration-500 ${bgColor} ${
                    isActive && strength === 4 ? "shadow-[0_0_8px_rgba(96,159,218,0.3)]" : ""
                  }`}
                />
              );
            })}
          </div>
          <p className={`text-[11px] font-semibold uppercase tracking-tight transition-all duration-300 ${strength > 0 ? "opacity-100" : "opacity-0"}`}>
            {strength === 1 && <span className="text-red-400/60">Weak</span>}
            {strength <= 3 && strength > 1 && <span className="text-yellow-500/60">Medium</span>}
            {strength === 4 && <span className="text-[#609fda]">Strong</span>}
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
                  ? "bg-[#609fda]/10 border-[#609fda]/40 text-[#609fda]" 
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
      <div className="relative">
        <div className="absolute -top-2 -right-1 z-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#609fda]/15 text-[#609fda] border border-[#609fda]/25 shadow-sm">
            Coming soon
          </span>
        </div>
        <div className="opacity-40 pointer-events-none select-none grayscale">
          <Input
            label="Affiliate Code (Optional)"
            value={affiliateCode}
            onChange={(e) => setAffiliateCode(e.target.value)}
            placeholder="Enter code"
            disabled
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input 
              type="checkbox" 
              className="peer sr-only"
              checked={tosAccepted}
              onChange={() => handleInputChange("tos", !tosAccepted, setTosAccepted)}
            />
            <div className={`w-5 h-5 border rounded-md bg-white/2 transition-all shadow-inner ${errors.tos ? "border-red-400/30" : "border-white/10 peer-checked:bg-[#609fda]/20 peer-checked:border-[#609fda]/50"}`} />
            <svg className="absolute w-3.5 h-3.5 text-[#609fda] opacity-0 peer-checked:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <span className="text-xs text-white/70 font-medium group-hover:text-white transition-colors">
            I accept the <span className="text-[#609fda] font-semibold">Terms of Service</span>
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
        <svg className="text-[#609fda]/60" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            className="absolute inset-y-0 w-12 bg-linear-to-r from-transparent via-[#609fda]/30 to-transparent"
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
          : <>Didn&apos;t get it? <span className="underline underline-offset-4 group-hover:text-[#609fda] transition-colors">Resend link</span></>
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
                className="absolute inset-0 bg-[#609fda] shadow-[0_0_10px_rgba(96,159,218,0.5)]"
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
