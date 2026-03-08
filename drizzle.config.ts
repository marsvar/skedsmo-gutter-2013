import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Prefer the pooler URL (IPv4-reachable) if set, fall back to direct connection.
    // Transaction-mode pooler (port 6543) supports DDL statements needed by drizzle-kit.
    url: (process.env.DATABASE_POOL_URL ?? process.env.DATABASE_URL)!,
  },
})
