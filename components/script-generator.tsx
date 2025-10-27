'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ScriptGenerator({ projectId }: { projectId: string }) {
  const [prompt, setPrompt] = useState('')
  const [videoType, setVideoType] = useState('youtube')
  const [duration, setDuration] = useState(60)
  const [generatedScript, setGeneratedScript] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateScript = async () => {
    setIsGenerating(true)
    setGeneratedScript('')

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, projectId, videoType, duration }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate script')
      }

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
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              setGeneratedScript(prev => prev + parsed.content)
            } catch (e) {
              console.error('Parse error:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Tipo de Vídeo
          </label>
          <select
            value={videoType}
            onChange={(e) => setVideoType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="educational">Educacional</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Duração (segundos)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Descrição do Roteiro
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Descreva o tema, público-alvo e pontos principais..."
            className="w-full p-2 border rounded h-32"
          />
        </div>

        <button
          onClick={generateScript}
          disabled={isGenerating || !prompt}
          className="w-full bg-blue-600 text-white p-3 rounded font-medium 
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Gerando...' : 'Gerar Roteiro'}
        </button>

        {generatedScript && (
          <div className="mt-6 p-4 border rounded bg-gray-50">
            <h3 className="font-bold mb-2">Roteiro Gerado:</h3>
            <pre className="whitespace-pre-wrap">{generatedScript}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
