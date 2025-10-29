'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type PricingCardProps = {
  name: string
  price: number
  credits: number | string
  features: string[]
  stripePriceId: string
  isPopular?: boolean
  isCurrentPlan?: boolean
}

export function PricingCard({
  name,
  price,
  credits,
  features,
  stripePriceId,
  isPopular,
  isCurrentPlan,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    if (price === 0) {
      router.push('/login')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: stripePriceId }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirecionar para checkout do Stripe
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Subscription error:', error)
      alert('Erro ao iniciar assinatura: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`relative rounded-2xl p-8 ${
        isPopular
          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl scale-105'
          : 'bg-white border-2 border-gray-200'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-full">
          Mais Popular
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
          Plano Atual
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-bold">
            {price === 0 ? 'Grátis' : `R$ ${price}`}
          </span>
          {price > 0 && (
            <span className={isPopular ? 'text-blue-200' : 'text-gray-500'}>
              /mês
            </span>
          )}
        </div>
        <p className={`mt-2 text-sm ${isPopular ? 'text-blue-100' : 'text-gray-600'}`}>
          {typeof credits === 'number' && credits < 999999
            ? `${credits} créditos por mês`
            : 'Créditos ilimitados'}
        </p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className={isPopular ? 'text-white' : 'text-green-600'}>✓</span>
            <span className={`text-sm ${isPopular ? 'text-white' : 'text-gray-700'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubscribe}
        disabled={loading || isCurrentPlan}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
          isCurrentPlan
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : isPopular
            ? 'bg-white text-blue-600 hover:bg-gray-100'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } disabled:opacity-50`}
      >
        {loading ? 'Processando...' : isCurrentPlan ? 'Plano Atual' : price === 0 ? 'Começar Grátis' : 'Assinar Agora'}
      </button>
    </div>
  )
}
