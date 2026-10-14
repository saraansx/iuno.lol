"use client";

import React from "react";
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/config';

interface NavbarProps {
  isAuthenticated?: boolean;
}

const tabForPath = (pathname: string) => {
  if (pathname === '/pricing' || pathname === '/checkout') return 'Pricing';
  if (pathname === '/leaderboard' || pathname === '/dashboard/leaderboard') return 'Leaderboard';
  return null;
};

const Navbar = ({ isAuthenticated = false }: NavbarProps) => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = React.useState(() => tabForPath(pathname));
  const [hidden, setHidden] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const navRef = React.useRef<HTMLElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    setActiveTab(tabForPath(pathname));
    setMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  React.useEffect(() => {
    const hideOnScroll =
      pathname === "/pricing" ||
      pathname === "/" ||
      pathname === "/leaderboard" ||
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
        setMenuOpen(false);
      } else {
        setHidden(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);
  
  const tabs = ['Helpcenter', 'Leaderboard', 'Pricing', 'Discord'];

  const handleTab = (tab: string) => {
    if (tab === 'Discord') {
      window.open(SITE_CONFIG.links.discord, '_blank');
    } else if (tab === 'Pricing') {
      setActiveTab(tab);
      router.push('/pricing');
    } else if (tab === 'Leaderboard') {
      setActiveTab(tab);
      router.push('/leaderboard');
    } else {
      setActiveTab(tab);
    }
  };

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/register');
  };

  const handleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/signin');
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-6 left-1/2 z-50 w-[95%] max-w-5xl transition-transform duration-300 ease-out"
        style={{
          fontFamily: "var(--font-comfortaa)",
          transform: hidden
            ? "translateX(-50%) translateY(-150%)"
            : "translateX(-50%) translateY(0)",
        }}
      >
        <div className="bg-[#0c0c0c]/85 backdrop-blur-xl border border-white/10 rounded-full px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity shrink-0">
            <Image src="/Favicon.png" alt="Iuno Logo" width={512} height={512} className="w-5 h-auto object-contain shrink-0" priority />
            <span className="font-light text-white tracking-tight text-base" style={{ fontFamily: "var(--font-comfortaa)" }}>Iuno<span className="text-[#5b6cf5] lowercase">.lol</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-[#5b6cf5]/3 rounded-full p-1 border border-[#5b6cf5]/10 relative">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTab(tab)}
                className={`px-5 py-1.5 rounded-full text-[13px] font-light transition-all relative z-10 cursor-pointer ${
                  activeTab === tab 
                    ? "text-white" 
                    : "text-white/60 hover:text-white"
                }`}
                style={{ fontFamily: "var(--font-comfortaa)" }}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="navbar-bubble"
                    className="absolute inset-0 bg-[#5b6cf5]/20 shadow-[0_0_15px_rgba(91,108,245,0.1)] rounded-full z-0"
                    transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="md:hidden flex items-center justify-center w-9 h-9 -ml-1 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              style={{ fontFamily: "var(--font-comfortaa)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {menuOpen ? (
                  <>
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </>
                ) : (
                  <>
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                  </>
                )}
              </svg>
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white px-4 sm:px-6 py-2 rounded-full text-sm font-normal transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer flex items-center gap-2"
                style={{ fontFamily: "var(--font-comfortaa)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 17L12 22L22 17"/><path d="M2 12L12 17L22 12"/><path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                </svg>
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={handleSignIn}
                  className="text-sm font-medium text-white/60 hover:text-white transition-all cursor-pointer whitespace-nowrap shrink-0"
                  style={{ fontFamily: "var(--font-comfortaa)" }}
                >
                  Sign In
                </button>
                <button
                  onClick={handleGetStarted}
                  className="bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white px-4 sm:px-6 py-2 rounded-full text-sm font-normal transition-all shadow-[0_0_15px_rgba(91,108,245,0.1)] cursor-pointer whitespace-nowrap"
                  style={{ fontFamily: "var(--font-comfortaa)" }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>

        {/* mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden mt-2 bg-[#0c0c0c]/95 backdrop-blur-xl border border-white/10 rounded-[24px] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] origin-top"
            >
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTab(tab)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-light transition-colors cursor-pointer ${
                    activeTab === tab
                      ? "text-white bg-[#5b6cf5]/20"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                  style={{ fontFamily: "var(--font-comfortaa)" }}
                >
                  <span>{tab === 'Helpcenter' ? 'Help Center' : tab}</span>
                  {tab === 'Discord' && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                      <path d="M15 3h6v6" />
                      <path d="M10 14 21 3" />
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    </svg>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
