import type { Metadata } from "next";
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

const OWNER = "iunolol";
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
  text: string;
}

const SKIP = /^(merge\b|update(\s|$)[^:]*$)/i;

function classify(raw: string): Item | null {
  const firstLine = raw.split("\n")[0].trim();
  if (!firstLine || SKIP.test(firstLine)) return null;
  const m = firstLine.match(/^[a-z]+(\(.+\))?(!)?:\s*(.+)$/i);
  const text = m ? m[3].trim() : firstLine;
  if (!text) return null;
  return { sha: "", time: "", text: text.charAt(0).toUpperCase() + text.slice(1) };
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
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

async function getChanges(): Promise<{ day: string; items: Item[] }[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "iuno-changelog/1.0",
  };
  if (process.env.GITHUB_CHANGELOG_TOKEN)
    headers.Authorization = `Bearer ${process.env.GITHUB_CHANGELOG_TOKEN}`;
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
    .map(([day, items]) => ({ day, items }))
    .filter((g) => g.items.length > 0);
}

export default async function ChangelogPage() {
  const auth = await isAuthenticated();
  const groups = await getChanges();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <TopFade />
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
      </section>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 pb-24">
        {groups.length === 0 ? (
          <div className="rounded-[20px] border border-white/[0.07] bg-[#151515] p-10 text-center text-[13.5px] font-light text-white/40">
            Nothing here yet. Updates show up within the hour of a push.
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {groups.map((g) => (
              <section key={g.day}>
                <p className="mb-4 text-[13px] font-medium text-white/45">
                  {dayLabel(g.items[0].time)}
                </p>
                <div className="rounded-[20px] border border-white/[0.07] bg-[#151515] px-6 py-5 flex flex-col gap-3.5">
                  {g.items.map((item) => (
                    <a
                      key={item.sha + item.text}
                      href={`https://github.com/${OWNER}/${REPO}/commit/${item.sha}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-3 text-[14px] font-light leading-relaxed text-white/65 transition-colors hover:text-white/95"
                    >
                      <span className="select-none text-white/25 transition-colors group-hover:text-[#5b6cf5]">
                        -
                      </span>
                      <span className="min-w-0">
                        {item.text}
                        <span className="ml-2 font-mono text-[11px] text-white/20 transition-colors group-hover:text-white/45">
                          {item.sha}
                        </span>
                      </span>
                    </a>
                  ))}
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
