import Link from 'next/link'

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
            <Link
              href="/login"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-blue-600">
              ✨ Powered by Azure OpenAI
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
            <h3 className="text-xl font-bold mb-3">Histórico Completo</h3>
            <p className="text-gray-700">
              Salve, organize e acesse todos os seus roteiros. 
              Nunca perca uma ideia.
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
                  ✨ Gerado em 4.2 segundos com Azure OpenAI
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Comece Gratuitamente
          </h2>
          <p className="text-xl text-gray-600">
            Sem truques, sem cartão de crédito
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Plano Gratuito</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold">5</span>
                <span className="text-2xl text-blue-200">créditos/mês</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>5 roteiros por mês</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>Todos os tipos de vídeo</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>Histórico ilimitado</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>Suporte por email</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>Atualizações gratuitas</span>
              </li>
            </ul>

            <Link
              href="/login"
              className="block w-full py-4 bg-white text-blue-600 rounded-lg text-center font-bold text-lg hover:bg-gray-100 transition"
            >
              Começar Agora →
            </Link>
            
            <p className="text-center text-sm text-blue-100 mt-4">
              Sem cartão de crédito • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para Revolucionar Seus Roteiros?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Junte-se a criadores que já economizam horas toda semana
          </p>
          <Link
            href="/login"
            className="inline-block px-10 py-4 bg-white text-blue-600 rounded-lg text-lg font-bold hover:bg-gray-100 transition shadow-xl"
          >
            Criar Conta Gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold text-white">TakeOne.ai</span>
              <p className="text-sm mt-2">
                Roteiros profissionais com IA
              </p>
            </div>
            <div className="flex gap-8 text-sm">
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
          </div>
        </div>
      </footer>
    </div>
  )
}
