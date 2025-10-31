import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'TakeOne.ai - Crie Roteiros Profissionais com IA',
  description: 'Transforme suas ideias em roteiros envolventes para YouTube, TikTok e Instagram em segundos. Comece grátis com 5 créditos.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TakeOne.ai
              </span>
            </div>
            <div className="flex gap-6 items-center">
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition font-medium">
                Preços
              </a>
              <Link 
                href="/login"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Começar Agora
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-blue-600">
              ✨ Powered by Azure OpenAI GPT-4
            </span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Crie Roteiros Profissionais em Segundos
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
            IA especializada em transformar suas ideias em roteiros envolventes 
            para YouTube, TikTok, Instagram e muito mais.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Começar Gratuitamente →
            </Link>
            <a
              href="#demo"
              className="px-8 py-4 border-2 border-gray-300 rounded-lg text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition"
            >
              Ver Demonstração
            </a>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            🎁 5 créditos gratuitos • Sem cartão de crédito • Comece em 30 segundos
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-gray-600">Roteiros Criados</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-purple-600">4.8/5</div>
              <div className="text-sm text-gray-600">Avaliação Média</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-pink-600">&lt;5s</div>
              <div className="text-sm text-gray-600">Tempo Médio</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Tudo que você precisa para criar conteúdo incrível
          </h2>
          <p className="text-xl text-gray-600">
            Ferramentas poderosas em uma interface simples
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="text-xl font-bold mb-3">Roteiros Estruturados</h3>
            <p className="text-gray-700">
              Gancho impactante, desenvolvimento claro e CTA poderoso. 
              Estrutura profissional automaticamente.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-3">Geração Instantânea</h3>
            <p className="text-gray-700">
              Veja seu roteiro sendo escrito em tempo real. 
              Streaming de IA para máxima velocidade.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-lg transition">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3">Múltiplas Plataformas</h3>
            <p className="text-gray-700">
              YouTube, TikTok, Instagram Reels, Shorts. 
              Otimizado para cada formato.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-3">Tom Personalizável</h3>
            <p className="text-gray-700">
              Casual, profissional, entusiasta ou educativo. 
              Adapte o tom ao seu público.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-lg transition">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3">Múltiplas Versões</h3>
            <p className="text-gray-700">
              Gere até 3 versões diferentes do mesmo roteiro. 
              Escolha a melhor abordagem.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-lg transition">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-3">Sem Configuração</h3>
            <p className="text-gray-700">
              Comece em segundos. Sem instalação, 
              sem complexidade. Apenas resultados.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="container mx-auto px-4 py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Veja a Mágica Acontecer
            </h2>
            <p className="text-xl text-gray-600">
              Exemplo de roteiro gerado em tempo real
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm text-gray-500 font-mono">
                roteiro-tutorial-react.txt
              </span>
            </div>

            <div className="space-y-4 font-mono text-sm">
              <div className="text-gray-800">
                <p className="font-bold text-blue-600 mb-2">🎬 GANCHO (3-5 segundos)</p>
                <p className="text-gray-700 leading-relaxed">
                  "Você está perdendo horas tentando entender React? 
                  Neste vídeo, vou te mostrar o segredo que mudou tudo para mim..."
                </p>
              </div>

              <div className="text-gray-800">
                <p className="font-bold text-purple-600 mb-2">📝 INTRODUÇÃO (10-15 segundos)</p>
                <p className="text-gray-700 leading-relaxed">
                  "Oi, eu sou [Nome], e depois de 3 anos trabalhando com React, 
                  aprendi que existem 3 conceitos fundamentais que, uma vez dominados, 
                  facilitam TUDO..."
                </p>
              </div>

              <div className="text-gray-800">
                <p className="font-bold text-green-600 mb-2">💡 DESENVOLVIMENTO</p>
                <p className="text-gray-700 leading-relaxed">
                  "Primeiro: Components são como LEGO. Segundo: Props são mensagens 
                  entre peças. Terceiro: State é a memória do seu app..."
                </p>
              </div>

              <div className="text-blue-50 bg-blue-600 p-3 rounded">
                <p className="text-white text-xs">
                  ✨ Gerado em 4.2 segundos com Azure OpenAI GPT-4
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Planos Para Cada Necessidade
          </h2>
          <p className="text-xl text-gray-600">
            Comece grátis e faça upgrade quando precisar de mais
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-300 transition shadow-lg">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">R$ 0</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">Para começar</p>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>5 roteiros</strong> por mês</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Todos os tipos de vídeo</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Múltiplas versões</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Histórico completo</span>
              </li>
            </ul>

            <Link
              href="/login"
              className="block w-full py-3 bg-gray-100 text-gray-700 rounded-lg text-center font-semibold hover:bg-gray-200 transition"
            >
              Começar Grátis
            </Link>
          </div>

          {/* Creator Plan */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-2xl transform lg:scale-105 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
              Mais Popular
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Creator</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">R$ 29</span>
                <span className="text-blue-200">/mês</span>
              </div>
              <p className="text-blue-200 text-sm mt-2">Para criadores regulares</p>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-2">
                <span className="font-bold">✓</span>
                <span><strong>50 roteiros</strong> por mês</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold">✓</span>
                <span>Todos os tipos de vídeo</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold">✓</span>
                <span>Múltiplas versões</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold">✓</span>
                <span>Histórico completo</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold">✓</span>
                <span>Suporte prioritário</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold">✓</span>
                <span>Templates exclusivos</span>
              </li>
            </ul>

            <Link
              href="/login"
              className="block w-full py-3 bg-white text-blue-600 rounded-lg text-center font-semibold hover:bg-blue-50 transition"
            >
              Assinar Agora
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-300 transition shadow-lg">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">R$ 79</span>
                <span className="text-gray-500">/mês</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">Para profissionais</p>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>200 roteiros</strong> por mês</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Todas as features Creator</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Análise de performance</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Export em PDF/DOCX</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Acesso antecipado</span>
              </li>
            </ul>

            <Link
              href="/login"
              className="block w-full py-3 bg-purple-600 text-white rounded-lg text-center font-semibold hover:bg-purple-700 transition"
            >
              Começar Pro
            </Link>
          </div>

          {/* Business Plan */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-lg border-2 border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Business</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">R$ 199</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">Para empresas</p>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">✓</span>
                <span><strong>Roteiros ILIMITADOS</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">✓</span>
                <span>Todas as features Pro</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">✓</span>
                <span>Suporte 24/7</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">✓</span>
                <span>API access</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">✓</span>
                <span>Whitelabel (em breve)</span>
              </li>
            </ul>

            <Link
              href="/login"
              className="block w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg text-center font-semibold hover:from-yellow-300 hover:to-orange-400 transition"
            >
              Falar com Vendas
            </Link>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            💳 Aceitamos todos os cartões de crédito • 🔒 Pagamento 100% seguro via Stripe
          </p>
          <p className="text-sm text-gray-500">
            Cancele quando quiser, sem taxas ou burocracia
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para Revolucionar Seus Roteiros?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Junte-se a centenas de criadores que já economizam horas toda semana
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-block px-10 py-4 bg-white text-blue-600 rounded-lg text-lg font-bold hover:bg-gray-100 transition shadow-xl"
            >
              Começar Gratuitamente
            </Link>
            <Link
              href="/pricing"
              className="inline-block px-10 py-4 border-2 border-white text-white rounded-lg text-lg font-bold hover:bg-white/10 transition"
            >
              Ver Todos os Planos
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="text-xl font-bold text-white">TakeOne.ai</span>
              </div>
              <p className="text-sm">
                Roteiros profissionais com IA
              </p>
              <p className="text-xs mt-2 text-gray-500">
                Powered by Azure OpenAI GPT-4
              </p>
            </div>
            
            <div className="flex gap-8 text-sm">
              <Link href="/pricing" className="hover:text-white transition">
                Preços
              </Link>
              <Link href="/login" className="hover:text-white transition">
                Login
              </Link>
              <a href="#" className="hover:text-white transition">
                Termos
              </a>
              <a href="#" className="hover:text-white transition">
                Privacidade
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2025 TakeOne.ai - Todos os direitos reservados</p>
            <p className="text-xs text-gray-600 mt-2">
              Desenvolvido por Buch Sistemas
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
