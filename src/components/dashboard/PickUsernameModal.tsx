"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { completeDiscordOnboarding } from "@/actions/account";

const HANDLE_RE = /^[a-z0-9_.]{2,32}$/;

export default function PickUsernameModal() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clean = username.toLowerCase().trim();
  const validHandle = HANDLE_RE.test(clean);
  const rules = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const strong = rules.every((r) => r.ok);
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = validHandle && strong && confirm === password;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !canSubmit) return;
    if (!validHandle) return setError("2–32 characters: lowercase letters, numbers, _ and . only.");
    if (!strong) return setError("Password is not strong enough.");
    if (mismatch) return setError("Passwords don't match.");
    setBusy(true);
    setError(null);
    const res = await completeDiscordOnboarding(clean, password);
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
        className="w-[min(420px,92vw)] bg-[#0c0c0c] border border-white/10 rounded-[20px] p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
      >
        <div>
          <h2 id="pick-username-title" className="text-[15px] font-normal text-white/90 tracking-tight">
            Welcome — set up your account
          </h2>
          <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">
            Choose your username and set a password. You will use the password to change your email, add passkeys and more.
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-white/60">Username</span>
          <span className="flex items-stretch bg-[#161616] border border-white/5 rounded-xl overflow-hidden focus-within:border-[#5b6cf5]/40 transition-colors">
            <span className="flex items-center pl-3.5 text-[13px] text-white/35 select-none">iuno.lol/</span>
            <input
              autoFocus
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 32));
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
          <span id="pick-username-hint" className="text-[11px] text-white/30">
            2–32 characters: a–z, 0–9, _ and .
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-white/60">Password</span>
          <span className="flex items-stretch bg-[#161616] border border-white/5 rounded-xl overflow-hidden focus-within:border-[#5b6cf5]/40 transition-colors">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="••••••••"
              autoComplete="new-password"
              maxLength={128}
              className="flex-1 min-w-0 bg-transparent h-10 px-3.5 text-[13px] text-white outline-none placeholder:text-white/25"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="shrink-0 w-10 flex items-center justify-center text-white/40 hover:text-white border-l border-white/5 cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path
                  d={
                    showPw
                      ? "M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"
                      : "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                  }
                />
                <circle cx="12" cy="12" r={showPw ? "0" : "3"} />
              </svg>
            </button>
          </span>
          <span className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            {rules.map((r) => (
              <span key={r.label} className={`flex items-center gap-1 text-[11px] ${r.ok ? "text-[#a5aef9]" : "text-white/30"}`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  {r.ok ? <path d="M20 6 9 17l-5-5" /> : <circle cx="12" cy="12" r="4" />}
                </svg>
                {r.label}
              </span>
            ))}
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-white/60">Confirm password</span>
          <span
            className={`flex items-stretch bg-[#161616] border rounded-xl overflow-hidden focus-within:border-[#5b6cf5]/40 transition-colors ${mismatch ? "border-red-500/30" : "border-white/5"}`}
          >
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError(null);
              }}
              placeholder="••••••••"
              autoComplete="new-password"
              maxLength={128}
              className="flex-1 min-w-0 bg-transparent h-10 px-3.5 text-[13px] text-white outline-none placeholder:text-white/25"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
              className="shrink-0 w-10 flex items-center justify-center text-white/40 hover:text-white border-l border-white/5 cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path
                  d={
                    showConfirm
                      ? "M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"
                      : "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                  }
                />
                <circle cx="12" cy="12" r={showConfirm ? "0" : "3"} />
              </svg>
            </button>
          </span>
          {mismatch && <span className="text-[11px] text-red-400/80">Passwords don&apos;t match.</span>}
        </label>

        {error && <p className="text-[12px] text-red-400/90 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={busy || !canSubmit}
          className="h-10 rounded-xl text-[13px] font-normal text-white bg-[#5b6cf5]/20 border border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
        >
          {busy ? "Saving…" : "Continue"}
        </button>
      </motion.form>
    </motion.div>
  );
}
