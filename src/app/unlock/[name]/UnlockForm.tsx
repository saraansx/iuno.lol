"use client";

import { useState, type FormEvent } from "react";

export default function UnlockForm({ name }: { name: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/image-host/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        setError(data?.error || "Couldn't unlock file");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Couldn't unlock file. Try again.");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm rounded-[20px] border border-white/5 bg-[#0c0c0c] p-6 shadow-sm"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#5b6cf5]/15 text-[#aab4ff]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </div>
      <h1 className="text-[14px] font-normal tracking-tight text-white/90">This file is password protected</h1>
      <p className="mt-1 text-[12px] text-white/40">Enter the password to view it.</p>

      <label htmlFor="file-password" className="sr-only">Password</label>
      <input
        id="file-password"
        type="password"
        autoFocus
        autoComplete="off"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "file-password-error" : undefined}
        className="mt-4 h-10 w-full rounded-xl border border-white/5 bg-[#161616] px-3.5 text-[13px] text-white placeholder:text-white/25 focus:border-[#5b6cf5]/40 focus:outline-none"
      />
      {error && (
        <p id="file-password-error" role="alert" className="mt-2 text-[12px] text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={!password || loading}
        className="mt-4 h-10 w-full rounded-xl bg-[#5b6cf5]/20 text-[13px] font-normal text-white transition-colors hover:bg-[#5b6cf5]/30 disabled:opacity-50"
      >
        {loading ? "Unlocking…" : "Unlock"}
      </button>
    </form>
  );
}
