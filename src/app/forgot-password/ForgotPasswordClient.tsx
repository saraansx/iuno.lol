"use client";

import { motion } from "framer-motion";
import React, { Suspense } from "react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordClient() {
  return (
    <main className="min-h-screen bg-transparent flex items-center justify-center p-4 font-poppins relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-100 bg-white/2 backdrop-blur-[32px] border border-white/8 rounded-4xl p-8 md:p-10 flex flex-col items-center relative z-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]"
      >
        <Suspense fallback={<div className="text-white/20 text-sm">Loading...</div>}>
          <ForgotPasswordForm />
        </Suspense>
      </motion.div>
    </main>
  );
}
