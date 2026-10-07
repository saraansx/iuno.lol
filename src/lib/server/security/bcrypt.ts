import bcrypt from 'bcrypt'

const BCRYPT_COST = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST)
}

export async function isPasswordCorrect(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword.replace('$2y$', '$2a$'))
}
