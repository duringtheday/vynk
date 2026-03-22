import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { db, payments, cards } from '@/db'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer()
  const sig  = req.headers.get('stripe-signature')!

  let event
  try { event = constructWebhookEvent(Buffer.from(body), sig) }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status:400 }) }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const { userId, cardId, type } = session.metadata

    // Record payment
    await db.insert(payments).values({
      stripeSessionId:       session.id,
      stripePaymentIntentId: session.payment_intent,
      userId, cardId, type,
      amountCents:   session.amount_total,
      currency:      session.currency,
      status:        'paid',
      paymentMethod: session.payment_method_types?.[0] || 'card',
      country:       session.customer_details?.address?.country,
      paidAt:        new Date(),
    }).onConflictDoNothing()

    // Archive previous active card on renewal
    if (type === 'renewal') {
      await db.update(cards).set({ status:'archived', archivedAt: new Date() })
        .where(and(eq(cards.userId, userId), eq(cards.status, 'active')))
    }

    // Activate the new card
    await db.update(cards).set({ status:'active', publishedAt: new Date() })
      .where(eq(cards.id, cardId))
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as any
    await db.update(payments).set({ status:'failed' })
      .where(eq(payments.stripePaymentIntentId, pi.id))
  }

  return NextResponse.json({ received: true })
}
