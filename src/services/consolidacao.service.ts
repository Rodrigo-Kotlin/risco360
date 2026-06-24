import { buscarEmpresaPorId } from './empresas.service'
import { listarSetoresPorEmpresa } from './setores.service'
import { buscarLevantamentosPorEmpresa } from './levantamentos.service'
import type { EmpresaConsolidada, SetorConsolidado } from '@/types/consolidacao'
import type { PontoMedicaoQuantitativa } from '@/types/levantamento'
import type { RiscoOcupacional, PlanoAcaoItem } from '@/types/risco'

export async function obterConsolidadoEmpresa(
  empresaId: string
): Promise<EmpresaConsolidada | null> {
  const [empResult, levResult, setResult] = await Promise.all([
    buscarEmpresaPorId(empresaId),
    buscarLevantamentosPorEmpresa(empresaId),
    listarSetoresPorEmpresa(empresaId),
  ])

  if (empResult.error || !empResult.data) return null

  const empresa = empResult.data
  const levantamentos = levResult.data ?? []
  const setores = setResult.data ?? []

  const setoresConsolidados: SetorConsolidado[] = setores.map((setor) => {
    const lev = levantamentos.find((l) => l.setor_id === setor.id) ?? null
    const controles = lev ? ((lev.plano_acao ?? []).length > 0 ? lev.plano_acao : (lev.controles ?? [])) : []
    return {
      setor,
      levantamento: lev,
      riscos: lev?.riscos ?? [],
      medicoes: (lev?.pontos_medicao?.length ?? 0) || (lev?.medicoes?.length ?? 0),
      controles: controles ?? [],
      status: lev?.status ?? 'pendente',
      percentual: lev?.percentual ?? 0,
    }
  })

  return {
    empresa,
    setores: setoresConsolidados,
    totalSetores: setores.length,
    totalLevantamentos: levantamentos.length,
    totalRiscos: levantamentos.reduce((acc, l) => acc + (l.riscos?.length ?? 0), 0),
    totalMedicoes: levantamentos.reduce((acc, l) => acc + ((l.pontos_medicao?.length ?? 0) || (l.medicoes?.length ?? 0)), 0),
    totalAcoes: levantamentos.reduce((acc, l) => acc + (l.controles?.length ?? 0), 0),
  }
}

export function obterResumoEmpresa(
  consolidado: EmpresaConsolidada
): {
  totalSetores: number
  concluidos: number
  pendentes: number
  totalRiscos: number
  totalMedicoes: number
  totalAcoes: number
} {
  const concluidos = consolidado.setores.filter(
    (s) => s.status === 'concluido'
  ).length
  const pendentes = consolidado.totalSetores - concluidos

  return {
    totalSetores: consolidado.totalSetores,
    concluidos,
    pendentes,
    totalRiscos: consolidado.totalRiscos,
    totalMedicoes: consolidado.totalMedicoes,
    totalAcoes: consolidado.totalAcoes,
  }
}

export function obterSetoresConsolidados(
  consolidado: EmpresaConsolidada
): SetorConsolidado[] {
  return consolidado.setores
}

export function obterRiscosConsolidados(
  setores: SetorConsolidado[]
): (RiscoOcupacional & { empresa: string; setor: string })[] {
  return setores.flatMap((s) =>
    (s.levantamento?.riscos ?? []).map((r) => ({
      ...r,
      empresa: s.setor.empresa_id,
      setor: s.setor.nome,
    }))
  )
}

export function obterMedicoesConsolidadas(
  setores: SetorConsolidado[]
): (PontoMedicaoQuantitativa & { empresa: string; setor: string })[] {
  return setores.flatMap((s) => {
    const pontos = s.levantamento?.pontos_medicao ?? []
    if (pontos.length > 0) {
      return pontos.map((p) => ({
        ...p,
        empresa: s.setor.empresa_id,
        setor: s.setor.nome,
      }))
    }
    return (s.levantamento?.medicoes ?? []).map((m) => ({
      ...m,
      empresa: s.setor.empresa_id,
      setor: s.setor.nome,
    })) as (PontoMedicaoQuantitativa & { empresa: string; setor: string })[]
  })
}

export function obterPlanoAcaoConsolidado(
  setores: SetorConsolidado[]
): (PlanoAcaoItem & { empresa: string; setor: string })[] {
  return setores.flatMap((s) =>
    (s.levantamento?.controles ?? []).map((c) => ({
      ...c,
      empresa: s.setor.empresa_id,
      setor: s.setor.nome,
    }))
  )
}
