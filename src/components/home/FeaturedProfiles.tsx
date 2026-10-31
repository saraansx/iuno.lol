import Image from "next/image";
import Link from "next/link";

export const FEATURED_USERNAMES = [
  "rio", "rex", "ok", "ma", "coffeeholic", "qq", "xd", "miloj", "uno",
  "sat_halder", "axmyouknow", "kqll", "zenitx", "xylen", "katrixgamerz",
];

export type FeaturedAvatars = Record<string, string | null>;

function Row({ copy, avatars }: { copy: boolean; avatars: FeaturedAvatars }) {
  return (
    <ul className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={copy || undefined}>
      {FEATURED_USERNAMES.map((username) => ({ username, avatar: avatars[username] ?? null })).map((p) => (
        <li key={p.username}>
          <Link
            href={`/${p.username}`}
            target="_blank"
            rel="noopener noreferrer"
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

export default function FeaturedProfiles({ avatars }: { avatars: FeaturedAvatars }) {
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
        <Row copy={false} avatars={avatars} />
        <Row copy avatars={avatars} />
      </div>
    </section>
  );
}
