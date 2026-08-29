"use client";

import React, {  useState  } from "react";
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
      
      <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar pt-2">
        <div className="py-4 relative flex transition-all shrink-0 items-center overflow-hidden h-[68px]">
          <Link 
            href="/" 
            className={`absolute flex items-center hover:opacity-80 transition-all duration-300 whitespace-nowrap overflow-hidden ${open ? 'left-6 opacity-100' : 'left-6 opacity-0 pointer-events-none'}`}
          >
            <Image src="/logo.png" alt="Iuno Logo" width={209} height={221} className="w-6 h-auto object-contain shrink-0" priority />
            <span className="font-normal text-white tracking-tight text-base uppercase whitespace-nowrap ml-1 overflow-hidden">
              Iuno<span className="text-[#609fda] lowercase">.lol</span>
            </span>
          </Link>

          <button 
            onClick={() => setOpen(!open)}
            className={`absolute transition-all duration-300 p-1.5 rounded-lg flex items-center justify-center shrink-0 z-20 ${open ? 'right-4 text-white/30 hover:text-white/80 hover:bg-white/5' : 'left-[15px] bg-[#609fda]/10 text-[#609fda] border border-[#609fda]/20 hover:bg-[#609fda]/20'}`}
            title="Toggle Sidebar"
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="shrink-0">
                <line x1="19" y1="5" x2="19" y2="19" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="14" y1="5" x2="14" y2="19" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M9 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z" fill="currentColor" stroke="none" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="shrink-0">
                <line x1="5" y1="5" x2="5" y2="19" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="10" y1="5" x2="10" y2="19" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M15 5h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" fill="currentColor" stroke="none" />
              </svg>
            )}
          </button>
        </div>

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
                          className={`relative flex items-center w-full transition-all duration-300 ${open ? 'px-3' : 'px-[9px]'} py-2.5 rounded-xl text-[13.5px] font-normal group overflow-hidden ${
                            isGroupActive
                              ? (open ? "text-white" : "bg-[#609fda]/20 text-white shadow-[0_0_15px_rgba(96,159,218,0.1)]")
                              : "text-white/30 hover:text-white/80 hover:bg-white/[0.06]"
                          }`}
                        >
                          <span className={`relative z-10 flex items-center ${open ? 'gap-3' : ''}`}>
                            {React.cloneElement(item.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { width: 18, height: 18, className: `shrink-0 transition-colors ${isGroupActive ? 'text-[#609fda]' : 'text-white/40 group-hover:text-white/80'}` })}
                            
                            <motion.span
                              animate={{
                                width: animate ? (open ? "auto" : 0) : "auto",
                                opacity: animate ? (open ? 1 : 0) : 1,
                                marginLeft: animate ? (open ? "12px" : "0px") : "12px",
                              }}
                              className="whitespace-nowrap overflow-hidden"
                            >
                              {item.label}
                            </motion.span>
                          </span>
                          <motion.svg
                            animate={{
                              width: animate ? (open ? 14 : 0) : 14,
                              opacity: animate ? (open ? 1 : 0) : 1,
                            }}
                            height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className={`transition-transform duration-200 text-white/40 shrink-0 overflow-hidden ml-auto ${profileExpanded ? "rotate-180" : ""}`}
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
                                    className={`px-4 py-2 rounded-[10px] text-[13px] font-normal transition-all whitespace-nowrap ${
                                      isSubActive
                                        ? "bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white shadow-[0_0_15px_rgba(96,159,218,0.1)]"
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
                      className={`relative flex items-center w-full transition-all duration-300 overflow-hidden ${open ? 'px-3' : 'px-[9px]'} py-2.5 rounded-xl text-[13.5px] font-normal group ${
                        isActive
                          ? "bg-[#609fda]/20 hover:bg-[#609fda]/30 text-white shadow-[0_0_15px_rgba(96,159,218,0.1)]"
                          : "text-white/30 hover:text-white/80 hover:bg-white/[0.06]"
                      }`}
                    >
                      <span className={`relative z-10 flex items-center ${open ? 'gap-3' : ''}`}>
                        {React.cloneElement(item.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { width: 18, height: 18, className: `shrink-0 transition-colors ${isActive ? 'text-[#609fda]' : 'text-white/40 group-hover:text-white/80'}` })}
                        <motion.span
                          animate={{
                            width: animate ? (open ? "auto" : 0) : "auto",
                            opacity: animate ? (open ? 1 : 0) : 1,
                            marginLeft: animate ? (open ? "12px" : "0px") : "12px",
                          }}
                          className="whitespace-nowrap overflow-hidden"
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

      <div className={`pt-2 pb-3 shrink-0 transition-all ${open ? 'px-3' : 'px-2'}`}>
        <div className={`rounded-xl border border-white/5 bg-[#0a0a0a] flex items-center transition-all duration-300 ${open ? 'gap-3 p-2' : 'p-[6px]'} overflow-hidden relative w-full`}>
          <div className="relative w-8 h-8 shrink-0">
            <div className="absolute inset-0 rounded-full bg-[#609fda]/10 border border-[#609fda]/20 flex items-center justify-center text-[#609fda] text-xs font-bold uppercase overflow-hidden shrink-0">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Profile picture" fill sizes="32px" className="object-cover" />
              ) : (
                username ? username[0] : "?"
              )}
            </div>
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
              width: animate ? (open ? "auto" : 0) : "auto",
              opacity: animate ? (open ? 1 : 0) : 1,
              marginLeft: animate ? (open ? "12px" : "0px") : "12px",
            }}
            className="flex-col flex-1 min-w-0 overflow-hidden"
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
        { label: "Overview", href: "/dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1.5"/><rect width="7" height="5" x="14" y="3" rx="1.5"/><rect width="7" height="9" x="14" y="12" rx="1.5"/><rect width="7" height="5" x="3" y="16" rx="1.5"/></svg> },
        { label: "Leaderboard", href: "/dashboard/leaderboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/><path d="M2 20h20"/></svg> },
      ],
    },
    {
      section: "CUSTOMIZE",
      items: [
        {
          label: "Profile",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="7" r="4" />
              <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            </svg>
          ),
          subItems: [
            { label: "General", href: "/dashboard/customize/profile/general" },
            { label: "Appearance", href: "/dashboard/customize/profile/appearance" },
            { label: "Fonts", href: "/dashboard/customize/profile/fonts" },
            { label: "Colors", href: "/dashboard/customize/profile/colors" },
            { label: "Effects", href: "/dashboard/customize/profile/effects" },
            { label: "Layout", href: "/dashboard/customize/profile/layout" },
            { label: "Widgets", href: "/dashboard/customize/profile/widgets" },
            { label: "Metadata", href: "/dashboard/customize/profile/metadata" },
          ]
        },
        { label: "Links", href: "/dashboard/customize/links", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
        { label: "Badges", href: "/dashboard/customize/badges", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
        { label: "Templates", href: "/dashboard/customize/templates", icon: <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2.5" fill="currentColor"/><path d="M3 9h18" stroke="#0a0a0a" strokeWidth="2"/><path d="M9 21V9" stroke="#0a0a0a" strokeWidth="2"/></svg> },
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
