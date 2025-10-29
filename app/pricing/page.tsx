import { createClient } from '@/lib/supabase/server'
import { PricingCard } from '@/components/pricing-card'
import { PLANS } from '@/types/subscription'
import Link from 'next/link'

export const metadata = {
  title: 'Planos e Preços',
  description: 'Escolha o plano ideal para você',
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPriceId: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_price_id')
      .eq('id', user.id)
      .single()

    currentPriceId = profile?.stripe_price_id || null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TakeOne.ai
              </span>
            </Link>
            <Link
              href={user ? '/dashboard' : '/login'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {user ? 'Dashboard' : 'Entrar'}
            </Link>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Escolha Seu Plano
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comece grátis e faça upgrade quando precisar de mais poder
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <PricingCard
            name={PLANS.free.name}
            price={PLANS.free.price}
            credits={PLANS.free.credits}
            features={PLANS.free.features}
            stripePriceId={PLANS.free.stripePriceId}
            isCurrentPlan={!currentPriceId || currentPriceId === ''}
          />

          <PricingCard
            name={PLANS.creator.name}
            price={PLANS.creator.price}
            credits={PLANS.creator.credits}
            features={PLANS.creator.features}
            stripePriceId={PLANS.creator.stripePriceId}
            isPopular={PLANS.creator.isPopular}
            isCurrentPlan={currentPriceId === PLANS.creator.stripePriceId}
          />

          <PricingCard
            name={PLANS.pro.name}
            price={PLANS.pro.price}
            credits={PLANS.pro.credits}
            features={PLANS.pro.features}
            stripePriceId={PLANS.pro.stripePriceId}
            isCurrentPlan={currentPriceId === PLANS.pro.stripePriceId}
          />

          <PricingCard
            name={PLANS.business.name}
            price={PLANS.business.price}
            credits="Ilimitado"
            features={PLANS.business.features}
            stripePriceId={PLANS.business.stripePriceId}
            isCurrentPlan={currentPriceId === PLANS.business.stripePriceId}
          />
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-gray-600">
                Sim! Você pode cancelar sua assinatura a qualquer momento. 
                Você manterá acesso até o final do período pago.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold mb-2">Como funcionam os créditos?</h3>
              <p className="text-gray-600">
                Cada roteiro gerado consome 1 crédito. Os créditos são renovados 
                mensalmente no dia da sua assinatura.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold mb-2">Posso fazer upgrade/downgrade?</h3>
              <p className="text-gray-600">
                Sim! Você pode mudar de plano a qualquer momento. 
                O valor será ajustado proporcionalmente.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold mb-2">Créditos não usados acumulam?</h3>
              <p className="text-gray-600">
                Não, os créditos não utilizados expiram no final do mês. 
                Eles são resetados todo mês.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ainda tem dúvidas?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Comece com o plano gratuito e experimente sem compromisso
          </p>
          <Link
            href={user ? '/dashboard' : '/login'}
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            {user ? 'Voltar ao Dashboard' : 'Começar Gratuitamente'}
          </Link>
        </div>
      </section>
    </div>
  )
}
