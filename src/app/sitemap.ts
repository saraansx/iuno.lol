import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/config";

const SITE_LAST_UPDATED = new Date("2026-10-21T00:00:00.000Z");

const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: SITE_CONFIG.url,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${SITE_CONFIG.url}/pricing`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${SITE_CONFIG.url}/leaderboard`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "daily",
    priority: 0.7,
  },
  {
    url: `${SITE_CONFIG.url}/changelog`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "weekly",
    priority: 0.6,
  },
  {
    url: `${SITE_CONFIG.url}/terms`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${SITE_CONFIG.url}/privacy`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${SITE_CONFIG.url}/refund`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${SITE_CONFIG.url}/copyright`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = STATIC_PAGES;

  let dynamicPages: MetadataRoute.Sitemap = [];
  try {
    const [templateRows, profileRows] = await Promise.all([
      db
        .select({
          slug: schema.templates.slug,
          updatedAt: schema.templates.updatedAt,
        })
        .from(schema.templates)
        .where(eq(schema.templates.isPublic, true)),
      db
        .select({
          username: schema.users.username,
          updatedAt: schema.users.updatedAt,
        })
        .from(schema.users)
        .where(eq(schema.users.needsUsername, false)),
    ]);

    dynamicPages = [
      ...templateRows.map((tpl) => ({
        url: `${SITE_CONFIG.url}/template/${tpl.slug}`,
        lastModified: tpl.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...profileRows.map((profile) => ({
        url: `${SITE_CONFIG.url}/${profile.username}`,
        lastModified: profile.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    ];
  } catch (error) {
    console.error("[sitemap] failed to load dynamic entries:", error);
  }

  return [...staticPages, ...dynamicPages];
}
