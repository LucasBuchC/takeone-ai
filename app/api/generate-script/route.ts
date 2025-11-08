import { OpenAI } from 'openai'
import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

// Usar Node.js runtime
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()

  try {
    // 1. Verificar autenticação
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // 2. Verificar créditos disponíveis
    const { data: profile } = await supabase
      .from('takeone.profiles')
      .select('credits_remaining')
      .eq('id', user.id)
      .single()

    if (!profile || profile.credits_remaining <= 0) {
      return new Response(
        JSON.stringify({ error: 'Créditos insuficientes' }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 3. Receber dados da requisição
    const body = await req.json()
    const version = body.version || 1
    const { prompt, projectId, videoType, duration, tone } = body

    if (!prompt || !projectId) {
      return new Response(
        JSON.stringify({ error: 'Dados incompletos' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 4. Construir prompt estruturado para IA
    const systemPrompt = `Você é um roteirista profissional especializado em criar roteiros para vídeos de redes sociais.
Sua missão é criar roteiros estruturados, envolventes e otimizados para retenção de audiência.`

    const userPrompt = `Crie um roteiro profissional para um vídeo de ${videoType} com duração de aproximadamente ${duration} segundos.

Tom desejado: ${tone || 'casual e informativo'}

Descrição e requisitos:
${prompt}

Estruture o roteiro da seguinte forma:

🎬 GANCHO (3-5 segundos)
[Abertura impactante que prenda a atenção imediatamente]

📝 INTRODUÇÃO (10-15 segundos)
[Apresente o tema e prometa o valor que será entregue]

💡 DESENVOLVIMENTO
[Pontos principais do conteúdo, organizados de forma clara]

🎯 CONCLUSÃO E CTA (5-10 segundos)
[Resumo rápido e call-to-action claro]

Use linguagem natural, direta e adaptada para ${videoType}.
Inclua dicas de enquadramento e transições quando relevante.`

    // 5. Configurar cliente OpenAI para Azure
    const openai = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
      defaultQuery: { 'api-version': '2024-08-01-preview' },
      defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY! },
    })

    // 6. Fazer requisição com streaming
    const stream = await openai.chat.completions.create({
      model: '', // Modelo é definido na baseURL para Azure
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
      top_p: 0.95,
      stream: true,
    })

    // 7. Processar stream de resposta
    let fullContent = ''
    const startTime = Date.now()

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content
            
            if (delta) {
              fullContent += delta
              
              // Enviar chunk para o cliente
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
              )
            }
          }

          // 8. Salvar roteiro no banco após conclusão
          const generationTime = (Date.now() - startTime) / 1000
          const tokensUsed = Math.ceil(fullContent.length / 4)

          const { error: insertError } = await supabase.from('takeone.scripts').insert({
            project_id: projectId,
            user_id: user.id,
            content: fullContent,
            prompt_used: prompt,
            generation_params: {
              tokens_used: tokensUsed,
              generation_time: generationTime,
              model: 'azure-openai',
              video_type: videoType,
              duration: duration,
              tone: tone
            }
          })

          if (insertError) {
            console.error('Error saving script:', insertError)
          }

          // Atualizar último prompt do projeto
          await supabase
            .from('takeone.projects')
            .update({ last_prompt: prompt })
            .eq('id', projectId)
            
          // Nota: Créditos serão decrementados automaticamente pelo trigger do banco

          // Sinalizar fim do stream
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    // 10. Retornar stream com headers corretos
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Generate script error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao gerar roteiro',
        details: error.toString()
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
