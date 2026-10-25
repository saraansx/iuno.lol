export class UserFacingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserFacingError'
  }
}

export function duplicateKey(err: unknown): string | null {
  type DbError = { code?: string; sqlMessage?: string; cause?: DbError }
  const e = err as DbError | null
  const dup = e?.code === 'ER_DUP_ENTRY' ? e : e?.cause?.code === 'ER_DUP_ENTRY' ? e.cause : null
  if (!dup) return null
  return dup.sqlMessage?.match(/for key '(?:[^.']+\.)?([^'.]+)'$/)?.[1] ?? ''
}
