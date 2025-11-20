import { createClient } from '@/lib/supabase/server'
import { SubscriptionStatus, PlanType } from '@/types/subscription'

export async function getUserSubscription(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      subscription_id,
      subscription_plan,
      subscription_status,
      subscription_started_at,
      subscription_ends_at,
      credits_remaining
    `)
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function isPremiumUser(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return subscription.subscription_status === 'active'
}

export function getPlanType(priceId: string | null): PlanType {
  if (!priceId) return 'free'
  
  switch (priceId) {
    case process.env.STRIPE_PRICE_CREATOR:
      return 'creator'
    case process.env.STRIPE_PRICE_PRO:
      return 'pro'
    case process.env.STRIPE_PRICE_BUSINESS:
      return 'business'
    default:
      return 'free'
  }
}

export function getCreditsForPlan(planType: PlanType): number {
  switch (planType) {
    case 'creator':
      return 50
    case 'pro':
      return 200
    case 'business':
      return 999999
    default:
      return 5
  }
}
