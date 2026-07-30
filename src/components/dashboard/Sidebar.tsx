"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/logout";
import { Sidebar as AceSidebar, SidebarBody, useSidebar } from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  username?: string;
  userId?: number;
  avatarUrl?: string;
  decorationUrl?: string;
  decorationHue?: number;
}

interface SubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  icon: React.ReactElement;
  href?: string;
  subItems?: SubItem[];
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

interface SidebarContentProps {
  username?: string;
  userId?: number;
  avatarUrl?: string;
  decorationUrl?: string;
  decorationHue?: number;
  navItems: NavGroup[];
  pathname: string;
  profileExpanded: boolean;
  setProfileExpanded: (expanded: boolean) => void;
}

const SidebarContent = ({ username, userId, avatarUrl, decorationUrl, decorationHue, navItems, pathname, profileExpanded, setProfileExpanded }: SidebarContentProps) => {
  const { open, setOpen, animate } = useSidebar();
  
  return (
    <SidebarBody className="bg-transparent border-r-0 justify-between gap-6 overflow-hidden w-full h-full p-0">
      
      {/* Top Content: Logo and Navigation */}
      <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar pt-2">
        {/* Logo and Toggle */}
        <div className={`py-4 flex transition-all shrink-0 items-center ${open ? 'px-6 justify-between flex-row' : 'px-0 justify-center flex-col gap-5'}`}>
          <Link href="/" className={`flex items-center hover:opacity-80 transition-opacity whitespace-nowrap ${open ? 'gap-2.5' : ''}`}>
            <Image src="/logo.png" alt="Iuno Logo" width={28} height={28} className="object-contain shrink-0" priority />
            <motion.span 
              animate={{
                display: animate ? (open ? "inline-block" : "none") : "inline-block",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
              className="font-normal text-white tracking-tight text-base uppercase whitespace-nowrap ml-1"
            >
              Iuno<span className="text-[#609fda] lowercase">.lol</span>
            </motion.span>
          </Link>

          <button 
            onClick={() => setOpen(!open)}
            className={`p-1.5 rounded-lg transition-all flex items-center justify-center shrink-0 ${open ? 'text-white/30 hover:text-white/80 hover:bg-white/5' : 'bg-[#609fda]/10 text-[#609fda] border border-[#609fda]/20 hover:bg-[#609fda]/20'}`}
            title="Toggle Sidebar"
          >
            {open ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 flex flex-col gap-6">
          {navItems.map((group: NavGroup) => (
            <div key={group.section}>
              <motion.p 
                animate={{
                  display: animate ? (open ? "block" : "none") : "block",
                  opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-medium px-3 mb-2 whitespace-nowrap"
              >
                {group.section}
              </motion.p>
              
              {!open && animate && <div className="h-4" />} 

              <div className="flex flex-col gap-0.5">
                {group.items.map((item: NavItem) => {
                  if (item.subItems) {
                    const isGroupActive = item.subItems.some((sub: SubItem) => pathname === sub.href) || pathname.startsWith("/dashboard/customize/profile");
                    return (
                      <div key={item.label} className="flex flex-col">
                        <button
                          onClick={() => {
                             if (open) setProfileExpanded(!profileExpanded);
                          }}
                          className={`relative flex items-center ${open ? 'justify-between px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-[13.5px] font-medium transition-all group ${
                            isGroupActive
                              ? (open ? "text-white" : "bg-[#609fda]/15 text-[#609fda]")
                              : "text-white/30 hover:text-white/80 hover:bg-white/[0.06]"
                          }`}
                        >
                          <span className={`relative z-10 flex items-center ${open ? 'gap-3' : ''}`}>
                            {React.cloneElement(item.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { width: 18, height: 18, className: `shrink-0 ${isGroupActive ? 'text-[#609fda]' : 'text-[#609fda]/60 group-hover:text-[#609fda]'}` })}
                            
                            <motion.span
                              animate={{
                                display: animate ? (open ? "inline-block" : "none") : "inline-block",
                                opacity: animate ? (open ? 1 : 0) : 1,
                              }}
                              className="whitespace-nowrap"
                            >
                              {item.label}
                            </motion.span>
                          </span>
                          <motion.svg
                            animate={{
                              display: animate ? (open ? "block" : "none") : "block",
                              opacity: animate ? (open ? 1 : 0) : 1,
                            }}
                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className={`transition-transform duration-200 text-white/40 shrink-0 ${profileExpanded ? "rotate-180" : ""}`}
                          >
                            <path d="m6 9 6 6 6-6"/>
                          </motion.svg>
                        </button>
                        
                        <AnimatePresence>
                          {profileExpanded && open && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="relative flex flex-col gap-1 mt-1 ml-5 pl-3 border-l border-white/8 overflow-hidden"
                            >
                              {item.subItems.map((subItem: SubItem) => {
                                const isSubActive = pathname === subItem.href || (subItem.label === "General" && pathname === "/dashboard/customize/profile");
                                return (
                                  <Link
                                    key={subItem.label}
                                    href={subItem.href}
                                    className={`px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all whitespace-nowrap ${
                                      isSubActive
                                        ? "bg-[#609fda]/15 text-[#609fda]"
                                        : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
                                    }`}
                                  >
                                    {subItem.label}
                                  </Link>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  const isActive = item.href ? pathname === item.href : false;
                  return (
                    <Link
                      key={item.label}
                      href={item.href!}
                      className={`relative flex items-center ${open ? 'px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-[13.5px] font-medium transition-all group ${
                        isActive
                          ? "bg-[#609fda]/15 text-[#609fda]"
                          : "text-white/30 hover:text-white/80 hover:bg-white/[0.06]"
                      }`}
                    >
                      <span className={`relative z-10 flex items-center ${open ? 'gap-3' : ''}`}>
                        {React.cloneElement(item.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { width: 18, height: 18, className: `shrink-0 ${isActive ? 'text-[#609fda]' : 'text-[#609fda]/60 group-hover:text-[#609fda]'}` })}
                        <motion.span
                          animate={{
                            display: animate ? (open ? "inline-block" : "none") : "inline-block",
                            opacity: animate ? (open ? 1 : 0) : 1,
                          }}
                          className="whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section - User Widget */}
      <div className={`pt-2 pb-3 shrink-0 transition-all ${open ? 'px-3' : 'px-2'}`}>
        <div className={`rounded-xl border border-white/5 bg-[#0a0a0a] flex items-center transition-all ${open ? 'gap-3 p-2' : 'justify-center p-1.5'} overflow-hidden`}>
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
          
          <motion.div 
            animate={{
              display: animate ? (open ? "flex" : "none") : "flex",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="flex-col flex-1 min-w-0"
          >
            <p className="text-sm text-white/80 font-medium truncate">
              {username || "User"}
            </p>
            <p className="text-[10px] text-white/25 truncate">
              UID {userId ?? "--"}
            </p>
          </motion.div>
          
          <motion.button 
            animate={{
              display: animate ? (open ? "flex" : "none") : "flex",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            onClick={() => logout()}
            className="h-8 w-8 items-center justify-center rounded-lg border border-transparent text-white/20 hover:border-red-400/25 hover:bg-red-400/8 hover:text-red-400/60 transition-all cursor-pointer shrink-0"
            title="Sign out"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </motion.button>
        </div>
      </div>
    </SidebarBody>
  );
};

const Sidebar = ({ username, userId, avatarUrl, decorationUrl, decorationHue = 0 }: SidebarProps) => {
  const pathname = usePathname();
  const [profileExpanded, setProfileExpanded] = useState(true);
  const [open, setOpen] = useState(false);

  const navItems = [
    {
      section: "MAIN",
      items: [
        { label: "Overview", href: "/dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18"/><rect width="3" height="5" x="6" y="11" rx="1"/><rect width="3" height="9" x="11" y="7" rx="1"/><rect width="3" height="13" x="16" y="3" rx="1"/></svg> },
        { label: "Leaderboard", href: "/dashboard/leaderboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> },
      ],
    },
    {
      section: "CUSTOMIZE",
      items: [
        {
          label: "Profile",
          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>,
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
        { label: "Links", href: "/dashboard/customize/links", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
        { label: "Badges", href: "/dashboard/customize/badges", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
        { label: "Templates", href: "/dashboard/customize/templates", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> },
      ]
    }
  ];

  return (
    <AceSidebar open={open} setOpen={setOpen}>
      <SidebarContent 
        username={username}
        userId={userId}
        avatarUrl={avatarUrl}
        decorationUrl={decorationUrl}
        decorationHue={decorationHue}
        navItems={navItems}
        pathname={pathname}
        profileExpanded={profileExpanded}
        setProfileExpanded={setProfileExpanded}
      />
    </AceSidebar>
  );
};

export default Sidebar;
