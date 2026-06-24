import type { NivelRisco } from '@/types/risco'

export function calcularNivelRisco(probabilidade: number, severidade: number): NivelRisco {
  const score = probabilidade * severidade

  if (score >= 15) return 'critico'
  if (score >= 10) return 'alto'
  if (score >= 6) return 'medio'
  if (score >= 3) return 'baixo'
  return 'irrelevante'
}

export const NIVEL_RISCO_LABEL: Record<NivelRisco, string> = {
  irrelevante: 'Irrelevante',
  baixo: 'Baixo',
  medio: 'Médio',
  alto: 'Alto',
  critico: 'Crítico',
}

export const NIVEL_RISCO_COR: Record<NivelRisco, string> = {
  irrelevante: 'text-gray-500 bg-gray-100 border-gray-200',
  baixo: 'text-green-700 bg-green-50 border-green-200',
  medio: 'text-amber-800 bg-amber-50 border-amber-200',
  alto: 'text-orange-700 bg-orange-50 border-orange-200',
  critico: 'text-danger bg-red-50 border-red-200',
}
