"use client";

import { useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SaveBarProps {
  show: boolean;
  onSave: () => Promise<void> | void;
  onRevert: () => void;
  saveLabel?: string;
  revertLabel?: string;
}

const SaveBar = ({
  show,
  onSave,
  onRevert,
  saveLabel = "Save",
  revertLabel = "Revert",
}: SaveBarProps) => {
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await onSave();
      } catch (err) {
        console.error("Save failed:", err);
      }
    });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="fixed bottom-12 left-[260px] z-50 flex justify-center pointer-events-none"
          style={{ right: 'var(--preview-width, 380px)' }}
        >
          <div className="bg-[#111111] border border-white/[0.08] rounded-[14px] pl-5 pr-2 py-2 flex items-center gap-6 pointer-events-auto">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#609fda] opacity-50" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#609fda]" />
              </div>
              <span className="text-[13px] text-white/80 font-medium tracking-wide">
                Unsaved changes
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onRevert}
                disabled={isPending}
                className="text-[13px] text-white/40 hover:text-white/80 px-3 py-2 rounded-[10px] transition-colors duration-200 disabled:opacity-40 cursor-pointer"
              >
                {revertLabel}
              </button>

              <button
                onClick={handleSave}
                disabled={isPending}
                className="text-[13px] bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white font-normal px-5 py-2 rounded-[10px] active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:grayscale-[0.5] disabled:hover:scale-100 flex items-center justify-center gap-2 min-w-[70px] cursor-pointer"
              >
                {isPending ? (
                  <svg className="animate-spin -ml-1 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  saveLabel
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SaveBar;
