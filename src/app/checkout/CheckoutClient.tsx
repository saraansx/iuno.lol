"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { toast } from "@/components/ui/toast";
import { PREMIUM_PLAN, PAYMENT_METHODS, CURRENCIES, PROVIDER, type Currency } from "@/lib/payments/plans";

interface CheckoutClientProps {
  isAuthenticated?: boolean;
  isPremium?: boolean;
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
  close: () => Promise<void>;
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

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const METHOD_META: Record<string, { label: string; sub: string; icon: React.ReactNode }> = {
  upi: {
    label: "UPI",
    sub: "GPay, PhonePe, Paytm & more",
    icon: (<svg {...iconProps}><rect x="5" y="2" width="14" height="20" rx="2.5" /><path d="M12 18h.01" /></svg>),
  },
  card: {
    label: "Card",
    sub: "Credit or debit card",
    icon: (<svg {...iconProps}><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /></svg>),
  },
  netbanking: {
    label: "Net Banking",
    sub: "All major banks",
    icon: (<svg {...iconProps}><path d="M3 21h18" /><path d="M5 21V9.5L12 5l7 4.5V21" /><path d="M9.5 21v-5h5v5" /></svg>),
  },
  paypal: {
    label: "PayPal",
    sub: "Pay with your PayPal account",
    icon: (<svg {...iconProps}><path d="M19 7V5a1 1 0 0 0-1-1H6a2 2 0 0 0 0 4h13a1 1 0 0 1 1 1v3h-3a2 2 0 0 0 0 4h3v1a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6" /></svg>),
  },
};

export default function CheckoutClient({
  isAuthenticated = true,
  isPremium = false,
  email = null,
}: CheckoutClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [method, setMethod] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const [paypalState, setPaypalState] = useState<
    "idle" | "loading" | "ready" | "error" | "unconfigured"
  >("idle");

  const plan = PREMIUM_PLAN[currency];
  const methods = PAYMENT_METHODS[currency];

  const selectCurrency = (c: Currency) => {
    setCurrency(c);
    setMethod(null); // available methods differ per currency
  };

  const handlePay = async () => {
    if (!method || paying) return;
    setPaying(true);
    try {
      const orderRes = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency, method }),
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
        prefill: { email: email || undefined, method: method === "paypal" ? undefined : method },
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

  // USD is paid via PayPal Smart Buttons. Render them when the user reaches the
  // payment step with USD selected; tear them down when they leave.
  useEffect(() => {
    if (step !== 2 || PROVIDER[currency] !== "paypal") return;
    let cancelled = false;
    let buttons: PaypalButtonsInstance | null = null;
    (async () => {
      setPaypalState("loading");
      const cfgRes = await fetch("/api/checkout/paypal/config").catch(() => null);
      const cfg = cfgRes && cfgRes.ok ? await cfgRes.json().catch(() => null) : null;
      if (cancelled) return;
      if (!cfg?.configured || !cfg.clientId) {
        setPaypalState("unconfigured");
        return;
      }
      const ok = await loadPaypal(cfg.clientId);
      if (cancelled) return;
      const container = paypalRef.current;
      if (!ok || !window.paypal || !container) {
        setPaypalState("error");
        return;
      }
      container.innerHTML = "";
      buttons = window.paypal.Buttons({
        style: { color: "blue", shape: "rect", label: "pay", height: 44 },
        createOrder: async () => {
          const res = await fetch("/api/checkout/paypal/order", { method: "POST" });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
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
          const result = await res.json().catch(() => ({}));
          if (res.ok && result.success) {
            setSucceeded(true);
          } else {
            toast.error(result.error || "We couldn't confirm your payment. If you were charged, contact support.");
          }
        },
        onError: () => {
          toast.error("PayPal ran into a problem. Please try again.");
        },
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
      if (buttons) buttons.close().catch(() => {});
    };
  }, [step, currency, router]);

  // Already upgraded — nothing to buy.
  if (isPremium) {
    return (
      <main className="relative min-h-screen bg-black" style={{ fontFamily: "var(--font-comfortaa)" }}>
        <Navbar isAuthenticated={isAuthenticated} />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 pb-16 pt-28">
          <div className="rounded-[20px] border border-white/5 bg-[#0c0c0c] p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5b6cf5]/15 text-[#5b6cf5]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <h1 className="text-xl font-medium tracking-tight text-white">You already have Premium</h1>
            <p className="mt-2 text-[13px] font-light leading-relaxed text-white/40">Lifetime access to everything is unlocked. Thanks for supporting iuno.</p>
            <button onClick={() => router.push("/dashboard")} className="mt-6 w-full cursor-pointer rounded-xl bg-[#5b6cf5]/20 py-2.5 text-sm font-normal text-white shadow-[0_0_15px_rgba(91,108,245,0.1)] transition-all hover:bg-[#5b6cf5]/30">Go to Dashboard</button>
          </div>
        </div>
      </main>
    );
  }

  // Payment just completed — confirm it before sending them to the dashboard.
  if (succeeded) {
    return (
      <main className="relative min-h-screen bg-black" style={{ fontFamily: "var(--font-comfortaa)" }}>
        <Navbar isAuthenticated={isAuthenticated} />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0"
          style={{ background: "radial-gradient(60% 40% at 50% 30%, rgba(91,108,245,0.16) 0%, transparent 70%)" }}
        />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 pb-16 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-[20px] border border-white/5 bg-[#0c0c0c] p-8 text-center shadow-sm"
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

      {/* soft indigo glow behind the card */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(60% 40% at 50% 30%, rgba(91,108,245,0.16) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 pb-16 pt-28">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5b6cf5]/15 text-[#5b6cf5]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" /></svg>
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-white">Upgrade to Premium</h1>
          <p className="mt-1 text-[13px] font-light text-white/40">Unlock everything, forever — one payment.</p>
        </div>

        <div className="rounded-[20px] border border-white/5 bg-[#0c0c0c] p-6 shadow-sm">
          {/* order summary */}
          <div className="flex items-center justify-between border-b border-white/5 pb-5">
            <div>
              <p className="text-[14px] font-normal tracking-tight text-white/90">Premium</p>
              <p className="text-[12px] font-light text-white/40">Lifetime access</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-medium text-white">{plan.symbol}{plan.display}</p>
              <p className="text-[11px] font-light text-white/40">one-time</p>
            </div>
          </div>

          {/* step indicator */}
          <div className="flex items-center gap-3 py-5 text-[11px] font-light">
            <span className={`flex items-center gap-1.5 ${step >= 1 ? "text-white/80" : "text-white/30"}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step >= 1 ? "bg-[#5b6cf5] text-white" : "bg-white/10 text-white/40"}`}>1</span>
              Currency
            </span>
            <span className="h-px flex-1 bg-white/10" />
            <span className={`flex items-center gap-1.5 ${step >= 2 ? "text-white/80" : "text-white/30"}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step >= 2 ? "bg-[#5b6cf5] text-white" : "bg-white/10 text-white/40"}`}>2</span>
              Payment
            </span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <p className="mb-2 text-[12.5px] font-light text-white/50">Choose your currency</p>
                <div className="grid grid-cols-2 gap-1 rounded-full border border-[#5b6cf5]/10 bg-[#5b6cf5]/3 p-1">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => selectCurrency(c)}
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
                <button
                  onClick={() => setStep(2)}
                  className="mt-6 w-full cursor-pointer rounded-xl bg-[#5b6cf5]/20 py-2.5 text-sm font-normal text-white shadow-[0_0_15px_rgba(91,108,245,0.1)] transition-all hover:bg-[#5b6cf5]/30"
                >
                  Continue
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
              >
                {PROVIDER[currency] === "paypal" ? (
                  <>
                    <p className="mb-3 text-[12.5px] font-light text-white/50">Pay securely with PayPal</p>
                    {paypalState === "unconfigured" ? (
                      <p className="rounded-xl border border-white/5 bg-[#161616] p-4 text-[12.5px] font-light leading-relaxed text-white/50">
                        PayPal isn&apos;t set up yet. Add your PayPal keys to enable USD payments.
                      </p>
                    ) : paypalState === "error" ? (
                      <p className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-[12.5px] font-light leading-relaxed text-red-300/80">
                        Couldn&apos;t load PayPal. This is usually an ad blocker or VPN — turn it off for this site and try again.
                      </p>
                    ) : (
                      <div className="min-h-[52px]">
                        {paypalState === "loading" && (
                          <p className="text-[12.5px] font-light text-white/40">Loading PayPal…</p>
                        )}
                        <div ref={paypalRef} />
                      </div>
                    )}
                    <button
                      onClick={() => setStep(1)}
                      className="mt-4 w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-normal text-white/70 transition-all hover:text-white"
                    >
                      Back
                    </button>
                  </>
                ) : (
                  <>
                <p className="mb-2 text-[12.5px] font-light text-white/50">Select a payment method</p>
                <div className="flex flex-col gap-2">
                  {methods.map((m) => {
                    const meta = METHOD_META[m];
                    const selected = method === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        aria-pressed={selected}
                        className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${selected ? "border-[#5b6cf5]/50 bg-[#5b6cf5]/10" : "border-white/5 bg-[#161616] hover:border-white/10"}`}
                      >
                        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-white/70">
                          {meta.icon}
                        </span>
                        <span className="flex-1">
                          <span className="block text-[13px] font-normal text-white/90">{meta.label}</span>
                          <span className="block text-[11.5px] font-light text-white/40">{meta.sub}</span>
                        </span>
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${selected ? "border-[#5b6cf5]" : "border-white/20"}`}>
                          {selected && <span className="h-2 w-2 rounded-full bg-[#5b6cf5]" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => setStep(1)}
                    className="cursor-pointer rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-normal text-white/70 transition-all hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePay}
                    disabled={!method || paying}
                    className="flex-1 cursor-pointer rounded-xl bg-[#5b6cf5]/20 py-2.5 text-sm font-normal text-white shadow-[0_0_15px_rgba(91,108,245,0.1)] transition-all hover:bg-[#5b6cf5]/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {paying ? "Processing…" : `Pay ${plan.symbol}${plan.display}`}
                  </button>
                </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-light text-white/30">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          Payments secured by {PROVIDER[currency] === "paypal" ? "PayPal" : "Razorpay"}
        </p>
      </div>
    </main>
  );
}
