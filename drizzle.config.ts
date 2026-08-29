import { defineConfig } from 'drizzle-kit'
import fs from 'fs'
import path from 'path'

const envFile = fs.existsSync(path.join(process.cwd(), '.env.local'))
  ? '.env.local'
  : fs.existsSync(path.join(process.cwd(), '.env'))
  ? '.env'
  : null

if (envFile) {
  const content = fs.readFileSync(path.join(process.cwd(), envFile), 'utf8')
  content.split('\n').forEach((line) => {
    const [key, ...vals] = line.split('=')
    if (key && vals.length > 0 && !process.env[key.trim()]) {
      process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '')
    }
  })
}

export default defineConfig({
  dialect: 'mysql',
  schema:  './src/lib/db/schema.ts',
  out:     './drizzle',
  dbCredentials: {
    host:     process.env.DB_HOST!,
    port:     parseInt(process.env.DB_PORT ?? '3306'),
    user:     process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
  },
})
