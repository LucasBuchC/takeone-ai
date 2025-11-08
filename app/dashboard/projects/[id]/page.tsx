import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { CopyButton } from '@/components/copy-button'
import { RegenerateButton } from '@/components/regenerate-button'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: project } = await supabase
    .from('takeone.projects')
    .select('title')
    .eq('id', id)
    .single()
  
  return {
    title: project?.title || 'Projeto',
    description: `Visualize e gerencie versões do projeto ${project?.title}`,
  }
}


export default async function ProjectPage({ params }: Props) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar perfil para mostrar créditos
  const { data: profile } = await supabase
    .from('takeone.profiles')
    .select('credits_remaining')
    .eq('id', user.id)
    .single()

  const { data: project, error: projectError } = await supabase
    .from('takeone.projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  const { data: scripts } = await supabase
    .from('takeone.scripts')
    .select('*')
    .eq('project_id', id)
    .order('version', { ascending: false })

  const latestVersion = scripts?.[0]?.version || 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/dashboard/projects"
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Voltar para Projetos
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
            <div className="flex gap-4 text-sm text-gray-600">
              <span className="capitalize">📹 {project.video_type}</span>
              <span>⏱️ {project.duration}s</span>
              <span>📅 {new Date(project.created_at).toLocaleDateString('pt-BR')}</span>
              <span className="text-purple-600 font-medium">
                🔢 {scripts?.length || 0} versão(ões)
              </span>
            </div>
          </div>

          {scripts && scripts.length > 0 && (
            <RegenerateButton
              projectId={id}
              projectTitle={project.title}
              videoType={project.video_type}
              duration={project.duration}
              tone="casual"
              lastPrompt={project.last_prompt || ''}
              currentVersion={latestVersion}
            />
          )}
        </div>

        {/* Aviso de créditos */}
        {profile && profile.credits_remaining <= 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">
              ⚠️ Você não tem créditos disponíveis. 
              Seus créditos serão renovados no próximo mês.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {scripts && scripts.length > 0 ? (
          scripts.map((script) => (
            <div key={script.id} className="bg-white rounded-lg p-6 shadow border-2 border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      Versão #{script.version}
                    </h3>
                    {script.version === latestVersion && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Mais recente
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(script.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed bg-gray-50 p-4 rounded border border-gray-200">
                  {script.content}
                </pre>
              </div>

              <div className="mt-4 pt-4 border-t">
                <CopyButton content={script.content} />
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg p-12 text-center shadow">
            <p className="text-gray-500 mb-4">Nenhum roteiro gerado ainda</p>
          </div>
        )}
      </div>
    </div>
  )
}
