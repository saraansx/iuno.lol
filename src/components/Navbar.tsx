"use client";

import React from "react";
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/config';

interface NavbarProps {
  isAuthenticated?: boolean;
}

const Navbar = ({ isAuthenticated = false }: NavbarProps) => {
  const [activeTab, setActiveTab] = React.useState('Features');
  const router = useRouter();
  
  const tabs = ['Features', 'Leaderboard', 'Pricing', 'FAQ', 'Discord'];

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
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl font-poppins">
        <div className="bg-white/2 backdrop-blur-xl border border-white/8 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Image src="/Favicon.png" alt="Iuno Logo" width={512} height={512} className="w-5 h-auto object-contain shrink-0" priority />
            <span className="font-light text-white tracking-tight text-base" style={{ fontFamily: "var(--font-comfortaa)" }}>Iuno<span className="text-[#609fda] lowercase">.lol</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-[#609fda]/3 rounded-full p-1 border border-[#609fda]/10 relative">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  if (tab === 'Discord') {
                    window.open(SITE_CONFIG.links.discord, '_blank');
                  } else {
                    setActiveTab(tab);
                  }
                }}
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
                    className="absolute inset-0 bg-[#609fda]/20 shadow-[0_0_15px_rgba(96,159,218,0.1)] rounded-full z-0"
                    transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white px-6 py-2 rounded-full text-sm font-normal transition-all shadow-[0_0_15px_rgba(96,159,218,0.1)] cursor-pointer flex items-center gap-2"
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
                  className="text-sm font-medium text-white/60 hover:text-white transition-all cursor-pointer"
                  style={{ fontFamily: "var(--font-comfortaa)" }}
                >
                  Sign In
                </button>
                <button
                  onClick={handleGetStarted}
                  className="bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white px-6 py-2 rounded-full text-sm font-normal transition-all shadow-[0_0_15px_rgba(96,159,218,0.1)] cursor-pointer"
                  style={{ fontFamily: "var(--font-comfortaa)" }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
