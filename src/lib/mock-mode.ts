export const isMockModeEnabled =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_MODE === 'true'

export const MOCK_USER_EMAIL = 'demo@risco360.local'
export const MOCK_USER_PASSWORD = 'Risco360@123'

export const MOCK_STORAGE_KEYS = {
  auth: 'risco360_mock_auth',
  empresas: 'risco360_mock_empresas',
  setores: 'risco360_mock_setores',
  levantamentos: 'risco360_mock_levantamentos',
  biblioteca: 'risco360_mock_biblioteca',
  relatorios: 'risco360_mock_relatorios',
} as const
