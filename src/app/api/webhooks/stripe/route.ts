import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { db } from '@/db'
import { cards, payments, users } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const payload = Buffer.from(await req.arrayBuffer())
  const sig     = req.headers.get('stripe-signature')!

  let event: any
  try {
    event = constructWebhookEvent(payload, sig)
  } catch (e: any) {
    console.error('Webhook signature error:', e.message)
    return new NextResponse(`Webhook Error: ${e.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, cardId, type } = session.metadata || {}

    try {
      // Mark payment paid
      await db.update(payments).set({
        status: 'paid',
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        paymentMethod: session.payment_method_types?.[0] || 'card',
        country: session.customer_details?.address?.country || null,
        paidAt: new Date(),
      }).where(eq(payments.stripeSessionId, session.id))

      // Archive old active card if renewal
      if (type === 'renewal') {
        await db.update(cards)
          .set({ status: 'archived', archivedAt: new Date() })
          .where(and(eq(cards.userId, userId), eq(cards.status, 'active')))
      }

      // Activate the new card
      await db.update(cards)
        .set({ status: 'active', publishedAt: new Date() })
        .where(eq(cards.id, cardId))

      console.log(`Card ${cardId} activated for user ${userId}`)
    } catch (e: any) {
      console.error('Webhook DB error:', e.message)
      return new NextResponse('DB Error', { status: 500 })
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object
    await db.update(payments)
      .set({ status: 'failed' })
      .where(eq(payments.stripePaymentIntentId, pi.id))
  }

  return NextResponse.json({ received: true })
}
