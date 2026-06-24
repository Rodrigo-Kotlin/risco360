import { useState } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Save, Loader2, ArrowLeft, ArrowRight } from 'lucide-react'
import {
  PISO_OPCOES, PAREDE_OPCOES, TELHADO_OPCOES, FORRO_OPCOES,
  DIVISORIAS_OPCOES, PAVIMENTO_OPCOES, REVESTIMENTO_OPCOES,
} from '@/constants/formulario-options'
import type { CaracteristicasFisicas } from '@/types/levantamento'

interface Step02CaracteristicasProps {
  caracteristicas: CaracteristicasFisicas | null | undefined
  onSave: (data: CaracteristicasFisicas, nextStep?: number) => Promise<boolean>
  saving: boolean
  onPrevious?: () => void
}

export function Step02Caracteristicas({ caracteristicas, onSave, saving, onPrevious }: Step02CaracteristicasProps) {
  const [form, setForm] = useState<CaracteristicasFisicas>(
    caracteristicas ?? {
      largura: null, comprimento: null, pe_direito: null,
      pavimento: null, divisórias: null, piso: null,
      revestimento: null, vedacao_paredes: null, telhado: null, forro: null,
      quantidade_colaboradores: null,
    }
  )

  const set = <K extends keyof CaracteristicasFisicas>(key: K, value: CaracteristicasFisicas[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (next?: number) => {
    await onSave(form, next)
  }

  return (
    <div className="space-y-6">
      <FormSection title="Dimensões" description="Medidas físicas do local avaliado">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Largura (m)" type="number" step="any" min="0"
            value={form.largura?.toString() ?? ''}
            onChange={(e) => set('largura', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="Ex: 10.5"
          />
          <Input label="Comprimento (m)" type="number" step="any" min="0"
            value={form.comprimento?.toString() ?? ''}
            onChange={(e) => set('comprimento', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="Ex: 8.0"
          />
          <Input label="Pé direito (m)" type="number" step="any" min="0"
            value={form.pe_direito?.toString() ?? ''}
            onChange={(e) => set('pe_direito', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="Ex: 3.0"
          />
        </div>
      </FormSection>

      <FormSection title="Equipe" description="Colaboradores alocados no local">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Quantidade de colaboradores" type="number" min="0" step="1"
            value={form.quantidade_colaboradores?.toString() ?? ''}
            onChange={(e) => set('quantidade_colaboradores', e.target.value ? parseInt(e.target.value, 10) : null)}
            placeholder="Ex: 12"
          />
        </div>
      </FormSection>

      <FormSection title="Estrutura física">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Pavimento" value={form.pavimento ?? ''}
            onChange={(e) => set('pavimento', e.target.value || null)}
            options={PAVIMENTO_OPCOES} placeholder="Selecione…"
          />
          <Select label="Divisórias" value={form.divisórias ?? ''}
            onChange={(e) => set('divisórias', e.target.value || null)}
            options={DIVISORIAS_OPCOES} placeholder="Selecione…"
          />
          <Select label="Piso" value={form.piso ?? ''}
            onChange={(e) => set('piso', e.target.value || null)}
            options={PISO_OPCOES} placeholder="Selecione…"
          />
          <Select label="Revestimento" value={form.revestimento ?? ''}
            onChange={(e) => set('revestimento', e.target.value || null)}
            options={REVESTIMENTO_OPCOES} placeholder="Selecione…"
          />
          <Select label="Vedação / Paredes" value={form.vedacao_paredes ?? ''}
            onChange={(e) => set('vedacao_paredes', e.target.value || null)}
            options={PAREDE_OPCOES} placeholder="Selecione…"
          />
          <Select label="Telhado" value={form.telhado ?? ''}
            onChange={(e) => set('telhado', e.target.value || null)}
            options={TELHADO_OPCOES} placeholder="Selecione…"
          />
          <Select label="Forro" value={form.forro ?? ''}
            onChange={(e) => set('forro', e.target.value || null)}
            options={FORRO_OPCOES} placeholder="Selecione…"
          />
        </div>
      </FormSection>

      <div className="flex flex-col gap-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" onClick={onPrevious} disabled={!onPrevious}>
            <ArrowLeft size={16} /> Anterior
          </Button>
          <Button onClick={async () => { await handleSave(3) }} disabled={saving}>
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
