import { getOfflineDB, nowISO, type OfflineEntity } from '@/lib/offline-db'
import { createLocalId } from '@/lib/local-id'
import { criarBaseOfflineEntity, adicionarSyncAposSalvar } from './offline-storage.service'
import type { Empresa } from '@/types/empresa'
import type { ServiceResult } from '@/types/common'

type EmpresaOffline = Empresa & OfflineEntity

export async function listarEmpresasOffline(): Promise<ServiceResult<Empresa[]>> {
  try {
    const db = await getOfflineDB()
    const items = await db.getAll('empresas')
    const filtered = items.filter((e) => !e.deleted)
    const mapped = filtered.map(stripOfflineFields)
    return { data: mapped, error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function buscarEmpresaOfflinePorId(id: string): Promise<ServiceResult<Empresa>> {
  try {
    const db = await getOfflineDB()
    const item = await db.get('empresas', id)
    if (!item || item.deleted) {
      return { data: null, error: 'Empresa não encontrada' }
    }
    return { data: stripOfflineFields(item), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function criarEmpresaOffline(input: Partial<Empresa>): Promise<ServiceResult<Empresa>> {
  try {
    const id = createLocalId('empresa')
    const base = criarBaseOfflineEntity({ id, created_at: nowISO(), updated_at: nowISO() })
    const empresa: EmpresaOffline = {
      ...base,
      razao_social: input.razao_social ?? '',
      nome_fantasia: input.nome_fantasia ?? null,
      cnpj: input.cnpj ?? null,
      cnae: input.cnae ?? null,
      grau_risco: input.grau_risco ?? null,
      endereco: input.endereco ?? null,
      numero: input.numero ?? null,
      bairro: input.bairro ?? null,
      cidade: input.cidade ?? null,
      uf: input.uf ?? null,
      cep: input.cep ?? null,
      responsavel: input.responsavel ?? null,
      telefone: input.telefone ?? null,
      email: input.email ?? null,
      observacoes: input.observacoes ?? null,
      user_id: input.user_id ?? 'offline_user',
    }

    const db = await getOfflineDB()
    await db.add('empresas', empresa)
    await adicionarSyncAposSalvar('empresas', id, 'create', input)

    return { data: stripOfflineFields(empresa), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function atualizarEmpresaOffline(id: string, input: Partial<Empresa>): Promise<ServiceResult<Empresa>> {
  try {
    const db = await getOfflineDB()
    const existing = await db.get('empresas', id)
    if (!existing || existing.deleted) {
      return { data: null, error: 'Empresa não encontrada' }
    }

    const updated: EmpresaOffline = {
      ...existing,
      ...input,
      updated_at: nowISO(),
      cached_at: nowISO(),
    }

    await db.put('empresas', updated)
    await adicionarSyncAposSalvar('empresas', id, 'update', input)

    return { data: stripOfflineFields(updated), error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function excluirEmpresaOffline(id: string): Promise<ServiceResult<boolean>> {
  try {
    const db = await getOfflineDB()

    const existing = await db.get('empresas', id)
    if (!existing) {
      return { data: false, error: 'Empresa não encontrada' }
    }

    existing.deleted = true
    existing.updated_at = nowISO()
    await db.put('empresas', existing)
    await adicionarSyncAposSalvar('empresas', id, 'delete', { id })

    const setorIndex = db.transaction('setores').store.index('empresa_id')
    const setores = await setorIndex.getAll(id)
    for (const setor of setores) {
      if (setor.deleted) continue

      setor.deleted = true
      setor.updated_at = nowISO()
      await db.put('setores', setor)
      await adicionarSyncAposSalvar('setores', setor.id, 'delete', { id: setor.id })

      const levIndex = db.transaction('levantamentos').store.index('setor_id')
      const levantamentos = await levIndex.getAll(setor.id)
      for (const lev of levantamentos) {
        if (lev.deleted) continue

        lev.deleted = true
        lev.updated_at = nowISO()
        await db.put('levantamentos', lev)
        await adicionarSyncAposSalvar('levantamentos', lev.id, 'delete', { id: lev.id })

        const relIndex = db.transaction('relatorios').store.index('levantamento_id')
        const relatorios = await relIndex.getAll(lev.id)
        for (const rel of relatorios) {
          if (rel.deleted) continue
          rel.deleted = true
          rel.updated_at = nowISO()
          await db.put('relatorios', rel)
          await adicionarSyncAposSalvar('relatorios', rel.id, 'delete', { id: rel.id })
        }
      }
    }

    return { data: true, error: null }
  } catch (error) {
    return { data: null, error: String(error) }
  }
}

export async function salvarEmpresasNoCache(empresas: Empresa[]): Promise<void> {
  const db = await getOfflineDB()
  const tx = db.transaction('empresas', 'readwrite')
  for (const empresa of empresas) {
    const existing = await tx.store.get(empresa.id)
    if (!existing) {
      const base = criarBaseOfflineEntity({
        id: empresa.id,
        source: 'mock',
        sync_status: 'synced',
        dirty: false,
      })
      await tx.store.add({
        ...base,
        ...empresa,
        updated_at: nowISO(),
        cached_at: nowISO(),
      })
    }
  }
  await tx.done
}

function stripOfflineFields(item: EmpresaOffline): Empresa {
  const { remote_id: _ri, cached_at: _ca, source: _sr, dirty: _d, deleted: _dl, ...rest } = item
  return rest as unknown as Empresa
}
