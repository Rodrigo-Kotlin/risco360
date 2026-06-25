import { useState } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { RiscoForm } from '@/components/forms/RiscoForm'
import { RiscoCard } from '@/components/forms/RiscoCard'
import { PlanoAcaoForm } from '@/components/forms/PlanoAcaoForm'
import { Plus } from 'lucide-react'
import { WizardNavigation } from '@/components/ui/WizardNavigation'
import type { RiscoOcupacional, PlanoAcaoItem } from '@/types/risco'
import type { AvaliacaoErgonomica } from '@/types/levantamento'
import type { BibliotecaTecnicaItem } from '@/types/biblioteca'

interface Step07PerigosRiscosAepProps {
  riscos: RiscoOcupacional[]
  avaliacao_ergonomica_preliminar: AvaliacaoErgonomica
  plano_acao: PlanoAcaoItem[]
  onSaveRiscos: (data: RiscoOcupacional[], nextStep?: number) => Promise<boolean>
  onSaveAvaliacaoErgonomica: (data: AvaliacaoErgonomica, nextStep?: number) => Promise<boolean>
  onSaveControles: (data: PlanoAcaoItem[], nextStep?: number) => Promise<boolean>
  saving: boolean
  onPrevious?: () => void
  bibliotecaItens?: BibliotecaTecnicaItem[]
}

export function Step07PerigosRiscosAep({
  riscos, avaliacao_ergonomica_preliminar, plano_acao,
  onSaveRiscos, onSaveAvaliacaoErgonomica, onSaveControles,
  saving, onPrevious,
  bibliotecaItens,
}: Step07PerigosRiscosAepProps) {
  const [riskItems, setRiskItems] = useState<RiscoOcupacional[]>(riscos)
  const [aeForm, setAeForm] = useState<AvaliacaoErgonomica>(
    avaliacao_ergonomica_preliminar ?? {
      posturas_predominantes: null, mobiliario_equipamentos: null,
      repetitividade: null, esforco_fisico: null,
      demandas_cognitivas: null, organizacao_trabalho: null,
      pausas: null, autonomia: null,
      relacoes_socioprofissionais: null, fatores_psicossociais: null,
      necessidade_aet_complementar: null,
      justificativa_tecnica: null, recomendacoes_ergonomicas: null,
    }
  )
  const [controlItems, setControlItems] = useState<PlanoAcaoItem[]>(plano_acao)
  const [showRiskForm, setShowRiskForm] = useState(false)
  const [controlModalOpen, setControlModalOpen] = useState(false)
  const [editingRisk, setEditingRisk] = useState<RiscoOcupacional | undefined>(undefined)
  const [editingControl, setEditingControl] = useState<PlanoAcaoItem | undefined>(undefined)

  const riscoOptions = riskItems.map((r) => ({
    value: r.id, label: `${r.codigo ?? ''} ${r.agente}`.trim(),
  }))

  const handleSaveRisk = async (item: RiscoOcupacional) => {
    const updated = editingRisk
      ? riskItems.map((r) => (r.id === item.id ? item : r))
      : [...riskItems, item]
    setRiskItems(updated)
    setShowRiskForm(false)
    setEditingRisk(undefined)
  }

  const handleDeleteRisk = (id: string) => {
    setRiskItems((prev) => prev.filter((r) => r.id !== id))
  }

  const handleSaveControl = async (item: PlanoAcaoItem) => {
    const updated = editingControl
      ? controlItems.map((c) => (c.id === item.id ? item : c))
      : [...controlItems, item]
    setControlItems(updated)
    setControlModalOpen(false)
    setEditingControl(undefined)
  }

  const handleSaveAll = async (next?: number) => {
    await onSaveRiscos(riskItems)
    await onSaveAvaliacaoErgonomica(aeForm)
    await onSaveControles(controlItems)
    if (next) onSaveRiscos(riskItems, next)
  }

  const setAe = (field: keyof AvaliacaoErgonomica, value: string | boolean | null) => {
    setAeForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <FormSection title="Perigos e riscos ocupacionais"
        description="Identifique os perigos e avalie os riscos presentes no setor">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-text-secondary">{riskItems.length} risco(s) identificado(s)</p>
          <Button onClick={() => { setEditingRisk(undefined); setShowRiskForm(true) }} size="sm">
            <Plus size={14} /> Novo risco
          </Button>
        </div>
        {riskItems.length === 0 ? (
          <EmptyState icon={undefined} title="Nenhum risco" description="Adicione riscos ocupacionais para análise."
            action={{ label: 'Adicionar risco', onClick: () => { setEditingRisk(undefined); setShowRiskForm(true) } }} />
        ) : (
          <div className="space-y-2">
            {riskItems.map((item) => (
              <RiscoCard key={item.id} risco={item}
                onEdit={() => { setEditingRisk(item); setShowRiskForm(true) }}
                onDelete={() => handleDeleteRisk(item.id)} />
            ))}
          </div>
        )}
        {showRiskForm && (
          <div className="mt-4">
            <RiscoForm key={editingRisk?.id ?? 'new'} initial={editingRisk} onSave={handleSaveRisk}
              onCancel={() => { setShowRiskForm(false); setEditingRisk(undefined) }}
              bibliotecaItens={bibliotecaItens} />
          </div>
        )}
      </FormSection>

      <FormSection title="Avaliação Ergonômica Preliminar (AEP)"
        description="Registre as condições ergonômicas do setor">
        <div className="space-y-4">
          <Textarea label="Posturas predominantes" value={aeForm.posturas_predominantes ?? ''}
            onChange={(e) => setAe('posturas_predominantes', e.target.value || null)}
            rows={2} placeholder="Posturas adotadas durante a jornada…" />
          <Textarea label="Mobiliário / equipamentos" value={aeForm.mobiliario_equipamentos ?? ''}
            onChange={(e) => setAe('mobiliario_equipamentos', e.target.value || null)}
            rows={2} placeholder="Adequação do mobiliário…" />
          <Textarea label="Repetitividade" value={aeForm.repetitividade ?? ''}
            onChange={(e) => setAe('repetitividade', e.target.value || null)}
            rows={2} placeholder="Ciclos repetitivos…" />
          <Textarea label="Esforço físico" value={aeForm.esforco_fisico ?? ''}
            onChange={(e) => setAe('esforco_fisico', e.target.value || null)}
            rows={2} placeholder="Intensidade e duração do esforço…" />
          <Textarea label="Demandas cognitivas" value={aeForm.demandas_cognitivas ?? ''}
            onChange={(e) => setAe('demandas_cognitivas', e.target.value || null)}
            rows={2} placeholder="Atenção, memória, tomada de decisão…" />
          <Textarea label="Organização do trabalho" value={aeForm.organizacao_trabalho ?? ''}
            onChange={(e) => setAe('organizacao_trabalho', e.target.value || null)}
            rows={2} placeholder="Distribuição de tarefas…" />
          <Textarea label="Pausas" value={aeForm.pausas ?? ''}
            onChange={(e) => setAe('pausas', e.target.value || null)}
            rows={2} placeholder="Existência e duração das pausas…" />
          <Textarea label="Autonomia" value={aeForm.autonomia ?? ''}
            onChange={(e) => setAe('autonomia', e.target.value || null)}
            rows={2} placeholder="Autonomia para definição do método…" />
          <Textarea label="Relações socioprofissionais" value={aeForm.relacoes_socioprofissionais ?? ''}
            onChange={(e) => setAe('relacoes_socioprofissionais', e.target.value || null)}
            rows={2} placeholder="Relacionamento com colegas e superiores…" />
          <Textarea label="Fatores psicossociais" value={aeForm.fatores_psicossociais ?? ''}
            onChange={(e) => setAe('fatores_psicossociais', e.target.value || null)}
            rows={2} placeholder="Estresse, assédio, pressão…" />
        </div>
        <Card className="p-4 mt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={aeForm.necessidade_aet_complementar === true}
              onChange={(e) => setAe('necessidade_aet_complementar', e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-brand-600 focus:ring-primary-500" />
            <div>
              <p className="text-sm font-medium text-text-primary">Necessidade de AET complementar</p>
              <p className="text-xs text-text-muted">Avaliação Ergonômica do Trabalho detalhada</p>
            </div>
          </label>
        </Card>
        <div className="space-y-4 mt-4">
          <Textarea label="Justificativa técnica" value={aeForm.justificativa_tecnica ?? ''}
            onChange={(e) => setAe('justificativa_tecnica', e.target.value || null)}
            rows={3} placeholder="Justificativa para necessidade ou dispensa da AET…" />
          <Textarea label="Recomendações ergonômicas" value={aeForm.recomendacoes_ergonomicas ?? ''}
            onChange={(e) => setAe('recomendacoes_ergonomicas', e.target.value || null)}
            rows={3} placeholder="Recomendações para adequação ergonômica…" />
        </div>
      </FormSection>

      <FormSection title="Medidas de controle e plano de ação"
        description="Defina as ações de controle para eliminar ou reduzir os riscos identificados">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-text-secondary">{controlItems.length} aç(ão/ões) de controle</p>
          <Button onClick={() => { setEditingControl(undefined); setControlModalOpen(true) }} size="sm">
            <Plus size={14} /> Nova ação
          </Button>
        </div>
        {controlItems.map((item) => (
          <Card key={item.id} className="p-3 mb-2">
            <div className="flex items-start justify-between">
              <div className="text-sm">
                <p className="font-medium">{item.descricao}</p>
                {item.responsavel && <p className="text-text-muted text-xs">Responsável: {item.responsavel}</p>}
                {item.prazo && <p className="text-text-muted text-xs">Prazo: {item.prazo}</p>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon"
                  onClick={() => { setEditingControl(item); setControlModalOpen(true) }}>
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {controlModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setControlModalOpen(false); setEditingControl(undefined) }}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold">{editingControl ? 'Editar ação' : 'Nova ação'}</h2>
              </div>
              <div className="px-6 py-4">
                <PlanoAcaoForm initial={editingControl} riscoOptions={riscoOptions}
                  onSave={handleSaveControl}
                  onCancel={() => { setControlModalOpen(false); setEditingControl(undefined) }} />
              </div>
            </div>
          </div>
        )}
      </FormSection>

      <WizardNavigation
        saving={saving}
        onPrevious={onPrevious}
        onNext={async () => { await handleSaveAll(8) }}
        onSave={async () => { await handleSaveAll() }}
        nextLabel="Revisar"
      />
    </div>
  )
}
