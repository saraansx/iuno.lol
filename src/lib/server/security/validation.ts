export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required.'
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters.'
  }
  if (password.length > 128) {
    return 'Password must be 128 characters or fewer.'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must include an uppercase letter.'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must include a number.'
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must include a special character.'
  }
  return null
}

export function validateUsername(username: string): string | null {
  if (!username) {
    return 'Username is required.'
  }
  if (username.length < 3 || username.length > 32) {
    return 'Username must be between 3 and 32 characters.'
  }
  if (!/^[a-z0-9_.]+$/.test(username)) {
    return 'Invalid username characters.'
  }
  if (!/^[a-z0-9]$/.test(username.slice(-1))) {
    return 'Username must end with a letter or number.'
  }
  return null
}

export function validateEmail(email: string): string | null {
  if (!email) {
    return 'Email is required.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Invalid email format.'
  }
  return null
}
