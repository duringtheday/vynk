// src/app/api/promos/validate/route.ts
//
// Valida un código promo y devuelve:
//   - valid, discountType, discountValue, appliesTo
//   - phoneBypass: true si el código tiene phone_bypass activado
//   - globalPhoneMode: 'required' | 'optional' | 'off' (del panel de admin)

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { promoCodes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

async function getPhoneMode(): Promise<string> {
  try {
    const result = await db.execute(sql`
      SELECT value FROM app_settings WHERE key = 'phone_filter_mode' LIMIT 1
    `)
    return (result.rows[0]?.value as string) ?? 'required'
  } catch {
    return 'required'
  }
}

export async function POST(req: NextRequest) {
  const { code } = await req.json()

  // Siempre devolvemos globalPhoneMode aunque no vengan con código
  const globalPhoneMode = await getPhoneMode()

  if (!code) {
    return NextResponse.json({ valid: false, error: 'No code provided', globalPhoneMode })
  }

  try {
    const [promo] = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.code, String(code).toUpperCase()))
      .limit(1)

    if (!promo || !promo.isActive) {
      return NextResponse.json({ valid: false, error: 'Código inválido o inactivo', globalPhoneMode })
    }
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: 'El código ha expirado', globalPhoneMode })
    }
    if (promo.maxUses && promo.usesCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, error: 'El código ha alcanzado su límite', globalPhoneMode })
    }

    return NextResponse.json({
      valid:           true,
      discountType:    promo.discountType,
      discountValue:   promo.discountValue,
      appliesTo:       promo.appliesTo,
      phoneBypass:     promo.phoneBypass,   // ← del campo en DB
      globalPhoneMode,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, globalPhoneMode }, { status: 500 })
  }
}

// GET — solo para que el sign-up page consulte el modo global sin código
export async function GET() {
  const globalPhoneMode = await getPhoneMode()
  return NextResponse.json({ globalPhoneMode })
}
