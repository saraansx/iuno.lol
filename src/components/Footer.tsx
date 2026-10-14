"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SITE_CONFIG } from "@/lib/config";
import {
  DiscordLogoIcon,
  GitHubLogoIcon,
} from "@/components/profile/widgets/WidgetIcons";

interface FootLink {
  label: string;
  href?: string;
  external?: boolean;
}

const COLS: { title: string; links: FootLink[] }[] = [
  {
    title: "General",
    links: [
      { label: "Login", href: "/signin" },
      { label: "Sign Up", href: "/register" },
      { label: "Pricing", href: "/pricing" },
      { label: "Leaderboard", href: "/leaderboard" },
    ],
  },
  {
    title: "Resources",
    links: [{ label: "Help Center" }, { label: "Changelog", href: "/changelog" }],
  },
  {
    title: "Contact",
    links: [
      { label: "Discord Server", href: SITE_CONFIG.links.discord, external: true },
      { label: "Support Email", href: "mailto:support@iuno.lol" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Copyright Policy", href: "/copyright" },
      { label: "Refund Policy", href: "/refund" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-8">
      <div className="w-full">
        <div className="border-t border-white/5 bg-black px-6 md:px-10 pt-14 pb-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
          <nav className="flex flex-wrap gap-10 md:gap-14" aria-label="Footer">
            {COLS.map((col) => (
              <div key={col.title}>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/90 mb-3">
                  {col.title}
                </p>
                <ul className="flex flex-col gap-2">
                  {col.links.map((l) =>
                    l.href ? (
                      l.external ? (
                        <li key={l.label}>
                          <a
                            href={l.href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[12.5px] font-light text-white/50 hover:text-white transition-colors cursor-pointer"
                          >
                            {l.label}
                          </a>
                        </li>
                      ) : (
                        <li key={l.label}>
                          <Link
                            href={l.href}
                            className="text-[12.5px] font-light text-white/50 hover:text-white transition-colors cursor-pointer"
                          >
                            {l.label}
                          </Link>
                        </li>
                      )
                    ) : (
                      <li key={l.label}>
                        <span className="text-[12.5px] font-light text-white/50">
                          {l.label}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </nav>
          <p className="text-[12px] font-light text-white/30 shrink-0">© 2026 iuno.lol</p>
        </div>

        <div className="border-t border-white/5 mt-14 pt-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-semibold tracking-[-0.04em] leading-[0.85] text-white select-none whitespace-nowrap text-[16vw] md:text-[7.5rem]"
            style={{ fontFamily: "var(--font-poppins)" }}
            aria-label="iuno.lol"
          >
            iuno<span className="text-[0.35em] align-baseline ml-[0.08em] tracking-normal text-[#8b93e8]">.lol</span>
          </motion.p>
          <div className="flex flex-col items-start md:items-end gap-4 shrink-0 md:pb-4">
            <div className="flex items-center gap-4">
              <a
                href={SITE_CONFIG.links.discord}
                target="_blank"
                rel="noreferrer"
                title="Discord server"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <DiscordLogoIcon size={20} className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/iunolol"
                target="_blank"
                rel="noreferrer"
                title="GitHub org"
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <GitHubLogoIcon size={20} className="w-5 h-5" />
              </a>
            </div>
            <p className="text-[15px] font-light text-white/70">One link for everything you are.</p>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}
