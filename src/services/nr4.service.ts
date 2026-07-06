import { NR4_CNAE_GRAU_RISCO, validarBaseNR4, type NR4CnaeGrauRiscoItem, type GrauRiscoNR4 } from '@/data/nr4-cnae-grau-risco'
import { getCnae4, normalizeCnae } from '@/lib/cnae-utils'

export type ResultadoNR4Found = {
  found: true
  cnae4: string
  grauRisco: GrauRiscoNR4
  descricao?: string
  fonte: 'NR-4'
  confidence: 'exact_prefix4'
}

export type ResultadoNR4NotFound = {
  found: false
  cnae4: string | null
  reason: 'invalid_cnae' | 'not_found' | 'ambiguous'
  message: string
}

export type ResultadoNR4 = ResultadoNR4Found | ResultadoNR4NotFound

export function buscarGrauRiscoPorCnae4(cnae4: string): ResultadoNR4 {
  if (!cnae4 || cnae4.length < 4) {
    return { found: false, cnae4: cnae4 ?? null, reason: 'invalid_cnae', message: 'CNAE deve ter pelo menos 4 dígitos.' }
  }

  const prefixo = cnae4.slice(0, 4)
  if (prefixo.length < 4) {
    return { found: false, cnae4: prefixo, reason: 'invalid_cnae', message: 'CNAE deve ter pelo menos 4 dígitos.' }
  }

  const resultados = NR4_CNAE_GRAU_RISCO.filter((item) => item.cnae4 === prefixo)

  if (resultados.length === 0) {
    return { found: false, cnae4: prefixo, reason: 'not_found', message: `CNAE ${prefixo} não localizado na base NR-4.` }
  }

  const grausUnicos = [...new Set(resultados.map((r) => r.grauRisco))]

  if (grausUnicos.length > 1) {
    return {
      found: false,
      cnae4: prefixo,
      reason: 'ambiguous',
      message: `CNAE ${prefixo} possui correspondência ambígua na base NR-4 (graus: ${grausUnicos.join(', ')}). Revise manualmente.`,
    }
  }

  const item = resultados[0]
  return {
    found: true,
    cnae4: prefixo,
    grauRisco: item.grauRisco,
    descricao: item.descricao,
    fonte: 'NR-4',
    confidence: 'exact_prefix4',
  }
}

export function buscarGrauRiscoPorCnae(cnae: string): ResultadoNR4 {
  const cnae4 = getCnae4(cnae)
  if (!cnae4) {
    return { found: false, cnae4: null, reason: 'invalid_cnae', message: 'CNAE inválido ou com menos de 4 dígitos.' }
  }
  return buscarGrauRiscoPorCnae4(cnae4)
}

export function listarCnaesNR4(): NR4CnaeGrauRiscoItem[] {
  return [...NR4_CNAE_GRAU_RISCO]
}

export function pesquisarCnaeNR4(termo: string): NR4CnaeGrauRiscoItem[] {
  const lower = termo.toLowerCase()
  return NR4_CNAE_GRAU_RISCO.filter(
    (item) =>
      item.cnae4.includes(lower) ||
      (item.descricao ?? '').toLowerCase().includes(lower)
  )
}

export function validarBaseNR4Service(): ReturnType<typeof validarBaseNR4> {
  return validarBaseNR4()
}

export function obterDescricaoGrauRiscoNR4(grau: GrauRiscoNR4): string {
  const descricoes: Record<GrauRiscoNR4, string> = {
    1: 'Grau 1 - Baixo',
    2: 'Grau 2 - Médio',
    3: 'Grau 3 - Alto',
    4: 'Grau 4 - Muito Alto',
  }
  return descricoes[grau] ?? `Grau ${grau}`
}
