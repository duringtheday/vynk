import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', typescript: true,
})

export async function createCheckoutSession({
  userId, cardId, type, promoCode, successUrl, cancelUrl,
}: {
  userId: string; cardId: string; type: 'new_card' | 'renewal'
  promoCode?: string; successUrl: string; cancelUrl: string
}) {
  const priceId = type === 'new_card'
    ? process.env.STRIPE_PRICE_NEW_CARD!
    : process.env.STRIPE_PRICE_RENEWAL!

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    payment_method_types: ['card','link'],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId, cardId, type },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    custom_text: {
      submit: {
        message: type === 'new_card'
          ? 'Your Vynk card will go live instantly after payment.'
          : 'Your previous card will be archived. New card goes live instantly.',
      },
    },
  }

  if (promoCode) {
    try {
      const list = await stripe.coupons.list({ limit: 100 })
      const coupon = list.data.find(c => c.name === promoCode.toUpperCase() && c.valid)
      if (coupon) { params.discounts = [{ coupon: coupon.id }]; delete params.allow_promotion_codes }
    } catch {}
  }

  return stripe.checkout.sessions.create(params)
}

export function constructWebhookEvent(payload: Buffer, sig: string) {
  return stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!)
}
