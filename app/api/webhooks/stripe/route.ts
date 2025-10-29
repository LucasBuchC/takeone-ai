import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Importante: Desabilitar parsing do body para ler o raw body
export const runtime = 'nodejs'

// Criar cliente Supabase com service role (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('Received event:', event.type)

  try {
    switch (event.type) {
      // Quando assinatura é criada com sucesso
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      // Quando assinatura é atualizada (renovação mensal, por exemplo)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      // Quando assinatura é deletada/cancelada
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      // Quando pagamento falha
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      // Quando pagamento é bem sucedido (renovação mensal)
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Salvar evento no banco (opcional mas recomendado)
    await supabaseAdmin.from('stripe_events').insert({
      event_id: event.id,
      event_type: event.type,
      customer_id: (event.data.object as any).customer || null,
      subscription_id: (event.data.object as any).subscription || null,
      payload: event.data.object,
      processed: true,
    })

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Handler: Checkout completado
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  // Buscar detalhes da subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  const priceId = subscription.items.data[0].price.id
  const userId = session.metadata?.supabase_user_id

  if (!userId) {
    console.error('No user ID in session metadata')
    return
  }

  // Calcular créditos baseado no plano
  let credits = 5 // Free default
  if (priceId === process.env.STRIPE_PRICE_CREATOR) credits = 50
  if (priceId === process.env.STRIPE_PRICE_PRO) credits = 200
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) credits = 999999

  // Atualizar banco de dados
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      subscription_status: subscription.status,
      subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      credits_remaining: credits,
      credits_reset_date: new Date(subscription.current_period_end * 1000).toISOString(),
      plan_type: getPlanType(priceId),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating profile:', error)
    throw error
  }

  console.log(`✅ Subscription activated for user ${userId}`)
}

// Handler: Subscription atualizada
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const priceId = subscription.items.data[0].price.id

  // Calcular novos créditos
  let credits = 5
  if (priceId === process.env.STRIPE_PRICE_CREATOR) credits = 50
  if (priceId === process.env.STRIPE_PRICE_PRO) credits = 200
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) credits = 999999

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      subscription_status: subscription.status,
      subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      credits_remaining: credits, // Reset créditos na renovação
      credits_reset_date: new Date(subscription.current_period_end * 1000).toISOString(),
      plan_type: getPlanType(priceId),
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }

  console.log(`✅ Subscription updated for customer ${customerId}`)
}

// Handler: Subscription cancelada
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      stripe_price_id: null,
      credits_remaining: 5, // Volta para plano free
      plan_type: 'free',
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }

  console.log(`✅ Subscription canceled for customer ${customerId}`)
}

// Handler: Pagamento falhou
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'past_due',
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Error updating payment failure:', error)
    throw error
  }

  console.log(`⚠️ Payment failed for customer ${customerId}`)
}

// Handler: Pagamento bem sucedido (renovação)
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const subscriptionId = invoice.subscription as string

  if (!subscriptionId) return // Não é uma subscription

  const subscription = await stripe.subscriptions.retrieve(subscriptionId as string)
  const priceId = subscription.items.data[0].price.id

  // Resetar créditos na renovação
  let credits = 5
  if (priceId === process.env.STRIPE_PRICE_CREATOR) credits = 50
  if (priceId === process.env.STRIPE_PRICE_PRO) credits = 200
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) credits = 999999

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'active',
      credits_remaining: credits,
      credits_reset_date: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Error updating payment success:', error)
    throw error
  }

  console.log(`✅ Payment succeeded and credits reset for customer ${customerId}`)
}

// Helper: Determinar tipo de plano
function getPlanType(priceId: string): string {
  if (priceId === process.env.STRIPE_PRICE_CREATOR) return 'creator'
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro'
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return 'business'
  return 'free'
}
