import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Meus Projetos',
  description: 'Gerencie todos os seus projetos de roteiro',
}
export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('takeone_projects')
    .select('*, takeone_scripts(count)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meus Projetos</h1>
        <Link
          href="/dashboard/projects/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          + Novo Projeto
        </Link>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project: any) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="block bg-white rounded-lg p-6 shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
              <div className="flex gap-3 text-sm text-gray-600 mb-4">
                <span className="capitalize">📹 {project.video_type}</span>
                <span>⏱️ {project.duration}s</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  {project.scripts?.[0]?.count || 0} roteiro(s)
                </span>
                <span className="text-gray-500">
                  {new Date(project.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 text-center shadow">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-xl font-semibold mb-2">Nenhum projeto ainda</h2>
          <p className="text-gray-600 mb-6">
            Crie seu primeiro projeto e deixe a IA fazer a mágica!
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Criar Primeiro Projeto
          </Link>
        </div>
      )}
    </div>
  )
}
