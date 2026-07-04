import type { Workbook } from 'exceljs'
import type { EmpresaConsolidada, SetorConsolidado } from '@/types/consolidacao'
import { ensureArray, formatItemQuantificado } from '@/lib/utils'
import { normalizePontosMedicao } from '@/lib/normalizers'

function formatValor(valor: unknown): string {
  if (valor === null || valor === undefined) return ''
  if (typeof valor === 'object') {
    if (Array.isArray(valor)) return valor.join('; ')
    return JSON.stringify(valor)
  }
  return String(valor)
}

function formatArray(arr: unknown): string {
  if (!Array.isArray(arr) || arr.length === 0) return ''
  return arr.map((v) => (typeof v === 'object' && v !== null ? String(v.nome ?? v) : String(v))).join('; ')
}

function formatItensArray(arr: unknown): string {
  const itens = ensureArray(arr as Array<{ nome?: string; quantidade?: number | null }>)
  if (itens.length === 0) return ''
  return itens.map((item) => formatItemQuantificado({ id: '', nome: item.nome ?? '', quantidade: item.quantidade ?? null, observacao: null })).join('; ')
}

function formatMedidasControle(
  medidas: { tipo: string; descricao: string; eficaz: boolean }[] | undefined | null
): string {
  if (!medidas || medidas.length === 0) return ''
  return medidas
    .map((m) => `${m.tipo}: ${m.descricao}${m.eficaz ? ' (eficaz)' : ' (não eficaz)'}`)
    .join('; ')
}

function formatEPIs(epis: { descricao: string; ca: string | null }[] | undefined | null): string {
  if (!epis || epis.length === 0) return ''
  return epis.map((e) => `${e.descricao}${e.ca ? ` CA: ${e.ca}` : ''}`).join('; ')
}

function obterEnderecoCompleto(empresa: EmpresaConsolidada['empresa']): string {
  return [empresa.endereco, empresa.numero, empresa.bairro].filter(Boolean).join(', ')
}

function empresaParaLinha(consolidado: EmpresaConsolidada) {
  const e = consolidado.empresa
  return {
    razao_social: e.razao_social,
    nome_fantasia: formatValor(e.nome_fantasia),
    cnpj: formatValor(e.cnpj),
    cnae: formatValor(e.cnae),
    grau_risco: formatValor(e.grau_risco),
    endereco_completo: obterEnderecoCompleto(e),
    cidade_uf: [e.cidade, e.uf].filter(Boolean).join('/'),
    responsavel: formatValor(e.responsavel),
    telefone: formatValor(e.telefone),
    email: formatValor(e.email),
  }
}

function setoresParaLinhas(setores: SetorConsolidado[]) {
  return setores.map((s) => ({
    empresa: s.setor.empresa_id,
    setor: s.setor.nome,
    descricao: formatValor(s.setor.descricao),
    responsavel_local: formatValor(s.setor.responsavel_local),
    status_levantamento: s.status,
    percentual: s.percentual,
    total_riscos: s.riscos.length,
    total_medicoes: s.medicoes,
    total_acoes: s.controles.length,
  }))
}

function caracteristicasParaLinhas(setores: SetorConsolidado[]) {
  return setores.flatMap((s) => {
    const c = s.levantamento?.caracteristicas
    if (!c) return []
    return {
      empresa: s.setor.empresa_id,
      setor: s.setor.nome,
      area_total: c.area_total ?? '',
      area_construida: c.area_construida ?? '',
      pe_direito: c.pe_direito ?? '',
      tipo_piso: formatValor(c.tipo_piso),
      tipo_teto: formatValor(c.tipo_teto),
      tipo_parede: formatValor(c.tipo_parede),
      iluminacao: formatValor(c.iluminacao),
      ventilacao: formatValor(c.ventilacao),
      temperatura: formatValor(c.temperatura),
      layout: formatValor(c.layout),
      maquinas_equipamentos: formatValor(c.maquinas_equipamentos),
      observacoes: formatValor(c.observacoes),
    }
  })
}

function segurancaParaLinhas(setores: SetorConsolidado[]) {
  return setores.flatMap((s) => {
    const seg = s.levantamento?.seguranca_equipamentos
    if (!seg) return []
    return {
      empresa: s.setor.empresa_id,
      setor: s.setor.nome,
      sistema_incendio: formatArray(seg.sistema_incendio_emergencia),
      sistema_incendio_itens: formatItensArray(seg.sistema_incendio_emergencia_itens),
      possui_ges: formatValor(seg.possui_ges),
      mobiliarios: formatArray(seg.mobiliarios),
      mobiliario_itens: formatItensArray(seg.mobiliario_itens),
      maquinas: formatArray(seg.maquinas_equipamentos),
      maquinas_equipamentos_itens: formatItensArray(seg.maquinas_equipamentos_itens),
      ferramentas: formatArray(seg.ferramentas),
      ferramentas_itens: formatItensArray(seg.ferramentas_itens),
      layout_posto: formatValor(seg.layout_posto),
      condicao_postos: formatValor(seg.condicao_postos),
      observacoes: formatValor(seg.observacoes),
    }
  })
}

function episEpcsParaLinhas(setores: SetorConsolidado[]) {
  return setores.flatMap((s) => {
    const episEpcs = s.levantamento?.epis_epcs_evidencias
    if (!episEpcs) return []
    const linhas: Record<string, string>[] = []
    for (const epi of episEpcs.epis) {
      linhas.push({
        empresa: s.setor.empresa_id,
        setor: s.setor.nome,
        tipo: 'EPI',
        nome: epi.nome,
        ca: formatValor(epi.ca),
        observacao: formatValor(epi.observacao),
      })
    }
    for (const epc of episEpcs.epcs) {
      linhas.push({
        empresa: s.setor.empresa_id,
        setor: s.setor.nome,
        tipo: 'EPC',
        nome: epc.nome,
        ca: '',
        observacao: formatValor(epc.observacao),
      })
    }
    return linhas
  })
}

function medicoesParaLinhas(setores: SetorConsolidado[]) {
  return setores.flatMap((s) => {
    const pontos = s.levantamento?.pontos_medicao ?? []
    const origens = pontos.length > 0
      ? pontos
      : normalizePontosMedicao(s.levantamento?.medicoes ?? [])
    return origens.map((p) => ({
      empresa: s.setor.empresa_id,
      setor: s.setor.nome,
      ponto_local: p.ponto_local,
      ruido_dba: p.ruido_dba ?? '',
      iluminacao_lux: p.iluminacao_lux ?? '',
      temperatura_c: p.temperatura_c ?? '',
      velocidade_ar_ms: p.velocidade_ar_ms ?? '',
      umidade_percent: p.umidade_percent ?? '',
      radiacao_usvh: p.radiacao_usvh ?? '',
      observacoes: p.observacoes ?? '',
    }))
  })
}

function riscosParaLinhas(setores: SetorConsolidado[]) {
  return setores.flatMap((s) =>
    (s.levantamento?.riscos ?? []).map((r) => ({
      empresa: s.setor.empresa_id,
      setor: s.setor.nome,
      categoria: r.categoria,
      agente: formatValor(r.agente),
      descricao: formatValor(r.descricao),
      fonte_geradora: formatValor(r.fonte_geradora),
      nivel_risco: r.nivel_risco,
      caracterizacao: formatValor(r.caracterizacao),
      medidas_controle: formatMedidasControle(r.medidas_controle),
      epis: formatEPIs(r.epis),
      acoes_recomendadas: formatArray(r.acoes_recomendadas),
      observacoes: formatValor(r.observacoes),
      biblioteca_item_id: formatValor(r.biblioteca_item_id),
      biblioteca_titulo: formatValor(r.biblioteca_titulo),
    }))
  )
}

function aepParaLinhas(setores: SetorConsolidado[]) {
  return setores.flatMap((s) => {
    const aep = s.levantamento?.avaliacao_ergonomica_preliminar ?? s.levantamento?.avaliacao_ergonomica
    if (!aep) return []
    const aepData = aep as unknown as Record<string, unknown>
    const necessidadeAet = aepData.necessidade_aet_complementar === true ? 'Sim' : aepData.necessidade_aet_complementar === false ? 'Não' : ''
    return {
      empresa: s.setor.empresa_id,
      setor: s.setor.nome,
      posturas_predominantes: formatValor(aepData.posturas_predominantes),
      mobiliario_equipamentos: formatValor(aepData.mobiliario_equipamentos),
      repetitividade: formatValor(aepData.repetitividade),
      esforco_fisico: formatValor(aepData.esforco_fisico),
      demandas_cognitivas: formatValor(aepData.demandas_cognitivas),
      organizacao_trabalho: formatValor(aepData.organizacao_trabalho),
      pausas: formatValor(aepData.pausas),
      autonomia: formatValor(aepData.autonomia),
      relacoes_socioprofissionais: formatValor(aepData.relacoes_socioprofissionais),
      fatores_psicossociais: formatValor(aepData.fatores_psicossociais),
      necessidade_aet: necessidadeAet,
      justificativa_tecnica: formatValor(aepData.justificativa_tecnica),
      recomendacoes: formatValor(aepData.recomendacoes_ergonomicas),
    }
  })
}

function planoAcaoParaLinhas(setores: SetorConsolidado[]) {
  return setores.flatMap((s) =>
    (s.levantamento?.controles ?? []).map((c) => ({
      empresa: s.setor.empresa_id,
      setor: s.setor.nome,
      descricao: c.descricao,
      prioridade: c.prioridade,
      status: c.status,
      prazo: formatValor(c.prazo),
      responsavel: formatValor(c.responsavel),
      tipo_controle: formatValor(c.tipo_controle),
      observacao: formatValor(c.observacao),
    }))
  )
}

function evidenciasParaLinhas(setores: SetorConsolidado[]) {
  return setores.flatMap((s) => {
    const episEpcs = s.levantamento?.epis_epcs_evidencias
    if (!episEpcs) return []
    return episEpcs.evidencias.map((ev) => ({
      empresa: s.setor.empresa_id,
      setor: s.setor.nome,
      legenda: formatValor(ev.legenda),
      observacao: formatValor(ev.observacao),
      data: formatValor(ev.data),
      hora: formatValor(ev.hora),
      mime_type: ev.mime_type ?? '',
      tamanho: ev.size_bytes ? `${(ev.size_bytes / 1024).toFixed(0)} KB` : '',
    }))
  })
}

function addSheetFromObjects(book: Workbook, name: string, data: Record<string, unknown>[]): void {
  const ws = book.addWorksheet(name)
  if (data.length > 0) {
    const headers = Object.keys(data[0])
    ws.addRow(headers)
    data.forEach(item => {
      ws.addRow(headers.map(h => item[h] ?? ''))
    })
  }
}

function addPlaceholderSheet(book: Workbook, name: string, message: string): void {
  const ws = book.addWorksheet(name)
  ws.addRow([message])
}

export async function gerarWorkbookEmpresa(consolidado: EmpresaConsolidada): Promise<Workbook> {
  const ExcelJS = await import('exceljs')
  const book = new ExcelJS.Workbook()

  const empSheetData = [empresaParaLinha(consolidado)]
  addSheetFromObjects(book, 'Empresa', empSheetData)

  const setoresLinhas = setoresParaLinhas(consolidado.setores)
  if (setoresLinhas.length > 0) {
    addSheetFromObjects(book, 'Setores', setoresLinhas)
  } else {
    addPlaceholderSheet(book, 'Setores', 'Nenhum setor')
  }

  const caracLinhas = caracteristicasParaLinhas(consolidado.setores)
  if (caracLinhas.length > 0) {
    addSheetFromObjects(book, 'Caracteristicas', caracLinhas)
  } else {
    addPlaceholderSheet(book, 'Caracteristicas', 'Nenhuma característica')
  }

  const segLinhas = segurancaParaLinhas(consolidado.setores)
  if (segLinhas.length > 0) {
    addSheetFromObjects(book, 'Seguranca_Mobiliario', segLinhas)
  } else {
    addPlaceholderSheet(book, 'Seguranca_Mobiliario', 'Nenhum dado')
  }

  const episLinhas = episEpcsParaLinhas(consolidado.setores)
  if (episLinhas.length > 0) {
    addSheetFromObjects(book, 'EPIs_EPCs', episLinhas)
  } else {
    addPlaceholderSheet(book, 'EPIs_EPCs', 'Nenhum EPI/EPC')
  }

  const medLinhas = medicoesParaLinhas(consolidado.setores)
  if (medLinhas.length > 0) {
    addSheetFromObjects(book, 'Medicoes', medLinhas)
  } else {
    addPlaceholderSheet(book, 'Medicoes', 'Nenhuma medição')
  }

  const riscLinhas = riscosParaLinhas(consolidado.setores)
  if (riscLinhas.length > 0) {
    addSheetFromObjects(book, 'Riscos', riscLinhas)
  } else {
    addPlaceholderSheet(book, 'Riscos', 'Nenhum risco')
  }

  const aepLinhas = aepParaLinhas(consolidado.setores)
  if (aepLinhas.length > 0) {
    addSheetFromObjects(book, 'AEP', aepLinhas)
  } else {
    addPlaceholderSheet(book, 'AEP', 'Nenhuma AEP')
  }

  const paLinhas = planoAcaoParaLinhas(consolidado.setores)
  if (paLinhas.length > 0) {
    addSheetFromObjects(book, 'Plano_Acao', paLinhas)
  } else {
    addPlaceholderSheet(book, 'Plano_Acao', 'Nenhuma ação')
  }

  const evLinhas = evidenciasParaLinhas(consolidado.setores)
  if (evLinhas.length > 0) {
    addSheetFromObjects(book, 'Evidencias', evLinhas)
  } else {
    addPlaceholderSheet(book, 'Evidencias', 'Nenhuma evidência')
  }

  return book
}

export async function exportarEmpresaParaXLSX(consolidado: EmpresaConsolidada): Promise<void> {
  const book = await gerarWorkbookEmpresa(consolidado)
  const nomeArquivo = `consolidado_${consolidado.empresa.razao_social.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`
  const buffer = await book.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function baixarArquivoXLSX(consolidado: EmpresaConsolidada): Promise<void> {
  const book = await gerarWorkbookEmpresa(consolidado)
  const buffer = await book.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `consolidado_${consolidado.empresa.razao_social.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function objetosParaCSV(
  data: Record<string, unknown>[],
  separador: string = ';'
): string {
  if (data.length === 0) return ''

  const cabecalhos = Object.keys(data[0])
  const linhas = data.map((linha) =>
    cabecalhos
      .map((chave) => {
        const valor = linha[chave]
        if (valor === null || valor === undefined) return ''
        const str = String(valor).replace(/"/g, '""')
        if (str.includes(separador) || str.includes('"') || str.includes('\n')) {
          return `"${str}"`
        }
        return str
      })
      .join(separador)
  )

  return [cabecalhos.join(separador), ...linhas].join('\n')
}

export function exportarRiscosParaCSV(consolidado: EmpresaConsolidada): string {
  const linhas = riscosParaLinhas(consolidado.setores)
  return objetosParaCSV(linhas)
}

export function exportarMedicoesParaCSV(consolidado: EmpresaConsolidada): string {
  const linhas = medicoesParaLinhas(consolidado.setores)
  return objetosParaCSV(linhas)
}

export function exportarPlanoAcaoParaCSV(consolidado: EmpresaConsolidada): string {
  const linhas = planoAcaoParaLinhas(consolidado.setores)
  return objetosParaCSV(linhas)
}

export function baixarCSV(conteudo: string, nomeArquivo: string): void {
  const bom = '\uFEFF'
  const blob = new Blob([bom + conteudo], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
