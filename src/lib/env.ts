export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.trim() ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '',
  enableMockMode: import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_MODE === 'true',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
