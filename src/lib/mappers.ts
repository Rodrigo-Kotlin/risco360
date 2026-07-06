import {
  STATUS_LEVANTAMENTO_VALIDOS,
} from '@/types/levantamento'
import type {
  ProfileRow,
  EmpresaRow,
  SetorRow,
  LevantamentoRow,
  BibliotecaTecnicaRow,
  RelatorioRow,
} from '@/types/database'
import type { Profile } from '@/types'
import type { Empresa, Setor } from '@/types/empresa'
import type { Levantamento, CaracteristicasLocal, Medicao, ColaboradorExposto, ParecerTecnico, Assinatura, AvaliacaoErgonomica, CaracteristicasFisicas, IluminacaoVentilacaoConforto, SegurancaEquipamentos, EpisEpcsEvidencias } from '@/types/levantamento'
import type { RiscoOcupacional, PlanoAcaoItem } from '@/types/risco'
import type { BibliotecaTecnicaItem } from '@/types/biblioteca'
import type { Relatorio } from '@/types/relatorio'
import { normalizePontosMedicao } from './normalizers'
import type { SyncStatus } from './offline-db'

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function ensureObject<T>(
  value: unknown,
  fallback: T
): T {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fallback
  }
  return { ...fallback, ...(value as Partial<T>) } as T
}

export function mapProfileRowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone,
    cargo: row.cargo,
    empresa: row.empresa,
    avatar_url: row.avatar_url,
    role: row.role,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function mapEmpresaRowToEmpresa(row: EmpresaRow): Empresa {
  return {
    id: row.id,
    razao_social: row.razao_social,
    nome_fantasia: row.nome_fantasia,
    cnpj: row.cnpj,
    cnae: row.cnae,
    grau_risco: row.grau_risco,
    endereco: row.endereco,
    numero: row.numero,
    bairro: row.bairro,
    cidade: row.cidade,
    uf: row.uf,
    cep: row.cep,
    responsavel: row.responsavel,
    telefone: row.telefone,
    email: row.email,
    observacoes: row.observacoes,
    cnae_principal: row.cnae_principal ?? undefined,
    cnae_principal_descricao: row.cnae_principal_descricao ?? undefined,
    cnaes_secundarios: (() => {
      if (!row.cnaes_secundarios || !Array.isArray(row.cnaes_secundarios)) return undefined
      return row.cnaes_secundarios.map((item) => ({
        codigo: String((item as Record<string, unknown>).codigo ?? ''),
        descricao: String((item as Record<string, unknown>).descricao ?? ''),
      }))
    })(),
    grau_risco_nr4: row.grau_risco_nr4 ?? undefined,
    user_id: row.user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    sync_status: (row as unknown as Record<string, unknown>).sync_status as SyncStatus | undefined,
  }
}

export function mapSetorRowToSetor(row: SetorRow): Setor {
  return {
    id: row.id,
    empresa_id: row.empresa_id,
    nome: row.nome,
    descricao: row.descricao,
    localizacao: row.localizacao,
    responsavel_local: row.responsavel_local,
    observacoes: row.observacoes,
    user_id: row.user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    sync_status: (row as unknown as Record<string, unknown>).sync_status as SyncStatus | undefined,
  }
}

export function mapLevantamentoRowToLevantamento(row: LevantamentoRow): Levantamento {
  return {
    id: row.id,
    codigo: row.codigo,
    tipo: row.tipo as Levantamento['tipo'],
    status: (STATUS_LEVANTAMENTO_VALIDOS.includes(row.status)
      ? row.status
      : 'rascunho') as Levantamento['status'],
    percentual: row.percentual,
    ultimo_step: row.ultimo_step ?? 1,
    progresso_percentual: row.progresso_percentual ?? null,
    ultima_edicao: row.ultima_edicao ?? null,
    ultima_sincronizacao: row.ultima_sincronizacao ?? null,
    empresa_id: row.empresa_id,
    empresa_nome: row.empresa_nome,
    cnpj: row.cnpj,
    unidade: row.unidade,
    setor: row.setor,
    setor_id: row.setor_id,
    setor_nome: row.setor_nome,
    responsavel_empresa: row.responsavel_empresa,
    auditor_tecnico: row.auditor_tecnico,
    registro_mte: row.registro_mte,
    data_levantamento: row.data_levantamento,
    data_lancamento_sgg: row.data_lancamento_sgg,
    responsavel_lancamento: row.responsavel_lancamento,
    observacoes_iniciais: row.observacoes_iniciais ?? null,
    caracteristicas_fisicas: (row.caracteristicas_fisicas ?? row.caracteristicas ?? {}) as unknown as CaracteristicasFisicas | null,
    iluminacao_ventilacao_conforto: (row.iluminacao_ventilacao_conforto ?? {}) as unknown as IluminacaoVentilacaoConforto | null,
    seguranca_equipamentos: (row.seguranca_equipamentos ?? {}) as unknown as SegurancaEquipamentos | null,
    epis_epcs_evidencias: (() => {
      const raw = row.epis_epcs_evidencias ?? {}
      if (typeof raw !== 'object' || raw === null) return null
      const d = raw as Record<string, unknown>
      const result: Record<string, unknown> = {
        observacoes: typeof d.observacoes === 'string' ? d.observacoes : null,
      }
      result.epis = Array.isArray(d.epis) ? d.epis : []
      result.epcs = Array.isArray(d.epcs) ? d.epcs : []
      result.evidencias = Array.isArray(d.evidencias) ? d.evidencias : []
      return result as unknown as EpisEpcsEvidencias | null
    })(),
    caracteristicas: ensureObject<CaracteristicasLocal>(row.caracteristicas, {} as CaracteristicasLocal),
    medicoes: ensureArray<Medicao>(row.medicoes),
    pontos_medicao: normalizePontosMedicao(row.pontos_medicao ?? row.medicoes),
    colaboradores: ensureArray<ColaboradorExposto>(row.colaboradores),
    riscos: ensureArray<RiscoOcupacional>(row.riscos),
    avaliacao_ergonomica: ensureObject<AvaliacaoErgonomica>(row.avaliacao_ergonomica, {} as AvaliacaoErgonomica),
    avaliacao_ergonomica_preliminar: (row.avaliacao_ergonomica_preliminar ?? row.avaliacao_ergonomica ?? {}) as unknown as AvaliacaoErgonomica | null,
    controles: ensureArray<PlanoAcaoItem>(row.controles),
    plano_acao: (row.plano_acao ?? row.controles ?? []) as unknown as PlanoAcaoItem[] | null,
    parecer: ensureObject<ParecerTecnico>(row.parecer, {} as ParecerTecnico),
    assinatura_tecnico: ensureObject<Assinatura>(row.assinatura_tecnico, {} as Assinatura),
    assinatura_empresa: ensureObject<Assinatura>(row.assinatura_empresa, {} as Assinatura),
    observacoes: row.observacoes,
    user_id: row.user_id,
    sync_status: row.sync_status as SyncStatus | undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function mapBibliotecaRowToBibliotecaItem(row: BibliotecaTecnicaRow): BibliotecaTecnicaItem {
  return {
    id: row.id,
    categoria: row.categoria,
    titulo: row.titulo,
    descricao: row.descricao,
    tipo_risco: row.tipo_risco,
    perigo: row.perigo,
    risco: row.risco,
    fonte: row.fonte,
    fonte_geradora: row.fonte_geradora,
    danos_possiveis: ensureArray<string>(row.danos_possiveis),
    meios_propagacao: ensureArray<string>(row.meios_propagacao),
    descricao_exposicao: row.descricao_exposicao,
    sugestao_exposicao: row.sugestao_exposicao,
    medidas_controle: ensureArray(row.medidas_controle),
    epis: ensureArray(row.epis),
    epcs: ensureArray<string>(row.epcs),
    treinamentos: ensureArray(row.treinamentos),
    acoes_recomendadas: ensureArray<string>(row.acoes_recomendadas),
    ativo: row.ativo,
    publico: row.publico,
    user_id: row.user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function mapRelatorioRowToRelatorio(row: RelatorioRow): Relatorio {
  return {
    id: row.id,
    levantamento_id: row.levantamento_id,
    empresa_nome: row.empresa_nome,
    tipo: row.tipo as Relatorio['tipo'],
    modelo: row.modelo,
    status: row.status as Relatorio['status'],
    arquivo_url: row.arquivo_url,
    metadados: row.metadados as Record<string, unknown>,
    user_id: row.user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}
