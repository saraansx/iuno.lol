"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TurnstileVerification from "@/components/auth/TurnstileVerification";

interface DashboardShellProps {
  children: React.ReactNode;
  username?: string;
  userId?: number;
  avatarUrl?: string;
  decorationUrl?: string;
  decorationHue?: number;
}

const DashboardShell = ({ children, username, userId, avatarUrl, decorationUrl, decorationHue }: DashboardShellProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [showTurnstile, setShowTurnstile] = useState(false);

  useEffect(() => {
    const checkVerification = () => {
      // Check if our 30-minute clearance cookie exists
      if (document.cookie.includes("turnstile_cleared=true")) {
        setIsVerified(true);
      } else {
        setShowTurnstile(true);
      }
    };

    Promise.resolve().then(checkVerification);
  }, []);

  const handleTurnstileSuccess = () => {
    document.cookie = "turnstile_cleared=true; max-age=1800; path=/";
    setShowTurnstile(false);
    setIsVerified(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] font-poppins flex">
      {!isVerified && (
        <TurnstileVerification
          isOpen={showTurnstile}
          onClose={() => {}}
          onSuccess={handleTurnstileSuccess}
        />
      )}

      {/* Sidebar */}
      <div className="w-65 shrink-0">
        <Sidebar username={username} userId={userId} avatarUrl={avatarUrl} decorationUrl={decorationUrl} decorationHue={decorationHue} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 pl-0 flex">
        <div className="flex-1 bg-[#0c0c0c] border border-white/4 rounded-[2.5rem] relative shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">

          <div className="absolute inset-0 px-12 py-10 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardShell;
