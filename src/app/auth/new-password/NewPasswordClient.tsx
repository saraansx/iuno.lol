"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Suspense } from "react";
import NewPasswordForm from "@/components/auth/NewPasswordForm";

export default function NewPasswordClient() {
  return (
    <main className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden" style={{ fontFamily: "var(--font-comfortaa)" }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-100 bg-white/2 backdrop-blur-[32px] border border-white/8 rounded-4xl p-8 md:p-10 flex flex-col items-center relative z-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]"
      >
        <Suspense fallback={null}>
          <NewPasswordForm />
        </Suspense>

        <div className="mt-8 text-center">
          <p className="text-xs text-white/40 font-light">
            Remember your password?{" "}
            <Link href="/signin" className="text-[#5b6cf5] hover:text-[#5b6cf5]/80 transition-colors font-medium">
              Back to Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
