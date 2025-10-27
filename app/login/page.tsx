import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Entre na sua conta TakeOne.ai para criar roteiros profissionais',
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const supabase = createClient()

      if (isSignUp) {
        // Registro
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        
        if (error) throw error
        
        setMessage('✅ Cadastro realizado! Verifique seu email para confirmar.')
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        
        // Redirecionar para dashboard
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setMessage('❌ ' + (error.message || 'Erro ao autenticar'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">
            {isSignUp ? 'Criar Conta' : 'Entrar'} no TakeOne.ai
          </h2>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha (mínimo 6 caracteres)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          {message && (
            <div className={`text-sm text-center p-3 rounded ${
              message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Aguarde...' : isSignUp ? 'Cadastrar' : 'Entrar'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage('')
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
