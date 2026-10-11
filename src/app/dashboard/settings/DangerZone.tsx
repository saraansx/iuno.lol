"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { verifyPasswordForDelete, verifyOtpForDelete, confirmDeleteAccount, cancelDeleteVerification } from "@/actions/account";
import { toast } from "@/components/ui/toast";

function ModalShell({ onClose, labelledBy, children, role = "dialog" }: { onClose: () => void; labelledBy: string; children: React.ReactNode; role?: "dialog" | "alertdialog" }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="w-[min(420px,90vw)] bg-[#0c0c0c] border border-white/10 rounded-[20px] p-6 shadow-2xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function DangerZone() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const router = useRouter();


  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[13.5px] font-normal text-white/90 tracking-tight">Delete account</h3>
            <p className="text-[12px] text-white/35 mt-1">This will permanently delete your account and all data.</p>
          </div>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 h-8 text-[12.5px] font-normal text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" /></svg>
            Delete account
          </button>
        </div>
        <div className="bg-[#161616] border border-white/5 rounded-xl px-3.5 py-3 flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center text-white/40 shrink-0" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" /></svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] text-white/70">No deletion scheduled.</p>
            <p className="text-[11px] text-white/30 mt-0.5">Once confirmed, your account and all data will be deleted immediately.</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {deleteOpen && <DeleteAccountModal onClose={() => setDeleteOpen(false)} onDeleted={() => router.push("/")} />}
      </AnimatePresence>
    </div>
  );
}

function DeleteAccountModal({ onClose, onDeleted }: { onClose: () => void; onDeleted: () => void }) {
  type Step = "password" | "otp" | "confirm";
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(10);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (step !== "confirm") return;
    const id = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [step]);

  async function submitPassword(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;
    if (!password) return toast.error("Enter your current password.");
    setBusy(true);
    const res = await verifyPasswordForDelete(password);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Code sent to your email");
    setStep("otp");
  }

  async function submitOtp(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy || otp.length !== 6) return;
    setBusy(true);
    const res = await verifyOtpForDelete(otp);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setCooldown(10);
    setStep("confirm");
  }

  async function handleConfirm() {
    if (cooldown > 0 || deleting) return;
    setDeleting(true);
    const res = await confirmDeleteAccount();
    setDeleting(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Account deleted");
    onDeleted();
  }

  async function handleCancel() {
    await cancelDeleteVerification().catch(() => {});
    onClose();
  }

  const inputCls = "w-full bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white outline-none placeholder:text-white/25 focus:border-[#5b6cf5]/40 transition-colors";
  const primaryCls = "h-9 rounded-xl px-4 text-[13px] font-normal text-white bg-red-500/15 border border-red-500/25 hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default";

  return (
    <ModalShell onClose={handleCancel} labelledBy="delete-account-title" role="alertdialog">
      <h3 id="delete-account-title" className="text-[15px] font-normal text-white/90 tracking-tight">Delete account?</h3>
      {step === "password" && (
        <>
          <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">Enter your password. We will send a 6-digit code to your email.</p>
          <form onSubmit={submitPassword} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] text-white/60">Current password</span>
              <div className="flex items-stretch bg-[#161616] border border-white/5 rounded-xl overflow-hidden focus-within:border-[#5b6cf5]/40">
                <input autoFocus type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" maxLength={128} className="flex-1 min-w-0 bg-transparent h-10 px-3.5 text-[13px] text-white outline-none placeholder:text-white/25" />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="shrink-0 w-10 flex items-center justify-center text-white/40 hover:text-white border-l border-white/5 cursor-pointer">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={showPw ? "M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" : "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"} /><circle cx="12" cy="12" r={showPw ? "0" : "3"} /></svg>
                </button>
              </div>
            </label>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={handleCancel} className="h-9 rounded-xl px-4 text-[13px] font-normal text-white/70 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] transition-colors cursor-pointer">Cancel</button>
              <button type="submit" disabled={busy} className="h-9 rounded-xl px-4 text-[13px] font-normal text-white bg-[#5b6cf5]/20 border border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30 transition-colors cursor-pointer disabled:opacity-50">{busy ? "Sending…" : "Send code"}</button>
            </div>
          </form>
        </>
      )}
      {step === "otp" && (
        <>
          <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">Enter the 6-digit code we sent to your email. It expires in 5 minutes.</p>
          <form onSubmit={submitOtp} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] text-white/60">Verification code</span>
              <input autoFocus inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" className={`${inputCls} tracking-[0.4em] text-center`} />
            </label>
            <div className="flex items-center justify-between gap-2">
              <button type="button" onClick={() => setStep("password")} className="text-[12px] text-white/45 hover:text-white/80 cursor-pointer">Back</button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleCancel} className="h-9 rounded-xl px-4 text-[13px] font-normal text-white/70 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={busy || otp.length !== 6} className={primaryCls}>{busy ? "Checking…" : "Verify"}</button>
              </div>
            </div>
          </form>
        </>
      )}
      {step === "confirm" && (
        <>
          <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">This will <span className="text-red-300">permanently delete</span> your account and all data. This cannot be undone.</p>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button type="button" onClick={handleCancel} className="h-9 rounded-xl px-4 text-[13px] font-normal text-white/70 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] transition-colors cursor-pointer" disabled={deleting}>Cancel</button>
            <button type="button" onClick={handleConfirm} disabled={cooldown > 0 || deleting} className={primaryCls}>{deleting ? "Deleting…" : cooldown > 0 ? `Confirm (${cooldown}s)` : "Confirm — delete my account"}</button>
          </div>
          {cooldown > 0 && <p className="text-[11px] text-white/30 mt-2 text-right">Wait {cooldown}s before you can confirm.</p>}
        </>
      )}
    </ModalShell>
  );
}
