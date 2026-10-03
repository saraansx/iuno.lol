"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { addAlias, deleteAlias, updateDisplayName, updateUsername, type AliasState } from "@/actions/account";
import { toast } from "@/components/ui/toast";
import AliasPromo from "@/components/dashboard/AliasPromo";

const TABS = [{ id: "names", label: "Names" }] as const;
const PAGE_SIZE = 10;
const HANDLE_RE = /^[a-z0-9_.]{2,32}$/;
const SITE = "iuno.lol";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function SettingsClient({
  initialUsername,
  initialDisplayName,
  initialAliases,
}: {
  initialUsername: string;
  initialDisplayName: string;
  initialAliases: AliasState;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("names");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-normal text-white tracking-tight">Account settings</h1>
        <p className="text-white/40 text-[13px] mt-0.5">Manage your username, display name and aliases.</p>
      </div>

      <div className="flex items-center gap-1 bg-[#0c0c0c] border border-white/5 rounded-full p-1 w-fit" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-5 py-2 text-[13.5px] font-normal transition-all relative cursor-pointer ${
              tab === t.id ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {tab === t.id && (
              <motion.div
                layoutId="settings-tab-bubble"
                className="absolute inset-0 bg-[#5b6cf5]/20 shadow-[0_0_15px_rgba(91,108,245,0.1)] rounded-full"
                transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      <NamesTab initialUsername={initialUsername} initialDisplayName={initialDisplayName} initialAliases={initialAliases} />
    </div>
  );
}

function NamesTab({
  initialUsername,
  initialDisplayName,
  initialAliases,
}: {
  initialUsername: string;
  initialDisplayName: string;
  initialAliases: AliasState;
}) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [savedUsername, setSavedUsername] = useState(initialUsername);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [savedDisplayName, setSavedDisplayName] = useState(initialDisplayName);
  const [busy, setBusy] = useState<"username" | "display" | null>(null);

  const cleanUsername = username.toLowerCase().trim();
  const usernameValid = HANDLE_RE.test(cleanUsername);
  const usernameDirty = cleanUsername !== savedUsername;
  const displayDirty = displayName.trim() !== savedDisplayName;

  async function saveUsername() {
    if (busy || !usernameDirty) return;
    if (!usernameValid) return toast.error("2–32 characters: lowercase letters, numbers, _ and . only.");
    setBusy("username");
    const res = await updateUsername(cleanUsername);
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    setUsername(res.data.username);
    setSavedUsername(res.data.username);
    toast.success("Username updated");
    router.refresh();
  }

  async function saveDisplayName() {
    if (busy || !displayDirty) return;
    setBusy("display");
    const res = await updateDisplayName(displayName);
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    setDisplayName(res.data.displayName);
    setSavedDisplayName(res.data.displayName);
    toast.success("Display name updated");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FieldCard
          title="Username"
          description={`Your handle on ${SITE}/${savedUsername}.`}
          label="Username"
          icon={<span className="text-[14px] leading-none">@</span>}
          value={username}
          onChange={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 32))}
          onSave={saveUsername}
          saveLabel="Save username"
          dirty={usernameDirty}
          busy={busy === "username"}
          hint={usernameDirty && !usernameValid ? "2–32 characters: a–z, 0–9, _ and ." : "Your old link stops working once you change it."}
          hintError={usernameDirty && !usernameValid}
          maxLength={32}
        />
        <FieldCard
          title="Display name"
          description="Shown on your profile. Leave empty to show your username instead."
          label="Display name"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
            </svg>
          }
          value={displayName}
          onChange={(v) => setDisplayName(v.slice(0, 32))}
          onSave={saveDisplayName}
          saveLabel="Save display name"
          dirty={displayDirty}
          busy={busy === "display"}
          hint={`${displayName.length}/32`}
          maxLength={32}
        />
      </div>

      <AliasPromo premium={initialAliases.premium} />
      <AliasesSection initial={initialAliases} />
    </div>
  );
}

function FieldCard({
  title,
  description,
  label,
  icon,
  value,
  onChange,
  onSave,
  saveLabel,
  dirty,
  busy,
  hint,
  hintError = false,
  maxLength,
}: {
  title: string;
  description: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  saveLabel: string;
  dirty: boolean;
  busy: boolean;
  hint?: string;
  hintError?: boolean;
  maxLength: number;
}) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col">
      <h2 className="text-[14px] font-normal text-white/90 tracking-tight">{title}</h2>
      <p className="text-[12px] text-white/40 mt-1">{description}</p>
      <label htmlFor={id} className="text-[12px] text-white/60 mt-5 mb-1.5">
        {label}
      </label>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
        className="flex items-stretch bg-[#161616] border border-white/5 rounded-xl overflow-hidden focus-within:border-[#5b6cf5]/40 transition-colors"
      >
        <span className="flex items-center pl-3.5 pr-2 text-[#5b6cf5]">{icon}</span>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 min-w-0 bg-transparent h-10 pr-3 text-[13px] text-white outline-none placeholder:text-white/25"
        />
        <button
          type="submit"
          disabled={!dirty || busy}
          className="shrink-0 px-4 text-[12.5px] border-l border-white/5 transition-colors cursor-pointer text-white bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 disabled:bg-transparent disabled:text-white/30 disabled:cursor-default"
        >
          {busy ? "Saving…" : saveLabel}
        </button>
      </form>
      {hint && <p className={`text-[11px] mt-1.5 ${hintError ? "text-red-400/80" : "text-white/30"}`}>{hint}</p>}
    </div>
  );
}

function AliasesSection({ initial }: { initial: AliasState }) {
  const [state, setState] = useState(initial);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "shortest" | "az">("newest");
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const used = state.aliases.length;
  const free = Math.max(0, state.slots - used);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const list = state.aliases.filter((a) => a.alias.includes(q));
    const sorted = [...list];
    if (sort === "newest") sorted.reverse();
    if (sort === "shortest") sorted.sort((a, b) => a.alias.length - b.alias.length || a.alias.localeCompare(b.alias));
    if (sort === "az") sorted.sort((a, b) => a.alias.localeCompare(b.alias));
    return sorted;
  }, [state.aliases, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const confirmAlias = state.aliases.find((a) => a.id === confirmId);

  async function handleDelete() {
    if (confirmId == null || deleting) return;
    setDeleting(true);
    const res = await deleteAlias(confirmId);
    setDeleting(false);
    setConfirmId(null);
    if (!res.ok) return toast.error(res.error);
    setState(res.data);
    toast.success("Alias deleted");
  }

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] shadow-sm p-6 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Aliases ({used})</h2>
            <span
              className="text-[11px] font-normal rounded-full px-2.5 py-0.5 border text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30"
              title="Aliases used / slots"
            >
              {used}/{state.slots}
            </span>
          </div>
          <p className="text-white/40 text-[12px] mt-1">
            Extra handles that redirect to your profile.{" "}
            {state.premium
              ? `Premium: every alias token gives 4 slots (${state.tokens} token${state.tokens === 1 ? "" : "s"}).`
              : "One alias token = one alias."}{" "}
            {free > 0 ? `${free} free slot${free === 1 ? "" : "s"}.` : "No free slots."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Link
            href="/checkout/alias-token"
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-normal border text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="17" cy="20" r="1.5" />
              <path d="M3 3h2l2.4 12.2a1 1 0 0 0 1 .8H17a1 1 0 0 0 1-.8L20 7H6" />
            </svg>
            Buy alias token
          </Link>
          <button
            type="button"
            onClick={() => (free > 0 ? setAdding(true) : toast.error("No free slot. Buy an alias token first."))}
            aria-disabled={free === 0}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-normal border transition-colors cursor-pointer text-white/60 bg-white/[0.03] border-white/10 hover:text-white/90 hover:bg-white/[0.06] ${free === 0 ? "opacity-50" : ""}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add alias
          </button>
        </div>
      </div>

      {used === 0 ? (
        <div className="w-full border border-dashed border-white/[0.08] rounded-2xl bg-[#141414]/30 py-10 px-6 flex flex-col items-center justify-center text-center">
          <p className="text-[13.5px] font-normal text-white/90 tracking-tight">No aliases yet</p>
          <p className="text-[11.5px] font-normal text-white/35 mt-1 max-w-xs leading-relaxed">
            {state.slots > 0
              ? `You have a free slot. Add an alias like ${SITE}/yourname to point at your profile.`
              : "Buy an alias token to grab an extra handle that redirects to your profile."}
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Search aliases</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search aliases…"
                className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] text-white outline-none placeholder:text-white/25 focus:border-[#5b6cf5]/40"
              />
            </label>
            <label className="relative">
              <span className="sr-only">Sort aliases</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="appearance-none bg-[#161616] border border-white/5 rounded-xl h-10 pl-3.5 pr-9 text-[13px] text-white cursor-pointer outline-none focus:border-[#5b6cf5]/40 w-full sm:w-auto"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="shortest">Shortest first</option>
                <option value="az">A → Z</option>
              </select>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </label>
          </div>

          <div className="border border-white/5 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1.4fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/5 text-[11px] uppercase tracking-wider text-white/35">
              <span>Alias</span>
              <span className="hidden md:block">Target</span>
              <span>Created</span>
              <span className="sr-only">Actions</span>
            </div>
            {rows.length === 0 ? (
              <p className="px-5 py-6 text-[12.5px] text-white/35 text-center">No aliases match “{query}”.</p>
            ) : (
              <ul>
                {rows.map((a) => (
                  <li key={a.id} className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1.4fr_1fr_1fr_auto] gap-4 items-center px-5 py-3 border-b border-white/5 last:border-b-0">
                    <a href={`/${a.alias}`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/90 truncate hover:text-white">
                      {SITE}/{a.alias}
                    </a>
                    <span className="hidden md:flex items-center gap-2 text-[12.5px] text-white/45">
                      Your profile
                      <span className="text-[10.5px] rounded-full px-2 py-0.5 text-[#c7cdfb] bg-[#5b6cf5]/15 border border-[#5b6cf5]/25">Redirect</span>
                    </span>
                    <span className="text-[12px] text-white/40 tabular-nums whitespace-nowrap">{formatDate(a.createdAt)}</span>
                    <button
                      type="button"
                      onClick={() => setConfirmId(a.id)}
                      aria-label={`Delete alias ${a.alias}`}
                      className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-white/5">
              <span className="text-[11.5px] text-white/35">
                {filtered.length === 0
                  ? "0 entries"
                  : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${(safePage - 1) * PAGE_SIZE + rows.length} of ${filtered.length}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage === 1}
                  className="h-8 px-3 rounded-lg text-[12px] text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
                >
                  Previous
                </button>
                <span className="min-w-8 h-8 px-2 rounded-lg bg-white/[0.04] text-[12px] text-white flex items-center justify-center tabular-nums">{safePage}</span>
                <button
                  type="button"
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage === pageCount}
                  className="h-8 px-3 rounded-lg text-[12px] text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {adding && (
          <AddAliasModal
            onClose={() => setAdding(false)}
            onAdded={(next) => {
              setState(next);
              setAdding(false);
            }}
          />
        )}
        {confirmAlias && (
          <ConfirmModal
            title="Delete this alias?"
            text={`${SITE}/${confirmAlias.alias} will stop redirecting and anyone can claim it. Your token stays, so you can add another alias.`}
            busy={deleting}
            onCancel={() => setConfirmId(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ModalShell({ onClose, labelledBy, children, role = "dialog" }: { onClose: () => void; labelledBy: string; children: React.ReactNode; role?: "dialog" | "alertdialog" }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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

function AddAliasModal({ onClose, onAdded }: { onClose: () => void; onAdded: (next: AliasState) => void }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const clean = value.toLowerCase().trim();
  const valid = HANDLE_RE.test(clean);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!valid) return toast.error("2–32 characters: lowercase letters, numbers, _ and . only.");
    setBusy(true);
    const res = await addAlias(clean);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(`${SITE}/${clean} now points to your profile`);
    onAdded(res.data);
  }

  return (
    <ModalShell onClose={onClose} labelledBy="add-alias-title">
      <h3 id="add-alias-title" className="text-[15px] font-normal text-white/90 tracking-tight">
        Add alias
      </h3>
      <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">Pick a handle. Visiting it will redirect to your profile. This uses one alias token.</p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        <label className="flex items-stretch bg-[#161616] border border-white/5 rounded-xl overflow-hidden focus-within:border-[#5b6cf5]/40 transition-colors">
          <span className="flex items-center pl-3.5 text-[13px] text-white/35 select-none">{SITE}/</span>
          <span className="sr-only">Alias</span>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 32))}
            placeholder="alias"
            maxLength={32}
            autoComplete="off"
            spellCheck={false}
            className="flex-1 min-w-0 bg-transparent h-10 pr-3.5 text-[13px] text-white outline-none placeholder:text-white/25"
          />
        </label>
        <p className={`text-[11px] -mt-1.5 ${clean && !valid ? "text-red-400/80" : "text-white/30"}`}>2–32 characters: a–z, 0–9, _ and .</p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-xl px-4 text-[13px] font-normal text-white/70 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !valid}
            className="h-9 rounded-xl px-4 text-[13px] font-normal text-white bg-[#5b6cf5]/20 border border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            {busy ? "Adding…" : "Add alias"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ConfirmModal({ title, text, busy, onCancel, onConfirm }: { title: string; text: string; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <ModalShell onClose={onCancel} labelledBy="alias-confirm-title" role="alertdialog">
      <h3 id="alias-confirm-title" className="text-[15px] font-normal text-white/90 tracking-tight">
        {title}
      </h3>
      <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">{text}</p>
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
          disabled={busy}
          className="h-9 rounded-xl px-4 text-[13px] font-normal text-red-300 bg-red-500/15 border border-red-500/25 hover:bg-red-500/25 transition-colors cursor-pointer disabled:opacity-50"
        >
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </ModalShell>
  );
}
