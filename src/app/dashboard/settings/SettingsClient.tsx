"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { addAlias, beginAddPasskey, confirmNewEmailOtp, disconnectDiscord, finishAddPasskey, removePasskey, confirmTwoFactorSetup, disableTwoFactor, sendNewEmailOtp, startTwoFactorSetup, deleteAlias, editAlias, verifyCurrentEmailOtp, verifyPasswordAndSendCurrentOtp, setUsernameLoginEnabled, swapAliasWithUsername, updateDisplayName, updatePassword, updateUsername, type AliasState, type PasskeyRow } from "@/actions/account";
import { browserSupportsWebAuthn, startRegistration } from "@simplewebauthn/browser";
import { toast } from "@/components/ui/toast";
import AliasPromo from "@/components/dashboard/AliasPromo";
import FilterSelect from "@/components/ui/filter-select";
import SaveBar from "@/components/dashboard/SaveBar";

const TABS = [
  { id: "general", label: "General" },
  { id: "security", label: "Security" },
] as const;

export type SecurityInfo = { email: string | null; emailVerified: boolean; hasPassword: boolean; twoFactor: boolean; usernameLoginEnabled: boolean; passkeys: PasskeyRow[] };
const PAGE_SIZE = 10;
const HANDLE_RE = /^[a-z0-9_.]{2,32}$/;
const SITE = "iuno.lol";

type AliasSort = "newest" | "oldest" | "shortest" | "az";
const SORT_OPTIONS: { id: AliasSort; label: string }[] = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "shortest", label: "Shortest first" },
  { id: "az", label: "A → Z" },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export type DiscordConnection = { connected: boolean; username: string | null };

export default function SettingsClient({
  initialUsername,
  initialDisplayName,
  initialAliases,
  security,
  discord,
}: {
  initialUsername: string;
  initialDisplayName: string;
  initialAliases: AliasState;
  security: SecurityInfo;
  discord: DiscordConnection;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("general");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-normal text-white tracking-tight">Account settings</h1>
        <p className="text-white/40 text-[13px] mt-0.5">Manage your general account settings, aliases and security.</p>
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

      {tab === "general" ? (
        <GeneralTab initialUsername={initialUsername} initialDisplayName={initialDisplayName} initialAliases={initialAliases} discord={discord} />
      ) : (
        <SecurityTabWithSave info={security} />
      )}
    </div>
  );
}

function GeneralTab({
  initialUsername,
  initialDisplayName,
  initialAliases,
  discord,
}: {
  initialUsername: string;
  initialDisplayName: string;
  initialAliases: AliasState;
  discord: DiscordConnection;
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

  const hasChanges = usernameDirty || displayDirty;
  const revertAll = () => {
    setUsername(savedUsername);
    setDisplayName(savedDisplayName);
  };
  async function saveAll() {
    if (busy) return;
    if (usernameDirty) {
      if (!usernameValid) { toast.error("2–32 characters: lowercase letters, numbers, _ and . only."); return; }
      setBusy("username");
      const res = await updateUsername(cleanUsername);
      setBusy(null);
      if (!res.ok) { toast.error(res.error); return; }
      setUsername(res.data.username);
      setSavedUsername(res.data.username);
      toast.success("Username updated");
      router.refresh();
    }
    if (displayDirty) {
      setBusy("display");
      const res = await updateDisplayName(displayName);
      setBusy(null);
      if (!res.ok) { toast.error(res.error); return; }
      setDisplayName(res.data.displayName);
      setSavedDisplayName(res.data.displayName);
      toast.success("Display name updated");
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FieldCard
            title="Username"
            description={`Your handle on ${SITE}/${savedUsername}.`}
            label="Username"
            icon={<span className="text-[14px] leading-none">@</span>}
            value={username}
            onChange={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 32))}
            onSave={saveAll}
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
            onSave={saveAll}
            saveLabel="Save display name"
            dirty={displayDirty}
            busy={busy === "display"}
            hint={`${displayName.length}/32`}
            maxLength={32}
          />
        </div>

        <ConnectionsCard initial={discord} savedUsername={savedUsername} />

        <AliasPromo premium={initialAliases.premium} />
        <AliasesSection
          initial={initialAliases}
          onUsernameChange={(u) => {
            setUsername(u);
            setSavedUsername(u);
            router.refresh();
          }}
        />
      </div>
      <SaveBar show={hasChanges} onSave={saveAll} onRevert={revertAll} />
    </>
  );
}

function ConnectionsCard({ initial, savedUsername }: { initial: DiscordConnection; savedUsername: string }) {
  const [connected, setConnected] = useState(initial.connected);
  const [username, setUsername] = useState(initial.username);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  async function handleDisconnect() {
    if (busy) return;
    setBusy(true);
    const res = await disconnectDiscord();
    setBusy(false);
    setConfirmOpen(false);
    if (!res.ok) return toast.error(res.error);
    setConnected(false);
    setUsername(null);
    toast.success("Discord disconnected");
    router.refresh();
  }

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] overflow-hidden shadow-sm flex flex-col">
      {}
      <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
        <span className="text-[12px] font-normal text-white/50 tracking-tight truncate">@{savedUsername}</span>
        <span className="text-[10px] tracking-[0.14em] uppercase text-white/25 shrink-0 ml-3">Connections</span>
      </div>

      <div className="p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Connections</h2>
          <p className="text-[12px] text-white/40 mt-1">Link external accounts to your profile.</p>
        </div>

        <div className="flex items-center gap-3 bg-[#161616] border border-white/5 rounded-xl px-3.5 py-3">
          <span className="w-8 h-8 rounded-xl bg-[#5b6cf5]/15 border border-[#5b6cf5]/20 flex items-center justify-center text-[#5b6cf5] shrink-0" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 9.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 18.159a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 2.98.078.078 0 0 0 .084-.027 14.09 14.09 0 0 0 1.226-1.963.076.076 0 0 0-.041-.104 13.2 13.2 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.291a.074.074 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.102.245.198.372.292a.075.075 0 0 1-.006.125 12.3 12.3 0 0 1-1.873.877.077.077 0 0 0-.041.105c.36.687.772 1.348 1.225 1.962a.077.077 0 0 0 .083.028 19.84 19.84 0 0 0 6.002-2.981.078.078 0 0 0 .031-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.183 0-2.157-1.068-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.947 2.38-2.157 2.38Zm7.974 0c-1.183 0-2.157-1.068-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.947 2.38-2.157 2.38Z" />
            </svg>
          </span>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[13px] text-white/90 leading-none">Discord</span>
            <span className="text-[11.5px] truncate mt-1">
              {connected ? (
                <span className="text-white/50 truncate">{username ? `@${username}` : "Connected"}</span>
              ) : (
                <span className="text-white/30">Not connected</span>
              )}
            </span>
          </div>
          {connected ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={busy}
              className="shrink-0 h-9 rounded-xl px-4 text-[12.5px] font-normal text-white/70 bg-white/[0.06] border border-white/10 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={() => (window.location.href = "/api/auth/discord")}
              className="shrink-0 h-9 rounded-xl px-4 text-[12.5px] font-normal text-white bg-[#5b6cf5]/20 border border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30 transition-colors cursor-pointer"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {confirmOpen && (
          <ConfirmModal
            title="Disconnect Discord?"
            text="Your Discord account will be unlinked. You can reconnect anytime."
            confirmLabel="Disconnect"
            busyLabel="Disconnecting…"
            busy={busy}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={handleDisconnect}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SecurityTabWithSave({ info }: { info: SecurityInfo }) {
  const [usernameLoginEnabled, setUsernameLoginEnabledState] = useState(info.usernameLoginEnabled);
  const [savedUsernameLoginEnabled, setSavedUsernameLoginEnabled] = useState(info.usernameLoginEnabled);
  const hasChanges = usernameLoginEnabled !== savedUsernameLoginEnabled;
  const revertAll = () => setUsernameLoginEnabledState(savedUsernameLoginEnabled);
  async function saveAll() {
    if (!hasChanges) return;
    const res = await setUsernameLoginEnabled(usernameLoginEnabled);
    if (!res.ok) { toast.error(res.error); return; }
    setSavedUsernameLoginEnabled(res.data.enabled);
    setUsernameLoginEnabledState(res.data.enabled);
    toast.success(res.data.enabled ? "Username login enabled" : "Username login disabled");
  }
  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <SecurityTab info={info} />
        <PasswordCard hasPassword={info.hasPassword} />
        <TwoFactorCard enabled={info.twoFactor} />
        <PasskeysCard initial={info.passkeys} />
        <UsernameLoginCard controlledEnabled={usernameLoginEnabled} onToggle={setUsernameLoginEnabledState} />
      </div>
      <SaveBar show={hasChanges} onSave={saveAll} onRevert={revertAll} />
    </>
  );
}

function SecurityTab({ info }: { info: SecurityInfo }) {
  const [email, setEmail] = useState(info.email);
  const [verified, setVerified] = useState(info.emailVerified);
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col">
      <div className="flex items-center gap-2">
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Email</h2>
        {email && (
          <span
            className={`text-[10.5px] rounded-full px-2 py-0.5 border ${
              verified ? "text-[#c7cdfb] bg-[#5b6cf5]/15 border-[#5b6cf5]/25" : "text-white/40 bg-white/[0.03] border-white/10"
            }`}
          >
            {verified ? "Verified" : "Not verified"}
          </span>
        )}
      </div>
      <p className="text-[12px] text-white/40 mt-1">Used for login and account notifications.</p>
      <span className="text-[12px] text-white/60 mt-5 mb-1.5">Email</span>
      <div className="flex items-stretch bg-[#161616] border border-white/5 rounded-xl overflow-hidden">
        <span className="flex items-center pl-3.5 pr-2.5 text-[#5b6cf5]" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 6L2 7" />
          </svg>
        </span>
        <span className={`flex-1 min-w-0 flex items-center h-10 pr-3 text-[13px] truncate ${email ? "text-white" : "text-white/30"}`}>
          {email ?? "No email on this account"}
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 px-4 text-[12.5px] border-l border-white/5 transition-colors text-white bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 cursor-pointer"
        >
          {email ? "Request email change" : "Add email"}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <ChangeEmailModal
            current={email}
            onClose={() => setOpen(false)}
            onDone={(next) => {
              setEmail(next);
              setVerified(true);
              setOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PasskeysCard({ initial }: { initial: PasskeyRow[] }) {
  const [rows, setRows] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const confirmRow = rows.find((r) => r.id === confirmId);

  async function handleDelete() {
    if (confirmId == null || deleting) return;
    setDeleting(true);
    const res = await removePasskey(confirmId);
    setDeleting(false);
    setConfirmId(null);
    if (!res.ok) return toast.error(res.error);
    setRows(res.data);
    toast.success("Passkey removed");
  }

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Passkeys</h2>
          <p className="text-[12px] text-white/40 mt-1">Sign in faster with your device&apos;s fingerprint, face or PIN. No password needed.</p>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="shrink-0 flex items-center gap-1.5 h-9 rounded-xl px-4 text-[13px] font-normal border transition-colors text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30 cursor-pointer"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add passkey
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 border border-dashed border-white/[0.08] rounded-xl bg-[#141414]/30 py-6 px-4 text-center">
          <p className="text-[12.5px] text-white/45">No passkeys yet. Add one to sign in with your device.</p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 bg-[#161616] border border-white/5 rounded-xl px-3.5 py-2.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5b6cf5] shrink-0" aria-hidden="true">
                <circle cx="9" cy="8" r="4" />
                <path d="M2 21v-1a6 6 0 0 1 9-5.2" />
                <circle cx="18" cy="14" r="2.5" />
                <path d="M18 16.5V22M18 19.5h2" />
              </svg>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] text-white/90 truncate">{r.name}</span>
                <span className="text-[11px] text-white/35 truncate">
                  Added {formatDate(r.createdAt)}
                  {r.lastUsedAt ? ` · Last used ${formatDate(r.lastUsedAt)}` : ""}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmId(r.id)}
                aria-label={`Remove passkey ${r.name}`}
                className="shrink-0 w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {adding && (
          <AddPasskeyModal
            onClose={() => setAdding(false)}
            onDone={(next) => {
              setRows(next);
              setAdding(false);
            }}
          />
        )}
        {confirmRow && (
          <ConfirmModal
            title="Remove this passkey?"
            text={`"${confirmRow.name}" won't be able to sign in to your account anymore. Also delete it from your device or password manager.`}
            confirmLabel="Remove"
            busyLabel="Removing…"
            busy={deleting}
            onCancel={() => setConfirmId(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddPasskeyModal({ onClose, onDone }: { onClose: () => void; onDone: (rows: PasskeyRow[]) => void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!browserSupportsWebAuthn()) return toast.error("This browser doesn't support passkeys.");
    setBusy(true);
    try {
      const begin = await beginAddPasskey();
      if (!begin.ok) return toast.error(begin.error);
      let response;
      try {
        response = await startRegistration({ optionsJSON: begin.data });
      } catch (err) {
        const n = err instanceof Error ? err.name : "";
        return toast.error(
          n === "InvalidStateError" ? "This device already has a passkey for your account." : n === "NotAllowedError" ? "Passkey setup was cancelled." : "Couldn't create a passkey on this device.",
        );
      }
      const done = await finishAddPasskey(response, name.trim() || "Passkey");
      if (!done.ok) return toast.error(done.error);
      toast.success("Passkey added");
      onDone(done.data);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell onClose={onClose} labelledBy="passkey-add-title">
      <h3 id="passkey-add-title" className="text-[15px] font-normal text-white/90 tracking-tight">
        Add passkey
      </h3>
      <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">
        Give it a name so you can tell your devices apart. Your browser will then ask for your fingerprint, face or PIN.
      </p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-white/60">Name</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 64))}
            placeholder="e.g. MacBook, iPhone, Windows Hello"
            maxLength={64}
            className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white outline-none placeholder:text-white/25 focus:border-[#5b6cf5]/40 transition-colors"
          />
        </label>
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
            disabled={busy}
            className="h-9 rounded-xl px-4 text-[13px] font-normal text-white bg-[#5b6cf5]/20 border border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            {busy ? "Waiting for device…" : "Continue"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function TwoFactorCard({ enabled: initialEnabled }: { enabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [modal, setModal] = useState<"setup" | "disable" | null>(null);

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Authenticator app</h2>
            <span
              className={`text-[10.5px] rounded-full px-2 py-0.5 border ${
                enabled ? "text-[#c7cdfb] bg-[#5b6cf5]/15 border-[#5b6cf5]/25" : "text-white/40 bg-white/[0.03] border-white/10"
              }`}
            >
              {enabled ? "On" : "Off"}
            </span>
          </div>
          <p className="text-[12px] text-white/40 mt-1">
            {enabled
              ? "Signing in asks for a code from your authenticator app after your password, email code or Discord."
              : "Add an extra step to sign-in: a 6-digit code from Google Authenticator, Authy, 1Password or similar."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal(enabled ? "disable" : "setup")}
          className={`shrink-0 h-9 rounded-xl px-4 text-[13px] font-normal border transition-colors cursor-pointer ${
            enabled ? "text-red-300 bg-red-500/10 border-red-500/20 hover:bg-red-500/20" : "text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30"
          }`}
        >
          {enabled ? "Turn off" : "Set up authenticator app"}
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3 bg-[#161616] border border-white/5 rounded-xl px-3.5 h-10">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5b6cf5] shrink-0" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        </svg>
        <span className="text-[13px] text-white/85">{enabled ? "Two-factor authentication is on" : "Two-factor authentication is off"}</span>
      </div>

      <AnimatePresence>
        {modal === "setup" && (
          <TwoFactorSetupModal
            onClose={() => setModal(null)}
            onDone={() => {
              setEnabled(true);
              setModal(null);
            }}
          />
        )}
        {modal === "disable" && (
          <TwoFactorDisableModal
            onClose={() => setModal(null)}
            onDone={() => {
              setEnabled(false);
              setModal(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CodeInput({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  return (
    <input
      id={id}
      autoFocus
      inputMode="numeric"
      autoComplete="one-time-code"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      placeholder="123456"
      className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white outline-none placeholder:text-white/25 focus:border-[#5b6cf5]/40 transition-colors tracking-[0.4em] text-center"
    />
  );
}

function TwoFactorSetupModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [data, setData] = useState<{ qr: string; secret: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    startTwoFactorSetup().then((res) => {
      if (cancelled) return;
      if (res.ok) setData(res.data);
      else setLoadError(res.error);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || code.length !== 6) return;
    setBusy(true);
    const res = await confirmTwoFactorSetup(code);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Authenticator app is on");
    onDone();
  }

  async function copySecret() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy. Select the key manually.");
    }
  }

  return (
    <ModalShell onClose={onClose} labelledBy="totp-setup-title">
      <h3 id="totp-setup-title" className="text-[15px] font-normal text-white/90 tracking-tight">
        Set up authenticator app
      </h3>
      <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">
        Scan the QR code with your authenticator app, then enter the 6-digit code it shows.
      </p>

      {loadError ? (
        <p className="mt-5 text-[12.5px] text-red-400/80">{loadError}</p>
      ) : !data ? (
        <div className="mt-5 h-[220px] flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/10 border-t-[#5b6cf5] rounded-full animate-spin" aria-label="Loading" />
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.qr} alt="QR code for your authenticator app" width={180} height={180} className="rounded-xl bg-white p-2" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-white/60">Can&apos;t scan? Enter this key</span>
            <div className="flex items-stretch bg-[#161616] border border-white/5 rounded-xl overflow-hidden">
              <code className="flex-1 min-w-0 flex items-center px-3.5 h-10 text-[12px] text-white/85 tracking-wider truncate">
                {data.secret.match(/.{1,4}/g)?.join(" ")}
              </code>
              <button
                type="button"
                onClick={copySecret}
                className="shrink-0 px-3.5 text-[12px] border-l border-white/5 text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <label htmlFor="totp-setup-code" className="flex flex-col gap-1.5">
            <span className="text-[12px] text-white/60">Code from the app</span>
            <CodeInput id="totp-setup-code" value={code} onChange={setCode} />
          </label>
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
              disabled={busy || code.length !== 6}
              className="h-9 rounded-xl px-4 text-[13px] font-normal text-white bg-[#5b6cf5]/20 border border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
            >
              {busy ? "Checking…" : "Turn on"}
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

function TwoFactorDisableModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || code.length !== 6) return;
    setBusy(true);
    const res = await disableTwoFactor(code);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Authenticator app turned off");
    onDone();
  }

  return (
    <ModalShell onClose={onClose} labelledBy="totp-disable-title" role="alertdialog">
      <h3 id="totp-disable-title" className="text-[15px] font-normal text-white/90 tracking-tight">
        Turn off authenticator app?
      </h3>
      <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">
        Your account will be less secure. Enter a current code from the app to confirm.
      </p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        <label htmlFor="totp-disable-code" className="flex flex-col gap-1.5">
          <span className="text-[12px] text-white/60">Code from the app</span>
          <CodeInput id="totp-disable-code" value={code} onChange={setCode} />
        </label>
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
            disabled={busy || code.length !== 6}
            className="h-9 rounded-xl px-4 text-[13px] font-normal text-red-300 bg-red-500/15 border border-red-500/25 hover:bg-red-500/25 transition-colors cursor-pointer disabled:opacity-50"
          >
            {busy ? "Checking…" : "Turn off"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function UsernameLoginCard({ controlledEnabled, onToggle }: { controlledEnabled: boolean; onToggle: (v: boolean) => void }) {
  const enabled = controlledEnabled;

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Username login</h2>
            <span className={`text-[10.5px] rounded-full px-2 py-0.5 border ${enabled ? "text-[#c7cdfb] bg-[#5b6cf5]/15 border-[#5b6cf5]/25" : "text-white/40 bg-white/[0.03] border-white/10"}`}>
              {enabled ? "On" : "Off"}
            </span>
          </div>
          <p className="text-[12px] text-white/40 mt-1">Allow signing in with your username instead of only email. Email login always works.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Username login"
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors cursor-pointer ${enabled ? "bg-[#5b6cf5] border-[#5b6cf5]" : "bg-white/[0.08] border-white/10"}`}
        >
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>
      <div className="mt-4 flex items-center gap-2 bg-[#161616] border border-white/5 rounded-xl px-3.5 h-10">
        <span className="text-[12px] text-white/60">Status:</span>
        <span className={`text-[12.5px] ${enabled ? "text-white/90" : "text-white/40"}`}>{enabled ? "You can sign in with username or email" : "Username login is off — use email to sign in"}</span>
      </div>
    </div>
  );
}

function PasswordCard({ hasPassword: initialHasPassword }: { hasPassword: boolean }) {
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const rules = [
    { label: "8+ characters", ok: next.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(next) },
    { label: "Number", ok: /[0-9]/.test(next) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(next) },
  ];
  const strong = rules.every((r) => r.ok);
  const mismatch = confirm.length > 0 && confirm !== next;
  const canSubmit = !busy && strong && confirm === next && (!hasPassword || current.length > 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    const res = await updatePassword(current, next);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(hasPassword ? "Password updated. Other devices were signed out." : "Password set. You can now sign in with it.");
    setHasPassword(true);
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col">
      <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Password</h2>
      <p className="text-[12px] text-white/40 mt-1">
        {hasPassword
          ? "Use a strong password you don't use anywhere else. Updating it signs out your other devices."
          : "Your account doesn't have a password yet. Set one to sign in with email and password."}
      </p>
      <form onSubmit={submit} className="flex flex-col">
        {hasPassword && (
          <PasswordField id="pw-current" label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" />
        )}
        <PasswordField id="pw-new" label="New password" value={next} onChange={setNext} autoComplete="new-password" describedBy="pw-rules" />
        <ul id="pw-rules" className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {rules.map((r) => (
            <li key={r.label} className={`flex items-center gap-1.5 text-[11.5px] ${r.ok ? "text-[#a5aef9]" : "text-white/30"}`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {r.ok ? <path d="M20 6 9 17l-5-5" /> : <circle cx="12" cy="12" r="4" />}
              </svg>
              {r.label}
              <span className="sr-only">{r.ok ? "(met)" : "(not met)"}</span>
            </li>
          ))}
        </ul>
        <PasswordField
          id="pw-confirm"
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          action={
            <button
              type="submit"
              disabled={!canSubmit}
              className="shrink-0 px-4 text-[12.5px] border-l border-white/5 transition-colors cursor-pointer text-white bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 disabled:bg-transparent disabled:text-white/30 disabled:cursor-default"
            >
              {busy ? "Saving…" : hasPassword ? "Update password" : "Set password"}
            </button>
          }
        />
        {mismatch && <p className="text-[11px] mt-1.5 text-red-400/80">Passwords don&apos;t match.</p>}
      </form>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  describedBy,
  action,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  describedBy?: string;
  action?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <>
      <label htmlFor={id} className="text-[12px] text-white/60 mt-5 mb-1.5">
        {label}
      </label>
      <div className="flex items-stretch bg-[#161616] border border-white/5 rounded-xl overflow-hidden focus-within:border-[#5b6cf5]/40 transition-colors">
        <span className="flex items-center pl-3.5 pr-2.5 text-[#5b6cf5]" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </span>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          maxLength={128}
          aria-describedby={describedBy}
          placeholder="••••••••"
          className="flex-1 min-w-0 bg-transparent h-10 pr-3 text-[13px] text-white outline-none placeholder:text-white/25"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={show}
          className="shrink-0 w-11 flex items-center justify-center border-l border-white/5 text-white/45 hover:text-white transition-colors cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {show ? (
              <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
            ) : (
              <>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
        {action}
      </div>
    </>
  );
}

function ChangeEmailModal({ current, onClose, onDone }: { current: string | null; onClose: () => void; onDone: (email: string) => void }) {
  type Step = "password" | "current_code" | "new_email" | "new_code";
  const [step, setStep] = useState<Step>(current ? "password" : "new_email");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [currentCode, setCurrentCode] = useState("");
  const [value, setValue] = useState("");
  const [newCode, setNewCode] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [busy, setBusy] = useState(false);
  const clean = value.toLowerCase().trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) && clean.length <= 254;

  async function submitPassword(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;
    if (current && password.length === 0) return toast.error("Enter your current password.");
    setBusy(true);
    const res = await verifyPasswordAndSendCurrentOtp(password);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(`Code sent to ${current}`);
    setStep("current_code");
  }

  async function submitCurrentCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy || currentCode.length !== 6) return;
    setBusy(true);
    const res = await verifyCurrentEmailOtp(currentCode);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Current email verified");
    setStep("new_email");
  }

  async function resendCurrentCode() {
    if (busy) return;
    setBusy(true);
    const res = await verifyPasswordAndSendCurrentOtp(password);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(`Code resent to ${current}`);
  }

  async function sendNew(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy || !validEmail) return;
    setBusy(true);
    const res = await sendNewEmailOtp(clean);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setSentTo(res.data.email);
    setStep("new_code");
    toast.success(`Code sent to ${res.data.email}`);
  }

  async function confirmNew(e: React.FormEvent) {
    e.preventDefault();
    if (busy || newCode.length !== 6) return;
    setBusy(true);
    const res = await confirmNewEmailOtp(newCode);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Email updated");
    onDone(res.data.email);
  }

  const inputCls =
    "w-full bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white outline-none placeholder:text-white/25 focus:border-[#5b6cf5]/40 transition-colors";
  const primaryCls =
    "h-9 rounded-xl px-4 text-[13px] font-normal text-white bg-[#5b6cf5]/20 border border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default";
  const secondaryCls =
    "h-9 rounded-xl px-4 text-[13px] font-normal text-white/70 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] transition-colors cursor-pointer disabled:opacity-50";

  return (
    <ModalShell onClose={onClose} labelledBy="change-email-title">
      <h3 id="change-email-title" className="text-[15px] font-normal text-white/90 tracking-tight">
        {current ? "Change email" : "Add email"}
      </h3>

      {step === "password" && (
        <>
          <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">
            First, confirm your current password. We&apos;ll then send a code to <span className="text-white/70">{current}</span>.
          </p>
          <form onSubmit={submitPassword} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] text-white/60">Current password</span>
              <div className="flex items-stretch bg-[#161616] border border-white/5 rounded-xl overflow-hidden focus-within:border-[#5b6cf5]/40">
                <input
                  autoFocus
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  maxLength={128}
                  className="flex-1 min-w-0 bg-transparent h-10 px-3.5 text-[13px] text-white outline-none placeholder:text-white/25"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="shrink-0 w-10 flex items-center justify-center text-white/40 hover:text-white border-l border-white/5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={showPw ? "M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" : "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"} /><circle cx="12" cy="12" r={showPw ? "0" : "3"} /></svg>
                </button>
              </div>
            </label>
            <p className="text-[11px] text-white/30">You need to enter your current password.</p>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={onClose} className={secondaryCls}>Cancel</button>
              <button type="submit" disabled={busy} className={primaryCls}>{busy ? "Sending…" : "Continue"}</button>
            </div>
          </form>
        </>
      )}

      {step === "current_code" && (
        <>
          <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">Enter the code we sent to <span className="text-white/70">{current}</span>. Expires in 5 minutes.</p>
          <form onSubmit={submitCurrentCode} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] text-white/60">Code from current email</span>
              <input autoFocus inputMode="numeric" autoComplete="one-time-code" value={currentCode} onChange={(e) => setCurrentCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" className={`${inputCls} tracking-[0.4em] text-center`} />
            </label>
            <div className="flex items-center justify-between gap-2">
              <button type="button" onClick={() => setStep("password")} className="text-[12px] text-white/45 hover:text-white/80 cursor-pointer">Back</button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={resendCurrentCode} disabled={busy} className={secondaryCls}>Resend</button>
                <button type="submit" disabled={busy || currentCode.length !== 6} className={primaryCls}>{busy ? "Checking…" : "Verify"}</button>
              </div>
            </div>
          </form>
        </>
      )}

      {step === "new_email" && (
        <>
          <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">
            {current ? <><span className="text-emerald-300/80">Current email verified.</span> Now enter your new email. We&apos;ll send a code there. </> : <>We&apos;ll send a 6-digit code to your new email to confirm it.</>}
            {current ? <>Currently <span className="text-white/50">{current}</span>.</> : null}
          </p>
          <form onSubmit={sendNew} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] text-white/60">New email</span>
              <input autoFocus type="email" value={value} onChange={(e) => setValue(e.target.value)} placeholder="you@example.com" autoComplete="email" maxLength={254} className={inputCls} />
            </label>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={onClose} className={secondaryCls}>Cancel</button>
              <button type="submit" disabled={busy || !validEmail} className={primaryCls}>{busy ? "Sending…" : "Send code"}</button>
            </div>
          </form>
        </>
      )}

      {step === "new_code" && (
        <>
          <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">Enter the code we sent to <span className="text-white/70">{sentTo}</span>. It expires in 5 minutes.</p>
          <form onSubmit={confirmNew} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] text-white/60">Verification code</span>
              <input autoFocus inputMode="numeric" autoComplete="one-time-code" value={newCode} onChange={(e) => setNewCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" className={`${inputCls} tracking-[0.4em] text-center`} />
            </label>
            <div className="flex items-center justify-between gap-2">
              <button type="button" onClick={() => { setStep("new_email"); setNewCode(""); }} className="text-[12px] text-white/45 hover:text-white/80 cursor-pointer">Use a different email</button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => sendNew()} disabled={busy} className={secondaryCls}>Resend</button>
                <button type="submit" disabled={busy || newCode.length !== 6} className={primaryCls}>{busy ? "Checking…" : "Confirm"}</button>
              </div>
            </div>
          </form>
        </>
      )}
    </ModalShell>
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

function AliasesSection({ initial, onUsernameChange }: { initial: AliasState; onUsernameChange: (username: string) => void }) {
  const [state, setState] = useState(initial);
  const [editing, setEditing] = useState<{ id: number; alias: string } | null>(null);
  const [swapId, setSwapId] = useState<number | null>(null);
  const [swapping, setSwapping] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<AliasSort>("newest");
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
  const swapAlias = state.aliases.find((a) => a.id === swapId);

  async function handleSwap() {
    if (swapId == null || swapping) return;
    setSwapping(true);
    const res = await swapAliasWithUsername(swapId);
    setSwapping(false);
    setSwapId(null);
    if (!res.ok) return toast.error(res.error);
    const { username, ...next } = res.data;
    setState(next);
    onUsernameChange(username);
    toast.success(`Your username is now @${username}`);
  }

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
              ? "Premium: every alias token you buy adds 4 slots (1 + 3 bonus)."
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
            <FilterSelect
              label="Sort aliases"
              value={sort}
              options={SORT_OPTIONS}
              onChange={setSort}
              icon={<path d="M3 6h18M6 12h12M10 18h4" />}
            />
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
                    <AliasMenu
                      alias={a.alias}
                      onEdit={() => setEditing({ id: a.id, alias: a.alias })}
                      onSwap={() => setSwapId(a.id)}
                      onDelete={() => setConfirmId(a.id)}
                    />
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
          <AliasFormModal
            title="Add alias"
            description="Pick a handle. Visiting it will redirect to your profile. This uses one alias slot."
            submitLabel="Add alias"
            busyLabel="Adding…"
            onClose={() => setAdding(false)}
            onSubmit={addAlias}
            onDone={(next, alias) => {
              setState(next);
              setAdding(false);
              toast.success(`${SITE}/${alias} now points to your profile`);
            }}
          />
        )}
        {editing && (
          <AliasFormModal
            title="Edit alias"
            description="Change this alias. The old handle stops working and is free for anyone to claim."
            submitLabel="Save alias"
            busyLabel="Saving…"
            initialValue={editing.alias}
            onClose={() => setEditing(null)}
            onSubmit={(value) => editAlias(editing.id, value)}
            onDone={(next, alias) => {
              setState(next);
              setEditing(null);
              toast.success(`Alias changed to ${SITE}/${alias}`);
            }}
          />
        )}
        {swapAlias && (
          <ConfirmModal
            title="Swap with username?"
            text={`@${swapAlias.alias} becomes your username, and your current username becomes this alias. Both links keep working.`}
            confirmLabel="Swap"
            busyLabel="Swapping…"
            tone="accent"
            busy={swapping}
            onCancel={() => setSwapId(null)}
            onConfirm={handleSwap}
          />
        )}
        {confirmAlias && (
          <ConfirmModal
            title="Remove this alias?"
            text={`${SITE}/${confirmAlias.alias} will stop redirecting and anyone can claim it. Your token stays, so you can add another alias.`}
            confirmLabel="Remove"
            busyLabel="Removing…"
            busy={deleting}
            onCancel={() => setConfirmId(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AliasMenu({ alias, onEdit, onSwap, onDelete }: { alias: string; onEdit: () => void; onSwap: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number; up: boolean } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const url = `https://${SITE}/${alias}`;
  const MENU_HEIGHT = 210;

  function toggle() {
    if (open) return setOpen(false);
    const r = buttonRef.current?.getBoundingClientRect();
    if (!r) return;
    const up = window.innerHeight - r.bottom < MENU_HEIGHT + 12;
    setPos({ top: up ? r.top - 6 : r.bottom + 6, right: window.innerWidth - r.right, up });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !buttonRef.current?.contains(t)) setOpen(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function copy() {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link.");
    }
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${alias}`}
        className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
          open ? "bg-white/[0.08] border-white/10 text-white" : "bg-white/[0.03] border-white/5 text-white/45 hover:text-white hover:bg-white/[0.06]"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>
      {typeof document !== "undefined" &&
        createPortal(
      <AnimatePresence>
        {open && pos && (
          <motion.div
            ref={menuRef}
            role="menu"
            initial={{ opacity: 0, y: pos.up ? 4 : -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: pos.up ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            style={{ position: "fixed", right: pos.right, ...(pos.up ? { bottom: window.innerHeight - pos.top } : { top: pos.top }) }}
            className={`z-[120] w-52 bg-[#121212] border border-white/10 rounded-xl p-1 shadow-2xl shadow-black/60 ${pos.up ? "origin-bottom-right" : "origin-top-right"}`}
          >
            <MenuItem
              label="Edit"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              icon={<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />}
            />
            <MenuItem
              label="Swap with username"
              onClick={() => {
                setOpen(false);
                onSwap();
              }}
              icon={<path d="M7 16V4M3 8l4-4 4 4M17 8v12M21 16l-4 4-4-4" />}
            />
            <MenuItem
              label="Copy link"
              onClick={copy}
              icon={
                <>
                  <rect x="9" y="9" width="12" height="12" rx="2" />
                  <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
                </>
              }
            />
            <MenuItem
              label="Open link"
              href={`/${alias}`}
              onClick={() => setOpen(false)}
              icon={<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />}
            />
            <div className="my-1 h-px bg-white/5" aria-hidden="true" />
            <MenuItem
              label="Remove"
              danger
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              icon={<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />}
            />
          </motion.div>
        )}
      </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

function MenuItem({
  label,
  icon,
  onClick,
  href,
  danger = false,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  href?: string;
  danger?: boolean;
}) {
  const cls = `w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] text-left transition-colors cursor-pointer ${
    danger ? "text-red-300/90 hover:bg-red-500/10 hover:text-red-300" : "text-white/75 hover:bg-white/[0.06] hover:text-white"
  }`;
  const svg = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
      {icon}
    </svg>
  );
  return href ? (
    <a role="menuitem" href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls}>
      {svg}
      {label}
    </a>
  ) : (
    <button role="menuitem" type="button" onClick={onClick} className={cls}>
      {svg}
      {label}
    </button>
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

function AliasFormModal({
  title,
  description,
  submitLabel,
  busyLabel,
  initialValue = "",
  onClose,
  onSubmit,
  onDone,
}: {
  title: string;
  description: string;
  submitLabel: string;
  busyLabel: string;
  initialValue?: string;
  onClose: () => void;
  onSubmit: (value: string) => Promise<{ ok: true; data: AliasState } | { ok: false; error: string }>;
  onDone: (next: AliasState, alias: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const clean = value.toLowerCase().trim();
  const valid = HANDLE_RE.test(clean);
  const unchanged = initialValue !== "" && clean === initialValue;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || unchanged) return;
    if (!valid) return toast.error("2–32 characters: lowercase letters, numbers, _ and . only.");
    setBusy(true);
    const res = await onSubmit(clean);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    onDone(res.data, clean);
  }

  return (
    <ModalShell onClose={onClose} labelledBy="alias-form-title">
      <h3 id="alias-form-title" className="text-[15px] font-normal text-white/90 tracking-tight">
        {title}
      </h3>
      <p className="text-[12.5px] text-white/40 mt-1.5 leading-relaxed">{description}</p>
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
            disabled={busy || !valid || unchanged}
            className="h-9 rounded-xl px-4 text-[13px] font-normal text-white bg-[#5b6cf5]/20 border border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            {busy ? busyLabel : submitLabel}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ConfirmModal({
  title,
  text,
  busy,
  onCancel,
  onConfirm,
  confirmLabel = "Delete",
  busyLabel = "Deleting…",
  tone = "danger",
}: {
  title: string;
  text: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  busyLabel?: string;
  tone?: "danger" | "accent";
}) {
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
          className={`h-9 rounded-xl px-4 text-[13px] font-normal border transition-colors cursor-pointer disabled:opacity-50 ${
            tone === "danger"
              ? "text-red-300 bg-red-500/15 border-red-500/25 hover:bg-red-500/25"
              : "text-white bg-[#5b6cf5]/20 border-[#5b6cf5]/30 hover:bg-[#5b6cf5]/30"
          }`}
        >
          {busy ? busyLabel : confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}
