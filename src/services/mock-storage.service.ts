import { isMockModeEnabled, MOCK_STORAGE_KEYS } from '@/lib/mock-mode'
import { mockEmpresas } from '@/data/mock/mock-empresas'
import { mockSetores } from '@/data/mock/mock-setores'
import { mockLevantamentos } from '@/data/mock/mock-levantamentos'
import { mockBiblioteca } from '@/data/mock/mock-biblioteca'

function getKey(domain: keyof typeof MOCK_STORAGE_KEYS): string {
  return MOCK_STORAGE_KEYS[domain]
}

export function getMockData<T>(domain: keyof typeof MOCK_STORAGE_KEYS): T[] {
  if (!isMockModeEnabled) return []
  try {
    const raw = localStorage.getItem(getKey(domain))
    if (raw) return JSON.parse(raw) as T[]
  } catch { /* ignore */ }
  return []
}

export function setMockData<T>(
  domain: keyof typeof MOCK_STORAGE_KEYS,
  data: T[]
): void {
  if (!isMockModeEnabled) return
  try {
    localStorage.setItem(getKey(domain), JSON.stringify(data))
  } catch { /* ignore */ }
}

export function seedMockDataIfEmpty(domain: keyof typeof MOCK_STORAGE_KEYS): void {
  if (!isMockModeEnabled) return

  const existing = getMockData(domain)
  if (existing.length > 0) return

  const seeds: Record<keyof typeof MOCK_STORAGE_KEYS, unknown[]> = {
    auth: [],
    empresas: mockEmpresas,
    setores: mockSetores,
    levantamentos: mockLevantamentos,
    biblioteca: mockBiblioteca,
    relatorios: [],
  }

  const seed = seeds[domain]
  if (seed) {
    setMockData(domain as keyof typeof MOCK_STORAGE_KEYS, seed)
  }
}

export function seedAllMockDataIfEmpty(): void {
  if (!isMockModeEnabled) return
  const domains = Object.keys(MOCK_STORAGE_KEYS) as (keyof typeof MOCK_STORAGE_KEYS)[]
  for (const domain of domains) {
    if (domain === 'auth') continue
    seedMockDataIfEmpty(domain)
  }
}

export function clearMockData(): void {
  if (!isMockModeEnabled) return
  const values = Object.values(MOCK_STORAGE_KEYS)
  for (const key of values) {
    try { localStorage.removeItem(key) } catch { /* ignore */ }
  }
}

export function resetMockData(): void {
  clearMockData()
  if (!isMockModeEnabled) return
  seedAllMockDataIfEmpty()
}

export function hasMockData(): boolean {
  if (!isMockModeEnabled) return false
  const values = Object.values(MOCK_STORAGE_KEYS)
  return values.some((key) => {
    try { return localStorage.getItem(key) !== null } catch { return false }
  })
}
