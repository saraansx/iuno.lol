import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PUBLIC_NAME_RE } from "@/lib/features/image-host/unlock";
import UnlockForm from "./UnlockForm";

export const metadata: Metadata = {
  title: "Protected file — iuno",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!PUBLIC_NAME_RE.test(name)) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <UnlockForm name={name} />
    </main>
  );
}
