import { STEP_WEIGHTS } from '@/constants/app'
import type { Levantamento } from '@/types/levantamento'

export function calcularPercentual(lev: Levantamento): number {
  let total = 0

  const hasIdentificacao = !!(
    lev.empresa_nome && lev.setor_nome && lev.data_levantamento
  )
  if (hasIdentificacao) total += STEP_WEIGHTS[1]

  const hasCaracteristicasFisicas = Object.values(lev.caracteristicas_fisicas ?? {}).some(
    (v) => v !== null && v !== undefined && v !== ''
  )
  if (hasCaracteristicasFisicas) total += STEP_WEIGHTS[2]

  const hasIluminacao = Object.values(lev.iluminacao_ventilacao_conforto ?? {}).some(
    (v) => v !== null && v !== undefined && v !== ''
  )
  if (hasIluminacao) total += STEP_WEIGHTS[3]

  const hasSeguranca = !!(
    (lev.seguranca_equipamentos?.sistema_incendio_emergencia ?? []).length > 0 ||
    (lev.seguranca_equipamentos?.sistema_incendio_emergencia_itens ?? []).length > 0 ||
    lev.seguranca_equipamentos?.possui_ges ||
    (lev.seguranca_equipamentos?.mobiliarios ?? []).length > 0 ||
    (lev.seguranca_equipamentos?.mobiliario_itens ?? []).length > 0 ||
    (lev.seguranca_equipamentos?.maquinas_equipamentos ?? []).length > 0 ||
    (lev.seguranca_equipamentos?.maquinas_equipamentos_itens ?? []).length > 0 ||
    (lev.seguranca_equipamentos?.ferramentas ?? []).length > 0 ||
    (lev.seguranca_equipamentos?.ferramentas_itens ?? []).length > 0
  )
  if (hasSeguranca) total += STEP_WEIGHTS[4]

  const hasEpis = (lev.epis_epcs_evidencias?.epis ?? []).length > 0
  if (hasEpis) total += STEP_WEIGHTS[5]

  const hasMedicoes = (lev.medicoes ?? []).length > 0 || (lev.pontos_medicao ?? []).length > 0
  if (hasMedicoes) total += STEP_WEIGHTS[6]

  const hasRiscos = (lev.riscos ?? []).length > 0
  if (hasRiscos) total += STEP_WEIGHTS[7]

  const hasRevisao = !!(
    lev.parecer?.conclusao || lev.assinatura_tecnico?.nome
  )
  if (hasRevisao) total += STEP_WEIGHTS[8]

  return Math.min(100, total)
}

export function calcularProximoPasso(lev: Levantamento): number {
  if (!(lev.empresa_nome && lev.setor_nome && lev.data_levantamento)) return 1

  const hasCaracteristicas = Object.values(lev.caracteristicas_fisicas ?? {}).some(
    (v) => v !== null && v !== undefined && v !== ''
  )
  if (!hasCaracteristicas) return 2

  const hasIluminacao = Object.values(lev.iluminacao_ventilacao_conforto ?? {}).some(
    (v) => v !== null && v !== undefined && v !== ''
  )
  if (!hasIluminacao) return 3

  const seg = lev.seguranca_equipamentos
  const hasSeguranca = !!(
    (seg?.sistema_incendio_emergencia ?? []).length > 0 ||
    (seg?.sistema_incendio_emergencia_itens ?? []).length > 0 ||
    seg?.possui_ges ||
    (seg?.mobiliarios ?? []).length > 0 ||
    (seg?.mobiliario_itens ?? []).length > 0 ||
    (seg?.maquinas_equipamentos ?? []).length > 0 ||
    (seg?.maquinas_equipamentos_itens ?? []).length > 0 ||
    (seg?.ferramentas ?? []).length > 0 ||
    (seg?.ferramentas_itens ?? []).length > 0
  )
  if (!hasSeguranca) return 4

  if ((lev.epis_epcs_evidencias?.epis ?? []).length === 0) return 5

  if ((lev.medicoes ?? []).length === 0 && (lev.pontos_medicao ?? []).length === 0) return 6

  if ((lev.riscos ?? []).length === 0) return 7

  if (!(lev.parecer?.conclusao || lev.assinatura_tecnico?.nome)) return 8

  return 1
}