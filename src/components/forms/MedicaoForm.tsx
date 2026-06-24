import { useState, type FormEvent } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { generateId } from '@/lib/utils'
import { Save, Loader2, X } from 'lucide-react'
import type { Medicao } from '@/types/levantamento'

interface MedicaoFormProps {
  initial?: Medicao
  onSave: (medicao: Medicao) => Promise<void>
  onCancel: () => void
}

const TIPO_OPTIONS = [
  { value: 'ruido', label: 'Ruído' },
  { value: 'vibracao', label: 'Vibração' },
  { value: 'calor', label: 'Calor' },
  { value: 'frio', label: 'Frio' },
  { value: 'iluminancia', label: 'Iluminância' },
  { value: 'quimico', label: 'Químico' },
  { value: 'biologico', label: 'Biológico' },
  { value: 'ergonomico', label: 'Ergonômico' },
  { value: 'outro', label: 'Outro' },
]

const UNIDADE_OPTIONS = [
  { value: 'dB(A)', label: 'dB(A)' },
  { value: 'm/s²', label: 'm/s²' },
  { value: '°C', label: '°C' },
  { value: 'lux', label: 'lux' },
  { value: 'ppm', label: 'ppm' },
  { value: 'mg/m³', label: 'mg/m³' },
  { value: '%', label: '%' },
  { value: 'adimensional', label: 'Adimensional' },
]

export function MedicaoForm({ initial, onSave, onCancel }: MedicaoFormProps) {
  const [tipo, setTipo] = useState(initial?.tipo ?? '')
  const [agente, setAgente] = useState(initial?.agente ?? '')
  const [metodo, setMetodo] = useState(initial?.metodo ?? '')
  const [equipamento, setEquipamento] = useState(initial?.equipamento ?? '')
  const [valor, setValor] = useState(initial?.valor?.toString() ?? '')
  const [unidade, setUnidade] = useState(initial?.unidade ?? '')
  const [limiteTolerancia, setLimiteTolerancia] = useState(initial?.limite_tolerancia?.toString() ?? '')
  const [fonte, setFonte] = useState(initial?.fonte ?? '')
  const [duracao, setDuracao] = useState(initial?.duracao ?? '')
  const [local, setLocal] = useState(initial?.local ?? '')
  const [numeroSerie, setNumeroSerie] = useState(initial?.numero_serie ?? '')
  const [responsavel, setResponsavel] = useState(initial?.responsavel ?? '')
  const [data, setData] = useState(initial?.data ?? '')
  const [hora, setHora] = useState(initial?.hora ?? '')
  const [observacao, setObservacao] = useState(initial?.observacao ?? '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        id: initial?.id ?? generateId(),
        tipo,
        agente,
        metodo: metodo || null,
        equipamento: equipamento || null,
        valor: valor ? parseFloat(valor) : null,
        unidade: unidade || null,
        limite_tolerancia: limiteTolerancia ? parseFloat(limiteTolerancia) : null,
        fonte: fonte || null,
        duracao: duracao || null,
        local: local || null,
        numero_serie: numeroSerie || null,
        responsavel: responsavel || null,
        data: data || null,
        hora: hora || null,
        observacao: observacao || null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={initial ? 'Editar medição' : 'Nova medição'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}
            options={TIPO_OPTIONS} placeholder="Selecione…" required
          />
          <Input label="Agente" value={agente} onChange={(e) => setAgente(e.target.value)}
            placeholder="Ex: Ruído contínuo" required
          />
          <Input label="Método" value={metodo} onChange={(e) => setMetodo(e.target.value)}
            placeholder="Ex: NHO 01"
          />
          <Input label="Equipamento" value={equipamento} onChange={(e) => setEquipamento(e.target.value)}
            placeholder="Ex: Dosímetro"
          />
          <Input label="Valor" type="number" step="any" value={valor}
            onChange={(e) => setValor(e.target.value)} placeholder="Ex: 85.0"
          />
          <Select label="Unidade" value={unidade} onChange={(e) => setUnidade(e.target.value)}
            options={UNIDADE_OPTIONS} placeholder="Selecione…"
          />
          <Input label="Limite de tolerância" type="number" step="any"
            value={limiteTolerancia} onChange={(e) => setLimiteTolerancia(e.target.value)}
          />
          <Input label="Fonte" value={fonte} onChange={(e) => setFonte(e.target.value)}
            placeholder="Fonte geradora"
          />
          <Input label="Duração" value={duracao} onChange={(e) => setDuracao(e.target.value)}
            placeholder="Ex: 8h/dia"
          />
          <Input label="Local" value={local} onChange={(e) => setLocal(e.target.value)}
            placeholder="Setor / máquina"
          />
          <Input label="Nº de série" value={numeroSerie} onChange={(e) => setNumeroSerie(e.target.value)}
            placeholder="Número de série do equipamento"
          />
          <Input label="Responsável" value={responsavel} onChange={(e) => setResponsavel(e.target.value)}
            placeholder="Técnico responsável"
          />
          <Input label="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
          <Input label="Hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
        </div>
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
