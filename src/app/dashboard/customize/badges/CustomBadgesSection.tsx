"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createCustomBadge, deleteCustomBadge, resetCustomBadges } from "@/actions/badges";
import ProfileBadges, { type CustomBadge } from "@/components/profile/layouts/ProfileBadges";
import { toast } from "@/components/ui/toast";

type MyBadges = { owned: string[]; equipped: string[]; custom: CustomBadge[]; tokens: number };

const MAX_ICON_BYTES = 1024 * 1024;
const PREVIEW_ID = "custom-preview";

type BadgeBoxStyle = {
  glowEnabled: boolean;
  glowStrength: number;
  badgeSize: number;
  containerStyle: string;
  badgeSpacing: number;
};

export default function CustomBadgesSection({
  custom,
  tokens,
  totalOwned,
  equipped,
  boxStyle,
  onToggle,
  onChange,
}: {
  custom: CustomBadge[];
  tokens: number;
  totalOwned: number;
  equipped: string[];
  boxStyle: BadgeBoxStyle;
  onToggle: (id: string) => void;
  onChange: (next: MyBadges) => void;
}) {
  const [modal, setModal] = useState<"preview" | "create" | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const used = custom.length;
  const free = Math.max(0, tokens - used);

  async function handleRestore() {
    setConfirm(null);
    if (deleting) return;
    setDeleting("all");
    try {
      onChange(await resetCustomBadges());
      toast.success("Custom badges reset");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setDeleting(null);
    }
  }

  async function handleDelete(id: string) {
    setConfirm(null);
    if (deleting) return;
    setDeleting(id);
    try {
      onChange(await deleteCustomBadge(id));
      toast.success("Badge deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl shadow-sm p-4 md:p-5 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Custom badges</h2>
            <span
              className="text-[11px] font-normal rounded-full px-2.5 py-0.5 border text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30"
              title="Slots used / slots owned"
            >
              {used}/{tokens}
            </span>
          </div>
          <p className="text-white/40 text-[11.5px] mt-0.5">
            {totalOwned} badge{totalOwned === 1 ? "" : "s"} total · One badge token = one slot. {free > 0 ? `${free} free slot${free === 1 ? "" : "s"}.` : "No free slots."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <SmallButton onClick={() => (used === 0 ? toast.error("No custom badges to reset.") : setConfirm("all"))} label="Restore order" disabled={used === 0 || deleting !== null}>
            <path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4" />
          </SmallButton>
          <SmallButton href="/checkout/badge-token" label="Buy badge token" accent>
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="17" cy="20" r="1.5" />
            <path d="M3 3h2l2.4 12.2a1 1 0 0 0 1 .8H17a1 1 0 0 0 1-.8L20 7H6" />
          </SmallButton>
          <SmallButton onClick={() => setModal("preview")} label="Preview" accent>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </SmallButton>
          <SmallButton
            onClick={() => (free > 0 ? setModal("create") : toast.error("No free slot. Buy a badge token first."))}
            label="Add badge"
            disabled={free === 0}
          >
            <path d="M12 5v14M5 12h14" />
          </SmallButton>
        </div>
      </div>

      {custom.length === 0 ? (
        <div className="w-full border border-dashed border-white/[0.08] rounded-2xl bg-[#141414]/30 py-10 px-6 flex flex-col items-center justify-center text-center">
          <p className="text-[13.5px] font-normal text-white/90 tracking-tight">No custom badges yet</p>
          <p className="text-[11.5px] font-normal text-white/35 mt-1 max-w-xs leading-relaxed">
            {tokens > 0
              ? "You have a free slot. Add a badge with your own icon and name."
              : "Buy a badge token to make your own badge. Try it first with Preview."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {custom.map((b) => {
            const isEquipped = equipped.includes(b.id);
            return (
              <div key={b.id} className="flex items-center gap-3 p-3.5 bg-[#141414]/70 border border-white/5 rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.iconUrl} alt="" width={26} height={26} className="w-[26px] h-[26px] object-contain shrink-0" />
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="text-[13.5px] font-normal text-white/90 truncate">{b.name}</span>
                  <span className="text-[10.5px] text-white/35 truncate">Custom badge</span>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle(b.id)}
                  className={`text-[12px] font-normal rounded-lg px-3 py-1 border transition-colors cursor-pointer ${
                    isEquipped
                      ? "text-white/70 bg-white/[0.03] border-white/15 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                      : "text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30"
                  }`}
                >
                  {isEquipped ? "Unequip" : "Equip"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm(b.id)}
                  disabled={deleting === b.id}
                  aria-label={`Delete ${b.name}`}
                  className="shrink-0 w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {confirm && (
          <ConfirmModal
            title={confirm === "all" ? "Reset custom badges?" : "Delete this badge?"}
            text={
              confirm === "all"
                ? "All your custom badges will be deleted and your slots freed, so you can make new ones. Your tokens stay."
                : "This badge will be deleted and its slot freed so you can use it again."
            }
            cta={confirm === "all" ? "Reset" : "Delete"}
            onCancel={() => setConfirm(null)}
            onConfirm={() => (confirm === "all" ? handleRestore() : handleDelete(confirm))}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal && (
          <BadgeModal
            mode={modal}
            hasFreeSlot={free > 0}
            boxStyle={boxStyle}
            onClose={() => setModal(null)}
            onCreated={(next) => {
              onChange(next);
              setModal(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfirmModal({
  title,
  text,
  cta,
  onCancel,
  onConfirm,
}: {
  title: string;
  text: string;
  cta: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onCancel}
      className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="custom-confirm-title"
        aria-describedby="custom-confirm-text"
        className="w-[min(400px,90vw)] bg-[#0c0c0c] border border-white/10 rounded-[20px] p-6 shadow-2xl"
      >
        <h3 id="custom-confirm-title" className="text-[15px] font-normal text-white/90 tracking-tight">
          {title}
        </h3>
        <p id="custom-confirm-text" className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">
          {text}
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            autoFocus
            className="h-9 rounded-xl px-4 text-[13px] font-normal text-white/70 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-9 rounded-xl px-4 text-[13px] font-normal text-red-300 bg-red-500/15 border border-red-500/25 hover:bg-red-500/25 transition-colors cursor-pointer"
          >
            {cta}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SmallButton({
  label,
  onClick,
  href,
  accent = false,
  disabled = false,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  accent?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const cls = `flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-normal border transition-colors cursor-pointer ${
    accent
      ? "text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30"
      : "text-white/60 bg-white/[0.03] border-white/10 hover:text-white/90 hover:bg-white/[0.06]"
  } ${disabled ? "opacity-50" : ""}`;
  const icon = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {icon}
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-disabled={disabled} className={cls}>
      {icon}
      {label}
    </button>
  );
}

function BadgeModal({
  mode,
  hasFreeSlot,
  boxStyle,
  onClose,
  onCreated,
}: {
  mode: "preview" | "create";
  hasFreeSlot: boolean;
  boxStyle: BadgeBoxStyle;
  onClose: () => void;
  onCreated: (next: MyBadges) => void;
}) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLocalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pick(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Pick an image file.");
    if (f.size > MAX_ICON_BYTES) return toast.error("Max icon size is 1MB.");
    setFile(f);
  }

  async function handleCreate() {
    if (busy) return;
    const trimmed = name.trim();
    if (!trimmed) return toast.error("Give your badge a name.");
    if (!file) return toast.error("Pick an icon.");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("fileToUpload", file);
      form.append("assetType", "badge");
      const res = await fetch("/api/upload", { method: "POST", body: form, signal: AbortSignal.timeout(30_000) });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) throw new Error(data?.error ?? "Upload failed.");
      onCreated(await createCustomBadge({ name: trimmed, iconUrl: data.url as string }));
      toast.success("Badge created. Equip it and save.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const previewBadge: CustomBadge | null = localUrl ? { id: PREVIEW_ID, name: name.trim() || "Your badge", iconUrl: localUrl } : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-badge-title"
        className="w-[min(520px,92vw)] bg-[#0c0c0c] border border-white/10 rounded-[20px] p-6 shadow-2xl flex flex-col gap-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="custom-badge-title" className="text-[15px] font-normal text-white/90 tracking-tight">
              {mode === "preview" ? "Badge preview" : "Add custom badge"}
            </h3>
            <p className="text-[12px] text-white/40 mt-1 leading-relaxed">
              {mode === "preview"
                ? "Try a badge before you spend a token: pick a name and an image and see it in your badge box."
                : "Pick a name and an icon. This uses one badge token slot."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-white/60">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 32))}
            placeholder="Badge name"
            maxLength={32}
            className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-[#5b6cf5]/40"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] text-white/60">Icon</span>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pick(e.dataTransfer.files[0]);
            }}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 bg-[#111111] hover:border-white/20 hover:bg-[#141414] transition-colors py-7 cursor-pointer text-center"
          >
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
            {localUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={localUrl} alt="" className="w-10 h-10 object-contain" />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-white/50" aria-hidden="true">
                <path d="M12 15V3M7 8l5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
              </svg>
            )}
            <span className="text-[12.5px] text-white/80">{file ? file.name : "Drop a file here or click to browse"}</span>
            <span className="text-[11px] text-white/35">Square image works best · Max 1MB</span>
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] text-white/60">Your badge box</span>
          <div className="rounded-xl border border-dashed border-white/10 bg-black min-h-[88px] flex items-center justify-center px-4 pt-5 pb-3">
            {previewBadge ? (
              <ProfileBadges
                badgeIds={[PREVIEW_ID]}
                customBadges={[previewBadge]}
                glowEnabled={boxStyle.glowEnabled}
                glowStrength={boxStyle.glowStrength}
                badgeSize={boxStyle.badgeSize}
                containerStyle={boxStyle.containerStyle}
                badgeSpacing={boxStyle.badgeSpacing}
              />
            ) : (
              <span className="text-[12px] text-white/35">Upload an image to see your badge box come to life.</span>
            )}
          </div>
        </div>

        {mode === "create" || hasFreeSlot ? (
          <button
            type="button"
            onClick={handleCreate}
            disabled={busy}
            className="h-10 rounded-xl bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 border border-[#5b6cf5]/30 text-[13px] font-normal text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create badge"}
          </button>
        ) : (
          <Link
            href="/checkout/badge-token"
            className="h-10 rounded-xl bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 border border-[#5b6cf5]/30 text-[13px] font-normal text-white transition-colors flex items-center justify-center"
          >
            Buy badge token
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}
