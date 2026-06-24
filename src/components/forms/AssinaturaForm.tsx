import { useState, type FormEvent } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Save, Loader2, X } from 'lucide-react'
import type { Assinatura } from '@/types/levantamento'

interface AssinaturaFormProps {
  title: string
  initial?: Assinatura
  onSave: (data: Assinatura) => Promise<void>
  onCancel: () => void
}

export function AssinaturaForm({ title, initial, onSave, onCancel }: AssinaturaFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [cargo, setCargo] = useState(initial?.cargo ?? '')
  const [registro, setRegistro] = useState(initial?.registro_profissional ?? '')
  const [data, setData] = useState(initial?.data ?? '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        nome: nome || null,
        cargo: cargo || null,
        registro_profissional: registro || null,
        data: data || null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={title}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)}
            placeholder="Nome completo"
          />
          <Input label="Cargo" value={cargo} onChange={(e) => setCargo(e.target.value)}
            placeholder="Cargo / função"
          />
          <Input label="Registro profissional" value={registro}
            onChange={(e) => setRegistro(e.target.value)}
            placeholder="Ex: CREA 000000"
          />
          <Input label="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
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
