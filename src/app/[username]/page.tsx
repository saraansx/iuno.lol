import type { Metadata, Viewport } from 'next'
import { SITE_CONFIG } from '@/lib/config'
import { buildOgImageUrl, OG_WIDTH, OG_HEIGHT, normalizeEmbedColor, formatTabTitle } from '@/lib/og'
import { getProfileRows } from './profile-data'
import ProfileView from './ProfileView'

export const revalidate = 604800;

export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export async function generateViewport(
  { params }: { params: Promise<{ username: string }> }
): Promise<Viewport> {
  const { username: rawUsername } = await params
  const username = rawUsername.toLowerCase().trim()

  const rows = await getProfileRows(username)

  return { themeColor: normalizeEmbedColor(rows[0]?.embedColor) }
}

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username: rawUsername } = await params
  const username = rawUsername.toLowerCase().trim()

  const rows = await getProfileRows(username)

  if (rows.length === 0) {
    return { title: { absolute: SITE_CONFIG.name } }
  }

  const row = rows[0]
  const title = row.embedTitle?.trim() || `@${row.username}`
  const description = row.embedDescription?.trim() || undefined
  const image = buildOgImageUrl(row.username, row)
  return {
    title: { absolute: formatTabTitle(row.tabTitle, row.username) },
    description,
    icons: { icon: row.faviconUrl || '/Favicon.png' },
    alternates: {
      canonical: `/${row.username}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_CONFIG.url}/${row.username}`,
      siteName: SITE_CONFIG.name,
      images: [{ url: image, width: OG_WIDTH, height: OG_HEIGHT }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return <ProfileView username={username} />
}
