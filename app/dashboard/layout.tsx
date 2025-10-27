import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_remaining, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                TakeOne.ai
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-blue-600 transition"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/projects" 
                  className="text-gray-600 hover:text-blue-600 transition"
                >
                  Projetos
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Contador de Créditos */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                <span className="text-sm text-gray-600">Créditos:</span>
                <span className="font-bold text-blue-600">
                  {profile?.credits_remaining || 0}
                </span>
              </div>

              {/* Menu do Usuário */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {profile?.email}
                </span>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="text-sm text-gray-600 hover:text-red-600 transition"
                  >
                    Sair
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
