"use client";

import React from "react";
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/config';

interface NavbarProps {
  isAuthenticated?: boolean;
}

const tabForPath = (pathname: string) => {
  if (pathname === '/pricing' || pathname === '/checkout') return 'Pricing';
  if (pathname === '/leaderboard' || pathname === '/dashboard/leaderboard') return 'Leaderboard';
  return null;
};

const Navbar = ({ isAuthenticated }: NavbarProps) => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = React.useState(() => tabForPath(pathname));
  const [hidden, setHidden] = React.useState(false);
  const serverAuthProvided = isAuthenticated !== undefined;
  const [clientAuth, setClientAuth] = React.useState(false);

  React.useEffect(() => {
    if (serverAuthProvided) return;
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.authenticated) setClientAuth(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [serverAuthProvided]);

  const showDashboard = serverAuthProvided ? isAuthenticated : clientAuth;

  React.useEffect(() => {
    setActiveTab(tabForPath(pathname));
  }, [pathname]);

  React.useEffect(() => {
    const hideOnScroll =
      pathname === "/pricing" ||
      pathname === "/" ||
      pathname === "/leaderboard" ||
      pathname === "/changelog" ||
      pathname === "/terms" ||
      pathname === "/privacy" ||
      pathname === "/copyright" ||
      pathname === "/refund";
    if (!hideOnScroll) {
      setHidden(false);
      return;
    }

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) < 6) return;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);
  
  const tabs: { label: string; href: string; external?: boolean }[] = [
    { label: 'Helpcenter', href: '/#faq' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Discord', href: SITE_CONFIG.links.discord, external: true },
  ];

  return (
    <>
      <nav
        className="fixed top-6 left-1/2 z-50 w-[95%] max-w-5xl transition-transform duration-300 ease-out"
        style={{
          fontFamily: "var(--font-comfortaa)",
          transform: hidden
            ? "translateX(-50%) translateY(-150%)"
            : "translateX(-50%) translateY(0)",
        }}
      >
        <div className="bg-[#0c0c0c]/85 backdrop-blur-xl border border-white/10 rounded-full px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <Link href="/" className="flex items-center gap-1.5 shrink-0 hover:opacity-80 transition-opacity">
            <Image src="/Favicon.png" alt="Iuno Logo" width={512} height={512} className="w-5 h-auto object-contain shrink-0" priority />
            <span className="font-light text-white tracking-tight text-base" style={{ fontFamily: "var(--font-comfortaa)" }}>Iuno<span className="text-[#5b6cf5] lowercase">.lol</span></span>
          </Link>

          <div className="hidden lg:flex shrink-0 items-center gap-1 bg-[#5b6cf5]/3 rounded-full p-1 border border-[#5b6cf5]/10 relative">
            {tabs.map((tab) => {
              const tabClassName = `px-5 py-1.5 rounded-full text-[13px] font-light transition-all relative z-10 cursor-pointer ${
                activeTab === tab.label
                  ? "text-white"
                  : "text-white/60 hover:text-white"
              }`;
              const content = (
                <>
                  {activeTab === tab.label && (
                    <motion.div
                      layoutId="navbar-bubble"
                      className="absolute inset-0 bg-[#5b6cf5]/20 shadow-[0_0_15px_rgba(91,108,245,0.1)] rounded-full z-0"
                      transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </>
              );
              return tab.external ? (
                <a
                  key={tab.label}
                  href={tab.href}
                  target="_blank"
                  rel="noreferrer"
                  className={tabClassName}
                  style={{ fontFamily: "var(--font-comfortaa)" }}
                >
                  {content}
                </a>
              ) : (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={tabClassName}
                  style={{ fontFamily: "var(--font-comfortaa)" }}
                >
                  {content}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {showDashboard ? (
              <Link
                href="/dashboard"
                className="whitespace-nowrap bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white px-6 py-2 rounded-full text-sm font-normal transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer flex items-center gap-2"
                style={{ fontFamily: "var(--font-comfortaa)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 17L12 22L22 17"/><path d="M2 12L12 17L22 12"/><path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                </svg>
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="whitespace-nowrap py-2 sm:py-0 text-sm font-medium text-white/60 hover:text-white transition-all cursor-pointer"
                  style={{ fontFamily: "var(--font-comfortaa)" }}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="whitespace-nowrap bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white px-6 py-2 rounded-full text-sm font-normal transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer"
                  style={{ fontFamily: "var(--font-comfortaa)" }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
