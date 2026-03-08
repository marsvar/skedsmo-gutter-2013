#!/usr/bin/env node
/**
 * scripts/migrate.mjs
 *
 * Applies all pending Drizzle migrations to Supabase.
 * Reads DATABASE_URL from .env.local (direct connection).
 * Usage: node scripts/migrate.mjs
 */

import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createReadStream } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Load .env.local manually
const envPath = resolve(root, '.env.local')
const envContent = readFileSync(envPath, 'utf8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  const val = trimmed.slice(eq + 1).trim()
  if (!process.env[key]) process.env[key] = val
}

const { default: postgres } = await import('postgres')

// Prefer the pooler URL (IPv4-reachable); fall back to direct connection.
// We replace port 6543 (Transaction pooler) with 5432 (Session pooler)
// because Session mode supports DDL statements needed for migrations.
let url = process.env.DATABASE_POOL_URL ?? process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_POOL_URL or DATABASE_URL not set in .env.local')

// If we got the Transaction-mode pooler (port 6543), switch to Session mode (port 5432)
url = url.replace(':6543/', ':5432/')
console.log(`Connecting to: ${url.replace(/:([^:@]+)@/, ':***@')}`)

const sql = postgres(url, {
  ssl: { rejectUnauthorized: false },
  connect_timeout: 15,
})

// Read all migration SQL files in order
const migrationsDir = resolve(root, 'drizzle')
const sqlFiles = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort()

console.log(`Found ${sqlFiles.length} migration file(s):`)
for (const file of sqlFiles) {
  console.log(`  → ${file}`)
}

for (const file of sqlFiles) {
  const sqlText = readFileSync(resolve(migrationsDir, file), 'utf8')
  console.log(`\nRunning ${file}...`)
  // Split on the drizzle statement breakpoints, or just run the whole file
  await sql.unsafe(sqlText)
  console.log(`✓ ${file} applied`)
}

await sql.end()
console.log('\n✓ All migrations applied.')
