import { useState } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Save, Loader2, ArrowLeft, ArrowRight } from 'lucide-react'
import { OPCOES_SIM_NAO, OPCOES_ILUMINACAO_ARTIFICIAL, OPCOES_VENTILACAO_ARTIFICIAL } from '@/constants/formulario-options'
import type { IluminacaoVentilacaoConforto } from '@/types/levantamento'

interface Step03IluminacaoVentilacaoProps {
  data: IluminacaoVentilacaoConforto | null | undefined
  onSave: (data: IluminacaoVentilacaoConforto, nextStep?: number) => Promise<boolean>
  saving: boolean
  onPrevious?: () => void
}

const AVALIACAO_OPCOES = [
  { value: 'adequada', label: 'Adequada' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'inadequada', label: 'Inadequada' },
  { value: 'nao_aplicavel', label: 'Não se aplica' },
  { value: 'nao_avaliado', label: 'Não avaliada' },
]

const CONFORTO_TERMICO_OPCOES = [
  { value: 'adequado', label: 'Adequado' },
  { value: 'calor_perceptivel', label: 'Calor perceptível' },
  { value: 'frio_perceptivel', label: 'Frio perceptível' },
  { value: 'oscilacao_termica', label: 'Oscilação térmica' },
  { value: 'nao_avaliado', label: 'Não avaliado' },
]

export function Step03IluminacaoVentilacao({ data, onSave, saving, onPrevious }: Step03IluminacaoVentilacaoProps) {
  const [form, setForm] = useState<IluminacaoVentilacaoConforto>(
    data ?? {
      iluminacao_natural: null, iluminacao_artificial: null,
      ventilacao_natural: null, ventilacao_artificial: null,
      condicao_iluminacao: null, condicao_ventilacao: null,
      conforto_termico: null, observacoes: null,
    }
  )
  const [outroArtificial, setOutroArtificial] = useState('')
  const [outroVentilacao, setOutroVentilacao] = useState('')

  const set = <K extends keyof IluminacaoVentilacaoConforto>(key: K, value: IluminacaoVentilacaoConforto[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (next?: number) => {
    let observacoes = form.observacoes ?? ''
    const extras: string[] = []
    if (form.iluminacao_artificial === 'outro' && outroArtificial.trim()) {
      extras.push(`Iluminação artificial (outro): ${outroArtificial.trim()}`)
    }
    if (form.ventilacao_artificial === 'outro' && outroVentilacao.trim()) {
      extras.push(`Ventilação artificial (outro): ${outroVentilacao.trim()}`)
    }
    if (extras.length > 0) {
      observacoes = observacoes ? `${observacoes}\n${extras.join('\n')}` : extras.join('\n')
    }
    await onSave({ ...form, observacoes: observacoes || null }, next)
  }

  return (
    <div className="space-y-6">
      <FormSection title="Iluminação" description="Avaliação das condições de iluminação do local">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Iluminação natural" value={form.iluminacao_natural ?? ''}
            onChange={(e) => set('iluminacao_natural', e.target.value || null)}
            options={OPCOES_SIM_NAO} placeholder="Selecione…"
          />
          <div className="space-y-2">
            <Select label="Iluminação artificial" value={form.iluminacao_artificial ?? ''}
              onChange={(e) => {
                set('iluminacao_artificial', e.target.value || null)
                if (e.target.value !== 'outro') setOutroArtificial('')
              }}
              options={OPCOES_ILUMINACAO_ARTIFICIAL} placeholder="Selecione…"
            />
            {form.iluminacao_artificial === 'outro' && (
              <Input value={outroArtificial}
                onChange={(e) => setOutroArtificial(e.target.value)}
                placeholder="Especifique o tipo…"
              />
            )}
          </div>
          <Select label="Condição de iluminação" value={form.condicao_iluminacao ?? ''}
            onChange={(e) => set('condicao_iluminacao', e.target.value || null)}
            options={AVALIACAO_OPCOES} placeholder="Selecione…"
          />
        </div>
      </FormSection>

      <FormSection title="Ventilação" description="Avaliação das condições de ventilação do local">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Ventilação natural" value={form.ventilacao_natural ?? ''}
            onChange={(e) => set('ventilacao_natural', e.target.value || null)}
            options={AVALIACAO_OPCOES} placeholder="Selecione…"
          />
          <div className="space-y-2">
            <Select label="Ventilação artificial" value={form.ventilacao_artificial ?? ''}
              onChange={(e) => {
                set('ventilacao_artificial', e.target.value || null)
                if (e.target.value !== 'outro') setOutroVentilacao('')
              }}
              options={OPCOES_VENTILACAO_ARTIFICIAL} placeholder="Selecione…"
            />
            {form.ventilacao_artificial === 'outro' && (
              <Input value={outroVentilacao}
                onChange={(e) => setOutroVentilacao(e.target.value)}
                placeholder="Especifique o tipo…"
              />
            )}
          </div>
          <Select label="Condição de ventilação" value={form.condicao_ventilacao ?? ''}
            onChange={(e) => set('condicao_ventilacao', e.target.value || null)}
            options={AVALIACAO_OPCOES} placeholder="Selecione…"
          />
        </div>
      </FormSection>

      <FormSection title="Conforto térmico">
        <Select label="Conforto térmico observado" value={form.conforto_termico ?? ''}
          onChange={(e) => set('conforto_termico', e.target.value || null)}
          options={CONFORTO_TERMICO_OPCOES} placeholder="Selecione…"
        />
      </FormSection>

      <FormSection title="Observações">
        <Textarea value={form.observacoes ?? ''}
          onChange={(e) => set('observacoes', e.target.value || null)}
          rows={3} placeholder="Observações sobre iluminação, ventilação e conforto…"
        />
      </FormSection>

      <div className="flex flex-col gap-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" onClick={onPrevious} disabled={!onPrevious}>
            <ArrowLeft size={16} /> Anterior
          </Button>
          <Button onClick={async () => { await handleSave(4) }} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Próximo
          </Button>
        </div>
        <Button variant="secondary" onClick={async () => { await handleSave() }} disabled={saving} className="w-full">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar rascunho
        </Button>
      </div>
    </div>
  )
}
