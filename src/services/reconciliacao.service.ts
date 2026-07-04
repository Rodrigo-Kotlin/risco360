import { getClient } from './base.service'
import { getOfflineDB, nowISO } from '@/lib/offline-db'

export interface DiferencaRegistro {
  entidade: string
  tipo: 'faltando_no_local' | 'faltando_no_remoto' | 'desatualizado' | 'divergente'
  id_local: string | null
  id_remoto: string | null
  campo?: string
  valor_local?: unknown
  valor_remoto?: unknown
}

export interface RelatorioReconciliacao {
  executado_em: string
  total_diferencas: number
  diferencas: DiferencaRegistro[]
}

export async function reconciliarCache(): Promise<RelatorioReconciliacao> {
  const client = getClient()
  const db = await getOfflineDB()
  const diferencas: DiferencaRegistro[] = []

  const { data: userData } = await client.auth.getUser()
  if (!userData?.user) {
    return {
      executado_em: nowISO(),
      total_diferencas: 0,
      diferencas: [],
    }
  }

  type Tabela = 'empresas' | 'setores' | 'levantamentos' | 'evidencias' | 'relatorios'
  const entidades: Array<{ nome: string; tabela: Tabela; store: string; }> = [
    { nome: 'empresa', tabela: 'empresas', store: 'empresas' },
    { nome: 'setor', tabela: 'setores', store: 'setores' },
    { nome: 'levantamento', tabela: 'levantamentos', store: 'levantamentos' },
    { nome: 'evidencia', tabela: 'evidencias', store: 'evidencias' },
    { nome: 'relatorio', tabela: 'relatorios', store: 'relatorios' },
  ]

  for (const ent of entidades) {
    const { data: remotos, error } = await client
      .from(ent.tabela)
      .select('id, updated_at')
      .is('deleted_at', null)
      .eq('user_id', userData.user.id)

    if (error) {
      diferencas.push({
        entidade: ent.nome,
        tipo: 'divergente',
        id_local: null,
        id_remoto: null,
        campo: 'erro_consulta',
        valor_local: null,
        valor_remoto: error.message,
      })
      continue
    }

    const locais = await db.getAll(ent.store)
    const locaisPorRemoteId = new Map<string, typeof locais[0]>()
    const locaisPorLocalId = new Map<string, typeof locais[0]>()
    for (const l of locais) {
      if (l.deleted) continue
      if (l.remote_id) locaisPorRemoteId.set(l.remote_id, l)
      if (l.id) locaisPorLocalId.set(l.id, l)
    }

    const remotosMap = new Map(remotos?.map(r => [r.id, r]) ?? [])

    for (const remoto of remotos ?? []) {
      const local = locaisPorRemoteId.get(remoto.id)
      if (!local) {
        diferencas.push({
          entidade: ent.nome,
          tipo: 'faltando_no_local',
          id_local: null,
          id_remoto: remoto.id,
          campo: 'id',
          valor_local: null,
          valor_remoto: remoto.id,
        })
        continue
      }

      if (new Date(local.updated_at).getTime() < new Date(remoto.updated_at).getTime()) {
        diferencas.push({
          entidade: ent.nome,
          tipo: 'desatualizado',
          id_local: local.id,
          id_remoto: remoto.id,
          campo: 'updated_at',
          valor_local: local.updated_at,
          valor_remoto: remoto.updated_at,
        })
      }
    }

    for (const local of locais) {
      if (local.deleted) continue
      if (local.remote_id && remotosMap.has(local.remote_id)) continue
      if (!local.remote_id && local.sync_status === 'synced') {
        diferencas.push({
          entidade: ent.nome,
          tipo: 'faltando_no_remoto',
          id_local: local.id,
          id_remoto: null,
          campo: 'id',
          valor_local: local.id,
          valor_remoto: null,
        })
      }
    }
  }

  return {
    executado_em: nowISO(),
    total_diferencas: diferencas.length,
    diferencas,
  }
}
