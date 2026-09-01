import { timingSafeEqual } from 'crypto'

export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const provided = request.headers.get('authorization')
  if (!provided) return false

  const a = Buffer.from(provided)
  const b = Buffer.from(`Bearer ${secret}`)
  return a.length === b.length && timingSafeEqual(a, b)
}
