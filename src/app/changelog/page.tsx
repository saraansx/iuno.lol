import type { Metadata } from "next";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopFade from "@/components/ui/top-fade";
import { isAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What shipped recently on iuno.lol.",
  alternates: {
    canonical: "/changelog",
  },
};

const CHANGELOG_PATH = path.join(process.cwd(), "changelog.md");

type Entry =
  | { kind: "bullet"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "text"; text: string };

interface Section {
  title: string;
  entries: Entry[];
}

const INLINE_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function readChangelog(): string {
  try {
    return readFileSync(CHANGELOG_PATH, "utf8");
  } catch {
    return "";
  }
}

function parseChangelog(markdown: string): Section[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const sections: Section[] = [];
  let current: Section | null = null;
  let paragraph: string[] = [];

  const ensureSection = (): Section => {
    if (!current) {
      current = { title: "", entries: [] };
      sections.push(current);
    }
    return current;
  };

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    ensureSection().entries.push({ kind: "text", text: paragraph.join(" ") });
    paragraph = [];
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      current = { title: line.slice(3).trim(), entries: [] };
      sections.push(current);
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      ensureSection().entries.push({ kind: "heading", text: line.slice(4).trim() });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      ensureSection().entries.push({ kind: "bullet", text: line.replace(/^[-*]\s+/, "") });
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();

  return sections.filter((section) => section.entries.length > 0);
}

function safeHref(href: string): string | null {
  return /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(href) ? href : null;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let index = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));

    const token = match[0];
    const key = `${keyPrefix}-${index++}`;

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-medium text-white/90">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12.5px] text-white/80"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      const href = link ? safeHref(link[2]) : null;

      if (link && href) {
        const external = /^https?:\/\//i.test(href);
        nodes.push(
          <a
            key={key}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="text-[#8b93f0] underline decoration-[#8b93f0]/30 underline-offset-2 transition-colors hover:text-white hover:decoration-white/30"
          >
            {link[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    }

    last = start + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default async function ChangelogPage() {
  const auth = await isAuthenticated();
  const sections = parseChangelog(readChangelog());

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <TopFade />
      <Navbar isAuthenticated={auth} />

      <section className="relative w-full max-w-3xl mx-auto px-6 pt-36 pb-10">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#8b93f0] font-medium">Changelog</p>
        <h1
          className="mt-3 text-5xl md:text-6xl font-semibold text-white tracking-[-0.03em] leading-[0.95]"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          What shipped
        </h1>
      </section>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pb-24">
        {sections.length === 0 ? (
          <div className="rounded-[20px] border border-white/[0.07] bg-[#151515] p-10 text-center text-[13.5px] font-light text-white/40">
            Nothing here yet. Add an entry to changelog.md.
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {sections.map((section, sectionIndex) => (
              <section key={`${sectionIndex}-${section.title}`}>
                {section.title ? (
                  <p className="mb-4 text-[13px] font-medium text-white/45">{section.title}</p>
                ) : null}
                <div className="flex flex-col gap-3.5 rounded-[20px] border border-white/[0.07] bg-[#151515] px-5 py-5 sm:px-6">
                  {section.entries.map((entry, entryIndex) => {
                    const key = `${sectionIndex}-${entryIndex}`;

                    if (entry.kind === "heading") {
                      return (
                        <p key={key} className="text-[13px] font-medium break-words text-white/80">
                          {renderInline(entry.text, key)}
                        </p>
                      );
                    }

                    if (entry.kind === "text") {
                      return (
                        <p
                          key={key}
                          className="text-[14px] font-light leading-relaxed break-words text-white/65"
                        >
                          {renderInline(entry.text, key)}
                        </p>
                      );
                    }

                    return (
                      <div
                        key={key}
                        className="flex gap-3 text-[14px] font-light leading-relaxed break-words text-white/65"
                      >
                        <span className="select-none text-white/25">-</span>
                        <span className="min-w-0">{renderInline(entry.text, key)}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
