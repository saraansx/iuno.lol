"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { newVerification } from "@/actions/new-verification";
import Link from "next/link";
import SharedBackground from "@/components/SharedBackground";

const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const verified = useRef(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (verified.current) return;
    verified.current = true;

    if (!token) {
      setError("Missing token!");
      return;
    }

    newVerification(token)
      .then((data) => {
        if (data.success) {
            setSuccess(data.success);
            setTimeout(() => {
                router.push("/dashboard");
            }, 3000);
        } else {
            setError(data.error);
        }
      })
      .catch(() => {
        setError("Something went wrong!");
      });
  }, [token, router]);

  useEffect(() => {
    const timeout = setTimeout(() => {
        onSubmit();
    }, 0);
    return () => clearTimeout(timeout);
  }, [onSubmit]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full relative z-10"
    >
      <div className="bg-[#0a0a0a]/30 backdrop-blur-3xl border border-white/5 rounded-4xl p-12 shadow-2xl overflow-hidden relative">
        <div className="flex flex-col items-center text-center gap-8 relative z-10">
          {/* Animated Icon */}
          <div className="w-16 h-16 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-[#609fda]/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <svg className="text-[#609fda] relative z-10" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
              {success && <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="m9 12 2 2 4-4" strokeWidth="2" />}
              {error && <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="m15 9-6 6M9 9l6 6" strokeWidth="2" />}
            </svg>
          </div>

          <div className="space-y-3">
            <h1 className="text-white text-xl font-medium tracking-tight">
              {success ? "Email verified" : error ? "Verification failed" : "Awaiting verification"}
            </h1>
            <p className="text-white/50 text-sm font-light max-w-[280px] mx-auto">
              {success 
                ? "Your account is ready. Redirecting you shortly..." 
                : error 
                ? error 
                : "Checking your security token..."}
            </p>
          </div>

          {/* Minimal Status Feedback */}
          {!success && !error && (
            <div className="flex gap-1.5">
              <div className="w-1 h-1 bg-[#609fda] rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-[#609fda] rounded-full animate-pulse [animation-delay:0.2s]" />
              <div className="w-1 h-1 bg-[#609fda] rounded-full animate-pulse [animation-delay:0.4s]" />
            </div>
          )}

          <div className="w-full pt-6 border-t border-white/3">
            <Link 
              href="/signin" 
              className="text-white/40 text-sm font-normal hover:text-white transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function NewVerificationClient() {
  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden font-['Outfit',sans-serif]">
      <SharedBackground />

      <Suspense>
        <NewVerificationForm />
      </Suspense>
    </div>
  );
}
