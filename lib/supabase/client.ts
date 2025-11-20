import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  console.log('Creating Supabase client...')
  console.log('URL:', url)
  console.log('Key length:', key.length)
  
  return createBrowserClient(url, key, {
    db: { schema: 'takeone' },
  })
}