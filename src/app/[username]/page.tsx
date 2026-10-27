import type { Metadata, Viewport } from 'next'
import { SITE_CONFIG } from '@/lib/config'
import { buildOgImageUrl, OG_WIDTH, OG_HEIGHT, normalizeEmbedColor, formatTabTitle } from '@/lib/og'
import { getProfileRows } from './profile-data'
import ProfileView from './ProfileView'
import JsonLd from '@/components/seo/JsonLd'

const absoluteUrl = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `${SITE_CONFIG.url}${url.startsWith('/') ? '' : '/'}${url}`

function plainBio(bio: string | null | undefined): string | null {
  const text = (bio ?? '')
    .replace(/<a?:\w+:\d+>/g, '')
    .replace(/[*_~`|>#]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return null
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text
}

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
  const description =
    row.embedDescription?.trim() ||
    plainBio(row.bio) ||
    `${row.displayName?.trim() || `@${row.username}`} on ${SITE_CONFIG.name}. Links, music and more in one place.`
  const image = buildOgImageUrl(row.username, row)
  return {
    title: { absolute: formatTabTitle(row.tabTitle, row.username) },
    description,
    icons: {
      icon: row.faviconUrl || '/favicon-96.png',
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
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
  const { username: rawUsername } = await params
  const username = rawUsername.toLowerCase().trim()

  const rows = await getProfileRows(username)
  const row = rows[0]

  const profileJsonLd = row
    ? {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        url: `${SITE_CONFIG.url}/${row.username}`,
        name: row.displayName?.trim() || `@${row.username}`,
        mainEntity: {
          '@type': 'Person',
          name: row.displayName?.trim() || row.username,
          alternateName: `@${row.username}`,
          url: `${SITE_CONFIG.url}/${row.username}`,
          ...(row.avatarUrl ? { image: absoluteUrl(row.avatarUrl) } : {}),
          ...(row.bio?.trim() ? { description: row.bio.trim() } : {}),
        },
      }
    : null

  return (
    <>
      {profileJsonLd && <JsonLd data={profileJsonLd} />}
      <ProfileView username={username} />
    </>
  )
}
