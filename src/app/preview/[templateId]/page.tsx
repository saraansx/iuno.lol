import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ProfileView from "@/app/[username]/ProfileView";
import PreviewToolbar from "@/components/templates/PreviewToolbar";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { getTemplateForPreview } from "@/lib/features/templates/db";
import { applyTemplateStyle, templateBackgrounds } from "@/lib/template-style";
import { sanitizeTemplateConfig } from "@/lib/template-config";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: Promise<{ templateId: string }> };

export default async function TemplatePreviewPage({ params }: Params) {
  const { templateId: raw } = await params;
  const id = parseInt(raw, 10);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const userId = await getSessionUserId();
  if (!userId) redirect(`/signin?next=${encodeURIComponent(`/preview/${id}`)}`);

  const template = await getTemplateForPreview(id, userId);
  if (!template) notFound();

  const rows = await db
    .select({ username: schema.users.username })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  const username = rows[0]?.username;
  if (!username) notFound();

  const sanitized = sanitizeTemplateConfig(template.config);
  const styleOverrides = applyTemplateStyle({}, sanitized as Record<string, unknown>);
  const backgrounds = templateBackgrounds(sanitized as Record<string, unknown>);

  return (
    <div className="relative">
      <ProfileView
        username={username}
        isPreview
        styleOverrides={styleOverrides}
        backgroundOverride={backgrounds}
      />
      <PreviewToolbar
        templateId={id}
        templateName={template.name}
        slug={template.slug}
        isPublic={template.isPublic}
        username={username}
      />
    </div>
  );
}