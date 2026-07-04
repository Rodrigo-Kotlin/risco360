import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { queryClient } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { buscarLevantamentoPorId, atualizarLevantamento, atualizarStatusLevantamento } from '@/services/levantamentos.service'
import { ROUTES } from '@/constants/app'
import { calcularPercentual, calcularProximoPasso, normalizeWizardStep } from '@/lib/wizard-progress'
import { useToast } from '@/hooks/useToast'
import { nowISO } from '@/lib/offline-db'
import type { Levantamento, LevantamentoUpdateInput } from '@/types/levantamento'
import type { CaracteristicasFisicas, IluminacaoVentilacaoConforto, SegurancaEquipamentos, EpisEpcsEvidencias } from '@/types/levantamento'
import type { Medicao, PontoMedicaoQuantitativa } from '@/types/levantamento'
import type { RiscoOcupacional, PlanoAcaoItem } from '@/types/risco'
import type { AvaliacaoErgonomica, ParecerTecnico, Assinatura } from '@/types/levantamento'

const TOTAL_STEPS = 9

interface WizardState {
  levantamento: Levantamento | null
  currentStep: number
  loading: boolean
  saving: boolean
  error: string | null
}

export function useLevantamentoWizard(levantamentoId: string | undefined) {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [state, setState] = useState<WizardState>({
    levantamento: null,
    currentStep: 1,
    loading: true,
    saving: false,
    error: null,
  })

  const load = useCallback(async () => {
    if (!levantamentoId) return
    setState((prev) => ({ ...prev, loading: true, error: null }))
    const result = await buscarLevantamentoPorId(levantamentoId)
    if (result.error) {
      setState((prev) => ({ ...prev, loading: false, error: result.error }))
      return
    }
    const lev = result.data
    const initialStep = normalizeWizardStep(lev?.ultimo_step ?? calcularProximoPasso(lev!), lev?.status)
    setState((prev) => ({
      ...prev,
      levantamento: lev,
      loading: false,
      currentStep: initialStep,
    }))
  }, [levantamentoId])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setState((prev) => ({ ...prev, currentStep: step }))
      if (levantamentoId) {
        atualizarLevantamento(levantamentoId, { ultimo_step: step }).catch(() => {})
      }
    }
  }, [levantamentoId])

  const saveStep = useCallback(
    async (input: LevantamentoUpdateInput, nextStep?: number) => {
      if (!levantamentoId || !state.levantamento) return false

      setState((prev) => ({ ...prev, saving: true }))

      const newPercentual = calcularPercentual({
        ...state.levantamento,
        ...input,
      })

      const result = await atualizarLevantamento(levantamentoId, {
        ...input,
        percentual: newPercentual,
        ultimo_step: state.currentStep,
        ultima_edicao: nowISO(),
      })

      setState((prev) => ({ ...prev, saving: false }))

      if (result.error) {
        toast(result.error, 'error')
        return false
      }

      if (!result.data) {
        toast('Levantamento não encontrado ou sem permissão. Recarregue e tente novamente.', 'error')
        return false
      }

      const updated = result.data

      if (updated.sync_status === 'pending') {
        toast('Salvo localmente. Pendente de sincronização.', 'info')
      }

      setState((prev) => ({
        ...prev,
        levantamento: updated,
      }))

      if (nextStep) {
        setState((prev) => ({ ...prev, currentStep: nextStep }))
      }

      return true
    },
    [levantamentoId, state.levantamento, state.currentStep, toast]
  )

  const concluirWizard = useCallback(async () => {
    if (!levantamentoId || !state.levantamento) return

    setState((prev) => ({ ...prev, saving: true }))
    const newPercentual = calcularPercentual(state.levantamento)

    await atualizarLevantamento(levantamentoId, {
      percentual: newPercentual,
      ultimo_step: 9,
      ultima_edicao: nowISO(),
    })
    const result = await atualizarStatusLevantamento(levantamentoId, 'concluido')
    setState((prev) => ({ ...prev, saving: false }))

    if (result.error) {
      toast(result.error, 'error')
      return
    }

    toast('Levantamento concluído com sucesso!', 'success')
    queryClient.invalidateQueries({ queryKey: queryKeys.levantamentos.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
    navigate(ROUTES.levantamentosDetalhe.replace(':id', levantamentoId))
  }, [levantamentoId, state.levantamento, navigate, toast])

  const setIdentificacao = useCallback(
    (data: LevantamentoUpdateInput, next?: number) => saveStep(data, next),
    [saveStep]
  )

  const setCaracteristicasFisicas = useCallback(
    (data: CaracteristicasFisicas, next?: number) => saveStep({ caracteristicas_fisicas: data }, next),
    [saveStep]
  )

  const setIluminacaoVentilacao = useCallback(
    (data: IluminacaoVentilacaoConforto, next?: number) => saveStep({ iluminacao_ventilacao_conforto: data }, next),
    [saveStep]
  )

  const setSegurancaEquipamentos = useCallback(
    (data: SegurancaEquipamentos, next?: number) => saveStep({ seguranca_equipamentos: data }, next),
    [saveStep]
  )

  const setEpisEpcs = useCallback(
    (data: EpisEpcsEvidencias, next?: number) => saveStep({ epis_epcs_evidencias: data }, next),
    [saveStep]
  )

  const setMedicoes = useCallback(
    (data: Medicao[], next?: number) => saveStep({ medicoes: data }, next),
    [saveStep]
  )

  const setPontosMedicao = useCallback(
    (data: PontoMedicaoQuantitativa[], next?: number) => saveStep({ pontos_medicao: data }, next),
    [saveStep]
  )

  const setRiscos = useCallback(
    (data: RiscoOcupacional[], next?: number) => saveStep({ riscos: data }, next),
    [saveStep]
  )

  const setAvaliacaoErgonomica = useCallback(
    (data: AvaliacaoErgonomica, next?: number) => saveStep({
      avaliacao_ergonomica_preliminar: data,
      avaliacao_ergonomica: data,
    }, next),
    [saveStep]
  )

  const setControles = useCallback(
    (data: PlanoAcaoItem[], next?: number) => saveStep({
      plano_acao: data,
      controles: data,
    }, next),
    [saveStep]
  )

  const setParecer = useCallback(
    (data: ParecerTecnico, next?: number) => saveStep({ parecer: data }, next),
    [saveStep]
  )

  const setAssinaturas = useCallback(
    (
      data: {
        assinatura_tecnico?: Assinatura
        assinatura_empresa?: Assinatura
      },
      next?: number
    ) => saveStep(data, next),
    [saveStep]
  )

  const percentual = state.levantamento ? calcularPercentual(state.levantamento) : 0

  return {
    ...state,
    percentual,
    load,
    goToStep,
    setIdentificacao,
    setCaracteristicasFisicas,
    setIluminacaoVentilacao,
    setSegurancaEquipamentos,
    setEpisEpcs,
    setMedicoes,
    setPontosMedicao,
    setRiscos,
    setAvaliacaoErgonomica,
    setControles,
    setParecer,
    setAssinaturas,
    concluirWizard,
    saveStep,
  }
}

export type UseLevantamentoWizardReturn = ReturnType<typeof useLevantamentoWizard>