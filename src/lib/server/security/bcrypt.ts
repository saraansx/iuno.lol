import bcrypt from 'bcrypt'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function isPasswordCorrect(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword.replace('$2y$', '$2a$'))
}
