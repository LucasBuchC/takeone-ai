import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Fazer logout
  await supabase.auth.signOut()

  // Limpar cache
  revalidatePath('/', 'layout')
  
  // Redirecionar para home
  redirect('/')
}
