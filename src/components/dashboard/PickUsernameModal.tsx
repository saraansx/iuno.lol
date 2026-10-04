"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { updateUsername } from "@/actions/account";

const HANDLE_RE = /^[a-z0-9_.]{2,32}$/;

export default function PickUsernameModal() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clean = value.toLowerCase().trim();
  const valid = HANDLE_RE.test(clean);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!valid) return setError("2–32 characters: lowercase letters, numbers, _ and . only.");
    setBusy(true);
    setError(null);
    const res = await updateUsername(clean);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pick-username-title"
        className="w-[min(380px,92vw)] bg-[#0c0c0c] border border-white/10 rounded-[20px] p-6 shadow-2xl flex flex-col gap-4"
      >
        <div>
          <h2 id="pick-username-title" className="text-[15px] font-normal text-white/90 tracking-tight">
            Choose your username
          </h2>
          <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">This is your profile link. You can change it later in Settings.</p>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="sr-only">Username</span>
          <span className="flex items-stretch bg-[#161616] border border-white/5 rounded-xl overflow-hidden focus-within:border-[#5b6cf5]/40 transition-colors">
            <span className="flex items-center pl-3.5 text-[13px] text-white/35 select-none">iuno.lol/</span>
            <input
              autoFocus
              value={value}
              onChange={(e) => {
                setValue(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 32));
                setError(null);
              }}
              placeholder="username"
              maxLength={32}
              autoComplete="username"
              spellCheck={false}
              aria-invalid={Boolean(error)}
              aria-describedby="pick-username-hint"
              className="flex-1 min-w-0 bg-transparent h-10 pr-3.5 text-[13px] text-white outline-none placeholder:text-white/25"
            />
          </span>
          <span id="pick-username-hint" className={`text-[11px] ${error ? "text-red-400/80" : "text-white/30"}`}>
            {error ?? "2–32 characters: a–z, 0–9, _ and ."}
          </span>
        </label>
        <button
          type="submit"
          disabled={busy || !valid}
          className="h-10 rounded-xl text-[13px] font-normal text-white bg-[#5b6cf5]/20 border border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
        >
          {busy ? "Saving…" : "Continue"}
        </button>
      </motion.form>
    </motion.div>
  );
}
