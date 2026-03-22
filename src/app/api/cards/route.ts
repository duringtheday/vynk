import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, users, cards } from '@/db'
import { eq, and } from 'drizzle-orm'
import { createCheckoutSession } from '@/lib/stripe'
import { generateSlug } from '@/lib/qr'
import { requiresPayment } from '@/lib/rules'

// GET — fetch current user's active card
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error:'Unauthorized' }, { status:401 })

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1)
  if (!user) return NextResponse.json({ card: null })

  const [card] = await db.select().from(cards)
    .where(and(eq(cards.userId, user.id), eq(cards.status, 'active'))).limit(1)

  return NextResponse.json({ card: card || null })
}

// POST — create/renew card → Stripe checkout (or free for owner)
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error:'Unauthorized' }, { status:401 })

  const body = await req.json()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  // Upsert user
  let [user] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1)
  if (!user) {
    const [created] = await db.insert(users).values({
      clerkId: userId,
      fullName: body.fullName,
      isOwner: userId === process.env.OWNER_CLERK_ID,
    }).returning()
    user = created
  }

  // Check existing active card
  const [existing] = await db.select().from(cards)
    .where(and(eq(cards.userId, user.id), eq(cards.status, 'active'))).limit(1)

  const isRenewal = !!existing
  const slug = generateSlug(body.fullName)

  // Create draft card
  const [card] = await db.insert(cards).values({
    userId: user.id, slug, status: 'draft',
    fullName: body.fullName, title: body.title, company: body.company,
    photoUrl: body.photoUrl || null, logoUrl: body.logoUrl || null,
    phone: body.phone, whatsapp: body.whatsapp, email: body.email,
    tagline: body.tagline, bio: body.bio, services: body.services || [],
    telegram: body.telegram, instagram: body.instagram, linkedin: body.linkedin,
    twitter: body.twitter, tiktok: body.tiktok, youtube: body.youtube,
    website: body.website, address: body.address, design: body.design,
  }).returning()

  // Owner → free publish
  if (user.isOwner) {
    if (existing) await db.update(cards).set({ status:'archived', archivedAt: new Date() }).where(eq(cards.id, existing.id))
    await db.update(cards).set({ status:'active', publishedAt: new Date() }).where(eq(cards.id, card.id))
    return NextResponse.json({ free:true, slug })
  }

  // Stripe checkout
  const session = await createCheckoutSession({
    userId: user.id, cardId: card.id,
    type: isRenewal ? 'renewal' : 'new_card',
    promoCode: body.promoCode,
    successUrl: `${appUrl}/checkout/success?slug=${slug}&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl:  `${appUrl}/builder?cancelled=true`,
  })

  return NextResponse.json({ url: session.url })
}

// PATCH — free update (back fields + design only)
export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error:'Unauthorized' }, { status:401 })

  const body = await req.json()
  const [user] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1)
  if (!user) return NextResponse.json({ error:'User not found' }, { status:404 })

  // Reject if any paid field is in the update
  const changedKeys = Object.keys(body)
  if (!user.isOwner && requiresPayment(changedKeys)) {
    return NextResponse.json({ error:'Paid fields require renewal payment', paidFields: changedKeys }, { status:402 })
  }

  // Only allow free fields
  const allowed = ['tagline','bio','services','telegram','instagram','linkedin','twitter','tiktok','youtube','website','address','design']
  const update: Record<string,any> = {}
  for (const key of changedKeys) {
    if (allowed.includes(key)) update[key] = body[key]
  }
  update.updatedAt = new Date()

  const [updated] = await db.update(cards).set(update)
    .where(and(eq(cards.userId, user.id), eq(cards.status, 'active')))
    .returning()

  return NextResponse.json({ card: updated })
}
