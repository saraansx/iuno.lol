import Image from "next/image";
import Link from "next/link";

const FEATURED = [
  { username: "rio", avatar: "https://cdn.iuno.lol/u1_1792451650521_5crqmd.png" },
  { username: "rex", avatar: "https://cdn.iuno.lol/FVw6j.png" },
  { username: "ok", avatar: "https://cdn.iuno.lol/qExj4.png" },
  { username: "ma", avatar: "https://cdn.iuno.lol/4o2ZJ.png" },
  { username: "coffeeholic", avatar: "https://cdn.iuno.lol/FRwkq.png" },
  { username: "qq", avatar: "https://cdn.iuno.lol/ktOew.png" },
  { username: "xd", avatar: "https://cdn.iuno.lol/u109_1792433921232_toathh.gif" },
  { username: "miloj", avatar: "https://cdn.iuno.lol/u22_1792867417028_gxhtkf.png" },
  { username: "uno", avatar: "https://cdn.iuno.lol/ktOew.png" },
  { username: "sat_halder", avatar: "https://cdn.iuno.lol/u203_1792958001885_e48uzp.png" },
  { username: "axmyouknow", avatar: "https://cdn.iuno.lol/u69_1792705562634_oksdsq.png" },
  { username: "kqll", avatar: null },
  { username: "zenitx", avatar: "https://cdn.iuno.lol/u110_1792431895108_7ikn30.png" },
  { username: "xylen", avatar: "https://cdn.iuno.lol/u196_1792874022167_3b73ny.png" },
  { username: "katrixgamerz", avatar: "https://cdn.iuno.lol/u207_1793013244566_qenogy.webp" },
];

function Row({ copy }: { copy: boolean }) {
  return (
    <ul className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={copy || undefined}>
      {FEATURED.map((p) => (
        <li key={p.username}>
          <Link
            href={`/${p.username}`}
            tabIndex={copy ? -1 : undefined}
            className="flex items-center gap-3 text-white/85 hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-comfortaa)" }}
          >
            {p.avatar ? (
              <Image
                src={p.avatar}
                alt=""
                width={32}
                height={32}
                unoptimized
                draggable={false}
                className="h-8 w-8 rounded-full object-cover bg-white/5"
              />
            ) : (
              <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[13px] uppercase text-white/70">
                {p.username[0]}
              </span>
            )}
            <span className="text-[14px] font-medium">/{p.username}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function FeaturedProfiles() {
  return (
    <section
      aria-label="Featured profiles"
      className="relative z-10 w-full overflow-hidden pt-4 pb-14 sm:pb-20"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div className="featured-marquee flex w-max">
        <Row copy={false} />
        <Row copy />
      </div>
    </section>
  );
}
