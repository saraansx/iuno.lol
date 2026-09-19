"use client";

import React, {  useState  } from "react";
import { motion } from "framer-motion";
import Input from "@/components/ui/input";
import FloatingInput from "@/components/ui/floating-input-base";
import Button from "@/components/ui/button";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendOTP } from "@/actions/send-otp";
import { login } from "@/actions/login";
import TurnstileVerification from "@/components/auth/TurnstileVerification";

type LoginMethod = "password" | "otp";

const LoginForm = () => {
  const [method, setMethod] = useState<LoginMethod>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const router = useRouter();
  const [countdown, setCountdown] = useState(0);
  const [showTurnstileModal, setShowTurnstileModal] = useState(false);
  const [pendingSendOTP, setPendingSendOTP] = useState(false);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const tabs: { id: LoginMethod; label: string; icon: React.ReactNode }[] = [
    {
      id: "password",
      label: "Password",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      ),
    },
    {
      id: "otp",
      label: "OTP",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>
      ),
    },
  ];

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email) {
      newErrors.email = method === "otp" ? "Email cannot be empty." : "Email or username cannot be empty.";
    } else if (method === "otp" && !email.includes("@")) {
      newErrors.email = "Enter a valid email address.";
    }
    if (method === "password") {
      if (!password) newErrors.password = "Password cannot be empty.";
    } else {
      if (otpSent && !otpCode) newErrors.otp = "OTP code cannot be empty.";
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
    if (method === "otp" && !otpSent) {
      if (!email) {
        setErrors({ email: "Email cannot be empty." });
        return;
      }
      if (!email.includes("@")) {
        setErrors({ email: "Enter a valid email address." });
        return;
      }
      setError("");
      setSuccess("");
      setPendingSendOTP(true);
      setShowTurnstileModal(true);
      return;
    }

    if (validate()) {
      setShowTurnstileModal(true);
    }
  };

  const handleTurnstileSuccess = (token: string) => {
    document.cookie = "turnstile_cleared=true; max-age=1800; path=/";
    setShowTurnstileModal(false);
    setError("");
    setSuccess("");

    if (pendingSendOTP) {
      setPendingSendOTP(false);
      startTransition(() => {
        sendOTP(email, token)
          .then((data) => {
            if (data.error) {
              setError(data.error);
            }
            if (data.success) {
              setSuccess(data.success);
              setOtpSent(true);
              setCountdown(60);
            }
          });
      });
      return;
    }

    startTransition(() => {
      login({ identifier: email, method, password, otpCode, turnstileToken: token })
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }
          if (data.success) {
            setSuccess(data.success);
            router.push("/dashboard");
          }
        });
    });
  };

  const handleMethodSwitch = (newMethod: LoginMethod) => {
    setMethod(newMethod);
    setErrors({});
    setOtpSent(false);
    setOtpCode("");
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col gap-4"
    >
      <TurnstileVerification
        isOpen={showTurnstileModal}
        onClose={() => setShowTurnstileModal(false)}
        onSuccess={handleTurnstileSuccess}
      />
      <div className="w-full bg-white/2 border border-white/5 rounded-xl p-1 flex relative">
        <motion.div
          className="absolute top-1 bottom-1 bg-[#5b6cf5]/20 rounded-lg shadow-[0_0_15px_rgba(91,108,245,0.1)]"
          initial={false}
          animate={{
            left: method === "password" ? "4px" : "50%",
            width: "calc(50% - 4px)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleMethodSwitch(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-normal transition-colors relative z-10 cursor-pointer ${
              method === tab.id
                ? "text-white"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <FloatingInput
        id="email"
        label={method === "otp" ? "Email Address" : "Email or Username"}
        type={method === "otp" ? "email" : "text"}
        value={email}
        onChange={(e) => handleInputChange("email", e.target.value, setEmail)}
        error={errors.email}
        autoComplete={method === "otp" ? "email" : "username"}
      />

      {method === "password" && (
        <motion.div
          key="password-fields"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-1"
        >
          <FloatingInput
            id="password"
            label="Password"
            isPassword
            maxLength={128}
            value={password}
            onChange={(e) => handleInputChange("password", e.target.value, setPassword)}
            error={errors.password}
            autoComplete="current-password"
          />
          <div className="flex justify-end px-1">
            <Link href="/forgot-password" className="text-[11px] text-[#5b6cf5] hover:text-[#5b6cf5]/80 transition-colors font-medium">
              Forgot password?
            </Link>
          </div>
        </motion.div>
      )}

      {method === "otp" && (
        <motion.div
          key="otp-fields"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-3"
        >
          {otpSent && (
            <>
              <div className="bg-[#5b6cf5]/5 border border-[#5b6cf5]/10 rounded-xl px-3.5 py-2.5 flex items-center gap-3">
                <svg className="text-[#5b6cf5]/60 shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m17 17 4 4"/><path d="m21 17-4 4"/></svg>
                <p className="text-[11px] text-white/50 font-medium">
                  We sent a code to <span className="text-[#5b6cf5]">{email}</span>
                </p>
              </div>
              <Input
                label="Verification Code"
                value={otpCode}
                onChange={(e) => handleInputChange("otp", e.target.value, setOtpCode)}
                placeholder="000000"
                maxLength={6}
                error={errors.otp}
                className="!py-2.5"
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>}
              />
              <button
                type="button"
                disabled={countdown > 0}
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setPendingSendOTP(true);
                  setShowTurnstileModal(true);
                }}
                className={`text-[11px] font-medium text-center mt-2 transition-colors ${
                  countdown > 0
                    ? "text-white/10 cursor-not-allowed"
                    : "text-white/30 hover:text-white/50 cursor-pointer"
                }`}
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : "Didn't receive it? Send again"}
              </button>
            </>
          )}
        </motion.div>
      )}

      <Button 
        type="submit" 
        disabled={isPending}
        className="mt-1 flex items-center justify-center gap-2 !py-2.5"
      >
        {isPending ? (
          "Processing..."
        ) : method === "otp" && !otpSent ? (
          <>Send Code <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></>
        ) : (
          <>Sign In <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg></>
        )}
      </Button>

      {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
      {success && <p className="text-emerald-500 text-xs mt-2 text-center">{success}</p>}

      <div className="my-3 border-t border-white/5" />

      <button
        type="button"
        onClick={() => window.location.href = '/api/auth/discord'}
        className="w-full bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-white py-3 rounded-xl font-normal text-sm transition-all flex items-center justify-center gap-3 group/discord cursor-pointer shadow-[0_0_15px_rgba(88,101,242,0.1)]"
      >
        <svg className="group-hover/discord:scale-110 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01a10.174 10.174 0 0 0 .372.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/></svg>
        Sign in with Discord
      </button>
    </motion.form>
  );
};

export default LoginForm;
