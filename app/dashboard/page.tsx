import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar projetos recentes
  const { data: projects } = await supabase
    .from('takeone_projects')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Buscar total de roteiros gerados
  const { count: totalScripts } = await supabase
    .from('takeone_scripts')
    .select('*', { count: 'exact', head: true })
    .in('project_id', projects?.map(p => p.id) || [])

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl font-bold mb-2">
          Bem-vindo de volta! 🎬
        </h1>
        <p className="text-gray-600">
          Pronto para criar roteiros incríveis hoje?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Total de Projetos</div>
          <div className="text-3xl font-bold text-blue-600">
            {projects?.length || 0}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Roteiros Gerados</div>
          <div className="text-3xl font-bold text-green-600">
            {totalScripts || 0}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Taxa de Sucesso</div>
          <div className="text-3xl font-bold text-purple-600">100%</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Começar Novo Projeto</h2>
        <p className="mb-6 opacity-90">
          Crie um roteiro profissional em minutos com nossa IA
        </p>
        <Link
          href="/dashboard/projects/new"
          className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          + Novo Projeto
        </Link>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Projetos Recentes</h2>
          <Link
            href="/dashboard/projects"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Ver todos →
          </Link>
        </div>

        {projects && projects.length > 0 ? (
          <div className="space-y-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <div className="flex gap-3 mt-1 text-sm text-gray-600">
                      <span className="capitalize">{project.video_type}</span>
                      <span>•</span>
                      <span>{project.duration}s</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(project.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <p className="mb-4">Nenhum projeto ainda</p>
            <Link
              href="/dashboard/projects/new"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Criar seu primeiro projeto →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
