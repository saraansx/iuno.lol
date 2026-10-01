import Link from "next/link";
import { getSessionUserId } from "@/lib/auth/session";
import { hasImageHostAccess } from "@/lib/features/image-host/access";
import { IMAGE_HOST_PLAN } from "@/lib/payments/plans";

export default async function ImageHostLayout({ children }: { children: React.ReactNode }) {
  const userId = await getSessionUserId();
  if (userId && (await hasImageHostAccess(userId))) return <>{children}</>;

  const { USD, INR } = IMAGE_HOST_PLAN;
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-[20px] border border-white/5 bg-[#0c0c0c] p-6 text-center shadow-sm">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5b6cf5]/15 text-[#aab4ff]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
        <h1 className="mt-4 text-[14px] font-normal tracking-tight text-white/90">Image Host is locked</h1>
        <p className="mt-1.5 text-[12.5px] font-light leading-relaxed text-white/40">
          Unlock 50 GB of storage, short share links, password-protected files and the Image Host badge.
          One-time payment of {USD.symbol}{USD.display} / {INR.symbol}{INR.display}.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <Link
            href="/checkout/image-host"
            className="rounded-xl bg-[#5b6cf5]/20 px-4 py-2 text-[13px] font-normal text-white transition-colors hover:bg-[#5b6cf5]/30"
          >
            Unlock Image Host
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-[13px] font-normal text-white/80 transition-colors hover:bg-white/[0.09]"
          >
            View pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
