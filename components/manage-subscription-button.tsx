'use client'

import { useState } from 'react'

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  const handleManage = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Portal error:', error)
      alert('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="text-sm text-gray-600 hover:text-blue-600 transition disabled:opacity-50"
    >
      {loading ? 'Carregando...' : '⚙️ Gerenciar Assinatura'}
    </button>
  )
}
