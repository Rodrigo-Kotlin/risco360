import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/app'
import { obterConsolidadoEmpresa } from '@/services/consolidacao.service'
import {
  formatarValorRelatorio,
  formatarListaRelatorio,
  formatarItensRelatorio,
  formatarDataRelatorio,
  formatarNivelRiscoRelatorio,
  formatarCategoriaRisco,
  formatarStatusAcao,
  formatarPrioridadeAcao,
  formatarMedidasControleRelatorio,
  formatarEPIsRelatorio,
  formatarMeiosPropagacao,
  contarRiscosCriticos,
  contarEvidencias,
  obterEnderecoCompleto,
  obterPdfDataAtual,
} from '@/services/pdf-conferencia.service'
import { Printer, ArrowLeft } from 'lucide-react'
import { normalizePontosMedicao } from '@/lib/normalizers'
import type { EmpresaConsolidada } from '@/types/consolidacao'
import type { RiscoOcupacional, PlanoAcaoItem } from '@/types/risco'
import type { PontoMedicaoQuantitativa } from '@/types/levantamento'

function SecaoLinha({ label, valor }: { label: string; valor: string }) {
  return (
    <tr>
      <td className="pdf-label">{label}</td>
      <td className="pdf-value">{valor}</td>
    </tr>
  )
}

function SecaoTitulo({ titulo }: { titulo: string }) {
  return (
    <h2 className="pdf-secao-titulo">{titulo}</h2>
  )
}

function NenhumDado() {
  return <p className="pdf-vazio">Nenhum registro encontrado.</p>
}

function formatMedicaoPdf(val: number | null, unit: string): string {
  if (val === null || val === undefined) return 'Não medido'
  return `${val} ${unit}`
}

function CardMedicao({ medicao, setorNome }: { medicao: PontoMedicaoQuantitativa; setorNome: string }) {
  return (
    <div className="pdf-medicao-card">
      <table className="pdf-tabela-dados">
        <tbody>
          <SecaoLinha label="Setor" valor={setorNome} />
          <SecaoLinha label="Ponto/Local" valor={formatarValorRelatorio(medicao.ponto_local)} />
          <SecaoLinha label="Ruído" valor={formatMedicaoPdf(medicao.ruido_dba, 'dB(A)')} />
          <SecaoLinha label="Iluminação" valor={formatMedicaoPdf(medicao.iluminacao_lux, 'lux')} />
          <SecaoLinha label="Temperatura" valor={formatMedicaoPdf(medicao.temperatura_c, '°C')} />
          <SecaoLinha label="Velocidade do ar" valor={formatMedicaoPdf(medicao.velocidade_ar_ms, 'm/s')} />
          <SecaoLinha label="Umidade" valor={formatMedicaoPdf(medicao.umidade_percent, '%')} />
          <SecaoLinha label="Radiação" valor={formatMedicaoPdf(medicao.radiacao_usvh, 'µSv/h')} />
          <SecaoLinha label="Observações" valor={formatarValorRelatorio(medicao.observacoes)} />
        </tbody>
      </table>
    </div>
  )
}

function CardRisco({ risco, setorNome }: { risco: RiscoOcupacional; setorNome: string }) {
  return (
    <div className="pdf-risco-card">
      <table className="pdf-tabela-dados">
        <tbody>
          <SecaoLinha label="Setor" valor={setorNome} />
          <SecaoLinha label="Categoria" valor={formatarCategoriaRisco(risco.categoria)} />
          <SecaoLinha label="Perigo/Fator de risco" valor={formatarValorRelatorio(risco.agente)} />
          <SecaoLinha label="Descrição" valor={formatarValorRelatorio(risco.descricao)} />
          <SecaoLinha label="Fonte geradora" valor={formatarValorRelatorio(risco.fonte_geradora)} />
          <SecaoLinha label="Meios de propagação" valor={formatarMeiosPropagacao(risco.meios_propagacao)} />
          <SecaoLinha label="Dano possível" valor={formatarValorRelatorio(risco.dano_possivel)} />
          <SecaoLinha label="Nível de risco" valor={formatarNivelRiscoRelatorio(risco.nivel_risco)} />
          <SecaoLinha label="Probabilidade" valor={risco.probabilidade != null ? String(risco.probabilidade) : 'Não informado'} />
          <SecaoLinha label="Severidade" valor={risco.severidade != null ? String(risco.severidade) : 'Não informado'} />
          <SecaoLinha label="Medidas de controle" valor={formatarMedidasControleRelatorio(risco.medidas_controle)} />
          <SecaoLinha label="EPIs" valor={formatarEPIsRelatorio(risco.epis)} />
          <SecaoLinha label="Ações recomendadas" valor={formatarListaRelatorio(risco.acoes_recomendadas)} />
          <SecaoLinha label="Biblioteca técnica" valor={risco.biblioteca_titulo ?? 'Não informado'} />
          <SecaoLinha label="Observações" valor={formatarValorRelatorio(risco.observacoes)} />
        </tbody>
      </table>
    </div>
  )
}

function CardAcao({ acao, setorNome }: { acao: PlanoAcaoItem; setorNome: string }) {
  return (
    <div className="pdf-acao-card">
      <table className="pdf-tabela-dados">
        <tbody>
          <SecaoLinha label="Setor" valor={setorNome} />
          <SecaoLinha label="Ação" valor={acao.descricao} />
          <SecaoLinha label="Prioridade" valor={formatarPrioridadeAcao(acao.prioridade)} />
          <SecaoLinha label="Status" valor={formatarStatusAcao(acao.status)} />
          <SecaoLinha label="Prazo" valor={formatarDataRelatorio(acao.prazo)} />
          <SecaoLinha label="Responsável" valor={formatarValorRelatorio(acao.responsavel)} />
          <SecaoLinha label="Tipo de controle" valor={formatarValorRelatorio(acao.tipo_controle)} />
          <SecaoLinha label="Observação" valor={formatarValorRelatorio(acao.observacao)} />
        </tbody>
      </table>
    </div>
  )
}

export default function EmpresaPdfConferenciaPage() {
  const { empresaId } = useParams<{ empresaId: string }>()
  const navigate = useNavigate()
  const printRef = useRef<HTMLDivElement>(null)

  const [consolidado, setConsolidado] = useState<EmpresaConsolidada | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!empresaId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    obterConsolidadoEmpresa(empresaId).then((result) => {
      if (!result) {
        setError('Empresa não encontrada ou sem dados.')
      } else {
        setConsolidado(result)
      }
      setLoading(false)
    })
  }, [empresaId])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="pdf-page">
        <div className="pdf-container">
          <p className="pdf-text-center">Carregando dados para o PDF de conferência...</p>
        </div>
      </div>
    )
  }

  if (error || !consolidado) {
    return (
      <div className="pdf-page">
        <div className="pdf-container">
          <p className="pdf-error">{error ?? 'Dados não encontrados'}</p>
          <Button variant="secondary" onClick={() => navigate(ROUTES.empresas)}>
            <ArrowLeft size={16} /> Voltar
          </Button>
        </div>
      </div>
    )
  }

  const { empresa, setores } = consolidado
  const setoresAvaliados = setores.filter((s) => s.status !== 'pendente').length
  const setoresConcluidos = setores.filter((s) => s.status === 'concluido').length
  const setoresRascunho = setores.filter((s) => s.status === 'rascunho').length
  const riscosCriticos = contarRiscosCriticos(setores)
  const totalEvidencias = contarEvidencias(setores)

  return (
    <>
      <div className="pdf-no-print pdf-barra-acoes">
        <div className="pdf-container">
          <div className="pdf-flex-gap">
            <Button onClick={handlePrint}>
              <Printer size={16} /> Imprimir / Salvar em PDF
            </Button>
            <Button variant="secondary" onClick={() => navigate(ROUTES.empresaConsolidado.replace(':empresaId', empresa.id))}>
              <ArrowLeft size={16} /> Voltar para Consolidação
            </Button>
          </div>
          <p className="pdf-aviso-topo">
            Revise as informações abaixo antes de imprimir ou salvar em PDF.
          </p>
        </div>
      </div>

      <div className="pdf-page" ref={printRef}>
        <div className="pdf-container">
          {/* ===== CAPA ===== */}
          <section className="pdf-capa pdf-page-break">
            <div className="pdf-capa-content">
              <h1 className="pdf-capa-sistema">Risco360</h1>
              <h2 className="pdf-capa-titulo">Relatório de Conferência — LPR + AEP</h2>
              <div className="pdf-capa-linha" />
              <p className="pdf-capa-empresa">{empresa.razao_social}</p>
              <p className="pdf-capa-info">CNPJ: {formatarValorRelatorio(empresa.cnpj)}</p>
              <p className="pdf-capa-info">{formatarValorRelatorio(empresa.cidade)}/{formatarValorRelatorio(empresa.uf)}</p>
              <p className="pdf-capa-info">Data de emissão: {obterPdfDataAtual()}</p>
              {empresa.responsavel && (
                <p className="pdf-capa-info">Responsável técnico: {empresa.responsavel}</p>
              )}
              <div className="pdf-capa-linha" />
              <div className="pdf-aviso">
                <p>
                  <strong>Aviso:</strong> Este documento apresenta a consolidação dos dados coletados em campo
                  no Risco360 para conferência técnica e apoio ao lançamento no SGG.
                  Não substitui, isoladamente, o PGR, PCMSO, laudos técnicos ou documentos legais finais.
                </p>
              </div>
            </div>
          </section>

          {/* ===== DADOS DA EMPRESA ===== */}
          <section className="pdf-section pdf-page-break">
            <SecaoTitulo titulo="Dados da Empresa" />
            <table className="pdf-tabela">
              <tbody>
                <SecaoLinha label="Razão social" valor={empresa.razao_social} />
                <SecaoLinha label="Nome fantasia" valor={formatarValorRelatorio(empresa.nome_fantasia)} />
                <SecaoLinha label="CNPJ" valor={formatarValorRelatorio(empresa.cnpj)} />
                <SecaoLinha label="CNAE" valor={formatarValorRelatorio(empresa.cnae)} />
                <SecaoLinha label="Grau de risco" valor={formatarValorRelatorio(empresa.grau_risco)} />
                <SecaoLinha label="Endereço" valor={obterEnderecoCompleto(empresa)} />
                <SecaoLinha label="CEP" valor={formatarValorRelatorio(empresa.cep)} />
                <SecaoLinha label="Responsável" valor={formatarValorRelatorio(empresa.responsavel)} />
                <SecaoLinha label="Telefone" valor={formatarValorRelatorio(empresa.telefone)} />
                <SecaoLinha label="E-mail" valor={formatarValorRelatorio(empresa.email)} />
              </tbody>
            </table>
          </section>

          {/* ===== RESUMO GERAL ===== */}
          <section className="pdf-section pdf-page-break">
            <SecaoTitulo titulo="Resumo Geral" />
            <table className="pdf-tabela">
              <tbody>
                <SecaoLinha label="Total de setores cadastrados" valor={String(consolidado.totalSetores)} />
                <SecaoLinha label="Setores avaliados" valor={String(setoresAvaliados)} />
                <SecaoLinha label="Setores concluídos" valor={String(setoresConcluidos)} />
                <SecaoLinha label="Setores em rascunho" valor={String(setoresRascunho)} />
                <SecaoLinha label="Total de riscos identificados" valor={String(consolidado.totalRiscos)} />
                <SecaoLinha label="Riscos críticos" valor={String(riscosCriticos)} />
                <SecaoLinha label="Total de medições" valor={String(consolidado.totalMedicoes)} />
                <SecaoLinha label="Total de ações do plano" valor={String(consolidado.totalAcoes)} />
                <SecaoLinha label="Total de evidências" valor={String(totalEvidencias)} />
              </tbody>
            </table>
          </section>

          {/* ===== SETORES AVALIADOS ===== */}
          <section className="pdf-section pdf-page-break">
            <SecaoTitulo titulo="Setores Avaliados" />
            {setores.length === 0 ? (
              <NenhumDado />
            ) : (
              <table className="pdf-tabela pdf-tabela-full">
                <thead>
                  <tr>
                    <th>Setor</th>
                    <th>Status</th>
                    <th>%</th>
                    <th>Riscos</th>
                    <th>Medições</th>
                    <th>Ações</th>
                    <th>Evid.</th>
                    <th>Atualização</th>
                  </tr>
                </thead>
                <tbody>
                  {setores.map((s) => {
                    const evCount = s.levantamento?.epis_epcs_evidencias?.evidencias?.length ?? 0
                    return (
                      <tr key={s.setor.id}>
                        <td className="pdf-td-label">{s.setor.nome}</td>
                        <td>{formatarValorRelatorio(s.status)}</td>
                        <td className="pdf-td-center">{s.percentual}%</td>
                        <td className="pdf-td-center">{s.riscos.length}</td>
                        <td className="pdf-td-center">{s.medicoes}</td>
                        <td className="pdf-td-center">{s.controles.length}</td>
                        <td className="pdf-td-center">{evCount}</td>
                        <td>{formatarDataRelatorio(s.levantamento?.updated_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </section>

          {/* ===== CARACTERÍSTICAS POR SETOR ===== */}
          {setores.map((s) => {
            const c = s.levantamento?.caracteristicas
            const cf = s.levantamento?.caracteristicas_fisicas
            const seg = s.levantamento?.seguranca_equipamentos
            if (!c && !cf && !seg) return null
            return (
              <section key={`carac-${s.setor.id}`} className="pdf-section pdf-page-break">
                <SecaoTitulo titulo={`Características — ${s.setor.nome}`} />
                <table className="pdf-tabela">
                  <tbody>
                    {cf && (
                      <>
                        <SecaoLinha label="Quantidade de colaboradores" valor={formatarValorRelatorio(cf.quantidade_colaboradores)} />
                        <SecaoLinha label="Largura (m)" valor={formatarValorRelatorio(cf.largura)} />
                        <SecaoLinha label="Comprimento (m)" valor={formatarValorRelatorio(cf.comprimento)} />
                        <SecaoLinha label="Pé direito (m)" valor={formatarValorRelatorio(cf.pe_direito)} />
                        <SecaoLinha label="Pavimento" valor={formatarValorRelatorio(cf.pavimento)} />
                        <SecaoLinha label="Piso" valor={formatarValorRelatorio(cf.piso)} />
                        <SecaoLinha label="Revestimento" valor={formatarValorRelatorio(cf.revestimento)} />
                        <SecaoLinha label="Parede/Vedação" valor={formatarValorRelatorio(cf.vedacao_paredes)} />
                        <SecaoLinha label="Forro/Teto" valor={formatarValorRelatorio(cf.forro)} />
                        <SecaoLinha label="Telhado/Cobertura" valor={formatarValorRelatorio(cf.telhado)} />
                        <SecaoLinha label="Divisórias" valor={formatarValorRelatorio(cf.divisórias)} />
                      </>
                    )}
                    {c && (
                      <>
                        <SecaoLinha label="Área total (m²)" valor={formatarValorRelatorio(c.area_total)} />
                        <SecaoLinha label="Área construída (m²)" valor={formatarValorRelatorio(c.area_construida)} />
                        {!cf && <SecaoLinha label="Pé direito (m)" valor={formatarValorRelatorio(c.pe_direito)} />}
                        {!cf && <SecaoLinha label="Piso" valor={formatarValorRelatorio(c.tipo_piso)} />}
                        <SecaoLinha label="Iluminação" valor={formatarValorRelatorio(c.iluminacao)} />
                        <SecaoLinha label="Ventilação" valor={formatarValorRelatorio(c.ventilacao)} />
                        <SecaoLinha label="Temperatura" valor={formatarValorRelatorio(c.temperatura)} />
                        <SecaoLinha label="Layout" valor={formatarValorRelatorio(c.layout)} />
                        <SecaoLinha label="Máquinas/Equipamentos" valor={formatarValorRelatorio(c.maquinas_equipamentos)} />
                      </>
                    )}
                    {seg && (
                      <>
                        <SecaoLinha label="Sistema de incêndio/emergência" valor={formatarListaRelatorio(seg.sistema_incendio_emergencia)} />
                        <SecaoLinha label="Incêndio/emergência (qtd)" valor={formatarItensRelatorio(seg.sistema_incendio_emergencia_itens)} />
                        <SecaoLinha label="GES" valor={formatarValorRelatorio(seg.possui_ges)} />
                        <SecaoLinha label="Mobiliário" valor={formatarListaRelatorio(seg.mobiliarios)} />
                        <SecaoLinha label="Mobiliário (qtd)" valor={formatarItensRelatorio(seg.mobiliario_itens)} />
                        <SecaoLinha label="Máquinas/Equipamentos" valor={formatarListaRelatorio(seg.maquinas_equipamentos)} />
                        <SecaoLinha label="Máquinas/Equip. (qtd)" valor={formatarItensRelatorio(seg.maquinas_equipamentos_itens)} />
                        <SecaoLinha label="Ferramentas" valor={formatarListaRelatorio(seg.ferramentas)} />
                        <SecaoLinha label="Ferramentas (qtd)" valor={formatarItensRelatorio(seg.ferramentas_itens)} />
                        <SecaoLinha label="Layout do posto" valor={formatarValorRelatorio(seg.layout_posto)} />
                        <SecaoLinha label="Condição dos postos" valor={formatarValorRelatorio(seg.condicao_postos)} />
                      </>
                    )}
                  </tbody>
                </table>
              </section>
            )
          })}

          {/* ===== MEDIÇÕES POR SETOR ===== */}
          {setores.map((s) => {
            const pontos = s.levantamento?.pontos_medicao ?? []
            const medicoesDoSetor = pontos.length > 0
              ? pontos
              : normalizePontosMedicao(s.levantamento?.medicoes ?? [])
            if (medicoesDoSetor.length === 0) return null
            return (
              <section key={`med-${s.setor.id}`} className="pdf-section pdf-page-break">
                <SecaoTitulo titulo={`Medições — ${s.setor.nome}`} />
                <p className="pdf-subtitulo">{medicoesDoSetor.length} medição(ões) registrada(s)</p>
                {medicoesDoSetor.map((m) => (
                  <CardMedicao key={m.id} medicao={m} setorNome={s.setor.nome} />
                ))}
              </section>
            )
          })}

          {/* ===== RISCOS POR SETOR ===== */}
          {setores.map((s) => {
            if (s.riscos.length === 0) return null
            return (
              <section key={`risco-${s.setor.id}`} className="pdf-section pdf-page-break">
                <SecaoTitulo titulo={`Riscos — ${s.setor.nome}`} />
                <p className="pdf-subtitulo">{s.riscos.length} risco(s) identificado(s)</p>
                {s.riscos.map((r) => (
                  <CardRisco key={r.id} risco={r} setorNome={s.setor.nome} />
                ))}
              </section>
            )
          })}

          {/* ===== AEP POR SETOR ===== */}
          {setores.map((s) => {
            const aep = s.levantamento?.avaliacao_ergonomica_preliminar ?? s.levantamento?.avaliacao_ergonomica
            if (!aep) return null
            const hasData = aep.posturas_predominantes || aep.mobiliario_equipamentos || aep.repetitividade ||
              aep.esforco_fisico || aep.demandas_cognitivas || aep.organizacao_trabalho ||
              aep.pausas || aep.autonomia || aep.relacoes_socioprofissionais ||
              aep.fatores_psicossociais || aep.necessidade_aet_complementar != null ||
              aep.justificativa_tecnica || aep.recomendacoes_ergonomicas
            if (!hasData) return null
            return (
              <section key={`aep-${s.setor.id}`} className="pdf-section pdf-page-break">
                <SecaoTitulo titulo={`Avaliação Ergonômica Preliminar — ${s.setor.nome}`} />
                <table className="pdf-tabela">
                  <tbody>
                    <SecaoLinha label="Posturas predominantes" valor={formatarValorRelatorio(aep.posturas_predominantes)} />
                    <SecaoLinha label="Mobiliário/Equipamentos" valor={formatarValorRelatorio(aep.mobiliario_equipamentos)} />
                    <SecaoLinha label="Repetitividade" valor={formatarValorRelatorio(aep.repetitividade)} />
                    <SecaoLinha label="Esforço físico" valor={formatarValorRelatorio(aep.esforco_fisico)} />
                    <SecaoLinha label="Demandas cognitivas" valor={formatarValorRelatorio(aep.demandas_cognitivas)} />
                    <SecaoLinha label="Organização do trabalho" valor={formatarValorRelatorio(aep.organizacao_trabalho)} />
                    <SecaoLinha label="Pausas" valor={formatarValorRelatorio(aep.pausas)} />
                    <SecaoLinha label="Autonomia" valor={formatarValorRelatorio(aep.autonomia)} />
                    <SecaoLinha label="Relações socioprofissionais" valor={formatarValorRelatorio(aep.relacoes_socioprofissionais)} />
                    <SecaoLinha label="Fatores psicossociais" valor={formatarValorRelatorio(aep.fatores_psicossociais)} />
                    <SecaoLinha label="Necessidade de AET" valor={aep.necessidade_aet_complementar ? 'Sim' : aep.necessidade_aet_complementar === false ? 'Não' : 'Não informado'} />
                    <SecaoLinha label="Justificativa técnica" valor={formatarValorRelatorio(aep.justificativa_tecnica)} />
                    <SecaoLinha label="Recomendações ergonômicas" valor={formatarValorRelatorio(aep.recomendacoes_ergonomicas)} />
                  </tbody>
                </table>
              </section>
            )
          })}

          {/* ===== PLANO DE AÇÃO CONSOLIDADO ===== */}
          {(() => {
            const todasAcoes = setores.flatMap((s) =>
              (s.levantamento?.controles ?? []).map((c) => ({ ...c, setorNome: s.setor.nome }))
            )
            if (todasAcoes.length === 0) return null
            return (
              <section className="pdf-section pdf-page-break">
                <SecaoTitulo titulo="Plano de Ação Consolidado" />
                <p className="pdf-subtitulo">{todasAcoes.length} ação(ões) registrada(s)</p>
                {todasAcoes.map((acao) => (
                  <CardAcao key={acao.id} acao={acao} setorNome={acao.setorNome} />
                ))}
              </section>
            )
          })()}

          {/* ===== EVidÊNCIAS ===== */}
          {(() => {
            const todasEvidencias = setores.flatMap((s) =>
              (s.levantamento?.epis_epcs_evidencias?.evidencias ?? []).map((ev) => ({ ...ev, setorNome: s.setor.nome }))
            )
            if (todasEvidencias.length === 0) return null
            return (
              <section className="pdf-section pdf-page-break">
                <SecaoTitulo titulo="Evidências" />
                <table className="pdf-tabela pdf-tabela-full">
                  <thead>
                    <tr>
                      <th>Setor</th>
                      <th>Legenda</th>
                      <th>Observação</th>
                      <th>Tipo</th>
                      <th>Tamanho</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todasEvidencias.map((ev, i) => (
                      <tr key={i}>
                        <td>{ev.setorNome}</td>
                        <td>{formatarValorRelatorio(ev.legenda)}</td>
                        <td>{formatarValorRelatorio(ev.observacao)}</td>
                        <td>{ev.mime_type ?? 'Não informado'}</td>
                        <td>{ev.size_bytes ? `${(ev.size_bytes / 1024).toFixed(0)} KB` : 'Não informado'}</td>
                        <td>{formatarDataRelatorio(ev.data)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )
          })()}

          {/* ===== PARECER E FECHAMENTO ===== */}
          <section className="pdf-section pdf-page-break">
            <SecaoTitulo titulo="Parecer e Fechamento" />
            {(() => {
              const primeiroLev = setores.find((s) => s.levantamento)
              const parecer = primeiroLev?.levantamento?.parecer
              const assinatura = primeiroLev?.levantamento?.assinatura_tecnico
              return (
                <table className="pdf-tabela">
                  <tbody>
                    <SecaoLinha label="Conclusão geral" valor={formatarValorRelatorio(parecer?.conclusao)} />
                    <SecaoLinha label="Recomendações gerais" valor={formatarValorRelatorio(parecer?.recomendacoes)} />
                    <SecaoLinha label="Restrições" valor={formatarValorRelatorio(parecer?.restricoes)} />
                    <SecaoLinha label="Responsável técnico" valor={formatarValorRelatorio(assinatura?.nome)} />
                    <SecaoLinha label="Registro profissional" valor={formatarValorRelatorio(assinatura?.registro_profissional)} />
                    <SecaoLinha label="Data" valor={formatarDataRelatorio(assinatura?.data)} />
                  </tbody>
                </table>
              )
            })()}
            <div className="pdf-assinatura">
              <div className="pdf-assinatura-linha" />
              <p className="pdf-assinatura-label">Assinatura do responsável técnico</p>
            </div>
          </section>

          {/* ===== RODAPÉ ===== */}
          <div className="pdf-rodape">
            <p>Documento gerado pelo Risco360 em {obterPdfDataAtual()} — Conferência LPR + AEP</p>
          </div>
        </div>
      </div>

      <style>{`
        .pdf-no-print { display: block; }
        .pdf-page { background: #fff; color: #1a1a1a; font-family: 'Segoe UI', Arial, sans-serif; }
        .pdf-container { max-width: 900px; margin: 0 auto; padding: 20px; }
        .pdf-text-center { text-align: center; }
        .pdf-error { color: #dc2626; text-align: center; padding: 40px 0; }
        .pdf-barra-acoes { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 0; position: sticky; top: 0; z-index: 50; }
        .pdf-flex-gap { display: flex; gap: 8px; flex-wrap: wrap; }
        .pdf-aviso-topo { margin-top: 8px; font-size: 13px; color: #64748b; }
        .pdf-capa { display: flex; align-items: center; justify-content: center; min-height: 80vh; text-align: center; }
        .pdf-capa-content { max-width: 600px; }
        .pdf-capa-sistema { font-size: 32px; font-weight: 700; color: #0B6B3A; margin-bottom: 8px; }
        .pdf-capa-titulo { font-size: 22px; font-weight: 600; color: #334155; margin-bottom: 24px; }
        .pdf-capa-linha { width: 80px; height: 3px; background: #0B6B3A; margin: 16px auto; }
        .pdf-capa-empresa { font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; }
        .pdf-capa-info { font-size: 14px; color: #475569; margin-bottom: 4px; }
        .pdf-aviso { margin-top: 24px; padding: 12px 16px; background: #fef3c7; border-left: 4px solid #f59e0b; font-size: 12px; color: #92400e; text-align: left; }
        .pdf-section { margin-top: 32px; margin-bottom: 32px; }
        .pdf-secao-titulo { font-size: 18px; font-weight: 700; color: #0B6B3A; border-bottom: 2px solid #0B6B3A; padding-bottom: 6px; margin-bottom: 16px; }
        .pdf-subtitulo { font-size: 13px; color: #64748b; margin-bottom: 12px; }
        .pdf-vazio { font-size: 13px; color: #94a3b8; font-style: italic; padding: 16px 0; }
        .pdf-tabela { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 12px; }
        .pdf-tabela-full { font-size: 12px; }
        .pdf-tabela th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 600; color: #334155; border-bottom: 2px solid #e2e8f0; }
        .pdf-tabela td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
        .pdf-tabela-dados { width: 100%; border-collapse: collapse; font-size: 12px; }
        .pdf-tabela-dados td { padding: 4px 8px; border-bottom: 1px solid #f1f5f9; }
        .pdf-label { font-weight: 600; color: #475569; width: 30%; vertical-align: top; white-space: nowrap; }
        .pdf-value { color: #1e293b; }
        .pdf-td-label { font-weight: 600; }
        .pdf-td-center { text-align: center; }
        .pdf-medicao-card, .pdf-risco-card, .pdf-acao-card { margin-bottom: 16px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fafafa; page-break-inside: avoid; }
        .pdf-assinatura { margin-top: 40px; text-align: center; }
        .pdf-assinatura-linha { width: 300px; height: 1px; background: #94a3b8; margin: 0 auto 8px; }
        .pdf-assinatura-label { font-size: 12px; color: #64748b; }
        .pdf-rodape { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }

        @media print {
          @page { margin: 20mm 15mm; }
          .pdf-no-print { display: none !important; }
          .pdf-page { background: #fff !important; }
          .pdf-container { max-width: 100%; padding: 0; }
          .pdf-page-break { page-break-before: auto; page-break-after: auto; }
          section { page-break-inside: avoid; }
          .pdf-capa { min-height: 60vh; page-break-after: always; }
          .pdf-medicao-card, .pdf-risco-card, .pdf-acao-card { break-inside: avoid; }
          .pdf-tabela th { background: #e2e8f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .pdf-capa-linha { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .pdf-secao-titulo { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .pdf-aviso { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </>
  )
}
