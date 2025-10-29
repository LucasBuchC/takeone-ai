import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
  typescript: true,
})

export const STRIPE_CONFIG = {
  prices: {
    creator: process.env.STRIPE_PRICE_CREATOR!,
    pro: process.env.STRIPE_PRICE_PRO!,
    business: process.env.STRIPE_PRICE_BUSINESS!,
  },
  successUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?success=true`,
  cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing?canceled=true`,
}
