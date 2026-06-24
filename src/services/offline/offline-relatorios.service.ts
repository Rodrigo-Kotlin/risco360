import { getOfflineDB, nowISO, type OfflineEntity } from '@/lib/offline-db'
import { createLocalId } from '@/lib/local-id'
import { criarBaseOfflineEntity, adicionarSyncAposSalvar } from './offline-storage.service'
import type { Relatorio } from '@/types/relatorio'
import type { ServiceResult } from '@/types/common'

type RelatorioOffline = Relatorio & OfflineEntity

export async function listarRelatoriosOffline(): Promise<ServiceResult<Relatorio[]>> {
  try {
    const db = await getOfflineDB()
    const items = await db.getAll('relatorios')
    const filtered = items.filter((r) => !r.deleted)
    return { data: filtered.map(stripOfflineFields), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function buscarRelatorioOffline(id: string): Promise<ServiceResult<Relatorio>> {
  try {
    const db = await getOfflineDB()
    const item = await db.get('relatorios', id)
    if (!item || item.deleted) return { data: null, error: 'Relatório não encontrado' }
    return { data: stripOfflineFields(item), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function criarRelatorioOffline(input: Partial<Relatorio>): Promise<ServiceResult<Relatorio>> {
  try {
    const id = createLocalId('relatorio')
    const base = criarBaseOfflineEntity({ id })
    const relatorio: RelatorioOffline = {
      ...base,
      id,
      levantamento_id: input.levantamento_id ?? null,
      empresa_nome: input.empresa_nome ?? null,
      tipo: input.tipo ?? 'completo',
      modelo: input.modelo ?? null,
      status: input.status ?? 'gerado',
      arquivo_url: input.arquivo_url ?? null,
      metadados: input.metadados ?? {},
      user_id: input.user_id ?? 'offline_user',
      created_at: nowISO(),
      updated_at: nowISO(),
    }

    const db = await getOfflineDB()
    await db.add('relatorios', relatorio)
    await adicionarSyncAposSalvar('relatorios', id, 'create', input)

    return { data: stripOfflineFields(relatorio), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function excluirRelatorioOffline(id: string): Promise<ServiceResult<boolean>> {
  try {
    const db = await getOfflineDB()
    const existing = await db.get('relatorios', id)
    if (existing) {
      existing.deleted = true
      existing.updated_at = nowISO()
      await db.put('relatorios', existing)
      await adicionarSyncAposSalvar('relatorios', id, 'delete', { id })
    }
    return { data: true, error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

function stripOfflineFields(item: RelatorioOffline): Relatorio {
  const { remote_id: _ri, cached_at: _ca, source: _sr, sync_status: _ss, dirty: _d, deleted: _dl, ...rest } = item
  return rest as unknown as Relatorio
}
