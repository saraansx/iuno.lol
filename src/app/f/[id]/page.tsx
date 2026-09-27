import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicImageHostFile } from "@/lib/features/image-host/db";
import PublicFileView from "./PublicFileView";

const ID_RE = /^[A-Za-z0-9._-]+$/;

async function load(id: string) {
  if (!id || id.length > 128 || !ID_RE.test(id)) return null;
  return getPublicImageHostFile(id);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const file = await load(id);
  if (!file) return { title: "File not found — iuno" };
  const isVideo = file.kind === "video";
  return {
    title: `${file.name} — iuno`,
    description: `Uploaded by ${file.ownerUsername}`,
    openGraph: {
      title: file.name,
      description: `Uploaded by ${file.ownerUsername}`,
      ...(isVideo ? { videos: [{ url: file.url }] } : { images: [{ url: file.url }] }),
    },
    twitter: {
      card: isVideo ? "player" : "summary_large_image",
      title: file.name,
      description: `Uploaded by ${file.ownerUsername}`,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await load(id);
  if (!file) notFound();

  return (
    <PublicFileView
      url={file.url}
      name={file.name}
      size={file.size}
      kind={file.kind}
      createdAt={file.createdAt}
      owner={file.ownerUsername}
    />
  );
}
