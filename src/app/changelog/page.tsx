import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { isAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What shipped recently on iuno.lol.",
};

const OWNER = "saraansx";
const REPO = "iuno.lol";

interface GhCommit {
  sha: string;
  commit: {
    message: string;
    author?: { date?: string } | null;
  };
}

interface Item {
  sha: string;
  time: string;
  label: string;
  text: string;
}

const SKIP = /^(merge\b|update(\s|$)[^:]*$)/i;

function classify(raw: string): Item | null {
  const firstLine = raw.split("\n")[0].trim();
  if (!firstLine || SKIP.test(firstLine)) return null;
  const m = firstLine.match(/^([a-z]+)(\(.+\))?(!)?:\s*(.+)$/i);
  if (!m) return { sha: "", time: "", label: "Update", text: firstLine };
  const type = m[1].toLowerCase();
  const label =
    type === "feat" ? "New" : type === "fix" ? "Fix" : type === "perf" ? "Faster" : type === "revert" ? "Revert" : "Update";
  const text = m[4].trim();
  if (!text) return null;
  return { sha: "", time: "", label, text: text.charAt(0).toUpperCase() + text.slice(1) };
}

function labelColor(label: string) {
  switch (label) {
    case "New":
      return "bg-[#5b6cf5]/15 border-[#5b6cf5]/30 text-[#aab2ff]";
    case "Fix":
      return "bg-[#4ade80]/10 border-[#4ade80]/25 text-[#4ade80]";
    case "Faster":
      return "bg-[#facc15]/10 border-[#facc15]/25 text-[#facc15]";
    case "Revert":
      return "bg-[#f87171]/10 border-[#f87171]/25 text-[#f87171]";
    default:
      return "bg-white/[0.05] border-white/10 text-white/60";
  }
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function getChanges(): Promise<{ day: string; items: Item[] }[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "iuno-changelog/1.0",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=40`,
    { headers, next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const commits = (await res.json()) as GhCommit[];
  const byDay = new Map<string, Item[]>();
  for (const c of commits) {
    const item = classify(c.commit.message);
    if (!item) continue;
    const time = c.commit.author?.date ?? "";
    if (!time) continue;
    item.sha = c.sha.slice(0, 7);
    item.time = time;
    const key = time.slice(0, 10);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(item);
  }
  return [...byDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([day, items]) => ({ day, items }));
}

export default async function ChangelogPage() {
  const auth = await isAuthenticated();
  const groups = await getChanges();

  return (
    <div className="min-h-screen flex flex-col">
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-40 h-28 pointer-events-none"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          maskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 35%, transparent 100%)",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)",
        }}
      />
      <Navbar isAuthenticated={auth} />

      <section className="relative w-full max-w-3xl mx-auto px-6 pt-36 pb-10">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#8b93f0] font-medium">
          Changelog
        </p>
        <h1
          className="mt-3 text-5xl md:text-6xl font-semibold text-white tracking-[-0.03em] leading-[0.95]"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          What shipped
        </h1>
        <p className="mt-4 max-w-md text-[15px] text-white/45 leading-relaxed">
          Pulled straight from the repo. Push to main and it shows up here within the hour.
        </p>
      </section>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 pb-20">
        {groups.length === 0 ? (
          <div className="rounded-[20px] border border-white/5 bg-[#0c0c0c] p-8 text-center text-[13.5px] font-light text-white/40">
            Nothing readable yet. Use messages like feat: add dark mode and they will show up here.
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {groups.map((g) => (
              <div key={g.day}>
                <p className="text-[12px] font-medium text-white/40 mb-3">{dayLabel(g.items[0].time)}</p>
                <div className="rounded-[20px] border border-white/5 bg-[#0c0c0c] px-6">
                  {g.items.map((item, i) => (
                    <div
                      key={item.sha + i}
                      className={`flex items-center gap-4 py-4 ${i < g.items.length - 1 ? "border-b border-white/[0.06]" : ""}`}
                    >
                      <span
                        className={`shrink-0 text-[11px] font-medium rounded-full border px-2.5 py-0.5 ${labelColor(item.label)}`}
                      >
                        {item.label}
                      </span>
                      <span className="flex-1 min-w-0 text-[13.5px] font-light text-white/80">{item.text}</span>
                      <span className="shrink-0 text-[11px] font-mono text-white/25">{item.sha}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
