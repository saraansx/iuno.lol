"use client";

import Navbar from "@/components/Navbar";
import { FREE_FEATURES, PREMIUM_FEATURES } from "@/lib/plan-features";
import { useRouter } from "next/navigation";
import { MorphingText } from "@/components/ui/morphing-text";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";
import GlyphPortal from "@/components/ui/glyph-portal";
import dynamic from "next/dynamic";

const AuroraEffect = dynamic(
  () => import("@/components/profile/layouts/background-effects/Aurora").then((m) => m.AuroraEffect),
  { ssr: false },
);
import { useState } from "react";
import { motion } from "framer-motion";
import { PREMIUM_PLAN, IMAGE_HOST_PLAN, VERIFIED_PLAN, BADGE_TOKEN_PLAN, ALIAS_TOKEN_PLAN, CURRENCIES, type Currency } from "@/lib/payments/plans";

interface PricingProps {
  isAuthenticated?: boolean;
  isPremium?: boolean;
  hasImageHost?: boolean;
  hasVerified?: boolean;
}


function TokenCard({
  title,
  price,
  features,
  cta,
  onClick,
  icon,
}: {
  title: string;
  price: string;
  features: string[];
  cta: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8 rounded-[20px] border border-white/5 bg-[#0c0c0c] p-5 md:px-6 shadow-sm text-left">
      <div className="flex items-center gap-4 shrink-0 md:min-w-[190px]">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#5b6cf5]/15 text-[#8b7cf6]">{icon}</span>
        <div>
          <p className="text-[15px] font-normal tracking-tight text-white/90">{title}</p>
          <p className="text-xl font-medium text-white leading-tight">{price}</p>
        </div>
      </div>
      <ul className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[12.5px] font-light text-white/65">
            <CheckIcon />
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClick}
        className="shrink-0 rounded-xl bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 border border-[#5b6cf5]/25 px-5 py-2.5 text-[13px] font-normal text-white transition-colors cursor-pointer"
      >
        {cta}
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <path d="M20 6L9 17L4 12" />
    </svg>
  );
}

const PRODUCTS = [
  {
    id: "image-host",
    title: "Image Host",
    desc: "Upload and share your images with fast, permanent CDN links.",
    price: { USD: IMAGE_HOST_PLAN.USD.display, INR: IMAGE_HOST_PLAN.INR.display },
    href: "/checkout/image-host",
    features: [
      "Exclusive Image Host Badge",
      "Special Discord Server Role",
      "50GB storage",
      "Up to 200MB per file upload",
      "Short share links & password lock",
    ],
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M1.5 6A2.25 2.25 0 0 1 3.75 3.75h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0z" /></svg>
    ),
  },
  {
    id: "verified-badge",
    title: "Verified Badge",
    desc: "Stand out with a verified checkmark shown right beside your name.",
    price: { USD: VERIFIED_PLAN.USD.display, INR: VERIFIED_PLAN.INR.display },
    href: "/checkout/verified",
    features: [
      "Exclusive verified checkmark",
      "Special Discord role",
      "Show next to your name as a checkmark",
      "Stand out as a trusted member",
    ],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25z" /></svg>
    ),
  },
  {
    id: "custom-badge",
    title: "Custom Badge",
    desc: "Design your own badge with a custom icon and colour.",
    price: { USD: BADGE_TOKEN_PLAN.USD.display, INR: BADGE_TOKEN_PLAN.INR.display },
    href: "/checkout/badge-token",
    features: [
      "Create your own custom badge",
      "Upload your own badge image",
      "Choose a custom badge name",
      "Display it on your profile",
    ],
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" /></svg>
    ),
  },
] as const;

export default function PricingClient({ isAuthenticated = false, isPremium = false, hasImageHost = false, hasVerified = false }: PricingProps) {
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>("USD");
  const plan = PREMIUM_PLAN[currency];

  const handleEnterClick = (e: React.MouseEvent<HTMLElement>) => {
    const enter = (e.target as HTMLElement).closest<HTMLElement>("[data-gp-enter]");
    if (!enter) return;
    e.preventDefault();
    const content = e.currentTarget.querySelector<HTMLElement>(".gp-pricing [data-gp-content]");
    if (!content) return;
    const keyboard = e.detail === 0;
    if (!keyboard) enter.blur();
    const startY = window.scrollY;
    const targetY = startY + content.getBoundingClientRect().top;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, targetY);
      if (keyboard) content.focus({ preventScroll: true });
      return;
    }
    let cancelled = false;
    const cancel = () => { cancelled = true; teardown(); };
    const onKey = (ev: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(ev.key)) cancel();
    };
    const teardown = () => {
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", onKey);
    };
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", onKey);
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const start = performance.now();
    const step = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - start) / 1600);
      window.scrollTo(0, startY + distance * ease(t));
      if (t < 1) requestAnimationFrame(step);
      else { teardown(); if (keyboard) content.focus({ preventScroll: true }); }
    };
    requestAnimationFrame(step);
  };

  return (
    <main className="bg-black relative" onClick={handleEnterClick} style={{ fontFamily: "var(--font-comfortaa)" }}>
      <Navbar isAuthenticated={isAuthenticated} />

      {}
      <style>{`
        .gp-pricing [data-gp-caption]{inset:calc(var(--gp-word-bottom,55%) + 44px) 24px auto;justify-content:center;}
        .gp-pricing [data-gp-enter]{min-height:44px;padding:0 22px;gap:14px;background:rgba(91,108,245,.20);border-radius:12px;color:#fff;font-size:13px;font-weight:400;box-shadow:0 0 15px rgba(91,108,245,.10);transition:background .18s,box-shadow .18s;}
        .gp-pricing [data-gp-enter]:hover{background:rgba(91,108,245,.30);box-shadow:0 0 20px rgba(91,108,245,.18);}
        .gp-pricing [data-gp-enter]:focus-visible{outline:2px solid #8b7cf6;outline-offset:4px;}
        /* Land the hero+cards near the top so there's no empty gap on entry (portal default centers them). */
        .gp-pricing [data-gp-content]{align-content:start;padding-top:clamp(88px,12vh,132px);}
      `}</style>

      <GlyphPortal
        className="gp-pricing relative z-10"
        word="PREMIUM"
        interactive={false}
        scrollLength={1.7}
        enterLabel="Treat yourself"
        style={{
          "--gp-paper": "#000000",
          "--gp-ink": "rgba(255,255,255,0.70)",
          "--gp-field": "#000000",
          "--gp-foreground": "#ffffff",
          fontFamily: "var(--font-comfortaa)",
        }}
        background={
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "#000000" }}>
            {}
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: "scale(var(--gp-field-scale,1))",
                background:
                  "radial-gradient(78% 42% at 50% 40%, rgba(91,108,245,0.42) 0%, rgba(91,108,245,0.10) 50%, transparent 76%)",
              }}
            >
              {}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: "scaleY(-1)",
                  WebkitMaskImage:
                    "radial-gradient(66% 80% at 50% 10%, #000 0%, rgba(0,0,0,0.5) 46%, transparent 74%)",
                  maskImage:
                    "radial-gradient(66% 80% at 50% 10%, #000 0%, rgba(0,0,0,0.5) 46%, transparent 74%)",
                }}
              >
                <AuroraEffect colors={["#4553d6", "#5b6cf5", "#8b7cf6"]} intensity={52} blend={0.72} />
              </div>
            </div>
          </div>
        }
        front={
          <div
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              bottom: "calc(100% - var(--gp-word-top, 35%) + 26px)",
              textAlign: "center",
              margin: 0,
            }}
          >
            <p className="text-[15px] md:text-[16px] font-light tracking-wide text-white/60">
              Free to start, premium when you want more.
            </p>
            <p className="mt-1.5 text-[12.5px] font-light tracking-wide text-white/35">
              No card to start, upgrade whenever it feels right.
            </p>
          </div>
        }
      >
        <div className="mx-auto w-full max-w-3xl">
          {}
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center justify-center gap-2 flex-wrap">
              <h1 className="text-3xl md:text-5xl font-medium text-white tracking-tight leading-[1.05]">
                Made super simple,
              </h1>
              <div className="text-[#8b7cf6]" style={{ fontFamily: "var(--font-caviar-dreams)" }}>
                <MorphingText
                  texts={["for all creators.", "scales with you.", "your own style.", "loved by all."]}
                  className="mx-0 h-9 w-[17ch] max-w-none text-center text-3xl md:h-14 md:text-5xl lg:text-5xl"
                />
              </div>
            </div>
            <div className="max-w-xl">
              <BlurTextEffect className="text-base font-light leading-relaxed text-white/50">
                One profile, endless possibilities. Free forever, premium when you are ready.
              </BlurTextEffect>
            </div>
          </div>

          {}
          <div className="mb-8 flex justify-center">
            <div className="relative inline-flex items-center gap-1 rounded-full border border-[#5b6cf5]/10 bg-[#5b6cf5]/3 p-1">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`relative z-10 rounded-full px-5 py-1.5 text-[13px] font-light transition-colors cursor-pointer ${
                    currency === c ? "text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {currency === c && (
                    <motion.div
                      layoutId="currency-bubble"
                      className="absolute inset-0 z-0 rounded-full bg-[#5b6cf5]/20 shadow-[0_0_15px_rgba(91,108,245,0.1)]"
                      transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{c}</span>
                </button>
              ))}
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end text-left">
            <div className="w-full bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm text-left flex flex-col">
              <p className="text-[14px] font-normal text-white/90 tracking-tight mb-1">Free</p>
              <p className="text-[12.5px] font-light text-white/40 mb-4">Everything you need to start.</p>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-4xl font-medium text-white">{plan.symbol}0</span>
                <span className="text-sm font-light text-white/40">/ forever</span>
              </div>

              <ul className="flex flex-col gap-3 mb-8">
                {FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[13px] font-light text-white/70">
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
                <li className="flex items-start gap-2.5 text-[13px] font-light text-white/35">
                  <CheckIcon />
                  And much more, etc.
                </li>
              </ul>

              <button
                onClick={() => router.push(isAuthenticated ? "/dashboard" : "/register")}
                className="mt-auto w-full bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white font-normal rounded-xl py-2.5 text-sm transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              </button>
            </div>
            <div className="w-full bg-[#0c0c0c] border border-[#5b6cf5]/40 rounded-[20px] p-6 text-left flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(91,108,245,0.12)]">
              <div className="absolute inset-0 bg-gradient-to-b from-[#5b6cf5]/[0.07] via-transparent to-transparent pointer-events-none" />
              <div className="relative flex flex-col h-full">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[14px] font-normal text-white/90 tracking-tight flex items-center gap-2">
                    <svg width="13" height="13" viewBox="0 0 512 512" fill="#5b6cf5" aria-hidden="true">
                      <path d="M396.31 32H264l84.19 112.26L396.31 32Zm-280.62 0 48.12 112.26L248 32H115.69ZM256 74.67 192 160h128l-64-85.33Zm166.95-23.61L376.26 160H488L422.95 51.06Zm-333.9 0L23 160h112.74L89.05 51.06ZM146.68 192H24l222.8 288h.53L146.68 192Zm218.64 0L264.67 480h.53L488 192H365.32Zm-35.93 0H182.61L256 400l73.39-208Z" />
                    </svg>
                    Premium
                  </p>
                  <span className="text-[11px] font-medium text-white bg-[#5b6cf5] rounded-full px-2.5 py-0.5">
                    {isPremium ? "Active" : "Recommended"}
                  </span>
                </div>
                <p className="text-[12.5px] font-light text-white/40 mb-4">Unlock everything, no limits.</p>
                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-4xl font-medium text-white">{plan.symbol}{plan.display}</span>
                  <span className="text-sm font-light text-white/40">/lifetime</span>
                </div>

                <ul className="flex flex-col gap-3 mb-8">
                  {PREMIUM_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-[13px] font-light text-white/70">
                      <CheckIcon />
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-start gap-2.5 text-[13px] font-light text-white/35">
                    <CheckIcon />
                    And much more, etc.
                  </li>
                </ul>

                {isPremium ? (
                  <div className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-[#5b6cf5]/15 py-2.5 text-sm font-normal text-white ring-1 ring-inset ring-[#5b6cf5]/30">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    You already have Premium
                  </div>
                ) : (
                  <button
                    onClick={() => router.push(isAuthenticated ? "/checkout" : "/register")}
                    className="mt-auto w-full bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white font-normal rounded-xl py-2.5 text-sm transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer"
                  >
                    Get Premium
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlyphPortal>

      {}
      <section className="relative z-20 bg-black px-5 pt-16 pb-24">
        {}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-full h-64 bg-gradient-to-b from-transparent to-black"
        />
        <div className="relative mx-auto w-full max-w-5xl">
          <div className="mb-14 flex flex-col items-center text-center">
            <span className="text-[11px] font-normal uppercase tracking-[0.2em] text-[#8b7cf6]/80">
              Add-ons
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-medium tracking-tight text-white">
              Discover products
            </h2>
            <p className="mt-3 max-w-md text-[13.5px] font-light leading-relaxed text-white/45">
              Extra upgrades you can add to your profile, à la carte.
            </p>
          </div>

          {}
          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-[1fr_1.15fr_1fr]">
            {PRODUCTS.map((product, i) => {
              const isMiddle = i === 1;
              return (
                <div
                  key={product.id}
                  className={`group relative flex flex-col overflow-hidden rounded-[20px] border bg-[#0c0c0c] p-6 text-left shadow-sm transition-all ${
                    isMiddle
                      ? "border-[#5b6cf5]/40 shadow-[0_0_30px_rgba(91,108,245,0.12)] md:-translate-y-4"
                      : "border-white/5"
                  }`}
                >
                  {isMiddle && (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#5b6cf5]/[0.07] via-transparent to-transparent" />
                  )}
                  {isMiddle && (
                    <span className="absolute right-4 top-4 rounded-full bg-[#5b6cf5] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                      Popular
                    </span>
                  )}
                  <div className="relative flex flex-1 flex-col">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5b6cf5]/15 text-[#8b7cf6]">
                      {product.icon}
                    </span>
                    <div className="mt-5 flex items-baseline justify-between gap-3">
                      <p className="text-[15px] font-normal tracking-tight text-white/90">
                        {product.title}
                      </p>
                      <p className="flex shrink-0 items-baseline gap-1 text-xl font-medium text-white">
                        <span>
                          {plan.symbol}
                          {product.price[currency]}
                        </span>
                        <span className="text-[12px] font-light text-white/40">/lifetime</span>
                      </p>
                    </div>
                    <p className="mt-2 text-[13px] font-light leading-relaxed text-white/45">
                      {product.desc}
                    </p>
                    <ul className="mt-5 mb-8 flex flex-col gap-3">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-[13px] font-light text-white/70">
                          <CheckIcon />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {(product.id === "image-host" && hasImageHost) || (product.id === "verified-badge" && hasVerified) ? (
                      <button
                        onClick={() => router.push(product.id === "image-host" ? "/dashboard/image-host/overview" : "/dashboard/customize/badges")}
                        className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#5b6cf5]/15 py-2.5 text-sm font-normal text-white ring-1 ring-inset ring-[#5b6cf5]/30 transition-all hover:bg-[#5b6cf5]/25 cursor-pointer"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                        {product.id === "image-host" ? "Open Image Host" : "Verified owned"}
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          router.push(
                            !isAuthenticated ? "/register" : "href" in product ? product.href : "/dashboard",
                          )
                        }
                        className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#5b6cf5]/20 py-2.5 text-sm font-normal text-white shadow-[0_0_15px_rgba(91,108,245,0.1)] transition-all hover:bg-[#5b6cf5]/30 cursor-pointer"
                      >
                        Get {product.title}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {}
          <div className="mt-6 flex flex-col gap-4">
            <TokenCard
              title="Alias Token"
              price={`${ALIAS_TOKEN_PLAN[currency].symbol}${ALIAS_TOKEN_PLAN[currency].display}`}
              features={[
                "Create an additional alias username",
                "Redirects straight to your profile",
                "Stack multiple for more aliases",
                "Aliases work without Premium",
              ]}
              cta="Buy Alias Token"
              onClick={() => router.push(isAuthenticated ? "/checkout/alias-token" : "/register")}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20.5C4 16.9 7.6 14 12 14s8 2.9 8 6.5a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5Z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>
    </main>
  );
}



