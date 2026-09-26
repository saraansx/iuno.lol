"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { toast } from "@/components/ui/toast";
import { AuroraEffect } from "@/components/profile/layouts/background-effects/Aurora";
import { PREMIUM_PLAN } from "@/lib/payments/plans";

interface CheckoutClientProps {
  isAuthenticated?: boolean;
  email?: string | null;
}

// Tebex.js is loaded from their CDN on demand, only when the user checks out.
// It exposes window.Tebex with an embedded-checkout API.
interface TebexCheckout {
  init: (config: {
    ident: string;
    theme?: "light" | "dark" | "auto";
    colors?: { name: string; color: string }[];
    closeOnComplete?: boolean;
  }) => void;
  launch: () => void;
  on: (event: string, cb: () => void) => void;
}
interface TebexNamespace {
  checkout: TebexCheckout;
  events?: Record<string, string>;
}
declare global {
  interface Window {
    Tebex?: TebexNamespace;
  }
}

const TEBEX_SCRIPT = "https://js.tebex.io/v/1.js";

function loadTebex(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Tebex) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${TEBEX_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = TEBEX_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Everything unlocked with Premium — the full list shown on the left.
const PREMIUM_FEATURES = [
  "Everything in Free",
  "Premium badge on your profile",
  "5 backgrounds",
  "10 audio tracks",
  "10 widgets",
  "Every background effect unlocked",
  "Every username & description text effect",
  "Electric border & card effects",
  "Every entry transition & profile animation",
  "Every click effect, sound & cursor trail",
  "Custom browser tab: title, favicon & cursor",
  "Higher upload limits",
  "Save up to 10 of your own templates + access to Premium templates",
  "Priority support in Discord",
];

type BuyFor = "personal" | "gift" | "giftlink";

const BUY_OPTIONS: { id: BuyFor; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    id: "personal",
    label: "Personal",
    sub: "Unlock Premium on your own account",
    icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg>),
  },
  {
    id: "gift",
    label: "Gift",
    sub: "Send Premium to another user",
    icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" /><path d="M12 8S10 3 7.5 3 5 6 5 6s2 2 7 2Zm0 0s2-5 4.5-5S19 6 19 6s-2 2-7 2Z" /></svg>),
  },
  {
    id: "giftlink",
    label: "Gift Link",
    sub: "Generate a redeemable link",
    icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" /></svg>),
  },
];

export default function CheckoutClient({
  isAuthenticated = true,
}: CheckoutClientProps) {
  const router = useRouter();
  const [buyFor, setBuyFor] = useState<BuyFor>("personal");
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  // Tebex localizes the display currency for the customer at checkout; we bill
  // in USD, so the summary shows the USD plan.
  const plan = PREMIUM_PLAN.USD;
  const canBuy = buyFor === "personal";

  // Poll the server until the webhook has granted Premium, then celebrate. The
  // browser is never trusted to flip is_premium — this only *reads* the flag.
  const confirmPremium = async () => {
    setVerifying(true);
    for (let i = 0; i < 20; i++) {
      try {
        const res = await fetch("/api/checkout/tebex/status", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (data?.premium) {
          setVerifying(false);
          setSucceeded(true);
          return;
        }
      } catch {
        /* transient — keep polling */
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    // Payment landed but the webhook hasn't caught up yet. Reassure, don't alarm.
    setVerifying(false);
    toast.success("Payment received! Your Premium will activate in a moment.");
  };

  // If Tebex redirected back with ?tebex=success (fallback for the hosted flow),
  // confirm server-side and clean the URL.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tebex") === "success") {
      window.history.replaceState(null, "", "/checkout");
      // Defer out of the effect body so we don't call setState synchronously.
      const t = setTimeout(() => void confirmPremium(), 0);
      return () => clearTimeout(t);
    }
  }, []);

  const handleCheckout = async () => {
    if (paying) return;
    if (!canBuy) {
      toast.error("Gifting is coming soon. Choose Personal for now.");
      return;
    }
    setPaying(true);
    try {
      const res = await fetch("/api/checkout/tebex", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ident) {
        toast.error(data.error || "Could not start checkout. Please try again.");
        setPaying(false);
        return;
      }

      const ready = await loadTebex();
      if (!ready || !window.Tebex) {
        // Fall back to the hosted checkout page if the embed script won't load.
        if (data.url) {
          window.location.href = data.url as string;
          return;
        }
        toast.error("Couldn't load the payment window. Check your connection and try again.");
        setPaying(false);
        return;
      }

      const { checkout, events } = window.Tebex;
      checkout.init({
        ident: data.ident as string,
        theme: "dark",
        colors: [
          { name: "primary", color: "#5b6cf5" },
          { name: "secondary", color: "#5b6cf5" },
        ],
        closeOnComplete: true,
      });

      checkout.on(events?.PAYMENT_COMPLETE ?? "payment:complete", () => {
        setPaying(false);
        void confirmPremium();
      });
      checkout.on(events?.PAYMENT_ERROR ?? "payment:error", () => {
        setPaying(false);
        toast.error("Payment couldn't be completed. Please try again.");
      });
      checkout.on(events?.CLOSE ?? "close", () => {
        setPaying(false);
      });

      checkout.launch();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setPaying(false);
    }
  };

  // Soft aurora backdrop shared by both states.
  const Backdrop = (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-black" />
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          WebkitMaskImage: "radial-gradient(90% 70% at 50% 25%, #000 0%, rgba(0,0,0,0.55) 55%, transparent 85%)",
          maskImage: "radial-gradient(90% 70% at 50% 25%, #000 0%, rgba(0,0,0,0.55) 55%, transparent 85%)",
        }}
      >
        <AuroraEffect colors={["#5b6cf5", "#5b6cf5", "#5b6cf5"]} intensity={48} blend={0.7} />
      </div>
    </div>
  );

  // Payment just completed — confirm it before sending them to the dashboard.
  if (succeeded) {
    return (
      <main className="relative min-h-screen bg-black" style={{ fontFamily: "var(--font-comfortaa)" }}>
        <Navbar isAuthenticated={isAuthenticated} />
        {Backdrop}
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-5 pb-16 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-[20px] border border-white/[0.06] bg-[#0c0c0c]/70 p-7 backdrop-blur-xl"
          >
            <div className="flex items-center gap-4">
              {/* Static logo mark */}
              <Image src="/Favicon.png" alt="iuno.lol" width={512} height={512} className="h-9 w-9 shrink-0 object-contain" priority />
              <div>
                <h1 className="text-[19px] font-medium tracking-tight text-white">
                  You&apos;re <span className="text-[#5b6cf5]">Premium</span>
                </h1>
                <p className="mt-1 text-[12.5px] font-light leading-relaxed text-white/40">
                  Every Premium feature is now unlocked on your account, forever.
                </p>
              </div>
            </div>

            {/* Receipt row */}
            <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-5">
              <div>
                <p className="text-[12.5px] font-normal text-white/85">iuno.lol Premium</p>
                <p className="mt-0.5 text-[10.5px] font-light text-white/35">Lifetime access · paid</p>
              </div>
              <p className="text-sm font-medium text-white">{plan.symbol}{plan.display}</p>
            </div>

            <button
              onClick={() => { router.push("/dashboard"); router.refresh(); }}
              className="mt-5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#5b6cf5]/15 py-2.5 text-[13px] font-normal text-white transition-colors hover:bg-[#5b6cf5]/25"
            >
              Go to Dashboard
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-black" style={{ fontFamily: "var(--font-comfortaa)" }}>
      <Navbar isAuthenticated={isAuthenticated} />
      {Backdrop}

      {/* Verifying overlay — shown while we confirm the payment server-side so the
          user waits instead of refreshing and thinking it failed. */}
      <AnimatePresence>
        {verifying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black/80 px-6 text-center backdrop-blur-md"
          >
            <span className="h-11 w-11 animate-spin rounded-full border-2 border-white/15 border-t-[#5b6cf5]" />
            <div>
              <p className="text-[15px] font-normal text-white">Confirming your payment…</p>
              <p className="mt-1.5 text-[12.5px] font-light text-white/45">
                This only takes a moment. Please don&apos;t close or refresh this page.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-24 pt-28 lg:pt-36">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          {/* LEFT — what Premium unlocks */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <span className="text-[11px] font-normal uppercase tracking-[0.2em] text-[#5b6cf5]/80">
              Lifetime upgrade
            </span>
            <h1 className="mt-3 text-4xl font-medium tracking-tight text-white sm:text-5xl">
              iuno.lol <span className="text-[#5b6cf5]">Premium</span>
            </h1>
            <p className="mt-3 max-w-md text-[14px] font-light leading-relaxed text-white/45">
              A single, one-time payment unlocks every Premium feature on your account. No renewals, no surprises — yours forever.
            </p>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-3xl font-medium text-white">{plan.symbol}{plan.display}</span>
              <span className="text-[13px] font-light text-white/40">one-time</span>
            </div>

            <div className="my-7 h-px w-full bg-white/[0.06]" />

            <p className="mb-4 text-[11px] font-normal uppercase tracking-[0.18em] text-white/35">What&apos;s included</p>
            <ul className="flex flex-col gap-2.5">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-[13px] font-light text-white/60">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* RIGHT — order summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
            className="rounded-[20px] border border-white/[0.06] bg-[#0c0c0c]/70 p-6 backdrop-blur-xl lg:sticky lg:top-28"
          >
            <p className="text-[11px] font-normal uppercase tracking-[0.18em] text-white/35">Order summary</p>

            {/* Buy for */}
            <p className="mt-6 mb-2.5 text-[12px] font-light text-white/45">Buy for</p>
            <div className="grid grid-cols-3 gap-1.5">
              {BUY_OPTIONS.map((opt) => {
                const selected = buyFor === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBuyFor(opt.id)}
                    aria-pressed={selected}
                    title={opt.sub}
                    className={`flex flex-col items-center gap-1.5 rounded-xl py-3 transition-colors cursor-pointer ${selected ? "bg-[#5b6cf5]/15 text-white" : "bg-white/[0.03] text-white/45 hover:text-white/70"}`}
                  >
                    <span className={selected ? "text-[#5b6cf5]" : "text-white/40"}>{opt.icon}</span>
                    <span className="text-[11.5px] font-light">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {buyFor !== "personal" && (
              <p className="mt-2 text-[11px] font-light text-[#a5aef9]/70">Gifting is coming soon — pick Personal to buy now.</p>
            )}

            <div className="my-6 h-px w-full bg-white/[0.06]" />

            {/* Total */}
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] font-light text-white/45">Total</span>
              <span className="text-xl font-medium text-white">{plan.symbol}{plan.display}</span>
            </div>

            {!canBuy ? (
              <button
                disabled
                className="mt-5 w-full cursor-not-allowed rounded-xl bg-[#5b6cf5] py-3 text-sm font-normal text-white opacity-50"
              >
                Gifting coming soon
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={paying}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5b6cf5]/20 py-3 text-sm font-normal text-white shadow-[0_0_15px_rgba(91,108,245,0.1)] transition-all hover:bg-[#5b6cf5]/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                {paying ? "Loading…" : <>Checkout - {plan.symbol}{plan.display}</>}
              </button>
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-light text-white/30">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Secure payment, encrypted end-to-end · Tebex
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
