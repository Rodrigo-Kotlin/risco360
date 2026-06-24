import { useState, type FormEvent } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { generateId } from '@/lib/utils'
import { Save, Loader2, X } from 'lucide-react'
import type { PlanoAcaoItem, PrioridadeAcao, StatusAcao, TipoControle } from '@/types/risco'

interface PlanoAcaoFormProps {
  initial?: PlanoAcaoItem
  riscoOptions?: { value: string; label: string }[]
  onSave: (item: PlanoAcaoItem) => Promise<void>
  onCancel: () => void
}

const PRIORIDADE_OPTIONS: { value: PrioridadeAcao; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
]

const STATUS_OPTIONS: { value: StatusAcao; label: string }[] = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
]

const TIPO_CONTROLE_OPTIONS: { value: TipoControle; label: string }[] = [
  { value: 'eliminacao', label: 'Eliminação' },
  { value: 'substituicao', label: 'Substituição' },
  { value: 'engenharia', label: 'Engenharia' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'epi', label: 'EPI' },
]

export function PlanoAcaoForm({ initial, riscoOptions = [], onSave, onCancel }: PlanoAcaoFormProps) {
  const [riscoId, setRiscoId] = useState(initial?.risco_id ?? '')
  const [descricao, setDescricao] = useState(initial?.descricao ?? '')
  const [prioridade, setPrioridade] = useState<PrioridadeAcao>(initial?.prioridade ?? 'media')
  const [status, setStatus] = useState<StatusAcao>(initial?.status ?? 'pendente')
  const [prazo, setPrazo] = useState(initial?.prazo ?? '')
  const [responsavel, setResponsavel] = useState(initial?.responsavel ?? '')
  const [observacao, setObservacao] = useState(initial?.observacao ?? '')
  const [tipoControle, setTipoControle] = useState<TipoControle | ''>(initial?.tipo_controle ?? '')
  const [evidencia, setEvidencia] = useState(initial?.evidencia ?? '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        id: initial?.id ?? generateId(),
        risco_id: riscoId || null,
        descricao,
        prioridade,
        status,
        prazo: prazo || null,
        responsavel: responsavel || null,
        observacao: observacao || null,
        concluida_em: initial?.concluida_em ?? null,
        tipo_controle: (tipoControle || null) as TipoControle | null,
        evidencia: evidencia || null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={initial ? 'Editar ação' : 'Nova ação'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riscoOptions.length > 0 && (
            <Select label="Risco associado" value={riscoId} onChange={(e) => setRiscoId(e.target.value)}
              options={riscoOptions} placeholder="Selecione um risco…"
            />
          )}
          <Select label="Prioridade" value={prioridade} onChange={(e) => setPrioridade(e.target.value as PrioridadeAcao)}
            options={PRIORIDADE_OPTIONS} required
          />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as StatusAcao)}
            options={STATUS_OPTIONS} required
          />
          <Select label="Tipo de controle" value={tipoControle}
            onChange={(e) => setTipoControle(e.target.value as TipoControle)}
            options={TIPO_CONTROLE_OPTIONS} placeholder="Selecione…"
          />
          <Input label="Responsável" value={responsavel} onChange={(e) => setResponsavel(e.target.value)}
            placeholder="Nome do responsável"
          />
          <Input label="Prazo" type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
          <Input label="Evidência" value={evidencia} onChange={(e) => setEvidencia(e.target.value)}
            placeholder="Link / documento"
          />
        </div>
        <Textarea label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)}
          rows={2} placeholder="Descreva a ação a ser tomada…" required
        />
        <Textarea label="Observação" value={observacao} onChange={(e) => setObservacao(e.target.value)}
          rows={2} placeholder="Observações…"
        />
      </FormSection>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          <X size={16} /> Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar
        </Button>
      </div>
    </form>
  )
}
