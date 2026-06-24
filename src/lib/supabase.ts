import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { env } from './env'

function isValidSupabaseUrl(value: string | undefined): value is string {
  if (!value || value.toLowerCase().includes('placeholder')) {
    return false
  }

  try {
    const url = new URL(value)

    return (
      url.protocol === 'https:' &&
      (url.hostname.endsWith('.supabase.co') ||
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1')
    )
  } catch {
    return false
  }
}

function isPublicSupabaseKey(value: string | undefined): value is string {
  if (!value || value.toLowerCase().includes('placeholder')) {
    return false
  }

  if (value.startsWith('sb_secret_')) {
    return false
  }

  if (value.toLowerCase().includes('service_role')) {
    return false
  }

  return true
}

export const isSupabaseConfigured =
  isValidSupabaseUrl(env.supabaseUrl) &&
  isPublicSupabaseKey(env.supabaseAnonKey)

if (!isSupabaseConfigured && env.isDev) {
  console.error(
    '%c[Supabase] Servidor não configurado.\n' +
      'Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env\n' +
      'Consulte .env.example para referência.',
    'color: #eab308; font-weight: bold;'
  )
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Servidor não configurado. Verifique as variáveis de ambiente do Supabase.'
    )
  }

  return supabase
}
