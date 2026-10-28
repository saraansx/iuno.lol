import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "iuno.lol" },
  robots: { index: false, follow: false },
};

export default async function CustomDomainPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 text-center">
      <h1 className="text-[22px] sm:text-[28px] font-normal tracking-tight text-white">
        This domain is part of the <span className="text-[#5b6cf5]">iuno.lol</span> {type === "image_host" ? "image hosting" : "profile"} service.
      </h1>
    </main>
  );
}
