import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

// Validação se as variáveis de ambiente foram fornecidas e não são valores de exemplo
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('SEU_PROJETO') &&
    !supabaseUrl.includes('seu-projeto') &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('sua_anon_key') &&
    !supabaseAnonKey.includes('sua_chave_anon') &&
    !supabaseAnonKey.includes('your-anon-key')
)

export const supabase: SupabaseClient | null = isSupabaseConfigured && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export type { SupabaseClient }
