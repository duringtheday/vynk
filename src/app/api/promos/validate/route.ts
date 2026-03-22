import { NextRequest, NextResponse } from 'next/server'
import { db, promoCodes } from '@/db'
import { eq, and } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get('code')
  if (!code) return NextResponse.json({ valid: false })

  const [promo] = await db.select().from(promoCodes)
    .where(and(eq(promoCodes.code, code.toUpperCase()), eq(promoCodes.isActive, true)))
    .limit(1)

  if (!promo) return NextResponse.json({ valid:false, error:'Invalid code' })
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date())
    return NextResponse.json({ valid:false, error:'Code expired' })
  if (promo.maxUses && promo.usesCount >= promo.maxUses)
    return NextResponse.json({ valid:false, error:'Code fully redeemed' })

  return NextResponse.json({
    valid: true,
    discountType:  promo.discountType,
    discountValue: promo.discountValue,
    appliesTo:     promo.appliesTo,
  })
}
