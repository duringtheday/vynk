// src/app/api/admin/phone-settings/route.ts
//
// Guarda la configuración del filtro de teléfono en la DB de Neon.
// NO llama a Clerk API (requiere plan Pro).
// El valor se lee en sign-up para controlar el comportamiento del formulario.

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeSession, isValid } from '@/lib/admin-auth'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

async function checkAuth() {
  const jar = await cookies()
  const cookie = jar.get('vynk_admin')
  if (!cookie?.value) return false
  try {
    const s = decodeSession(cookie.value)
    return s ? isValid(s) : false
  } catch { return false }
}

// Asegura que la tabla exista (se crea al primer GET/PATCH)
async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)
}

// GET — devuelve el modo actual del filtro de teléfono
// Valores posibles: 'required' | 'optional' | 'off'
export async function GET() {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await ensureTable()
    const result = await db.execute(sql`
      SELECT value FROM app_settings WHERE key = 'phone_filter_mode' LIMIT 1
    `)
    const mode = (result.rows[0]?.value as string) ?? 'required'
    return NextResponse.json({ mode })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH — cambia el modo
// body: { mode: 'required' | 'optional' | 'off' }
export async function PATCH(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { mode } = await req.json()
  if (!['required', 'optional', 'off'].includes(mode)) {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  }
  try {
    await ensureTable()
    await db.execute(sql`
      INSERT INTO app_settings (key, value, updated_at)
      VALUES ('phone_filter_mode', ${mode}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${mode}, updated_at = NOW()
    `)
    return NextResponse.json({ ok: true, mode })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
