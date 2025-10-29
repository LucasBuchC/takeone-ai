import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/config'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar customer_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Você ainda não tem uma assinatura' },
        { status: 400 }
      )
    }

    // Criar Portal Session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar portal' },
      { status: 500 }
    )
  }
}
