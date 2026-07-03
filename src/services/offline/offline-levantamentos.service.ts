import { getOfflineDB, nowISO, type OfflineEntity } from '@/lib/offline-db'
import { createLocalId } from '@/lib/local-id'
import { criarBaseOfflineEntity, adicionarSyncAposSalvar } from './offline-storage.service'
import type { Levantamento, LevantamentoUpdateInput, LevantamentoCreateInput, StatusLevantamento } from '@/types/levantamento'
import type { ServiceResult } from '@/types/common'

type LevantamentoOffline = Levantamento & OfflineEntity

export async function listarLevantamentosOffline(): Promise<ServiceResult<Levantamento[]>> {
  try {
    const db = await getOfflineDB()
    const items = await db.getAll('levantamentos')
    const filtered = items.filter((l) => !l.deleted)
    return { data: filtered.map(stripOfflineFields), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function listarLevantamentosOfflinePorSetor(setorId: string): Promise<ServiceResult<Levantamento[]>> {
  try {
    const db = await getOfflineDB()
    const index = db.transaction('levantamentos').store.index('setor_id')
    const items = await index.getAll(setorId)
    const filtered = items.filter((l) => !l.deleted)
    return { data: filtered.map(stripOfflineFields), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function buscarLevantamentoOfflinePorId(id: string): Promise<ServiceResult<Levantamento>> {
  try {
    const db = await getOfflineDB()
    const item = await db.get('levantamentos', id)
    if (!item || item.deleted) {
      return { data: null, error: 'Levantamento não encontrado' }
    }
    return { data: stripOfflineFields(item), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function criarLevantamentoOffline(input: LevantamentoCreateInput): Promise<ServiceResult<Levantamento>> {
  try {
    const id = createLocalId('levantamento')
    const base = criarBaseOfflineEntity({ id, created_at: nowISO(), updated_at: nowISO() })

    const levantamento: LevantamentoOffline = {
      ...base,
      codigo: input.codigo ?? null,
      tipo: input.tipo ?? 'LPR_AEP',
      status: input.status ?? 'rascunho',
      percentual: input.percentual ?? 0,
      ultimo_step: input.ultimo_step ?? 1,
      progresso_percentual: input.progresso_percentual ?? null,
      ultima_edicao: input.ultima_edicao ?? null,
      ultima_sincronizacao: input.ultima_sincronizacao ?? null,
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
      caracteristicas_fisicas: input.caracteristicas_fisicas ?? null,
      iluminacao_ventilacao_conforto: input.iluminacao_ventilacao_conforto ?? null,
      seguranca_equipamentos: input.seguranca_equipamentos ?? null,
      epis_epcs_evidencias: input.epis_epcs_evidencias ?? null,
      caracteristicas: input.caracteristicas ?? {} as Levantamento['caracteristicas'],
      medicoes: input.medicoes ?? [],
      pontos_medicao: input.pontos_medicao ?? [],
      colaboradores: input.colaboradores ?? [],
      riscos: input.riscos ?? [],
      avaliacao_ergonomica: input.avaliacao_ergonomica ?? {} as Levantamento['avaliacao_ergonomica'],
      controles: input.controles ?? [],
      parecer: input.parecer ?? {} as Levantamento['parecer'],
      assinatura_tecnico: input.assinatura_tecnico ?? {} as Levantamento['assinatura_tecnico'],
      assinatura_empresa: input.assinatura_empresa ?? {} as Levantamento['assinatura_empresa'],
      observacoes: input.observacoes ?? null,
      user_id: 'offline_user',
    }

    const db = await getOfflineDB()
    await db.add('levantamentos', levantamento)
    await adicionarSyncAposSalvar('levantamentos', id, 'create', input)

    return { data: stripOfflineFields(levantamento), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function atualizarLevantamentoOffline(id: string, input: LevantamentoUpdateInput): Promise<ServiceResult<Levantamento>> {
  try {
    const db = await getOfflineDB()
    const existing = await db.get('levantamentos', id)
    if (!existing || existing.deleted) {
      return { data: null, error: 'Levantamento não encontrado' }
    }

    const updated: LevantamentoOffline = {
      ...existing,
      ...input,
      updated_at: nowISO(),
      cached_at: nowISO(),
    }

    await db.put('levantamentos', updated)
    await adicionarSyncAposSalvar('levantamentos', id, 'update', input)

    return { data: stripOfflineFields(updated), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function salvarRascunhoLevantamentoOffline(id: string, input: LevantamentoUpdateInput): Promise<ServiceResult<Levantamento>> {
  return atualizarLevantamentoOffline(id, { ...input, status: 'rascunho' })
}

export async function concluirLevantamentoOffline(id: string): Promise<ServiceResult<Levantamento>> {
  return atualizarLevantamentoOffline(id, {
    status: 'concluido' as StatusLevantamento,
  })
}

export async function excluirLevantamentoOffline(id: string): Promise<ServiceResult<boolean>> {
  try {
    const db = await getOfflineDB()
    const existing = await db.get('levantamentos', id)
    if (existing) {
      existing.deleted = true
      existing.updated_at = nowISO()
      await db.put('levantamentos', existing)
      await adicionarSyncAposSalvar('levantamentos', id, 'delete', { id })

      const relIndex = db.transaction('relatorios').store.index('levantamento_id')
      const relatorios = await relIndex.getAll(id)
      for (const rel of relatorios) {
        if (rel.deleted) continue
        rel.deleted = true
        rel.updated_at = nowISO()
        await db.put('relatorios', rel)
        await adicionarSyncAposSalvar('relatorios', rel.id, 'delete', { id: rel.id })
      }
    }
    return { data: true, error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

function stripOfflineFields(item: LevantamentoOffline): Levantamento {
  const { remote_id: _ri, cached_at: _ca, source: _sr, dirty: _d, deleted: _dl, ...rest } = item
  return rest as unknown as Levantamento
}
