export type SubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  | 'inactive'

export type PlanType = 'free' | 'creator' | 'pro' | 'business'

export interface SubscriptionDetails {
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  subscription_status: SubscriptionStatus
  subscription_period_start: string | null
  subscription_period_end: string | null
  trial_ends_at: string | null
  cancel_at_period_end: boolean
}

export interface PlanInfo {
  name: string
  price: number
  credits: number
  features: string[]
  stripePriceId: string
  isPopular?: boolean
}

export const PLANS: Record<PlanType, PlanInfo> = {
  free: {
    name: 'Free',
    price: 0,
    credits: 5,
    features: [
      '5 roteiros por mês',
      'Todos os tipos de vídeo',
      'Múltiplas versões',
      'Histórico completo'
    ],
    stripePriceId: '',
  },
  creator: {
    name: 'Creator',
    price: 29,
    credits: 50,
    features: [
      '50 roteiros por mês',
      'Todos os tipos de vídeo',
      'Múltiplas versões',
      'Histórico completo',
      'Suporte prioritário',
      'Templates exclusivos'
    ],
    stripePriceId: process.env.STRIPE_PRICE_CREATOR || '',
    isPopular: true,
  },
  pro: {
    name: 'Pro',
    price: 79,
    credits: 200,
    features: [
      '200 roteiros por mês',
      'Todos os tipos de vídeo',
      'Múltiplas versões ilimitadas',
      'Histórico completo',
      'Suporte prioritário',
      'Templates exclusivos',
      'Análise de performance',
      'Export em PDF/DOCX'
    ],
    stripePriceId: process.env.STRIPE_PRICE_PRO || '',
  },
  business: {
    name: 'Business',
    price: 199,
    credits: 999999, // Ilimitado
    features: [
      'Roteiros ILIMITADOS',
      'Todos os tipos de vídeo',
      'Múltiplas versões ilimitadas',
      'Histórico completo',
      'Suporte 24/7',
      'Templates exclusivos',
      'Análise avançada',
      'Export em todos os formatos',
      'API access',
      'Whitelabel (em breve)'
    ],
    stripePriceId: process.env.STRIPE_PRICE_BUSINESS || '',
  },
}
