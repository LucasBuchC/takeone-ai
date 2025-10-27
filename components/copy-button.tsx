'use client'

import { useState } from 'react'

export function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <button 
      onClick={handleCopy}
      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
    >
      {copied ? '✅ Copiado!' : '📋 Copiar'}
    </button>
  )
}
