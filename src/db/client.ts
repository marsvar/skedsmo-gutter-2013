import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// At runtime on Vercel/serverless, use the pooler URL.
// Locally (and for migrations), the direct URL is used via drizzle.config.ts.
const connectionString = process.env.DATABASE_POOL_URL ?? process.env.DATABASE_URL

// Provide a dummy connection string during build so the module loads without crashing.
// Any DB calls made at build time against this will fail gracefully in the try/catch
// wrappers in db-season.ts and db-matches.ts.
const client = postgres(connectionString ?? 'postgresql://localhost/placeholder', {
  prepare: false,
  ...(connectionString ? {} : { max: 0 }),
})

export const db = drizzle(client, { schema })

export type DB = typeof db
