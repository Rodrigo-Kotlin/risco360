import { isMockModeEnabled } from '@/lib/mock-mode'
import { isSupabaseConfigured } from '@/lib/supabase'
import { getClient, handleServiceError } from './base.service'
import { gerarCodigoLevantamento } from './codigo.service'
import { mapLevantamentoRowToLevantamento } from '@/lib/mappers'
import { isNetworkError } from '@/lib/network'
import {
  criarLevantamentoOffline,
  atualizarLevantamentoOffline,
  excluirLevantamentoOffline,
  listarLevantamentosOffline,
  listarLevantamentosOfflinePorSetor,
  buscarLevantamentoOfflinePorId,
} from './offline/offline-levantamentos.service'
import { cacheLevantamentoLocalmente } from './sync.service'
import type { ServiceResult } from '@/types/common'
import type {
  Levantamento,
  LevantamentoCreateInput,
  LevantamentoUpdateInput,
  StatusLevantamento,
  TipoLevantamento,
  ParecerTecnico,
  Assinatura,
} from '@/types/levantamento'
import { STATUS_LEVANTAMENTO_VALIDOS } from '@/types/levantamento'
import type { LevantamentoRow } from '@/types/database'
import * as mockService from './mock-levantamentos.service'

export async function listarLevantamentos(): Promise<ServiceResult<Levantamento[]>> {
  if (isMockModeEnabled) return mockService.listarLevantamentos()

  if (navigator.onLine && isSupabaseConfigured) {
    try {
      const client = getClient()
      const { data, error } = await client
        .from('levantamentos')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error

      const levantamentos = (data ?? []).map(mapLevantamentoRowToLevantamento)
      for (const lev of levantamentos) {
        await cacheLevantamentoLocalmente(lev)
      }
      return { data: levantamentos, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return listarLevantamentosOffline()
      }
      return handleServiceError('Erro ao listar levantamentos:', error)
    }
  }

  return listarLevantamentosOffline()
}

export async function buscarLevantamentoPorId(
  id: string
): Promise<ServiceResult<Levantamento>> {
  if (isMockModeEnabled) return mockService.buscarLevantamentoPorId(id)

  if (navigator.onLine && isSupabaseConfigured && !id.startsWith('local_')) {
    try {
      const client = getClient()
      const { data, error } = await client
        .from('levantamentos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      const levantamento = mapLevantamentoRowToLevantamento(data)
      await cacheLevantamentoLocalmente(levantamento)
      return { data: levantamento, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return buscarLevantamentoOfflinePorId(id)
      }
      return handleServiceError('Erro ao buscar levantamento:', error)
    }
  }

  return buscarLevantamentoOfflinePorId(id)
}

export async function criarLevantamento(
  input: LevantamentoCreateInput
): Promise<ServiceResult<Levantamento>> {
  if (isMockModeEnabled) return mockService.criarLevantamento(input)

  if (navigator.onLine && isSupabaseConfigured) {
    try {
      const client = getClient()

      const { data: userData, error: userError } = await client.auth.getUser()

      if (userError) throw userError
      if (!userData.user) {
        return { data: null, error: 'Usuário não autenticado.' }
      }

      let codigo = input.codigo

      if (!codigo) {
        const codigoResult = await gerarCodigoLevantamento()
        if (codigoResult.data) {
          codigo = codigoResult.data
        }
      }

      const jsonb = <T>(v: T): Record<string, unknown> => v as unknown as Record<string, unknown>
      const jsonbArr = <T>(v: T[]): Record<string, unknown>[] => v as unknown as Record<string, unknown>[]

      const payload: Omit<LevantamentoRow, 'id' | 'created_at' | 'updated_at'> = {
        codigo: codigo ?? null,
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
        caracteristicas_fisicas: jsonb(input.caracteristicas_fisicas ?? {}),
        iluminacao_ventilacao_conforto: jsonb(input.iluminacao_ventilacao_conforto ?? {}),
        seguranca_equipamentos: jsonb(input.seguranca_equipamentos ?? {}),
        epis_epcs_evidencias: jsonb(input.epis_epcs_evidencias ?? {}),
        caracteristicas: jsonb(input.caracteristicas ?? {}),
        medicoes: jsonbArr(input.medicoes ?? []),
        pontos_medicao: jsonbArr(input.pontos_medicao ?? []),
        colaboradores: jsonbArr(input.colaboradores ?? []),
        riscos: jsonbArr(input.riscos ?? []),
        avaliacao_ergonomica: jsonb(input.avaliacao_ergonomica ?? {}),
        avaliacao_ergonomica_preliminar: jsonb(input.avaliacao_ergonomica_preliminar ?? {}),
        controles: jsonbArr(input.controles ?? []),
        plano_acao: jsonbArr(input.plano_acao ?? []),
        parecer: jsonb(input.parecer ?? {}),
        assinatura_tecnico: jsonb(input.assinatura_tecnico ?? {}),
        assinatura_empresa: jsonb(input.assinatura_empresa ?? {}),
        observacoes: input.observacoes ?? null,
        user_id: userData.user.id,
      }

      const { data, error } = await client
        .from('levantamentos')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error

      const lev = mapLevantamentoRowToLevantamento(data)
      await cacheLevantamentoLocalmente(lev)
      return { data: lev, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return criarLevantamentoOffline(input)
      }
      return handleServiceError('Erro ao criar levantamento:', error)
    }
  }

  return criarLevantamentoOffline(input)
}

export async function atualizarLevantamento(
  id: string,
  input: LevantamentoUpdateInput
): Promise<ServiceResult<Levantamento>> {
  if (isMockModeEnabled) return mockService.atualizarLevantamento(id, input)

  if (navigator.onLine && isSupabaseConfigured && !id.startsWith('local_')) {
    try {
      const client = getClient()

      const { data: userData, error: userError } = await client.auth.getUser()

      if (userError) throw userError
      if (!userData.user) {
        return { data: null, error: 'Usuário não autenticado.' }
      }

      const jsonb = <T>(v: T): Record<string, unknown> => v as unknown as Record<string, unknown>
      const jsonbArr = <T>(v: T[]): Record<string, unknown>[] => v as unknown as Record<string, unknown>[]

      const payload: Record<string, unknown> = {}

      if (input.codigo !== undefined) payload.codigo = input.codigo
      if (input.tipo !== undefined) payload.tipo = input.tipo
      if (input.status !== undefined) payload.status = input.status
      if (input.percentual !== undefined) payload.percentual = input.percentual
      if (input.empresa_id !== undefined) payload.empresa_id = input.empresa_id
      if (input.empresa_nome !== undefined) payload.empresa_nome = input.empresa_nome
      if (input.cnpj !== undefined) payload.cnpj = input.cnpj
      if (input.unidade !== undefined) payload.unidade = input.unidade
      if (input.setor !== undefined) payload.setor = input.setor
      if (input.setor_id !== undefined) payload.setor_id = input.setor_id
      if (input.setor_nome !== undefined) payload.setor_nome = input.setor_nome
      if (input.responsavel_empresa !== undefined) {
        payload.responsavel_empresa = input.responsavel_empresa
      }
      if (input.auditor_tecnico !== undefined) {
        payload.auditor_tecnico = input.auditor_tecnico
      }
      if (input.registro_mte !== undefined) payload.registro_mte = input.registro_mte
      if (input.data_levantamento !== undefined) {
        payload.data_levantamento = input.data_levantamento
      }
      if (input.data_lancamento_sgg !== undefined) {
        payload.data_lancamento_sgg = input.data_lancamento_sgg
      }
      if (input.responsavel_lancamento !== undefined) {
        payload.responsavel_lancamento = input.responsavel_lancamento
      }
      if (input.caracteristicas_fisicas !== undefined) {
        payload.caracteristicas_fisicas = jsonb(input.caracteristicas_fisicas)
      }
      if (input.iluminacao_ventilacao_conforto !== undefined) {
        payload.iluminacao_ventilacao_conforto = jsonb(input.iluminacao_ventilacao_conforto)
      }
      if (input.seguranca_equipamentos !== undefined) {
        payload.seguranca_equipamentos = jsonb(input.seguranca_equipamentos)
      }
      if (input.epis_epcs_evidencias !== undefined) {
        payload.epis_epcs_evidencias = jsonb(input.epis_epcs_evidencias)
      }
      if (input.caracteristicas !== undefined) {
        payload.caracteristicas = jsonb(input.caracteristicas)
      }
      if (input.medicoes !== undefined) {
        payload.medicoes = jsonbArr(input.medicoes)
      }
      if (input.pontos_medicao !== undefined) {
        payload.pontos_medicao = jsonbArr(input.pontos_medicao)
      }
      if (input.colaboradores !== undefined) {
        payload.colaboradores = jsonbArr(input.colaboradores)
      }
      if (input.riscos !== undefined) {
        payload.riscos = jsonbArr(input.riscos)
      }
      if (input.avaliacao_ergonomica !== undefined) {
        payload.avaliacao_ergonomica = jsonb(input.avaliacao_ergonomica)
      }
      if (input.avaliacao_ergonomica_preliminar !== undefined) {
        payload.avaliacao_ergonomica_preliminar = jsonb(input.avaliacao_ergonomica_preliminar)
      }
      if (input.controles !== undefined) {
        payload.controles = jsonbArr(input.controles)
      }
      if (input.plano_acao !== undefined) {
        payload.plano_acao = jsonbArr(input.plano_acao)
      }
      if (input.parecer !== undefined) {
        payload.parecer = jsonb(input.parecer)
      }
      if (input.assinatura_tecnico !== undefined) {
        payload.assinatura_tecnico = jsonb(input.assinatura_tecnico)
      }
      if (input.assinatura_empresa !== undefined) {
        payload.assinatura_empresa = jsonb(input.assinatura_empresa)
      }
      if (input.observacoes !== undefined) payload.observacoes = input.observacoes

      const { data, error } = await client
        .from('levantamentos')
        .update(payload)
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .select('*')
        .maybeSingle()

      if (error) throw error

      if (!data) {
        return {
          data: null,
          error: 'Levantamento não encontrado no servidor ou sem permissão de acesso. Recarregue a lista e tente novamente.',
        }
      }

      const lev = mapLevantamentoRowToLevantamento(data)
      await cacheLevantamentoLocalmente(lev)
      return { data: lev, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return atualizarLevantamentoOffline(id, input)
      }
      return handleServiceError('Erro ao atualizar levantamento:', error)
    }
  }

  return atualizarLevantamentoOffline(id, input)
}

export async function excluirLevantamento(
  id: string
): Promise<ServiceResult<boolean>> {
  if (isMockModeEnabled) return mockService.excluirLevantamento(id)

  if (navigator.onLine && isSupabaseConfigured && !id.startsWith('local_')) {
    try {
      const client = getClient()
      const { error } = await client
        .from('levantamentos')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return excluirLevantamentoOffline(id)
      }
      return handleServiceError('Erro ao excluir levantamento:', error)
    }
  }

  return excluirLevantamentoOffline(id)
}

export async function duplicarLevantamento(
  id: string
): Promise<ServiceResult<Levantamento>> {
  if (isMockModeEnabled) return mockService.duplicarLevantamento(id)
  const original = await buscarLevantamentoPorId(id)

  if (original.error) {
    return { data: null, error: original.error }
  }

  if (!original.data) {
    return { data: null, error: 'Levantamento original não encontrado.' }
  }

  const orig = original.data

  const input: LevantamentoCreateInput = {
    tipo: orig.tipo,
    status: 'rascunho',
    percentual: 0,
    empresa_id: orig.empresa_id ?? undefined,
    empresa_nome: orig.empresa_nome ?? undefined,
    cnpj: orig.cnpj ?? undefined,
    unidade: orig.unidade ?? undefined,
    setor: orig.setor ?? undefined,
    setor_id: orig.setor_id ?? undefined,
    setor_nome: orig.setor_nome ?? undefined,
    responsavel_empresa: orig.responsavel_empresa ?? undefined,
    auditor_tecnico: orig.auditor_tecnico ?? undefined,
    registro_mte: orig.registro_mte ?? undefined,
    data_levantamento: orig.data_levantamento ?? undefined,
    data_lancamento_sgg: orig.data_lancamento_sgg ?? undefined,
    responsavel_lancamento: orig.responsavel_lancamento ?? undefined,
    caracteristicas: orig.caracteristicas,
    medicoes: [],
    colaboradores: [],
    riscos: [],
    controles: [],
    parecer: {} as ParecerTecnico,
    assinatura_tecnico: {} as Assinatura,
    assinatura_empresa: {} as Assinatura,
    observacoes: `Duplicado do levantamento ${orig.codigo ?? orig.id}`,
  }

  return criarLevantamento(input)
}

export async function atualizarStatusLevantamento(
  id: string,
  status: StatusLevantamento
): Promise<ServiceResult<Levantamento>> {
  if (!STATUS_LEVANTAMENTO_VALIDOS.includes(status)) {
    if (import.meta.env.DEV) {
      console.error('[DevError] Status de levantamento inválido:', status)
    }
    return {
      data: null,
      error: 'Status de levantamento inválido. Recarregue a página e tente novamente.',
    }
  }

  if (isMockModeEnabled) return mockService.atualizarStatusLevantamento(id, status)

  if (navigator.onLine && isSupabaseConfigured && !id.startsWith('local_')) {
    try {
      const client = getClient()
      const { data: userData, error: userError } = await client.auth.getUser()

      if (userError) throw userError
      if (!userData.user) {
        return { data: null, error: 'Usuário não autenticado.' }
      }

      const { data, error } = await client
        .from('levantamentos')
        .update({ status })
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .select('*')
        .maybeSingle()

      if (error) throw error

      if (!data) {
        return {
          data: null,
          error: 'Levantamento não encontrado no servidor ou sem permissão de acesso. Recarregue a lista e tente novamente.',
        }
      }

      const lev = mapLevantamentoRowToLevantamento(data)
      await cacheLevantamentoLocalmente(lev)
      return { data: lev, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return atualizarLevantamentoOffline(id, { status })
      }
      return handleServiceError('Erro ao atualizar status do levantamento:', error)
    }
  }

  return atualizarLevantamentoOffline(id, { status })
}

export async function atualizarPercentualLevantamento(
  id: string,
  percentual: number
): Promise<ServiceResult<Levantamento>> {
  if (isMockModeEnabled) return mockService.atualizarPercentualLevantamento(id, percentual)

  if (navigator.onLine && isSupabaseConfigured && !id.startsWith('local_')) {
    try {
      const client = getClient()
      const { data: userData, error: userError } = await client.auth.getUser()

      if (userError) throw userError
      if (!userData.user) {
        return { data: null, error: 'Usuário não autenticado.' }
      }

      const clampedPercentual = Math.min(100, Math.max(0, percentual))

      const { data, error } = await client
        .from('levantamentos')
        .update({ percentual: clampedPercentual })
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .select('*')
        .maybeSingle()

      if (error) throw error

      if (!data) {
        return {
          data: null,
          error: 'Levantamento não encontrado no servidor ou sem permissão de acesso. Recarregue a lista e tente novamente.',
        }
      }

      const lev = mapLevantamentoRowToLevantamento(data)
      await cacheLevantamentoLocalmente(lev)
      return { data: lev, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return atualizarLevantamentoOffline(id, { percentual })
      }
      return handleServiceError('Erro ao atualizar percentual do levantamento:', error)
    }
  }

  return atualizarLevantamentoOffline(id, { percentual })
}

export async function buscarLevantamentosPorEmpresa(
  empresaId: string
): Promise<ServiceResult<Levantamento[]>> {
  if (isMockModeEnabled) return mockService.buscarLevantamentosPorEmpresa(empresaId)

  if (navigator.onLine && isSupabaseConfigured && !empresaId.startsWith('local_')) {
    try {
      const client = getClient()
      const { data, error } = await client
        .from('levantamentos')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      const levantamentos = (data ?? []).map(mapLevantamentoRowToLevantamento)
      for (const lev of levantamentos) {
        await cacheLevantamentoLocalmente(lev)
      }
      return { data: levantamentos, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return listarLevantamentosOffline()
      }
      return handleServiceError('Erro ao buscar levantamentos da empresa:', error)
    }
  }

  return listarLevantamentosOffline()
}

export async function buscarLevantamentosPorStatus(
  status: StatusLevantamento
): Promise<ServiceResult<Levantamento[]>> {
  if (isMockModeEnabled) return mockService.buscarLevantamentosPorStatus(status)

  if (navigator.onLine && isSupabaseConfigured) {
    try {
      const client = getClient()
      const { data, error } = await client
        .from('levantamentos')
        .select('*')
        .eq('status', status)
        .order('updated_at', { ascending: false })

      if (error) throw error

      const levantamentos = (data ?? []).map(mapLevantamentoRowToLevantamento)
      for (const lev of levantamentos) {
        await cacheLevantamentoLocalmente(lev)
      }
      return { data: levantamentos, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return listarLevantamentosOffline()
      }
      return handleServiceError('Erro ao buscar levantamentos por status:', error)
    }
  }

  return listarLevantamentosOffline()
}

export async function buscarLevantamentosPorTipo(
  tipo: TipoLevantamento
): Promise<ServiceResult<Levantamento[]>> {
  if (isMockModeEnabled) return mockService.buscarLevantamentosPorTipo(tipo)

  if (navigator.onLine && isSupabaseConfigured) {
    try {
      const client = getClient()
      const { data, error } = await client
        .from('levantamentos')
        .select('*')
        .eq('tipo', tipo)
        .order('updated_at', { ascending: false })

      if (error) throw error

      const levantamentos = (data ?? []).map(mapLevantamentoRowToLevantamento)
      for (const lev of levantamentos) {
        await cacheLevantamentoLocalmente(lev)
      }
      return { data: levantamentos, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return listarLevantamentosOffline()
      }
      return handleServiceError('Erro ao buscar levantamentos por tipo:', error)
    }
  }

  return listarLevantamentosOffline()
}

export async function listarLevantamentosPorSetor(
  setorId: string
): Promise<ServiceResult<Levantamento[]>> {
  if (isMockModeEnabled) return mockService.listarLevantamentosPorSetor(setorId)

  if (navigator.onLine && isSupabaseConfigured && !setorId.startsWith('local_')) {
    try {
      const client = getClient()
      const { data, error } = await client
        .from('levantamentos')
        .select('*')
        .eq('setor_id', setorId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      const levantamentos = (data ?? []).map(mapLevantamentoRowToLevantamento)
      for (const lev of levantamentos) {
        await cacheLevantamentoLocalmente(lev)
      }
      return { data: levantamentos, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        return listarLevantamentosOfflinePorSetor(setorId)
      }
      return handleServiceError('Erro ao listar levantamentos do setor:', error)
    }
  }

  return listarLevantamentosOfflinePorSetor(setorId)
}

export async function buscarFormularioSetorialPorSetor(
  setorId: string
): Promise<ServiceResult<Levantamento | null>> {
  if (isMockModeEnabled) return mockService.buscarFormularioSetorialPorSetor(setorId)

  if (navigator.onLine && isSupabaseConfigured && !setorId.startsWith('local_')) {
    try {
      const client = getClient()
      const { data, error } = await client
        .from('levantamentos')
        .select('*')
        .eq('setor_id', setorId)
        .eq('tipo', 'LPR_AEP')
        .order('updated_at', { ascending: false })
        .limit(1)

      if (error) throw error

      const rows = data ?? []
      if (rows.length > 0) {
        const lev = mapLevantamentoRowToLevantamento(rows[0])
        await cacheLevantamentoLocalmente(lev)
        return { data: lev, error: null }
      }
      return { data: null, error: null }
    } catch (error) {
      if (isNetworkError(error)) {
        const levs = await listarLevantamentosOfflinePorSetor(setorId)
        if (levs.data) {
          const found = levs.data.find(l => l.tipo === 'LPR_AEP')
          return { data: found ?? null, error: null }
        }
        return { data: null, error: levs.error }
      }
      return handleServiceError('Erro ao buscar formulário setorial do setor:', error)
    }
  }

  const levs = await listarLevantamentosOfflinePorSetor(setorId)
  if (levs.data) {
    const found = levs.data.find(l => l.tipo === 'LPR_AEP')
    return { data: found ?? null, error: null }
  }
  return { data: null, error: levs.error }
}

export async function criarFormularioSetorial(
  input: LevantamentoCreateInput & { setor_id: string; setor_nome: string }
): Promise<ServiceResult<Levantamento>> {
  if (isMockModeEnabled) return mockService.criarFormularioSetorial(input)

  const existing = await buscarFormularioSetorialPorSetor(input.setor_id)
  if (existing.error) return { data: null, error: existing.error }
  if (existing.data) {
    return { data: null, error: 'Já existe um formulário setorial LPR + AEP para este setor.' }
  }

  return criarLevantamento({
    ...input,
    tipo: 'LPR_AEP',
  })
}

export async function abrirOuCriarFormularioSetorial(
  input: LevantamentoCreateInput & { setor_id: string; setor_nome: string }
): Promise<ServiceResult<Levantamento>> {
  if (isMockModeEnabled) return mockService.abrirOuCriarFormularioSetorial(input)

  const existing = await buscarFormularioSetorialPorSetor(input.setor_id)
  if (existing.error) return { data: null, error: existing.error }
  if (existing.data) return { data: existing.data, error: null }

  return criarLevantamento({
    ...input,
    tipo: 'LPR_AEP',
  })
}
