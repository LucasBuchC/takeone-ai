import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'TakeOne.ai - Roteiros Profissionais com IA',
    template: '%s | TakeOne.ai'
  },
  description: 'Crie roteiros incríveis para YouTube, TikTok e Instagram em segundos. Powered by Azure OpenAI.',
  keywords: ['roteiro', 'IA', 'inteligência artificial', 'YouTube', 'TikTok', 'vídeo', 'conteúdo'],
  authors: [{ name: 'TakeOne.ai' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://seu-app.vercel.app',
    siteName: 'TakeOne.ai',
    title: 'TakeOne.ai - Roteiros Profissionais com IA',
    description: 'Crie roteiros incríveis para YouTube, TikTok e Instagram em segundos',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TakeOne.ai - Roteiros Profissionais com IA',
    description: 'Crie roteiros incríveis para YouTube, TikTok e Instagram em segundos',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
