import { useState } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Save, Loader2, ArrowLeft, ArrowRight } from 'lucide-react'
import type { AvaliacaoErgonomica } from '@/types/levantamento'

interface Step06AvaliacaoErgonomicaPreliminarProps {
  avaliacao_ergonomica: AvaliacaoErgonomica
  onSave: (data: AvaliacaoErgonomica, nextStep?: number) => Promise<boolean>
  saving: boolean
  onPrevious?: () => void
}

export function Step06AvaliacaoErgonomicaPreliminar({
  avaliacao_ergonomica,
  onSave,
  saving,
  onPrevious,
}: Step06AvaliacaoErgonomicaPreliminarProps) {
  const [form, setForm] = useState<AvaliacaoErgonomica>(
    avaliacao_ergonomica ?? {
      posturas_predominantes: null,
      mobiliario_equipamentos: null,
      repetitividade: null,
      esforco_fisico: null,
      demandas_cognitivas: null,
      organizacao_trabalho: null,
      pausas: null,
      autonomia: null,
      relacoes_socioprofissionais: null,
      fatores_psicossociais: null,
      necessidade_aet_complementar: null,
      justificativa_tecnica: null,
      recomendacoes_ergonomicas: null,
    }
  )

  const set = (field: keyof AvaliacaoErgonomica, value: string | boolean | null) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (next?: number) => {
    await onSave(form, next)
  }

  return (
    <div className="space-y-6">
      <FormSection
        title="Avaliação Ergonômica Preliminar (AEP)"
        description="Registre as condições ergonômicas do setor para compor o levantamento integrado LPR + AEP"
      >
        <div className="space-y-4">
          <Textarea label="Posturas predominantes" value={form.posturas_predominantes ?? ''}
            onChange={(e) => set('posturas_predominantes', e.target.value || null)}
            rows={2} placeholder="Posturas adotadas durante a jornada…"
          />
          <Textarea label="Repetitividade" value={form.repetitividade ?? ''}
            onChange={(e) => set('repetitividade', e.target.value || null)}
            rows={2} placeholder="Ciclos repetitivos e tempo de recuperação…"
          />
          <Textarea label="Esforço físico" value={form.esforco_fisico ?? ''}
            onChange={(e) => set('esforco_fisico', e.target.value || null)}
            rows={2} placeholder="Intensidade e duração do esforço…"
          />
          <Textarea label="Mobiliário e equipamentos" value={form.mobiliario_equipamentos ?? ''}
            onChange={(e) => set('mobiliario_equipamentos', e.target.value || null)}
            rows={2} placeholder="Adequação do mobiliário e equipamentos ao trabalhador…"
          />
          <Textarea label="Organização do trabalho" value={form.organizacao_trabalho ?? ''}
            onChange={(e) => set('organizacao_trabalho', e.target.value || null)}
            rows={2} placeholder="Distribuição de tarefas e conteúdo do trabalho…"
          />
          <Textarea label="Pausas" value={form.pausas ?? ''}
            onChange={(e) => set('pausas', e.target.value || null)}
            rows={2} placeholder="Existência e duração das pausas…"
          />
          <Textarea label="Autonomia" value={form.autonomia ?? ''}
            onChange={(e) => set('autonomia', e.target.value || null)}
            rows={2} placeholder="Autonomia para definição do método de trabalho…"
          />
          <Textarea label="Demandas cognitivas" value={form.demandas_cognitivas ?? ''}
            onChange={(e) => set('demandas_cognitivas', e.target.value || null)}
            rows={2} placeholder="Atenção, memória, tomada de decisão…"
          />
          <Textarea label="Relações socioprofissionais" value={form.relacoes_socioprofissionais ?? ''}
            onChange={(e) => set('relacoes_socioprofissionais', e.target.value || null)}
            rows={2} placeholder="Relacionamento com colegas e superiores…"
          />
          <Textarea label="Fatores psicossociais" value={form.fatores_psicossociais ?? ''}
            onChange={(e) => set('fatores_psicossociais', e.target.value || null)}
            rows={2} placeholder="Estresse, pressão, assédio, etc…"
          />
          <Textarea label="Fatores psicossociais observados" value={form.fatores_psicossociais ?? ''}
            onChange={(e) => set('fatores_psicossociais', e.target.value || null)}
            rows={2} placeholder="Estresse, assédio, pressão por resultados…"
          />
        </div>
      </FormSection>

      <FormSection title="AET Complementar" description="Avaliação Ergonômica do Trabalho detalhada">
        <Card className="p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.necessidade_aet_complementar === true}
              onChange={(e) => set('necessidade_aet_complementar', e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-brand-600 focus:ring-primary-500"
            />
            <div>
              <p className="text-label-large text-text-primary">Necessidade de AET complementar</p>
              <p className="text-label-medium text-text-muted">Marque se for necessária uma Avaliação Ergonômica do Trabalho detalhada</p>
            </div>
          </label>
        </Card>
        <div className="space-y-4 mt-4">
          <Textarea label="Justificativa técnica" value={form.justificativa_tecnica ?? ''}
            onChange={(e) => set('justificativa_tecnica', e.target.value || null)}
            rows={3} placeholder="Justificativa para necessidade ou dispensa da AET…"
          />
          <Textarea label="Recomendações ergonômicas" value={form.recomendacoes_ergonomicas ?? ''}
            onChange={(e) => set('recomendacoes_ergonomicas', e.target.value || null)}
            rows={3} placeholder="Recomendações para adequação ergonômica do setor…"
          />
        </div>
      </FormSection>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Button variant="secondary" onClick={onPrevious} disabled={!onPrevious} className="min-h-[48px]">
          <ArrowLeft size={16} /> Anterior
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={async () => { await handleSave() }} disabled={saving} className="min-h-[48px]">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar
          </Button>
          <Button onClick={async () => { await handleSave(7) }} disabled={saving} className="min-h-[48px]">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}