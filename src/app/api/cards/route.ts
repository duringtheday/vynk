import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users, cards, promoCodes } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { createCheckoutSession } from '@/lib/stripe'
import { generateSlug } from '@/lib/qr'
import { requiresPayment } from '@/lib/rules'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  let [user] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1)
  if (!user) return NextResponse.json({ card: null, isOwner: false })
  const [card] = await db.select().from(cards)
    .where(and(eq(cards.userId, user.id), eq(cards.status,'active'))).limit(1)
  return NextResponse.json({ card: card||null, isOwner: user.isOwner })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const body = await req.json()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const isOwnerClerk = userId === process.env.OWNER_CLERK_ID

  // Upsert user
  let [user] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1)
  if (!user) {
    const [created] = await db.insert(users).values({
      clerkId: userId, fullName: body.fullName, isOwner: isOwnerClerk,
    }).returning()
    user = created
  } else if (!user.isOwner && isOwnerClerk) {
    const [updated] = await db.update(users).set({ isOwner: true })
      .where(eq(users.id, user.id)).returning()
    user = updated
  }

  const [existing] = await db.select().from(cards)
    .where(and(eq(cards.userId, user.id), eq(cards.status,'active'))).limit(1)

  const slug = generateSlug(body.fullName)

  const [card] = await db.insert(cards).values({
    userId: user.id, slug, status:'draft',
    fullName: body.fullName, title: body.title||null, company: body.company||null,
    photoUrl: body.photoUrl||null, logoUrl: body.logoUrl||null,
    phone: body.phone||null, whatsapp: body.whatsapp||null, email: body.email||null,
    tagline: body.tagline||null, bio: body.bio||null,
    services: body.services||[],
    telegram: body.telegram||null, instagram: body.instagram||null,
    linkedin: body.linkedin||null, twitter: body.twitter||null,
    tiktok: body.tiktok||null, youtube: body.youtube||null,
    website: body.website||null, address: body.address||null,
    design: body.design,
  }).returning()

  async function activateCard() {
    if (existing) {
      await db.update(cards).set({ status:'archived', archivedAt: new Date() })
        .where(eq(cards.id, existing.id))
    }
    await db.update(cards).set({ status:'active', publishedAt: new Date() })
      .where(eq(cards.id, card.id))
  }

  // Owner — always free
  if (user.isOwner) {
    await activateCard()
    return NextResponse.json({ free: true, slug })
  }

  // Promo code check
  if (body.promoCode) {
    const [promo] = await db.select().from(promoCodes)
      .where(eq(promoCodes.code, body.promoCode.toUpperCase())).limit(1)
    if (promo && promo.isActive) {
      const expired = promo.expiresAt && new Date(promo.expiresAt) < new Date()
      const maxed   = promo.maxUses && promo.usesCount >= promo.maxUses
      if (!expired && !maxed && promo.discountType === 'free') {
        await activateCard()
        await db.update(promoCodes).set({ usesCount: (promo.usesCount||0)+1 })
          .where(eq(promoCodes.id, promo.id))
        return NextResponse.json({ free: true, slug })
      }
    }
  }

  // Stripe checkout
  const session = await createCheckoutSession({
    userId: user.id, cardId: card.id,
    type: existing ? 'renewal' : 'new_card',
    promoCode: body.promoCode,
    successUrl: `${appUrl}/checkout/success?slug=${slug}&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl:  `${appUrl}/builder?cancelled=true`,
  })
  return NextResponse.json({ url: session.url })
}
