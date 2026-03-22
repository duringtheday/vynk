import { NextRequest, NextResponse } from 'next/server'
import { db, users, cards, payments, promoCodes, cardViews, contactSaves, adminLog } from '@/db'
import { eq, desc, gte, and, sql } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { decodeSession, isValid } from '@/lib/admin-auth'
import { stripe } from '@/lib/stripe'

async function requireAdmin() {
  const jar  = await cookies()
  const sess = jar.get('vynk_admin')
  if (!sess?.value) return false
  const s = decodeSession(sess.value)
  return s && isValid(s)
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error:'Unauthorized' }, { status:401 })

  const section = new URL(req.url).searchParams.get('section') || 'overview'
  const today   = new Date(); today.setHours(0,0,0,0)

  if (section === 'overview') {
    const [
      totalUsers, activeCards,
      todayPmts, recentPmts, allPmts,
    ] = await Promise.all([
      db.select({ c: sql<number>`count(*)` }).from(users),
      db.select({ c: sql<number>`count(*)` }).from(cards).where(eq(cards.status,'active')),
      db.select({ sum: sql<number>`coalesce(sum(amount_cents),0)` }).from(payments).where(and(eq(payments.status,'paid'),gte(payments.paidAt,today))),
      db.select().from(payments).orderBy(desc(payments.createdAt)).limit(10),
      db.select({ sum: sql<number>`coalesce(sum(amount_cents),0)` }).from(payments).where(eq(payments.status,'paid')),
    ])
    return NextResponse.json({
      totalUsers:    Number(totalUsers[0].c),
      activeCards:   Number(activeCards[0].c),
      todayCents:    Number(todayPmts[0].sum),
      totalCents:    Number(allPmts[0].sum),
      recentPayments: recentPmts,
    })
  }

  if (section === 'daily') {
    const rows = await db.execute(sql`
      SELECT
        date_trunc('day', paid_at)::date AS day,
        count(*)::int AS transactions,
        coalesce(sum(amount_cents),0)::int AS gross_cents,
        coalesce(sum(discount_cents),0)::int AS discount_cents,
        round(coalesce(sum(amount_cents),0)*0.029 + count(*)*30)::int AS stripe_fee_cents,
        (coalesce(sum(amount_cents),0) - round(coalesce(sum(amount_cents),0)*0.029 + count(*)*30))::int AS net_cents
      FROM payments WHERE status='paid'
      GROUP BY date_trunc('day', paid_at)::date
      ORDER BY day DESC LIMIT 90
    `)
    return NextResponse.json({ daily: rows.rows })
  }

  if (section === 'clients') {
    const data = await db.select().from(users).orderBy(desc(users.createdAt)).limit(500)
    return NextResponse.json({ clients: data })
  }

  if (section === 'orders') {
    const data = await db.select().from(payments).orderBy(desc(payments.createdAt)).limit(500)
    return NextResponse.json({ orders: data })
  }

  if (section === 'accounting') {
    const [monthly, daily] = await Promise.all([
      db.execute(sql`
        SELECT date_trunc('month', paid_at)::date AS month,
          count(*)::int AS transactions,
          coalesce(sum(amount_cents),0)::int AS gross_cents,
          (coalesce(sum(amount_cents),0) - round(coalesce(sum(amount_cents),0)*0.029 + count(*)*30))::int AS net_cents,
          count(*) FILTER (WHERE type='new_card')::int AS new_cards,
          count(*) FILTER (WHERE type='renewal')::int AS renewals
        FROM payments WHERE status='paid'
        GROUP BY date_trunc('month', paid_at)::date
        ORDER BY month DESC LIMIT 24
      `),
      db.execute(sql`
        SELECT date_trunc('day', paid_at)::date AS day,
          count(*)::int AS transactions,
          coalesce(sum(amount_cents),0)::int AS gross_cents,
          round(coalesce(sum(amount_cents),0)*0.029 + count(*)*30)::int AS stripe_fee_cents,
          (coalesce(sum(amount_cents),0) - round(coalesce(sum(amount_cents),0)*0.029 + count(*)*30))::int AS net_cents
        FROM payments WHERE status='paid'
        GROUP BY date_trunc('day', paid_at)::date
        ORDER BY day DESC LIMIT 90
      `),
    ])
    return NextResponse.json({ monthly: monthly.rows, daily: daily.rows })
  }

  if (section === 'metrics') {
    const [totalViews, totalSaves, byCountry, bySrc] = await Promise.all([
      db.select({ c: sql<number>`count(*)` }).from(cardViews),
      db.select({ c: sql<number>`count(*)` }).from(contactSaves),
      db.execute(sql`SELECT country, count(*)::int AS cnt FROM card_views WHERE country IS NOT NULL GROUP BY country ORDER BY cnt DESC LIMIT 20`),
      db.execute(sql`SELECT source, count(*)::int AS cnt FROM card_views WHERE source IS NOT NULL GROUP BY source ORDER BY cnt DESC`),
    ])
    return NextResponse.json({
      totalViews:   Number(totalViews[0].c),
      totalSaves:   Number(totalSaves[0].c),
      byCountry:    byCountry.rows,
      bySource:     bySrc.rows,
    })
  }

  if (section === 'security') {
    const logs = await db.select().from(adminLog).orderBy(desc(adminLog.createdAt)).limit(100)
    return NextResponse.json({ logs })
  }

  if (section === 'promos') {
    const data = await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt))
    return NextResponse.json({ promos: data })
  }

  return NextResponse.json({ error:'Unknown section' }, { status:400 })
}

// DELETE — delete records
export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { table, id } = await req.json()
  const map: Record<string, any> = {
    users, cards, payments, promo_codes: promoCodes,
    card_views: cardViews, admin_log: adminLog,
  }
  const tbl = map[table]
  if (!tbl) return NextResponse.json({ error:'Invalid table' }, { status:400 })
  await db.delete(tbl).where(eq(tbl.id, id))
  return NextResponse.json({ ok: true })
}

// POST — create promo code
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const body = await req.json()

  // Create in Stripe
  try {
    const cp: any = { name: body.code.toUpperCase(), currency:'usd' }
    if (body.discountType==='percent') cp.percent_off = body.discountValue
    else if (body.discountType==='fixed') cp.amount_off = body.discountValue * 100
    else cp.percent_off = 100
    if (body.maxUses)   cp.max_redemptions = body.maxUses
    if (body.expiresAt) cp.redeem_by = Math.floor(new Date(body.expiresAt).getTime()/1000)
    await stripe.coupons.create(cp)
  } catch (e) { console.error('Stripe coupon error:', e) }

  const [promo] = await db.insert(promoCodes).values({
    code:          body.code.toUpperCase(),
    discountType:  body.discountType,
    discountValue: body.discountValue,
    appliesTo:     body.appliesTo || 'both',
    maxUses:       body.maxUses || null,
    expiresAt:     body.expiresAt ? new Date(body.expiresAt) : null,
  }).returning()

  return NextResponse.json({ promo })
}
