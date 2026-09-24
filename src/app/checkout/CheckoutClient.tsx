"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { toast } from "@/components/ui/toast";
import { AuroraEffect } from "@/components/profile/layouts/background-effects/Aurora";
import { PREMIUM_PLAN, PROVIDER, CURRENCIES, type Currency } from "@/lib/payments/plans";

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

// PayPal JS SDK (USD). Only the button-rendering surface we actually use is typed.
interface PaypalButtonsConfig {
  style?: Record<string, string | number>;
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void> | void;
  onError?: (err: unknown) => void;
  onCancel?: () => void;
}
interface PaypalButtonsInstance {
  render: (container: HTMLElement) => Promise<void>;
  close: () => void;
}
interface PaypalNamespace {
  Buttons: (config: PaypalButtonsConfig) => PaypalButtonsInstance;
}
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
    paypal?: PaypalNamespace;
  }
}

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

// PayPal JS SDK loader. The SDK is keyed by the client id in its URL, so once
// window.paypal exists we reuse it.
function loadPaypal(clientId: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.paypal) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>("script[data-paypal-sdk]");
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=buttons`;
    script.dataset.paypalSdk = "true";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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
  const [succeeded, setSucceeded] = useState(false);

  const plan = PREMIUM_PLAN[currency];
  const provider = PROVIDER[currency];
  const canBuy = buyFor === "personal";

  // USD is paid with PayPal Smart Buttons. Render them when USD + personal is the
  // active selection; tear them down when the user switches away.
  const paypalRef = useRef<HTMLDivElement>(null);
  const [paypalState, setPaypalState] = useState<"idle" | "loading" | "ready" | "unconfigured" | "error">("idle");

  useEffect(() => {
    // Only relevant for the USD/PayPal + personal path; otherwise the buttons
    // aren't rendered and the state is ignored, so there's nothing to reset.
    if (provider !== "paypal" || !canBuy || succeeded) {
      return;
    }
    let cancelled = false;
    let buttons: PaypalButtonsInstance | null = null;
    (async () => {
      setPaypalState("loading");
      const cfgRes = await fetch("/api/checkout/paypal/config").catch(() => null);
      const cfg = cfgRes && cfgRes.ok ? await cfgRes.json().catch(() => null) : null;
      if (!cfg?.configured || !cfg.clientId) {
        if (!cancelled) setPaypalState("unconfigured");
        return;
      }
      const ok = await loadPaypal(cfg.clientId);
      const container = paypalRef.current;
      if (cancelled) return;
      if (!ok || !window.paypal || !container) {
        setPaypalState("error");
        return;
      }
      container.innerHTML = "";
      buttons = window.paypal.Buttons({
        style: { layout: "vertical", color: "blue", shape: "rect", label: "pay", height: 46 },
        createOrder: async () => {
          const res = await fetch("/api/checkout/paypal/order", { method: "POST" });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.orderId) {
            toast.error(data.error || "Could not start PayPal checkout.");
            throw new Error("paypal order failed");
          }
          return data.orderId as string;
        },
        onApprove: async (data) => {
          const res = await fetch("/api/checkout/paypal/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderID }),
          });
          const verifyData = await res.json().catch(() => ({}));
          if (res.ok && verifyData.success) {
            setSucceeded(true);
          } else {
            toast.error(verifyData.error || "We couldn't confirm your payment. If you were charged, contact support.");
          }
        },
        onError: () => toast.error("PayPal ran into a problem. Please try again."),
      });
      try {
        await buttons.render(container);
        if (!cancelled) setPaypalState("ready");
      } catch {
        if (!cancelled) setPaypalState("error");
      }
    })();
    return () => {
      cancelled = true;
      try { buttons?.close(); } catch { /* button already gone */ }
    };
  }, [provider, canBuy, succeeded]);

  const handlePay = async () => {
    if (paying) return;
    // Only INR is charged here (Razorpay). USD goes through the PayPal buttons.
    if (provider !== "razorpay") return;
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
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json().catch(() => ({}));
            if (verifyRes.ok && verifyData.success) {
              setPaying(false);
              setSucceeded(true);
            } else {
              toast.error(verifyData.error || "We couldn't confirm your payment. If you were charged, contact support.");
              setPaying(false);
            }
          } catch {
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
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 pb-16 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-[20px] border border-white/5 bg-[#0c0c0c]/80 p-8 text-center shadow-sm backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.1, duration: 0.6 }}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5b6cf5]/15 text-[#5b6cf5] shadow-[0_0_25px_rgba(91,108,245,0.15)]"
            >
              <motion.svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <motion.path d="M20 6 9 17l-5-5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.4, ease: "easeOut" }} />
              </motion.svg>
            </motion.div>
            <h1 className="text-xl font-medium tracking-tight text-white">You&apos;re Premium</h1>
            <p className="mt-2 text-[13px] font-light leading-relaxed text-white/40">
              Payment successful — lifetime access to everything is now unlocked. Thank you for supporting iuno.
            </p>
            <div className="mt-6 flex items-center justify-between rounded-xl border border-white/5 bg-[#161616] px-4 py-3 text-left">
              <div>
                <p className="text-[13px] font-normal text-white/90">Premium</p>
                <p className="text-[11px] font-light text-white/40">Lifetime access</p>
              </div>
              <p className="text-[15px] font-medium text-white">{plan.symbol}{plan.display}</p>
            </div>
            <button
              onClick={() => { router.push("/dashboard"); router.refresh(); }}
              className="mt-6 w-full cursor-pointer rounded-xl bg-[#5b6cf5]/20 py-2.5 text-sm font-normal text-white shadow-[0_0_15px_rgba(91,108,245,0.1)] transition-all hover:bg-[#5b6cf5]/30"
            >
              Go to Dashboard
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

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-24 pt-28 lg:pt-36">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          {/* LEFT — what Premium unlocks */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5b6cf5]/30 bg-[#5b6cf5]/10 px-3 py-1 text-[11.5px] font-normal text-[#a5aef9]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#5b6cf5" aria-hidden="true"><path d="M12 2l2.9 6.9L22 9.6l-5.3 4.7L18.2 22 12 18.3 5.8 22l1.5-7.7L2 9.6l7.1-.7L12 2z" /></svg>
              Lifetime upgrade
            </span>
            <h1 className="mt-5 text-4xl font-medium tracking-tight text-white sm:text-5xl">
              iuno.lol <span className="text-[#5b6cf5]">Premium</span>
            </h1>
            <p className="mt-3 max-w-md text-[14px] font-light leading-relaxed text-white/45">
              A single, one-time payment unlocks every Premium feature on your account. No renewals, no surprises — yours forever.
            </p>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-3xl font-medium text-white">{plan.symbol}{plan.display}</span>
              <span className="text-[13px] font-light text-white/40">one-time</span>
            </div>

            <div className="my-7 h-px w-full bg-white/5" />

            <p className="mb-4 text-[11px] font-normal uppercase tracking-[0.18em] text-white/35">What&apos;s included</p>
            <ul className="flex flex-col gap-3">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[13px] font-light text-white/70">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#5b6cf5]/15 text-[#5b6cf5]">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </span>
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
            className="rounded-[20px] border border-white/5 bg-[#0c0c0c]/80 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:sticky lg:top-28"
          >
            <p className="text-[11px] font-normal uppercase tracking-[0.18em] text-white/35">Order summary</p>

            {/* Buy for */}
            <p className="mt-5 mb-2 text-[13px] font-normal text-white/90">Buy for</p>
            <div className="grid grid-cols-2 gap-2">
              {BUY_OPTIONS.map((opt) => {
                const selected = buyFor === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBuyFor(opt.id)}
                    aria-pressed={selected}
                    title={opt.sub}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all cursor-pointer ${opt.id === "giftlink" ? "col-span-2" : ""} ${selected ? "border-[#5b6cf5]/50 bg-[#5b6cf5]/10 text-white" : "border-white/5 bg-[#161616] text-white/70 hover:border-white/10"}`}
                  >
                    <span className={selected ? "text-[#5b6cf5]" : "text-white/50"}>{opt.icon}</span>
                    <span className="text-[13px] font-normal">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {buyFor !== "personal" && (
              <p className="mt-2 text-[11.5px] font-light text-[#a5aef9]/70">Gifting is coming soon — pick Personal to buy now.</p>
            )}

            {/* Currency */}
            <p className="mt-5 mb-2 text-[13px] font-normal text-white/90">Currency</p>
            <div className="grid grid-cols-2 gap-1 rounded-full border border-[#5b6cf5]/10 bg-[#5b6cf5]/[0.03] p-1">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  aria-pressed={currency === c}
                  className={`relative rounded-full py-2 text-[13px] font-light transition-colors cursor-pointer ${currency === c ? "text-white" : "text-white/60 hover:text-white"}`}
                >
                  {currency === c && (
                    <motion.div
                      layoutId="checkout-currency-bubble"
                      className="absolute inset-0 z-0 rounded-full bg-[#5b6cf5]/20 shadow-[0_0_15px_rgba(91,108,245,0.1)]"
                      transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{PREMIUM_PLAN[c].label}</span>
                </button>
              ))}
            </div>

            <div className="my-5 h-px w-full bg-white/5" />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-light text-white/50">Total</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${currency}-${plan.display}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="text-2xl font-medium text-white"
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
            ) : provider === "paypal" ? (
              <div className="mt-5">
                {paypalState === "unconfigured" ? (
                  <p className="rounded-xl border border-white/5 bg-[#161616] p-3.5 text-[12.5px] font-light leading-relaxed text-white/50">
                    PayPal isn&apos;t set up yet. Add your PayPal keys to enable USD payments, or switch to INR.
                  </p>
                ) : paypalState === "error" ? (
                  <p className="rounded-xl border border-white/5 bg-[#161616] p-3.5 text-[12.5px] font-light leading-relaxed text-white/50">
                    Couldn&apos;t load PayPal. Check your connection and try again, or switch to INR.
                  </p>
                ) : (
                  <>
                    {paypalState === "loading" && (
                      <p className="mb-2 text-center text-[12.5px] font-light text-white/40">Loading PayPal…</p>
                    )}
                    <div ref={paypalRef} className="[color-scheme:none]" />
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handlePay}
                disabled={paying}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5b6cf5] py-3 text-sm font-normal text-white shadow-[0_0_20px_rgba(91,108,245,0.25)] transition-all hover:bg-[#5b6cf5]/85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paying ? "Processing…" : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    Buy now — {plan.symbol}{plan.display}
                  </>
                )}
              </button>
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-light text-white/30">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Secure payment, encrypted end-to-end · {provider === "paypal" ? "PayPal" : "Razorpay"}
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
