"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { forgotPassword } from "@/actions/forgot-password";
import { useTransition } from "react";
import Link from "next/link";
import TurnstileVerification from "@/components/auth/TurnstileVerification";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [countdown, setCountdown] = useState(0);
  const [showTurnstileModal, setShowTurnstileModal] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email) newErrors.email = "Email cannot be empty.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format.";
    
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
      setShowTurnstileModal(true);
    }
  };

  const handleTurnstileSuccess = (token: string) => {
    document.cookie = "turnstile_cleared=true; max-age=1800; path=/";
    setShowTurnstileModal(false);
    setError("");
    setSuccess("");

    startTransition(() => {
      forgotPassword(email, token).then((data) => {
        if (data.error) {
          const match = data.error.match(/Please wait (\d+) seconds/);
          if (match) {
            setCountdown(parseInt(match[1]));
          } else {
            setError(data.error);
          }
        }
        if (data.success) {
          setSuccess(data.success);
          setEmail("");
          setCountdown(60);
        }
      });
    });
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
        
        <h2 className="text-xl font-medium text-white mb-2">Check Your Email</h2>
        <p className="text-white/40 text-sm leading-relaxed max-w-70 mb-8">
          A password reset link has been sent to your email address.
        </p>

        <Link 
          href="/signin" 
          className="text-xs font-medium text-[#609fda] hover:text-[#609fda]/80 transition-all flex items-center gap-2 group"
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
      <TurnstileVerification
        isOpen={showTurnstileModal}
        onClose={() => setShowTurnstileModal(false)}
        onSuccess={handleTurnstileSuccess}
      />
      <div className="text-center">
        <h1 className="text-2xl font-normal text-white mb-2 tracking-tight">Reset Password</h1>
        <p className="text-white/60 text-sm font-normal mb-0">
          We&apos;ll help you get back into your account
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col gap-5"
      >
        <div className="bg-white/2 border border-white/5 rounded-xl px-4 py-4 flex items-center gap-3">
          <svg className="text-white/20 shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m17 17 4 4"/><path d="m21 17-4 4"/></svg>
          <p className="text-[11px] text-white/40 font-medium">
            Enter your email address to receive a password reset link.
          </p>
        </div>

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => handleInputChange("email", e.target.value, setEmail)}
          placeholder="email@example.com"
          error={errors.email}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
        />

        <Button onClick={handleSubmit} disabled={isPending || countdown > 0} className="mt-2 flex items-center justify-center gap-2">
          {isPending ? "Sending..." : countdown > 0 ? `Wait ${countdown}s` : "Send Reset Link"} 
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </Button>
        {error && <p className="text-red-400 text-[10px] text-center mt-1">{error}</p>}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordForm;

