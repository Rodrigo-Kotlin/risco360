import { useState, type FormEvent } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { generateId } from '@/lib/utils'
import { normalizePontoMedicao } from '@/lib/normalizers'
import { Save, Loader2, X } from 'lucide-react'
import type { PontoMedicaoQuantitativa } from '@/types/levantamento'

interface PontoMedicaoFormProps {
  initial?: PontoMedicaoQuantitativa
  onSave: (medicao: PontoMedicaoQuantitativa) => Promise<void>
  onCancel: () => void
}

export function PontoMedicaoForm({ initial, onSave, onCancel }: PontoMedicaoFormProps) {
  const normalized = initial ? normalizePontoMedicao(initial) : null

  const [localPonto, setLocalPonto] = useState(normalized?.ponto_local || '')
  const [ruido, setRuido] = useState(normalized?.ruido_dba?.toString() ?? '')
  const [iluminacao, setIluminacao] = useState(normalized?.iluminacao_lux?.toString() ?? '')
  const [temperatura, setTemperatura] = useState(normalized?.temperatura_c?.toString() ?? '')
  const [velocidadeAr, setVelocidadeAr] = useState(normalized?.velocidade_ar_ms?.toString() ?? '')
  const [umidade, setUmidade] = useState(normalized?.umidade_percent?.toString() ?? '')
  const [radiacao, setRadiacao] = useState(normalized?.radiacao_usvh?.toString() ?? '')
  const [observacao, setObservacao] = useState(normalized?.observacoes ?? '')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (umidade) {
      const u = Number(umidade)
      if (u < 0 || u > 100) newErrors.umidade = 'Umidade deve estar entre 0 e 100%'
    }
    if (ruido && Number(ruido) < 0) newErrors.ruido = 'Ruído não pode ser negativo'
    if (iluminacao && Number(iluminacao) < 0) newErrors.iluminacao = 'Iluminação não pode ser negativa'
    if (velocidadeAr && Number(velocidadeAr) < 0) newErrors.velocidadeAr = 'Velocidade do ar não pode ser negativa'
    if (radiacao && Number(radiacao) < 0) newErrors.radiacao = 'Radiação não pode ser negativa'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await onSave({
        id: initial?.id ?? generateId(),
        ponto_local: localPonto || 'Ponto não informado',
        ruido_dba: ruido ? parseFloat(ruido) : null,
        iluminacao_lux: iluminacao ? parseFloat(iluminacao) : null,
        temperatura_c: temperatura ? parseFloat(temperatura) : null,
        velocidade_ar_ms: velocidadeAr ? parseFloat(velocidadeAr) : null,
        umidade_percent: umidade ? parseFloat(umidade) : null,
        radiacao_usvh: radiacao ? parseFloat(radiacao) : null,
        observacoes: observacao || null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={initial ? 'Editar ponto de medição' : 'Novo ponto de medição'}>
        <div className="space-y-3">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Identificação</p>
          <Input label="Ponto / local avaliado" value={localPonto}
            onChange={(e) => setLocalPonto(e.target.value)}
            placeholder="Ex: Sala 201 — Posto administrativo"
          />

          <p className="text-xs font-medium text-text-muted uppercase tracking-wider pt-2">Medições quantitativas</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Ruído (dB(A))" type="number" step="any" inputMode="decimal" value={ruido}
              onChange={(e) => setRuido(e.target.value)} placeholder="Ex: 85.0"
              error={errors.ruido}
            />
            <Input label="Iluminação (lux)" type="number" step="any" inputMode="decimal" value={iluminacao}
              onChange={(e) => setIluminacao(e.target.value)} placeholder="Ex: 500"
              error={errors.iluminacao}
            />
            <Input label="Temperatura (°C)" type="number" step="any" inputMode="decimal" value={temperatura}
              onChange={(e) => setTemperatura(e.target.value)} placeholder="Ex: 23"
            />
            <Input label="Velocidade do ar (m/s)" type="number" step="any" inputMode="decimal" value={velocidadeAr}
              onChange={(e) => setVelocidadeAr(e.target.value)} placeholder="Ex: 0.5"
              error={errors.velocidadeAr}
            />
            <Input label="Umidade (%)" type="number" step="any" inputMode="decimal" value={umidade}
              onChange={(e) => setUmidade(e.target.value)} placeholder="Ex: 60"
              error={errors.umidade}
            />
            <Input label="Radiação (µSv/h)" type="number" step="any" inputMode="decimal" value={radiacao}
              onChange={(e) => setRadiacao(e.target.value)} placeholder="Ex: 0.12"
              error={errors.radiacao}
            />
          </div>

          <p className="text-xs font-medium text-text-muted uppercase tracking-wider pt-2">Observações</p>
          <Textarea label="Observações" value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            rows={2} placeholder="Observações sobre a medição…"
          />
        </div>
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
