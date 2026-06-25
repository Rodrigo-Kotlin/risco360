import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
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
import { ArrowLeft, Info, Building2, Layers, Check } from 'lucide-react'
import { TIPOS_LEVANTAMENTO_SHORT_LABELS } from '@/constants/levantamentos'
import { cn } from '@/lib/utils'

/** Stepper horizontal — visível apenas em sm: e acima */
function WizardStepperDesktop({
  currentStep,
  totalSteps,
  steps,
  onStepClick,
}: {
  currentStep: number
  totalSteps: number
  steps: typeof STEPS
  onStepClick: (s: number) => void
}) {
  return (
    <nav aria-label="Progresso do formulário" className="hidden sm:block w-full">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep
          const isCurrent = step.number === currentStep
          const isClickable = isCompleted

          return (
            <li key={step.id} className={cn('flex items-center flex-1', index === steps.length - 1 && 'flex-none')}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.number)}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors',
                  isCurrent && 'text-primary-500',
                  isCompleted && 'text-success',
                  !isCurrent && !isCompleted && 'text-text-muted',
                  isClickable && 'cursor-pointer hover:text-primary-600',
                  !isClickable && 'cursor-default'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-all shrink-0',
                  isCurrent && 'border-primary-500 bg-primary-50 text-primary-500',
                  isCompleted && 'border-success bg-success text-white',
                  !isCurrent && !isCompleted && 'border-border-light bg-white text-text-muted'
                )}>
                  {isCompleted ? <Check size={14} /> : step.number}
                </span>
                <span className="hidden lg:inline truncate max-w-[8rem]">{step.label}</span>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px mx-2',
                    step.number < currentStep ? 'bg-success' : 'bg-border-light'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** Indicador compacto para mobile — mostra "Passo X de 8 — Label" + progress bar */
function WizardStepperMobile({
  currentStep,
  totalSteps,
  stepLabel,
  percentual,
}: {
  currentStep: number
  totalSteps: number
  stepLabel: string
  percentual: number
}) {
  return (
    <div className="sm:hidden space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-secondary">
          <span className="text-primary-600 font-bold">Passo {currentStep}</span>
          {' '}de {totalSteps}
        </p>
        <p className="text-xs font-semibold text-primary-600 tabular-nums">{percentual}%</p>
      </div>
      <ProgressBar value={percentual} size="sm" />
      <p className="text-xs text-text-muted truncate">{stepLabel}</p>
    </div>
  )
}

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
            <div className="sm:hidden space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl hidden sm:block" />
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
  const currentStepData = STEPS[wizard.currentStep - 1]

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
      <Header
        title={`${lev.codigo ?? 'Levantamento'}`}
        description={`${lev.empresa_nome ?? ''}${lev.setor_nome ? ` — ${lev.setor_nome}` : ''}`}
      />
      <MainContainer>
        <div className="space-y-4">
          <PageHeader
            title={lev.codigo ?? 'Editar levantamento'}
            description={currentStepData?.label}
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

          {/* Stepper — compacto em mobile, horizontal em desktop */}
          <WizardStepperMobile
            currentStep={wizard.currentStep}
            totalSteps={STEPS.length}
            stepLabel={currentStepData?.label ?? ''}
            percentual={wizard.percentual}
          />
          <WizardStepperDesktop
            currentStep={wizard.currentStep}
            totalSteps={STEPS.length}
            steps={STEPS}
            onStepClick={(s) => wizard.goToStep(s)}
          />

          {/* Contexto do levantamento */}
          {(lev.empresa_nome || lev.setor_nome) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3 py-2.5 bg-surface-muted rounded-xl text-xs text-text-secondary">
              {lev.empresa_nome && (
                <span className="flex items-center gap-1.5">
                  <Building2 size={13} className="shrink-0 text-text-muted" />
                  {lev.empresa_nome}
                </span>
              )}
              {lev.setor_nome && (
                <span className="flex items-center gap-1.5">
                  <Layers size={13} className="shrink-0 text-text-muted" />
                  {lev.setor_nome}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-primary-600 font-medium">
                <Info size={13} className="shrink-0" />
                {tipoLabel}
              </span>
            </div>
          )}

          {lev.status === 'concluido' && (
            <div className="flex items-center gap-2 p-3 bg-info-light border border-blue-200 rounded-xl text-sm text-blue-700">
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
