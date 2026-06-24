import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Stepper } from '@/components/ui/Stepper'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { Button } from '@/components/ui/Button'
import { ROUTES, STEPS } from '@/constants/app'
import { useLevantamentoWizard } from '@/hooks/useLevantamentoWizard'
import { listarEmpresas } from '@/services/empresas.service'
import { Step01Identificacao } from '@/pages/steps/Step01Identificacao'
import { Step02Caracteristicas } from '@/pages/steps/Step02Caracteristicas'
import { Step03IluminacaoVentilacao } from '@/pages/steps/Step03IluminacaoVentilacao'
import { Step04SegurancaEquipamentos } from '@/pages/steps/Step04SegurancaEquipamentos'
import { Step05EpisEpcs } from '@/pages/steps/Step05EpisEpcs'
import { Step06Medicoes } from '@/pages/steps/Step06Medicoes'
import { Step07PerigosRiscosAep } from '@/pages/steps/Step07PerigosRiscosAep'
import { Step08RevisaoConclusao } from '@/pages/steps/Step08RevisaoConclusao'
import { useBibliotecaTecnica } from '@/hooks/useBibliotecaTecnica'
import { ArrowLeft, Info, Building2, Layers } from 'lucide-react'
import { TIPOS_LEVANTAMENTO_SHORT_LABELS } from '@/constants/levantamentos'

export default function LevantamentoWizardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const wizard = useLevantamentoWizard(id)
  const [_empresas, setEmpresas] = useState<{ value: string; label: string }[]>([])
  const { data: bibliotecaItens } = useBibliotecaTecnica()

  useEffect(() => {
    listarEmpresas().then((result) => {
      if (!result.error && result.data) {
        setEmpresas(
          result.data.map((e) => ({ value: e.id, label: `${e.razao_social}${e.cnpj ? ` (${e.cnpj})` : ''}` }))
        )
      }
    })
  }, [])

  if (wizard.loading) {
    return (
      <>
        <Header title="Editando levantamento" />
        <MainContainer>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </MainContainer>
      </>
    )
  }

  if (wizard.error || !wizard.levantamento) {
    return (
      <>
        <Header title="Erro" />
        <MainContainer>
          <p className="text-sm text-danger">{wizard.error ?? 'Levantamento não encontrado'}</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate(ROUTES.levantamentos)}>
            <ArrowLeft size={16} /> Voltar
          </Button>
        </MainContainer>
      </>
    )
  }

  const lev = wizard.levantamento

  const renderStep = () => {
    switch (wizard.currentStep) {
      case 1:
        return (
          <Step01Identificacao
            levantamento={lev}
            onSave={async (data, nextStep) => {
              return wizard.setIdentificacao(data, nextStep as 2 | undefined)
            }}
            saving={wizard.saving}
          />
        )
      case 2:
        return (
          <Step02Caracteristicas
            caracteristicas={lev.caracteristicas_fisicas}
            onSave={wizard.setCaracteristicasFisicas}
            saving={wizard.saving}
            onPrevious={() => wizard.goToStep(1)}
          />
        )
      case 3:
        return (
          <Step03IluminacaoVentilacao
            data={lev.iluminacao_ventilacao_conforto}
            onSave={wizard.setIluminacaoVentilacao}
            saving={wizard.saving}
            onPrevious={() => wizard.goToStep(2)}
          />
        )
      case 4:
        return (
          <Step04SegurancaEquipamentos
            data={lev.seguranca_equipamentos}
            onSave={wizard.setSegurancaEquipamentos}
            saving={wizard.saving}
            onPrevious={() => wizard.goToStep(3)}
          />
        )
      case 5:
        return (
          <Step05EpisEpcs
            data={lev.epis_epcs_evidencias}
            onSave={wizard.setEpisEpcs}
            saving={wizard.saving}
            onPrevious={() => wizard.goToStep(4)}
          />
        )
      case 6:
        return (
          <Step06Medicoes
            medicoes={lev.pontos_medicao ?? []}
            onSave={wizard.setPontosMedicao}
            saving={wizard.saving}
            onPrevious={() => wizard.goToStep(5)}
          />
        )
      case 7:
        return (
          <Step07PerigosRiscosAep
            riscos={lev.riscos}
            avaliacao_ergonomica_preliminar={lev.avaliacao_ergonomica_preliminar ?? lev.avaliacao_ergonomica}
            plano_acao={lev.plano_acao ?? lev.controles}
            onSaveRiscos={wizard.setRiscos}
            onSaveAvaliacaoErgonomica={wizard.setAvaliacaoErgonomica}
            onSaveControles={wizard.setControles}
            saving={wizard.saving}
            onPrevious={() => wizard.goToStep(6)}
            bibliotecaItens={bibliotecaItens ?? []}
          />
        )
      case 8:
        return (
          <Step08RevisaoConclusao
            levantamento={lev}
            percentual={wizard.percentual}
            onSaveParecer={wizard.setParecer}
            onSaveAssinaturas={wizard.setAssinaturas}
            onConcluir={wizard.concluirWizard}
            saving={wizard.saving}
            onPrevious={() => wizard.goToStep(7)}
          />
        )
      default:
        return <p className="text-text-secondary">Etapa desconhecida</p>
    }
  }

  const tipoLabel = TIPOS_LEVANTAMENTO_SHORT_LABELS[lev.tipo] ?? lev.tipo

  return (
    <>
      <Header title={`Editando ${lev.codigo ?? ''}`} description={`${lev.empresa_nome ?? ''}${lev.setor_nome ? ` — ${lev.setor_nome}` : ''}`} />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title={lev.codigo ?? 'Editar levantamento'}
            description={`${STEPS[wizard.currentStep - 1]?.label ?? ''} — etapa ${wizard.currentStep} de 8`}
            breadcrumb={
              lev.empresa_id && lev.setor_id
                ? [
                    { label: 'Empresas', href: ROUTES.empresas },
                    { label: 'Setor', href: ROUTES.setorDetalhe.replace(':empresaId', lev.empresa_id).replace(':setorId', lev.setor_id) },
                    { label: lev.codigo ?? 'Editar' },
                  ]
                : [
                    { label: 'Levantamentos', href: ROUTES.levantamentos },
                    { label: lev.codigo ?? 'Editar' },
                  ]
            }
            secondaryActions={
              <Button variant="secondary" onClick={() => {
                if (lev.empresa_id && lev.setor_id) {
                  navigate(ROUTES.setorDetalhe.replace(':empresaId', lev.empresa_id).replace(':setorId', lev.setor_id))
                } else {
                  navigate(ROUTES.levantamentosDetalhe.replace(':id', lev.id))
                }
              }}>
                <ArrowLeft size={16} /> Voltar
              </Button>
            }
          />

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Stepper steps={STEPS} currentStep={wizard.currentStep} onStepClick={(s) => wizard.goToStep(s)} />
            </div>
            <div className="shrink-0 w-32">
              <ProgressBar value={wizard.percentual} size="sm" showLabel />
            </div>
          </div>

          {(lev.empresa_nome || lev.setor_nome) && (
            <div className="flex items-center gap-4 p-3 bg-surface-muted rounded-xl text-sm text-text-secondary">
              {lev.empresa_nome && (
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} className="shrink-0" />
                  {lev.empresa_nome}
                </span>
              )}
              {lev.setor_nome && (
                <span className="flex items-center gap-1.5">
                  <Layers size={14} className="shrink-0" />
                  {lev.setor_nome}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-primary-600 font-medium">
                <Info size={14} className="shrink-0" />
                {tipoLabel}
              </span>
            </div>
          )}

          {lev.status === 'concluido' && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
              <Info size={16} className="shrink-0" />
              Este levantamento já foi concluído. As alterações serão salvas, mas não alteram o status.
            </div>
          )}

          <Card className="p-4 md:p-5">
            {renderStep()}
          </Card>
        </div>
      </MainContainer>
    </>
  )
}
