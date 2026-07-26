"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Turnstile } from "@marsidev/react-turnstile";

interface TurnstileVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

const TurnstileVerification: React.FC<TurnstileVerificationProps> = ({ isOpen, onClose, onSuccess }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 5 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-90 bg-[#050505]/95 backdrop-blur-3xl border border-white/10 rounded-[20px] overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.7)]"
          >
            {/* Header */}
            <div className="p-5 pb-4 border-b border-white/4 relative">
              <div className="flex items-center justify-between mb-0.5">
                <h2 className="text-[15px] font-medium text-white/90 tracking-tight">Human Verification</h2>
                <button 
                  onClick={onClose}
                  className="p-1 rounded-full text-white/20 hover:text-white transition-all cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              <p className="text-white/30 text-[12px] font-normal">Please complete the check to continue.</p>
            </div>

            {/* Turnstile Container */}
            <div className="p-5 pb-6">
              <div className="w-full bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center min-h-22.5 relative overflow-hidden group shadow-inner">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-500/2 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  onSuccess={onSuccess}
                  options={{
                    theme: "dark"
                  }}
                  className="scale-[0.9] origin-center"
                />
              </div>
            </div>
            
            {/* Minimal Emerald glow at the bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-emerald-500/20 to-transparent" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TurnstileVerification;
