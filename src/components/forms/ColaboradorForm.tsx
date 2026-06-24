import { useState, type FormEvent } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { generateId } from '@/lib/utils'
import { Save, Loader2, X } from 'lucide-react'
import type { ColaboradorExposto } from '@/types/levantamento'

interface ColaboradorFormProps {
  initial?: ColaboradorExposto
  onSave: (colaborador: ColaboradorExposto) => Promise<void>
  onCancel: () => void
}

export function ColaboradorForm({ initial, onSave, onCancel }: ColaboradorFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [cpf, setCpf] = useState(initial?.cpf ?? '')
  const [funcao, setFuncao] = useState(initial?.funcao ?? '')
  const [setor, setSetor] = useState(initial?.setor ?? '')
  const [jornada, setJornada] = useState(initial?.jornada ?? '')
  const [tempoExposicao, setTempoExposicao] = useState(initial?.tempo_exposicao ?? '')
  const [epiUtilizado, setEpiUtilizado] = useState(initial?.epi_utilizado ?? '')
  const [observacao, setObservacao] = useState(initial?.observacao ?? '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        id: initial?.id ?? generateId(),
        nome: nome || null,
        cpf: cpf || null,
        funcao: funcao || null,
        setor: setor || null,
        jornada: jornada || null,
        tempo_exposicao: tempoExposicao || null,
        epi_utilizado: epiUtilizado || null,
        observacao: observacao || null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSection title={initial ? 'Editar colaborador' : 'Novo colaborador'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)}
            placeholder="Nome completo" required
          />
          <Input label="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
          />
          <Input label="Função" value={funcao} onChange={(e) => setFuncao(e.target.value)}
            placeholder="Cargo / função"
          />
          <Input label="Setor" value={setor} onChange={(e) => setSetor(e.target.value)}
            placeholder="Setor de trabalho"
          />
          <Input label="Jornada" value={jornada} onChange={(e) => setJornada(e.target.value)}
            placeholder="Ex: 8h/dia, 44h/sem"
          />
          <Input label="Tempo de exposição" value={tempoExposicao}
            onChange={(e) => setTempoExposicao(e.target.value)}
            placeholder="Ex: 5 anos"
          />
          <Input label="EPI utilizado" value={epiUtilizado}
            onChange={(e) => setEpiUtilizado(e.target.value)}
            placeholder="Ex: Protetor auricular"
          />
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
