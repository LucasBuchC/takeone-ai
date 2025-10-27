'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  projectId: string
  projectTitle: string
  videoType: string
  duration: number
  tone: string
  lastPrompt: string
  currentVersion: number
}

export function RegenerateButton({ 
  projectId, 
  projectTitle,
  videoType,
  duration,
  tone,
  lastPrompt,
  currentVersion 
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newPrompt, setNewPrompt] = useState(lastPrompt || '')
  const router = useRouter()

  const handleRegenerate = async () => {
    if (!newPrompt.trim()) {
      alert('Por favor, descreva o que você quer no roteiro')
      return
    }

    setIsGenerating(true)
    setGeneratedScript('')

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: newPrompt,
          projectId,
          videoType,
          duration,
          tone,
          version: currentVersion + 1,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar roteiro')
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
            if (data === '[DONE]') {
              setIsGenerating(false)
              setTimeout(() => {
                setShowModal(false)
                router.refresh()
              }, 1500)
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
      console.error('Error:', error)
      alert('Erro ao regenerar: ' + error.message)
      setIsGenerating(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-md"
      >
        🔄 Gerar Nova Versão
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Nova Versão do Roteiro
                  </h2>
                  <p className="text-gray-600">
                    Versão #{currentVersion + 1} de "{projectTitle}"
                  </p>
                </div>
                {!isGenerating && (
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {!isGenerating && !generatedScript ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descreva o que você quer nesta versão
                    </label>
                    <textarea
                      value={newPrompt}
                      onChange={(e) => setNewPrompt(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ex: Fazer uma versão mais engraçada, com piadas relacionadas ao tema..."
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex gap-2">
                      <span className="text-yellow-600">⚠️</span>
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Esta ação consome 1 crédito</p>
                        <p>Cada nova versão gerada usa um dos seus créditos mensais.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleRegenerate}
                      disabled={!newPrompt.trim()}
                      className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Gerar Nova Versão
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 border border-gray-300 rounded-md font-semibold hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    {isGenerating && (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    )}
                    <h3 className="text-lg font-bold">
                      {isGenerating ? 'Gerando versão...' : '✅ Nova versão criada!'}
                    </h3>
                  </div>

                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed bg-gray-50 p-4 rounded">
                      {generatedScript}
                    </pre>
                  </div>

                  {!isGenerating && (
                    <div className="mt-6 text-center">
                      <p className="text-gray-600 mb-4">
                        Atualizando página...
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
