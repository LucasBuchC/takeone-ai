'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'


export default function NewProjectPage() {
  const [title, setTitle] = useState('')
  const [videoType, setVideoType] = useState('youtube')
  const [duration, setDuration] = useState(60)
  const [tone, setTone] = useState('casual')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedScript, setGeneratedScript] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Criar projeto no banco
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: user!.id,
          title,
          video_type: videoType,
          duration,
          last_prompt: prompt,
        })
        .select()
        .single()

      if (error) throw error

      setProjectId(project.id)

      // 2. Gerar roteiro automaticamente
      await generateScript(project.id)
    } catch (error: any) {
      console.error('Error creating project:', error)
      alert('Erro ao criar projeto: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const generateScript = async (projId: string) => {
    setIsGenerating(true)
    setGeneratedScript('')

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          projectId: projId,
          videoType,
          duration,
          tone,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar roteiro')
      }

      // 3. Ler stream de resposta
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n').filter(line => line.trim())

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              setIsGenerating(false)
              // Mostrar opção de salvar ou criar outro
              setTimeout(() => {
                router.push(`/dashboard/projects/${projId}`)
              }, 2000)
              continue
            }

            try {
              const parsed = JSON.parse(data)
              setGeneratedScript(prev => prev + parsed.content)
            } catch (e) {
              console.error('Parse error:', e)
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error generating script:', error)
      alert('Erro ao gerar roteiro: ' + error.message)
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Criar Novo Projeto</h1>
        <p className="text-gray-600">
          Preencha as informações abaixo e nossa IA criará um roteiro profissional para você
        </p>
      </div>

      {!projectId ? (
        <form onSubmit={handleCreateProject} className="space-y-6 bg-white rounded-lg p-6 shadow">
          {/* Título do Projeto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Projeto *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Tutorial de React para Iniciantes"
            />
          </div>

          {/* Tipo de Vídeo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Vídeo *
            </label>
            <select
              value={videoType}
              onChange={(e) => setVideoType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram Reels</option>
              <option value="shorts">YouTube Shorts</option>
              <option value="educational">Educacional</option>
            </select>
          </div>

          {/* Duração */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duração (segundos): {duration}s
            </label>
            <input
              type="range"
              min="15"
              max="600"
              step="15"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>15s (Shorts)</span>
              <span>60s (Reels)</span>
              <span>300s (YouTube)</span>
              <span>600s (Longo)</span>
            </div>
          </div>

          {/* Tom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tom do Vídeo
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="casual">Casual e Descontraído</option>
              <option value="professional">Profissional</option>
              <option value="enthusiastic">Entusiasta e Energético</option>
              <option value="educational">Educativo e Didático</option>
              <option value="humorous">Bem-Humorado</option>
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descreva seu Vídeo *
            </label>
            <textarea
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva os pontos principais que você quer abordar no vídeo, público-alvo, objetivo, etc.

Exemplo:
- Ensinar hooks básicos do React (useState, useEffect)
- Público: iniciantes em programação
- Mostrar exemplos práticos
- Objetivo: fazer o viewer criar seu primeiro componente React"
            />
            <p className="text-sm text-gray-500 mt-1">
              Quanto mais detalhes você fornecer, melhor será o roteiro gerado
            </p>
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Criando projeto e gerando roteiro...' : '✨ Criar Projeto e Gerar Roteiro'}
          </button>
        </form>
      ) : (
        // Exibir roteiro sendo gerado
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center gap-3 mb-6">
            {isGenerating && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            )}
            <h2 className="text-xl font-bold">
              {isGenerating ? 'Gerando seu roteiro...' : '✅ Roteiro Completo!'}
            </h2>
          </div>

          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
              {generatedScript}
            </pre>
          </div>

          {!isGenerating && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-gray-600 mb-4">
                Roteiro salvo com sucesso! Redirecionando para o projeto...
              </p>
              <button
                onClick={() => router.push(`/dashboard/projects/${projectId}`)}
                className="bg-blue-600 text-white py-2 px-6 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                Ir para o Projeto →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
