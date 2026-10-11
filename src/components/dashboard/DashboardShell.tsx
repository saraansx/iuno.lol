"use client";

import { useState, useSyncExternalStore } from "react";
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

const emptySubscribe = () => () => {};
function useTurnstileCookie(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => document.cookie.includes("turnstile_cleared=true"),
    () => false,
  );
}

const DashboardShell = ({ children, username, userId, avatarUrl, decorationUrl, decorationHue }: DashboardShellProps) => {
  const cookieVerified = useTurnstileCookie();
  const [manuallyVerified, setManuallyVerified] = useState(false);
  const isVerified = cookieVerified || manuallyVerified;

  const handleTurnstileSuccess = () => {
    document.cookie = "turnstile_cleared=true; max-age=1800; path=/";
    setManuallyVerified(true);
  };

  return (
    <div className="h-screen bg-[#050505] flex overflow-hidden" style={{ fontFamily: "var(--font-comfortaa)" }}>
      {!isVerified && (
        <TurnstileVerification
          isOpen={!isVerified}
          onClose={() => {}}
          onSuccess={handleTurnstileSuccess}
        />
      )}

      <Sidebar username={username} userId={userId} avatarUrl={avatarUrl} decorationUrl={decorationUrl} decorationHue={decorationHue} />

      <main className="flex-1 p-4 pl-0 flex">
        <div className="flex-1 bg-[#0c0c0c] border border-white/4 rounded-[2.5rem] relative overflow-hidden">

          <div className="absolute inset-0 px-12 py-10 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardShell;
