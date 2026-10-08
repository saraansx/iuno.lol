import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import TemplatePageClient, { type PublicTemplateView } from "@/components/templates/TemplatePageClient";
import { getPublicTemplateBySlug, getViewerFavorite } from "@/lib/features/templates/db";
import { isAuthenticated } from "@/lib/auth/session";
import { SITE_CONFIG } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [];
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const tpl = await getPublicTemplateBySlug(slug);
  if (!tpl) return { title: { absolute: "Template not found" } };

  const creator = tpl.creatorUsername ? `@${tpl.creatorUsername}` : "iuno.lol";
  const description = `Preview "${tpl.name}" by ${creator} — ${tpl.useCount} uses, ${tpl.favoriteCount} favorites. Apply it to your iuno.lol profile in one click.`;
  const url = `${SITE_CONFIG.url}/template/${tpl.slug}`;

  return {
    title: { absolute: `${tpl.name} — ${SITE_CONFIG.name}` },
    description,
    openGraph: {
      title: tpl.name,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: tpl.thumbnailUrl ? [{ url: tpl.thumbnailUrl }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: tpl.name,
      description,
      images: tpl.thumbnailUrl ? [tpl.thumbnailUrl] : undefined,
    },
  };
}

export default async function TemplatePage({ params }: Params) {
  const { slug } = await params;
  const tpl = await getPublicTemplateBySlug(slug);
  if (!tpl) notFound();

  const [auth, favorite] = await Promise.all([isAuthenticated(), getViewerFavorite(tpl.id)]);

  const view: PublicTemplateView = {
    id: tpl.id,
    slug: tpl.slug,
    name: tpl.name,
    thumbnailUrl: tpl.thumbnailUrl,
    shareUrl: `${SITE_CONFIG.url}/template/${tpl.slug}`,
    useCount: tpl.useCount,
    favoriteCount: tpl.favoriteCount,
    creatorUsername: tpl.creatorUsername,
    creatorAvatarUrl: tpl.creatorAvatarUrl,
    favorited: favorite.favorited,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={auth} />
      <TemplatePageClient template={view} isAuthenticated={auth} />
    </div>
  );
}