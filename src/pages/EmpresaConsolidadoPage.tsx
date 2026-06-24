import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ROUTES } from '@/constants/app'
import { obterConsolidadoEmpresa, obterResumoEmpresa } from '@/services/consolidacao.service'
import { baixarArquivoXLSX, baixarCSV, exportarRiscosParaCSV, exportarMedicoesParaCSV, exportarPlanoAcaoParaCSV } from '@/services/exportacao.service'
import { ArrowLeft, FileSpreadsheet, FileText, Building2, AlertTriangle, CheckCircle, Clock, Ruler, ClipboardList, Printer } from 'lucide-react'
import type { EmpresaConsolidada } from '@/types/consolidacao'

export default function EmpresaConsolidadoPage() {
  const { empresaId } = useParams<{ empresaId: string }>()
  const navigate = useNavigate()

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

  if (loading) {
    return (
      <>
        <Header title="Consolidado" />
        <MainContainer>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </MainContainer>
      </>
    )
  }

  if (error || !consolidado) {
    return (
      <>
        <Header title="Erro" />
        <MainContainer>
          <p className="text-sm text-danger">{error ?? 'Dados não encontrados'}</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate(ROUTES.empresas)}>
            <ArrowLeft size={16} /> Voltar
          </Button>
        </MainContainer>
      </>
    )
  }

  const resumo = obterResumoEmpresa(consolidado)

  const statusBadge = (status: string) => {
    const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
      rascunho: 'muted',
      em_andamento: 'warning',
      concluido: 'success',
      arquivado: 'muted',
      pendente: 'muted',
    }
    return <Badge variant={map[status] ?? 'default'}>{status.replace('_', ' ')}</Badge>
  }

  const handleExportXLSX = async () => {
    await baixarArquivoXLSX(consolidado)
  }

  const handleExportCSVRiscos = () => {
    const csv = exportarRiscosParaCSV(consolidado)
    baixarCSV(csv, `riscos_${consolidado.empresa.razao_social.replace(/[^a-zA-Z0-9]/g, '_')}.csv`)
  }

  const handleExportCSVMedicoes = () => {
    const csv = exportarMedicoesParaCSV(consolidado)
    baixarCSV(csv, `medicoes_${consolidado.empresa.razao_social.replace(/[^a-zA-Z0-9]/g, '_')}.csv`)
  }

  const handleExportCSVPlanoAcao = () => {
    const csv = exportarPlanoAcaoParaCSV(consolidado)
    baixarCSV(csv, `plano_acao_${consolidado.empresa.razao_social.replace(/[^a-zA-Z0-9]/g, '_')}.csv`)
  }

  const pendentes = consolidado.setores.filter((s) => s.status === 'pendente' || s.status === 'rascunho')

  return (
    <>
      <Header title={`Consolidado - ${consolidado.empresa.razao_social}`} />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title="Consolidado da Empresa"
            description={consolidado.empresa.razao_social}
            breadcrumb={[
              { label: 'Empresas', href: ROUTES.empresas },
              { label: consolidado.empresa.razao_social, href: ROUTES.empresasDetalhe.replace(':id', consolidado.empresa.id) },
              { label: 'Consolidado' },
            ]}
            secondaryActions={
              <Button variant="secondary" onClick={() => navigate(ROUTES.empresasDetalhe.replace(':id', consolidado.empresa.id))}>
                <ArrowLeft size={16} /> Voltar
              </Button>
            }
          />

          {pendentes.length > 0 && (
            <Card className="p-4 border-warning">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning">Atenção: pendências de sincronização</p>
                  <p className="text-xs text-text-muted mt-1">
                    {pendentes.length} setor(es) com formulário pendente ou em rascunho.
                    Os dados exportados refletem apenas o que foi preenchido até o momento.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <Building2 size={20} className="text-primary-600" />
                <div>
                  <p className="text-xs text-text-muted">Setores</p>
                  <p className="text-2xl font-bold">{resumo.totalSetores}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-2 text-xs text-text-muted">
                <span className="flex items-center gap-1"><CheckCircle size={12} className="text-success" /> {resumo.concluidos} concluídos</span>
                <span className="flex items-center gap-1"><Clock size={12} className="text-warning" /> {resumo.pendentes} pendentes</span>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-danger" />
                <div>
                  <p className="text-xs text-text-muted">Riscos Identificados</p>
                  <p className="text-2xl font-bold">{resumo.totalRiscos}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <Ruler size={20} className="text-info" />
                <div>
                  <p className="text-xs text-text-muted">Medições</p>
                  <p className="text-2xl font-bold">{resumo.totalMedicoes}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <ClipboardList size={20} className="text-primary-600" />
                <div>
                  <p className="text-xs text-text-muted">Ações do Plano</p>
                  <p className="text-2xl font-bold">{resumo.totalAcoes}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <CardTitle className="mb-4">Exportar Dados</CardTitle>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExportXLSX}>
                <FileSpreadsheet size={16} /> Exportar XLSX (10 abas)
              </Button>
              <Button variant="secondary" onClick={handleExportCSVRiscos}>
                <FileText size={16} /> CSV Riscos
              </Button>
              <Button variant="secondary" onClick={handleExportCSVMedicoes}>
                <FileText size={16} /> CSV Medições
              </Button>
              <Button variant="secondary" onClick={handleExportCSVPlanoAcao}>
                <FileText size={16} /> CSV Plano de Ação
              </Button>
              <Button variant="secondary" onClick={() => navigate(ROUTES.empresaPdfConferencia.replace(':empresaId', consolidado.empresa.id))}>
                <Printer size={16} /> PDF de Conferência
              </Button>
            </div>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Setores</h3>
                <p className="text-xs text-text-muted">Status dos formulários setoriais</p>
              </div>
            </div>
            {consolidado.setores.length === 0 ? (
              <Card className="p-5">
                <p className="text-sm text-text-muted">Nenhum setor cadastrado.</p>
              </Card>
            ) : (
              <div className="border border-border-light rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-secondary border-b border-border-light">
                      <th className="text-left p-3 text-text-muted font-medium">Setor</th>
                      <th className="text-left p-3 text-text-muted font-medium">Status</th>
                      <th className="text-center p-3 text-text-muted font-medium">%</th>
                      <th className="text-center p-3 text-text-muted font-medium">Riscos</th>
                      <th className="text-center p-3 text-text-muted font-medium">Medições</th>
                      <th className="text-center p-3 text-text-muted font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consolidado.setores.map((s) => (
                      <tr key={s.setor.id} className="border-b border-border-light hover:bg-surface-secondary/50">
                        <td className="p-3 font-medium text-text-primary">{s.setor.nome}</td>
                        <td className="p-3">{statusBadge(s.status)}</td>
                        <td className="p-3 text-center text-text-primary">{s.percentual}%</td>
                        <td className="p-3 text-center text-text-primary">{s.riscos.length}</td>
                        <td className="p-3 text-center text-text-primary">{s.medicoes}</td>
                        <td className="p-3 text-center text-text-primary">{s.controles.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </MainContainer>
    </>
  )
}
