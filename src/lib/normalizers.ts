import { generateId } from './utils'
import type { PontoMedicaoQuantitativa } from '@/types/levantamento'

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isNaN(value) ? null : value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return null
    const num = Number(trimmed)
    return Number.isNaN(num) ? null : num
  }
  return null
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null
  return String(value)
}

function toStringOrEmpty(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

function matchUnit(unidade: unknown, patterns: string[]): boolean {
  const u = String(unidade ?? '').toLowerCase().trim()
  return patterns.some((p) => u === p.toLowerCase() || u.includes(p.toLowerCase()))
}

function criarPontoVazio(): PontoMedicaoQuantitativa {
  return {
    id: generateId(),
    ponto_local: 'Ponto não informado',
    ruido_dba: null,
    iluminacao_lux: null,
    temperatura_c: null,
    velocidade_ar_ms: null,
    umidade_percent: null,
    radiacao_usvh: null,
    observacoes: null,
  }
}

export function normalizePontoMedicao(value: unknown): PontoMedicaoQuantitativa {
  if (!value || typeof value !== 'object') {
    return criarPontoVazio()
  }

  const raw = value as Record<string, unknown>
  const id = toStringOrNull(raw.id) || generateId()

  const ponto_local =
    toStringOrEmpty(raw.ponto_local) ||
    toStringOrEmpty(raw.local) ||
    toStringOrEmpty(raw.posto_trabalho) ||
    'Ponto não informado'

  const ruido_dba =
    toNumberOrNull(raw.ruido_dba) ??
    (matchUnit(raw.unidade, ['dB(A)', 'dBA', 'dB', 'ruido', 'ruído'])
      ? toNumberOrNull(raw.valor)
      : null)

  const iluminacao_lux =
    toNumberOrNull(raw.iluminacao_lux) ??
    (matchUnit(raw.unidade, ['lux', 'lx', 'iluminacao', 'iluminação'])
      ? toNumberOrNull(raw.valor)
      : null)

  const temperatura_c =
    toNumberOrNull(raw.temperatura_c) ??
    (matchUnit(raw.unidade, ['°C', '°c', 'c', 'celsius', 'temperatura', 'temp'])
      ? toNumberOrNull(raw.valor)
      : null)

  const velocidade_ar_ms =
    toNumberOrNull(raw.velocidade_ar_ms) ??
    (matchUnit(raw.unidade, ['m/s', 'ms', 'velocidade do ar', 'velocidade'])
      ? toNumberOrNull(raw.valor)
      : null)

  const umidade_percent =
    toNumberOrNull(raw.umidade_percent) ??
    (matchUnit(raw.unidade, ['%', 'umidade', 'umidade relativa', 'porcentagem'])
      ? toNumberOrNull(raw.valor)
      : null)

  const radiacao_usvh =
    toNumberOrNull(raw.radiacao_usvh) ??
    (matchUnit(raw.unidade, ['µSv/h', 'uSv/h', 'usv/h', 'radiacao', 'radiação'])
      ? toNumberOrNull(raw.valor)
      : null)

  const observacoes =
    toStringOrNull(raw.observacoes) ??
    toStringOrNull(raw.observacao) ??
    null

  return {
    id,
    ponto_local,
    ruido_dba,
    iluminacao_lux,
    temperatura_c,
    velocidade_ar_ms,
    umidade_percent,
    radiacao_usvh,
    observacoes,
  }
}

export function normalizePontosMedicao(value: unknown): PontoMedicaoQuantitativa[] {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) {
    if (value.length === 0) return []
    return value.map(normalizePontoMedicao)
  }
  if (typeof value === 'object') {
    return [normalizePontoMedicao(value)]
  }
  return []
}
