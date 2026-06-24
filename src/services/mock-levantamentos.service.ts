import { getMockData, setMockData } from './mock-storage.service'
import { mockUserId } from '@/data/mock/mock-user'
import type { ServiceResult } from '@/types/common'
import type {
  Levantamento,
  LevantamentoCreateInput,
  LevantamentoUpdateInput,
  StatusLevantamento,
} from '@/types/levantamento'
import type { ParecerTecnico, Assinatura, AvaliacaoErgonomica } from '@/types/levantamento'

function list(): Levantamento[] {
  return getMockData<Levantamento>('levantamentos')
}

function save(data: Levantamento[]): void {
  setMockData('levantamentos', data)
}

function now(): string {
  return new Date().toISOString()
}

export async function listarLevantamentos(): Promise<ServiceResult<Levantamento[]>> {
  return { data: list(), error: null }
}

export async function buscarLevantamentoPorId(
  id: string
): Promise<ServiceResult<Levantamento>> {
  const found = list().find((l) => l.id === id)
  if (!found) return { data: null, error: 'Levantamento não encontrado.' }
  return { data: found, error: null }
}

export async function criarLevantamento(
  input: LevantamentoCreateInput
): Promise<ServiceResult<Levantamento>> {
  const data = list()
  const codigo = input.codigo ?? `${input.tipo}-${new Date().getFullYear()}-${String(data.length + 1).padStart(4, '0')}`
  const novo: Levantamento = {
    id: `mock-lev-${Date.now()}`,
    codigo,
    tipo: input.tipo,
    status: input.status ?? 'rascunho',
    percentual: input.percentual ?? 0,
    empresa_id: input.empresa_id ?? null,
    empresa_nome: input.empresa_nome ?? null,
    cnpj: input.cnpj ?? null,
    unidade: input.unidade ?? null,
    setor: input.setor ?? null,
    setor_id: input.setor_id ?? null,
    setor_nome: input.setor_nome ?? null,
    responsavel_empresa: input.responsavel_empresa ?? null,
    auditor_tecnico: input.auditor_tecnico ?? null,
    registro_mte: input.registro_mte ?? null,
    data_levantamento: input.data_levantamento ?? null,
    data_lancamento_sgg: input.data_lancamento_sgg ?? null,
    responsavel_lancamento: input.responsavel_lancamento ?? null,
    observacoes_iniciais: input.observacoes_iniciais ?? null,
    caracteristicas: input.caracteristicas ?? {} as Levantamento['caracteristicas'],
    medicoes: input.medicoes ?? [],
    pontos_medicao: input.pontos_medicao ?? [],
    colaboradores: input.colaboradores ?? [],
    riscos: input.riscos ?? [],
    avaliacao_ergonomica: input.avaliacao_ergonomica ?? {} as AvaliacaoErgonomica,
    controles: input.controles ?? [],
    parecer: input.parecer ?? {} as ParecerTecnico,
    assinatura_tecnico: input.assinatura_tecnico ?? {} as Assinatura,
    assinatura_empresa: input.assinatura_empresa ?? {} as Assinatura,
    observacoes: input.observacoes ?? null,
    user_id: mockUserId,
    created_at: now(),
    updated_at: now(),
  }
  data.push(novo)
  save(data)
  return { data: novo, error: null }
}

export async function atualizarLevantamento(
  id: string,
  input: LevantamentoUpdateInput
): Promise<ServiceResult<Levantamento>> {
  const data = list()
  const idx = data.findIndex((l) => l.id === id)
  if (idx === -1) return { data: null, error: 'Levantamento não encontrado.' }
  data[idx] = { ...data[idx], ...input, id, updated_at: now() }
  save(data)
  return { data: data[idx], error: null }
}

export async function excluirLevantamento(
  id: string
): Promise<ServiceResult<boolean>> {
  const data = list().filter((l) => l.id !== id)
  save(data)
  return { data: true, error: null }
}

export async function duplicarLevantamento(
  id: string
): Promise<ServiceResult<Levantamento>> {
  const original = list().find((l) => l.id === id)
  if (!original) return { data: null, error: 'Levantamento original não encontrado.' }
  const dup: Levantamento = {
    ...original,
    id: `mock-lev-${Date.now()}`,
    codigo: `${original.tipo}-${new Date().getFullYear()}-${String(list().length + 1).padStart(4, '0')}`,
    status: 'rascunho' as StatusLevantamento,
    percentual: 0,
    medicoes: [],
    colaboradores: [],
    riscos: [],
    controles: [],
    parecer: {} as ParecerTecnico,
    assinatura_tecnico: {} as Assinatura,
    assinatura_empresa: {} as Assinatura,
    observacoes: `Duplicado do levantamento ${original.codigo ?? original.id}`,
    created_at: now(),
    updated_at: now(),
  }
  const data = list()
  data.push(dup)
  save(data)
  return { data: dup, error: null }
}

export async function atualizarStatusLevantamento(
  id: string,
  status: StatusLevantamento
): Promise<ServiceResult<Levantamento>> {
  return atualizarLevantamento(id, { status })
}

export async function atualizarPercentualLevantamento(
  id: string,
  percentual: number
): Promise<ServiceResult<Levantamento>> {
  return atualizarLevantamento(id, { percentual })
}

export async function buscarLevantamentosPorEmpresa(
  empresaId: string
): Promise<ServiceResult<Levantamento[]>> {
  const data = list().filter((l) => l.empresa_id === empresaId)
  return { data, error: null }
}

export async function buscarLevantamentosPorStatus(
  status: StatusLevantamento
): Promise<ServiceResult<Levantamento[]>> {
  const data = list().filter((l) => l.status === status)
  return { data, error: null }
}

export async function buscarLevantamentosPorTipo(
  tipo: string
): Promise<ServiceResult<Levantamento[]>> {
  const data = list().filter((l) => l.tipo === tipo)
  return { data, error: null }
}

export async function listarLevantamentosPorSetor(
  setorId: string
): Promise<ServiceResult<Levantamento[]>> {
  const data = list().filter((l) => l.setor_id === setorId)
  return { data, error: null }
}

export async function buscarFormularioSetorialPorSetor(
  setorId: string
): Promise<ServiceResult<Levantamento | null>> {
  const found = list().find((l) => l.setor_id === setorId && l.tipo === 'LPR_AEP')
  return { data: found ?? null, error: null }
}

export async function criarFormularioSetorial(
  input: LevantamentoCreateInput & { setor_id: string; setor_nome: string }
): Promise<ServiceResult<Levantamento>> {
  const existing = list().find((l) => l.setor_id === input.setor_id && l.tipo === 'LPR_AEP')
  if (existing) {
    return { data: null, error: 'Já existe um formulário setorial LPR + AEP para este setor.' }
  }
  return criarLevantamento({ ...input, tipo: 'LPR_AEP' })
}

export async function abrirOuCriarFormularioSetorial(
  input: LevantamentoCreateInput & { setor_id: string; setor_nome: string }
): Promise<ServiceResult<Levantamento>> {
  const existing = list().find((l) => l.setor_id === input.setor_id && l.tipo === 'LPR_AEP')
  if (existing) return { data: existing, error: null }
  return criarLevantamento({ ...input, tipo: 'LPR_AEP' })
}
