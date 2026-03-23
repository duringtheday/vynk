import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeSession, isValid } from '@/lib/admin-auth'
import { db } from '@/db'
import { users, cards, payments, promoCodes, cardViews, contactSaves, adminLog } from '@/db/schema'
import { eq, desc, gte, and, sql, count } from 'drizzle-orm'

async function checkAuth() {
  const jar = await cookies()
  const cookie = jar.get('vynk_admin')
  if (!cookie?.value) return false
  try {
    const s = decodeSession(cookie.value)
    return isValid(s)
  } catch { return false }
}

export async function GET(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const section = req.nextUrl.searchParams.get('section') || 'overview'

  try {
    if (section === 'overview') {
      const today = new Date(); today.setHours(0,0,0,0)
      const [todayRow] = await db.select({ cents: sql<number>`coalesce(sum(amount_cents),0)` })
        .from(payments).where(and(eq(payments.status,'paid'), gte(payments.paidAt, today)))
      const [totalRow] = await db.select({ cents: sql<number>`coalesce(sum(amount_cents),0)` })
        .from(payments).where(eq(payments.status,'paid'))
      const [cardCount] = await db.select({ n: count() }).from(cards).where(eq(cards.status,'active'))
      const [userCount] = await db.select({ n: count() }).from(users)
      const recent = await db.select().from(payments).orderBy(desc(payments.createdAt)).limit(10)
      return NextResponse.json({
        todayCents: Number(todayRow?.cents||0),
        totalCents: Number(totalRow?.cents||0),
        activeCards: Number(cardCount?.n||0),
        totalUsers: Number(userCount?.n||0),
        recentPayments: recent,
      })
    }

    if (section === 'daily') {
      const rows = await db.execute(sql`
        SELECT date_trunc('day', paid_at)::date as day,
          count(*) as transactions,
          coalesce(sum(amount_cents),0) as gross_cents,
          coalesce(sum(round(amount_cents * 0.029 + 30)),0) as stripe_fee_cents,
          coalesce(sum(amount_cents) - sum(round(amount_cents * 0.029 + 30)),0) as net_cents
        FROM payments WHERE status='paid' AND paid_at IS NOT NULL
        GROUP BY 1 ORDER BY 1 DESC LIMIT 90
      `)
      return NextResponse.json({ daily: rows.rows })
    }

    if (section === 'clients') {
      const all = await db.select().from(users).orderBy(desc(users.createdAt))
      return NextResponse.json({ clients: all })
    }

    if (section === 'orders') {
      const all = await db.select().from(payments).orderBy(desc(payments.createdAt))
      return NextResponse.json({ orders: all })
    }

    if (section === 'accounting') {
      const monthly = await db.execute(sql`
        SELECT date_trunc('month', paid_at)::date as month,
          count(*) as transactions,
          coalesce(sum(amount_cents),0) as gross_cents,
          coalesce(sum(amount_cents) - sum(round(amount_cents * 0.029 + 30)),0) as net_cents,
          count(*) filter (where type='new_card') as new_cards,
          count(*) filter (where type='renewal') as renewals
        FROM payments WHERE status='paid' AND paid_at IS NOT NULL
        GROUP BY 1 ORDER BY 1 DESC
      `)
      const daily = await db.execute(sql`
        SELECT date_trunc('day', paid_at)::date as day,
          count(*) as transactions,
          coalesce(sum(amount_cents),0) as gross_cents,
          coalesce(sum(round(amount_cents * 0.029 + 30)),0) as stripe_fee_cents,
          coalesce(sum(amount_cents) - sum(round(amount_cents * 0.029 + 30)),0) as net_cents
        FROM payments WHERE status='paid' AND paid_at IS NOT NULL
        GROUP BY 1 ORDER BY 1 DESC LIMIT 90
      `)
      return NextResponse.json({ monthly: monthly.rows, daily: daily.rows })
    }

    if (section === 'metrics') {
      const [totalViews] = await db.select({ n: count() }).from(cardViews)
      const [totalSaves] = await db.select({ n: count() }).from(contactSaves)
      const byCountry = await db.execute(sql`SELECT country, count(*) as cnt FROM card_views GROUP BY country ORDER BY cnt DESC LIMIT 10`)
      const bySource  = await db.execute(sql`SELECT source, count(*) as cnt FROM card_views GROUP BY source ORDER BY cnt DESC`)
      return NextResponse.json({
        totalViews: Number(totalViews?.n||0),
        totalSaves: Number(totalSaves?.n||0),
        byCountry: byCountry.rows,
        bySource: bySource.rows,
      })
    }

    if (section === 'promos') {
      const all = await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt))
      return NextResponse.json({ promos: all })
    }

    if (section === 'security') {
      const logs = await db.select().from(adminLog).orderBy(desc(adminLog.createdAt)).limit(100)
      return NextResponse.json({ logs })
    }

    if (section === 'mycard') {
      return NextResponse.json({ ok: true })
    }

    if (section === 'rules') {
      return NextResponse.json({ ok: true })
    }

    if (section === 'compliance') {
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({})
  } catch (e: any) {
    console.error('Dashboard error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  try {
    const [promo] = await db.insert(promoCodes).values({
      code: body.code.toUpperCase(),
      discountType: body.discountType,
      discountValue: Number(body.discountValue) || 0,
      appliesTo: body.appliesTo || 'both',
      maxUses: body.maxUses ? Number(body.maxUses) : null,
      isActive: true,
    }).returning()
    return NextResponse.json({ promo })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, isActive } = await req.json()
  await db.update(promoCodes).set({ isActive }).where(eq(promoCodes.id, id))
  return NextResponse.json({ ok: true })
}
