"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { toast } from "@/components/ui/toast";
import { AuroraEffect } from "@/components/profile/layouts/background-effects/Aurora";
import { PREMIUM_PLAN, CURRENCIES, type Currency } from "@/lib/payments/plans";

interface CheckoutClientProps {
  isAuthenticated?: boolean;
  email?: string | null;
}

// Razorpay Checkout is loaded from their CDN on demand, only when the user pays.
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string; method?: string };
  theme?: { color?: string };
  handler?: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
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
  email = null,
}: CheckoutClientProps) {
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>("USD");
  const [buyFor, setBuyFor] = useState<BuyFor>("personal");
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const plan = PREMIUM_PLAN[currency];
  const canBuy = buyFor === "personal";

  const [payOpen, setPayOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // "Razorpay" (Razorpay Checkout) is the default method; "card" routes to Polar.
  const [payMethod, setPayMethod] = useState<"razorpay" | "card">("razorpay");
  const [cardLoading, setCardLoading] = useState(false);

  // "Card" is charged through Polar's hosted checkout. We ask our server to
  // create a checkout session, then hand the browser off to Polar's secure page;
  // Premium is granted server-side by the Polar webhook once payment lands.
  const startPolarCheckout = async () => {
    if (cardLoading) return;
    setCardLoading(true);
    try {
      const res = await fetch("/api/checkout/polar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        toast.error(data?.error ?? "Could not start card checkout. Please try again.");
        setCardLoading(false);
        return;
      }
      window.location.href = data.url as string;
    } catch {
      toast.error("Could not start card checkout. Please try again.");
      setCardLoading(false);
    }
  };

  // When Polar redirects back with ?polar=success, the webhook has (or shortly
  // will have) granted Premium. Confirm the good news and clean the URL.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("polar") === "success") {
      setSucceeded(true);
      window.history.replaceState(null, "", "/checkout");
    }
  }, []);

  // Close the payment popup whenever the purchase completes or gifting (not yet
  // wired) is selected.
  useEffect(() => {
    if (!canBuy || succeeded) setPayOpen(false);
  }, [canBuy, succeeded]);

  const handlePay = async () => {
    if (paying) return;
    // Gifting isn't wired up server-side yet — only the personal purchase is live.
    if (buyFor !== "personal") {
      toast.error("Gifting is coming soon. Choose Personal for now.");
      return;
    }
    setPaying(true);
    try {
      const orderRes = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency }),
      });
      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        toast.error(orderData.error || "Could not start checkout.");
        setPaying(false);
        return;
      }
      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        toast.error("Couldn't load the payment window. Check your connection and try again.");
        setPaying(false);
        return;
      }
      const rzp = new window.Razorpay({
        key: orderData.keyId,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "iuno.lol",
        description: "Premium — lifetime access",
        prefill: { email: email || undefined },
        theme: { color: "#5b6cf5" },
        handler: async (response) => {
          setVerifying(true);
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json().catch(() => ({}));
            if (verifyRes.ok && verifyData.success) {
              setPaying(false);
              setVerifying(false);
              setSucceeded(true);
            } else {
              setVerifying(false);
              toast.error(verifyData.error || "We couldn't confirm your payment. If you were charged, contact support.");
              setPaying(false);
            }
          } catch {
            setVerifying(false);
            toast.error("We couldn't confirm your payment. If you were charged, contact support.");
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setPaying(false);
      });
      rzp.open();
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

            {/* Currency */}
            <p className="mt-6 mb-2.5 text-[12px] font-light text-white/45">Currency</p>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/[0.03] p-1">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  aria-pressed={currency === c}
                  className={`relative rounded-lg py-1.5 text-[12.5px] font-light transition-colors cursor-pointer ${currency === c ? "text-white" : "text-white/45 hover:text-white/70"}`}
                >
                  {currency === c && (
                    <motion.div
                      layoutId="checkout-currency-bubble"
                      className="absolute inset-0 z-0 rounded-lg bg-[#5b6cf5]/15"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{PREMIUM_PLAN[c].label}</span>
                </button>
              ))}
            </div>

            <div className="my-6 h-px w-full bg-white/[0.06]" />

            {/* Total */}
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] font-light text-white/45">Total</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${currency}-${plan.display}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="text-xl font-medium text-white"
                >
                  {plan.symbol}{plan.display}
                </motion.span>
              </AnimatePresence>
            </div>

            {!canBuy ? (
              <button
                disabled
                className="mt-5 w-full cursor-not-allowed rounded-xl bg-[#5b6cf5] py-3 text-sm font-normal text-white opacity-50"
              >
                Gifting coming soon
              </button>
            ) : (
              <div className="mt-5">
                <button
                  onClick={() => setPayOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5b6cf5]/20 py-3 text-sm font-normal text-white shadow-[0_0_15px_rgba(91,108,245,0.1)] transition-all hover:bg-[#5b6cf5]/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  Checkout - {plan.symbol}{plan.display}
                </button>

                {/* Centered payment popup with blurred backdrop — portaled to body
                    so `fixed` centers on the viewport, not the transformed card. */}
                {mounted && createPortal(
                  <AnimatePresence>
                    {payOpen && (
                    <motion.div
                      className="fixed inset-0 z-50 flex items-center justify-center p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        onClick={() => setPayOpen(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                      />
                      <motion.div
                        className="relative z-10 w-full max-w-sm rounded-[20px] border border-white/5 bg-[#0c0c0c] p-6 shadow-2xl"
                        initial={{ opacity: 0, scale: 0.94, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 12 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                      >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[14px] font-normal tracking-tight text-white/90">Complete your payment</p>
                      <button
                        onClick={() => setPayOpen(false)}
                        aria-label="Close"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="mb-4 flex items-center justify-between text-[13px]">
                      <span className="font-light text-white/50">Total</span>
                      <span className="font-medium text-white">{plan.symbol}{plan.display}</span>
                    </div>
                    {/* Payment method selector — Razorpay or Card (Polar). */}
                    <div className="mb-4 grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPayMethod("razorpay")}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-3.5 transition-all ${
                          payMethod !== "card"
                            ? "border-[#5b6cf5]/40 bg-[#5b6cf5]/10 text-white"
                            : "border-white/5 bg-[#161616] text-white/50 hover:bg-white/[0.06]"
                        }`}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
                        <span className="text-[12px] font-normal">Razorpay</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayMethod("card")}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-3.5 transition-all ${
                          payMethod === "card"
                            ? "border-[#5b6cf5]/40 bg-[#5b6cf5]/10 text-white"
                            : "border-white/5 bg-[#161616] text-white/50 hover:bg-white/[0.06]"
                        }`}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
                        <span className="text-[12px] font-normal">Card</span>
                      </button>
                    </div>

                    {payMethod === "card" ? (
                      /* Card → Polar hosted checkout (USD or INR product). */
                      <button
                        type="button"
                        onClick={startPolarCheckout}
                        disabled={cardLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5b6cf5]/20 py-3 text-sm font-normal text-white shadow-[0_0_15px_rgba(91,108,245,0.1)] transition-all hover:bg-[#5b6cf5]/30 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {cardLoading ? "Redirecting…" : `Pay with Card - ${plan.symbol}${plan.display}`}
                      </button>
                    ) : (
                      /* Razorpay — opens Razorpay Checkout over the popup. */
                      <button
                        type="button"
                        onClick={handlePay}
                        disabled={paying}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5b6cf5]/20 py-3 text-sm font-normal text-white shadow-[0_0_15px_rgba(91,108,245,0.1)] transition-all hover:bg-[#5b6cf5]/30 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {paying ? "Processing…" : `Pay with Razorpay - ${plan.symbol}${plan.display}`}
                      </button>
                    )}
                      </motion.div>
                    </motion.div>
                  )}
                  </AnimatePresence>,
                  document.body
                )}
              </div>
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-light text-white/30">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Secure payment, encrypted end-to-end · Razorpay
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
