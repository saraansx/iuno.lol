import type { Metadata } from 'next'
import ProfileView from '../ProfileView'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfileShotPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return <ProfileView username={username} isScreenshot />
}
