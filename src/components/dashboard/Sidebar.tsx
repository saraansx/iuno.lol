"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/logout";

interface SidebarProps {
  username?: string;
  userId?: number;
  avatarUrl?: string;
  decorationUrl?: string;
  decorationHue?: number;
}

const Sidebar = ({ username, userId, avatarUrl, decorationUrl, decorationHue = 0 }: SidebarProps) => {
  const pathname = usePathname();
  const [profileExpanded, setProfileExpanded] = useState(true);

  const navItems = [
    {
      section: "MAIN",
      items: [
        { label: "Overview", href: "/dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18"/><rect width="3" height="5" x="6" y="11" rx="1"/><rect width="3" height="9" x="11" y="7" rx="1"/><rect width="3" height="13" x="16" y="3" rx="1"/></svg> },
        { label: "Leaderboard", href: "/dashboard/leaderboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> },
      ],
    },
    {
      section: "CUSTOMIZE",
      items: [
        {
          label: "Profile",
          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>,
          subItems: [
            { label: "General", href: "/dashboard/customize/profile/general" },
            { label: "Appearance", href: "/dashboard/customize/profile/appearance" },
            { label: "Colors", href: "/dashboard/customize/profile/colors" },
            { label: "Effects", href: "/dashboard/customize/profile/effects" },
            { label: "Layout", href: "/dashboard/customize/profile/layout" },
            { label: "Widgets", href: "/dashboard/customize/profile/widgets" },
            { label: "Metadata", href: "/dashboard/customize/profile/metadata" },
          ]
        },
        { label: "Links", href: "/dashboard/customize/links", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
        { label: "Badges", href: "/dashboard/customize/badges", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
        { label: "Templates", href: "/dashboard/customize/templates", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> },
      ]
    }
  ];

  return (
    <aside className="w-full h-screen bg-transparent flex flex-col">
      {/* Logo */}
      <div className="px-7 py-6 flex items-center gap-2.5">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="Iuno Logo" width={28} height={28} className="object-contain" priority />
          <span className="font-normal text-white tracking-tight text-base uppercase">
            Iuno<span className="text-[#609fda] lowercase">.lol</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-6 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.section}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-medium px-4 mb-2">
              {group.section}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                if (item.subItems) {
                  const isGroupActive = item.subItems.some(sub => pathname === sub.href) || pathname.startsWith("/dashboard/customize/profile");
                  return (
                    <div key={item.label} className="flex flex-col">
                      <button
                        onClick={() => setProfileExpanded(!profileExpanded)}
                        className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all group ${
                          isGroupActive
                            ? "text-white"
                            : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          {React.cloneElement(item.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { width: 18, height: 18 })}
                          {item.label}
                        </span>
                        <svg
                          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className={`transition-transform duration-200 text-white/40 ${profileExpanded ? "rotate-180" : ""}`}
                        >
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </button>
                      
                      {profileExpanded && (
                        <div className="relative flex flex-col gap-1 mt-1 ml-5.25 pl-3 border-l border-white/8">
                          {item.subItems.map((subItem) => {
                            const isSubActive = pathname === subItem.href || (subItem.label === "General" && pathname === "/dashboard/customize/profile");
                            
                            return (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                className={`px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all ${
                                  isSubActive
                                    ? "bg-[#609fda]/15 text-[#609fda]"
                                    : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
                                }`}
                              >
                                {subItem.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const isActive = item.href ? pathname === item.href : false;
                return (
                  <Link
                    key={item.label}
                    href={item.href!}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all group ${
                      isActive
                        ? "bg-[#609fda]/15 text-[#609fda]"
                        : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {React.cloneElement(item.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { width: 18, height: 18 })}
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pt-2 pb-3">
        <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="relative w-8 h-8 shrink-0">
              <div className="absolute inset-0 rounded-full bg-[#609fda]/10 border border-[#609fda]/20 flex items-center justify-center text-[#609fda] text-xs font-bold uppercase overflow-hidden shrink-0">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Profile picture" fill sizes="32px" className="object-cover" />
                ) : (
                  username ? username[0] : "?"
                )}
              </div>
              {/* Decoration Overlay */}
              {decorationUrl && (
                <div className="pointer-events-none absolute -inset-[3px] z-10">
                  <Image
                    src={decorationUrl}
                    alt="Decoration"
                    fill
                    sizes="40px"
                    className="object-contain"
                    style={{ filter: `hue-rotate(${decorationHue}deg)` }}
                  />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
            <p className="text-sm text-white/80 font-medium truncate">
              {username || "User"}
            </p>
            <p className="text-[10px] text-white/25 truncate">
              UID {userId ?? "--"}
            </p>
          </div>
          <button 
            onClick={() => logout()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-white/20 hover:border-red-400/25 hover:bg-red-400/8 hover:text-red-400/60 transition-all cursor-pointer shrink-0"
            title="Sign out"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
      </div>
    </aside>
  );
};

export default Sidebar;
