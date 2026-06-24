import { obterConsolidadoEmpresa } from './consolidacao.service'
import type { EmpresaConsolidada, SetorConsolidado } from '@/types/consolidacao'
import type { RiscoOcupacional } from '@/types/risco'

export async function obterDadosPdfConferencia(
  empresaId: string
): Promise<EmpresaConsolidada | null> {
  return obterConsolidadoEmpresa(empresaId)
}

export function gerarNomeArquivoPdf(empresa: { razao_social: string }): string {
  const nome = empresa.razao_social.replace(/[^a-zA-Z0-9À-ÿ]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  const data = new Date().toISOString().slice(0, 10)
  return `conferencia_${nome}_${data}.pdf`
}

export function formatarValorRelatorio(valor: unknown): string {
  if (valor === null || valor === undefined) return 'Não informado'
  const str = String(valor)
  if (str.trim() === '') return 'Não informado'
  return str
}

export function formatarListaRelatorio(arr: string[] | undefined | null): string {
  if (!arr || arr.length === 0) return 'Não informado'
  return arr.join(', ')
}

export function formatarItensRelatorio(
  itens: Array<{ nome: string; quantidade?: number | null }> | undefined | null
): string {
  if (!itens || itens.length === 0) return 'Não informado'
  return itens
    .map((item) => {
      const base = item.nome
      if (item.quantidade != null && item.quantidade > 0) {
        return `${base} — ${item.quantidade} un.`
      }
      return base
    })
    .join(', ')
}

export function formatarDataRelatorio(data: string | null | undefined): string {
  if (!data) return 'Não informado'
  try {
    const d = new Date(data)
    if (isNaN(d.getTime())) return data
    return d.toLocaleDateString('pt-BR')
  } catch {
    return data
  }
}

export function formatarNivelRiscoRelatorio(nivel: string | null | undefined): string {
  if (!nivel) return 'Não informado'
  const mapa: Record<string, string> = {
    irrelevante: 'Irrelevante',
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
    critico: 'Crítico',
  }
  return mapa[nivel] ?? nivel
}

export function formatarCategoriaRisco(categoria: string | null | undefined): string {
  if (!categoria) return 'Não informado'
  const mapa: Record<string, string> = {
    fisico: 'Físico',
    quimico: 'Químico',
    biologico: 'Biológico',
    ergonomico: 'Ergonômico',
    acidente: 'Acidente',
    mecanico: 'Mecânico',
    psicossocial: 'Psicossocial',
  }
  return mapa[categoria] ?? categoria
}

export function formatarStatusAcao(status: string | null | undefined): string {
  if (!status) return 'Não informado'
  const mapa: Record<string, string> = {
    pendente: 'Pendente',
    em_andamento: 'Em andamento',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
  }
  return mapa[status] ?? status
}

export function formatarPrioridadeAcao(prioridade: string | null | undefined): string {
  if (!prioridade) return 'Não informado'
  const mapa: Record<string, string> = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    urgente: 'Urgente',
  }
  return mapa[prioridade] ?? prioridade
}

export function formatarTipoControle(tipo: string | null | undefined): string {
  if (!tipo) return 'Não informado'
  const mapa: Record<string, string> = {
    eliminacao: 'Eliminação',
    substituicao: 'Substituição',
    engenharia: 'Engenharia',
    administrativo: 'Administrativo',
    epi: 'EPI',
  }
  return mapa[tipo] ?? tipo
}

export function formatarMedidasControleRelatorio(
  medidas: RiscoOcupacional['medidas_controle'] | undefined | null
): string {
  if (!medidas || medidas.length === 0) return 'Não informado'
  return medidas
    .map((m) => `${formatarTipoControle(m.tipo)}: ${m.descricao}${m.eficaz ? ' (eficaz)' : ' (não eficaz)'}`)
    .join('; ')
}

export function formatarEPIsRelatorio(
  epis: RiscoOcupacional['epis'] | undefined | null
): string {
  if (!epis || epis.length === 0) return 'Não informado'
  return epis.map((e) => `${e.descricao}${e.ca ? ` (CA: ${e.ca})` : ''}`).join('; ')
}

export function formatarMeiosPropagacao(
  meios: string[] | undefined | null
): string {
  if (!meios || meios.length === 0) return 'Não informado'
  const mapa: Record<string, string> = {
    ar: 'Ar',
    caminhar: 'Caminhar',
    conducao_conveccao_radiacao: 'Condução/Convecção/Radiação',
    contato: 'Contato',
    cutanea_dermica: 'Cutânea/Dérmica',
    digestiva_oral: 'Digestiva/Oral',
    luz: 'Luz',
    movimento_acao: 'Movimento/Ação',
    nao_aplicavel: 'Não aplicável',
    parenteral: 'Parenteral',
    percepcao: 'Percepção',
    posto_de_trabalho: 'Posto de trabalho',
    respiratoria: 'Respiratória',
    sobrecarga_biomecanica: 'Sobrecarga biomecânica',
    sonora: 'Sonora',
  }
  return meios.map((m) => mapa[m] ?? m).join(', ')
}

export function contarRiscosCriticos(setores: SetorConsolidado[]): number {
  return setores.reduce((acc, s) => {
    return acc + (s.riscos?.filter((r) => r.nivel_risco === 'critico').length ?? 0)
  }, 0)
}

export function contarEvidencias(setores: SetorConsolidado[]): number {
  return setores.reduce((acc, s) => {
    const evs = s.levantamento?.epis_epcs_evidencias?.evidencias
    return acc + (evs?.length ?? 0)
  }, 0)
}

export function obterEnderecoCompleto(empresa: EmpresaConsolidada['empresa']): string {
  return [empresa.endereco, empresa.numero, empresa.bairro, empresa.cidade, empresa.uf]
    .filter(Boolean)
    .join(', ')
}

export function obterPdfDataAtual(): string {
  return new Date().toLocaleDateString('pt-BR')
}
