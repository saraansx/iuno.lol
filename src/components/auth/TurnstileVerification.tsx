"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Turnstile } from "@marsidev/react-turnstile";

interface TurnstileVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

const TurnstileVerification: React.FC<TurnstileVerificationProps> = ({ isOpen, onClose, onSuccess }) => {
  const [rayId, setRayId] = useState("");

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (isOpen) {
      const fetchRayId = async () => {
        try {
          const res = await fetch(window.location.origin, { method: "HEAD", signal: AbortSignal.timeout(30_000) });
          const cfRay = res.headers.get("cf-ray");

          if (cfRay) {
            setRayId(cfRay.split('-')[0]);
          } else {
            const chars = '0123456789abcdef';
            let id = '';
            for (let i = 0; i < 16; i++) {
              id += chars[Math.floor(Math.random() * chars.length)];
            }
            setRayId(id);
          }
        } catch (error) {
          console.error("Failed to fetch ray ID", error);
        }
      };

      fetchRayId();
    }
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 5 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-sm bg-[#050505]/95 backdrop-blur-3xl border border-white/10 rounded-[20px] overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.7)] p-6"
          >
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[16px] font-medium text-white/90 tracking-tight">security check</h2>
                <button 
                  onClick={onClose}
                  className="p-1 rounded-full text-white/20 hover:text-white transition-all cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              <p className="text-white/40 text-[13px] font-normal">verification required to continue</p>
            </div>

            <div className="mb-6">
              <div className="w-full bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center min-h-22.5 relative overflow-hidden shadow-inner">
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
            
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[#666666] font-mono text-[11px] font-medium">ray id: {rayId}</span>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/20 to-transparent" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default TurnstileVerification;
