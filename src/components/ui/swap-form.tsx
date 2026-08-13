"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

export type AuthMode = "signin" | "register";

interface SwapFormProps {
  /** Which mode to start on. Defaults to "signin". */
  initialMode?: AuthMode;
  /** Called whenever the user toggles between sign in / register. */
  onModeChange?: (mode: AuthMode) => void;
  /** Called when the register flow completes successfully (hides card chrome). */
  onRegisterSuccess?: (success: boolean) => void;
  /** Custom labels. Falls back to the app's copy. */
  texts?: {
    signinTitle?: string;
    signinSubtitle?: string;
    registerTitle?: string;
    registerSubtitle?: string;
  };
}

const DEFAULT_TEXTS = {
  signinTitle: "Welcome back",
  signinSubtitle: "Choose your preferred method to sign in",
  registerTitle: "Create an account",
  registerSubtitle: "Join thousands of creators on IUNO.LOL",
};

const swapVariants = {
  initial: { opacity: 0, y: -30, scale: 0.97, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: 30, scale: 0.97, filter: "blur(4px)" },
};

const toggleClassName =
  "text-[#609fda] hover:text-[#609fda]/90 font-medium relative inline-block cursor-pointer after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#609fda] hover:after:w-full after:transition-all after:duration-300";

/**
 * SwapForm — the shared auth card for /signin and /register. Holds the real
 * LoginForm/RegisterForm and animates the swap between them (blur + y + scale
 * via AnimatePresence), so "create account" and "sign in" never leave the page.
 */
export default function SwapForm({
  initialMode = "signin",
  onModeChange,
  onRegisterSuccess,
  texts = {},
}: SwapFormProps) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const isSignIn = mode === "signin";
  const title = isSignIn
    ? texts.signinTitle ?? DEFAULT_TEXTS.signinTitle
    : texts.registerTitle ?? DEFAULT_TEXTS.registerTitle;
  const subtitle = isSignIn
    ? texts.signinSubtitle ?? DEFAULT_TEXTS.signinSubtitle
    : texts.registerSubtitle ?? DEFAULT_TEXTS.registerSubtitle;

  // Hide the logo/heading/footer once registration succeeds so the form's own
  // "check your email" screen fills the card (matches the old register page).
  const showChrome = !(!isSignIn && registerSuccess);

  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    setMode(next);
    setRegisterSuccess(false);
    onModeChange?.(next);
  };

  return (
    <div className="w-full max-w-100 bg-white/2 backdrop-blur-[32px] border border-white/8 rounded-4xl p-6 md:p-7 flex flex-col items-center relative z-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] overflow-hidden">
      {showChrome && (
        <Link href="/" className="mb-4 flex justify-center hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="Iuno Logo" width={48} height={48} className="object-contain" priority />
        </Link>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          variants={swapVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex flex-col items-center"
        >
          {showChrome && (
            <>
              <h1 className="text-xl font-normal text-white mb-1 tracking-tight">{title}</h1>
              <p className="text-white/60 text-sm font-normal mb-6 text-center">{subtitle}</p>
            </>
          )}

          {isSignIn && error === "discord_email_unverified" && (
            <div className="w-full mb-4 bg-red-400/10 border border-red-400/20 rounded-xl px-3.5 py-2.5 flex items-center gap-3">
              <svg className="text-red-400 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
              </svg>
              <p className="text-red-400 text-xs font-medium">
                Your Discord email is not verified. Please verify your email on Discord and try again.
              </p>
            </div>
          )}

          {isSignIn && error === "discord_rate_limited" && (
            <div className="w-full mb-4 bg-red-400/10 border border-red-400/20 rounded-xl px-3.5 py-2.5 flex items-center gap-3">
              <svg className="text-red-400 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
              </svg>
              <p className="text-red-400 text-xs font-medium">
                Too many Discord sign-in attempts. Please try again in a few minutes.
              </p>
            </div>
          )}

          {isSignIn ? (
            <LoginForm />
          ) : (
            <RegisterForm
              onSuccessStateChange={(s) => {
                setRegisterSuccess(!!s);
                onRegisterSuccess?.(!!s);
              }}
            />
          )}

          {showChrome && (
            <div className="mt-6 text-center">
              <p className="text-xs text-white/40 font-light">
                {isSignIn ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button type="button" onClick={() => switchMode("register")} className={toggleClassName}>
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button type="button" onClick={() => switchMode("signin")} className={toggleClassName}>
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
