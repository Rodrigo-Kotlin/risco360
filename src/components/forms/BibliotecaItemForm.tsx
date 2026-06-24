import { useState, type FormEvent } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Save, Loader2, X, Plus } from 'lucide-react'
import type { BibliotecaTecnicaItem, BibliotecaTecnicaCreateInput } from '@/types/biblioteca'

const CATEGORIA_OPTIONS = [
  { value: 'Normas Regulamentadoras', label: 'Normas Regulamentadoras' },
  { value: 'Riscos Ocupacionais', label: 'Riscos Ocupacionais' },
  { value: 'EPIs e EPCs', label: 'EPIs e EPCs' },
  { value: 'Documentação Técnica', label: 'Documentação Técnica' },
]

const TIPO_RISCO_OPTIONS = [
  { value: 'fisico', label: 'Físico' },
  { value: 'quimico', label: 'Químico' },
  { value: 'biologico', label: 'Biológico' },
  { value: 'ergonomico', label: 'Ergonômico' },
  { value: 'acidente', label: 'Acidente' },
]

interface BibliotecaItemFormProps {
  initialData?: BibliotecaTecnicaItem
  onSubmit: (data: BibliotecaTecnicaCreateInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function BibliotecaItemForm({ initialData, onSubmit, onCancel, loading }: BibliotecaItemFormProps) {
  const isEditing = !!initialData

  const [titulo, setTitulo] = useState(initialData?.titulo ?? '')
  const [categoria, setCategoria] = useState(initialData?.categoria ?? '')
  const [descricao, setDescricao] = useState(initialData?.descricao ?? '')
  const [tipo_risco, setTipoRisco] = useState(initialData?.tipo_risco ?? '')
  const [perigo, setPerigo] = useState(initialData?.perigo ?? '')
  const [risco, setRisco] = useState(initialData?.risco ?? '')
  const [fonte, setFonte] = useState(initialData?.fonte ?? '')
  const [medidas_controle, setMedidasControle] = useState<string[]>(
    initialData?.medidas_controle?.map((m) => (typeof m === 'string' ? m : m.descricao ?? '')) ?? ['']
  )
  const [epis, setEpis] = useState<string[]>(
    initialData?.epis?.map((e) => (typeof e === 'string' ? e : e.descricao ?? '')) ?? ['']
  )
  const [epcs, setEpcs] = useState<string[]>(initialData?.epcs ?? [''])
  const [treinamentos, setTreinamentos] = useState<string[]>(
    initialData?.treinamentos?.map((t) => (typeof t === 'string' ? t : t.descricao ?? '')) ?? ['']
  )
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true)
  const [publico, setPublico] = useState(initialData?.publico ?? false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!titulo.trim()) errs.titulo = 'Título é obrigatório'
    if (!categoria) errs.categoria = 'Categoria é obrigatória'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const data: BibliotecaTecnicaCreateInput = {
      titulo: titulo.trim(),
      categoria: categoria || undefined,
      descricao: descricao.trim() || undefined,
      tipo_risco: tipo_risco || undefined,
      perigo: perigo.trim() || undefined,
      risco: risco.trim() || undefined,
      fonte: fonte.trim() || undefined,
      medidas_controle: medidas_controle.filter(Boolean).map((d) => ({ descricao: d, tipo: 'engenharia' as const, eficaz: false, observacao: null })),
      epis: epis.filter(Boolean).map((d) => ({ descricao: d, ca: null, validade: null })),
      epcs: epcs.filter(Boolean),
      treinamentos: treinamentos.filter(Boolean).map((d) => ({ descricao: d, tipo: null, carga_horaria: null, periodicidade: null })),
      ativo,
      publico,
    }

    await onSubmit(data)
  }

  const addField = (list: string[], setter: (v: string[]) => void) => {
    setter([...list, ''])
  }

  const removeField = (list: string[], idx: number, setter: (v: string[]) => void) => {
    if (list.length > 1) setter(list.filter((_, i) => i !== idx))
    else setter([''])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Informações básicas" description="Dados gerais do item">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            options={CATEGORIA_OPTIONS}
            placeholder="Selecione…"
            error={errors.categoria}
            required
          />
          <Select
            label="Tipo de risco"
            value={tipo_risco}
            onChange={(e) => setTipoRisco(e.target.value)}
            options={TIPO_RISCO_OPTIONS}
            placeholder="Selecione…"
          />
          <Input
            label="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            error={errors.titulo}
            required
            placeholder="Título do item"
            className="md:col-span-2"
          />
          <Textarea
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição detalhada…"
            rows={3}
            className="md:col-span-2"
          />
          <Input
            label="Perigo"
            value={perigo}
            onChange={(e) => setPerigo(e.target.value)}
            placeholder="Identificação do perigo"
          />
          <Input
            label="Risco"
            value={risco}
            onChange={(e) => setRisco(e.target.value)}
            placeholder="Descrição do risco"
          />
          <Input
            label="Fonte"
            value={fonte}
            onChange={(e) => setFonte(e.target.value)}
            placeholder="Fonte de referência"
            className="md:col-span-2"
          />
        </div>
      </FormSection>

      <FormSection title="Medidas de controle">
        <div className="space-y-2">
          {medidas_controle.map((m, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={m}
                onChange={(e) => {
                  const next = [...medidas_controle]
                  next[i] = e.target.value
                  setMedidasControle(next)
                }}
                placeholder="Medida de controle"
              />
              <button type="button" onClick={() => removeField(medidas_controle, i, setMedidasControle)} className="p-2 text-text-muted hover:text-danger transition-colors" aria-label="Remover">
                <X size={16} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addField(medidas_controle, setMedidasControle)} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            <Plus size={12} /> Adicionar medida
          </button>
        </div>
      </FormSection>

      <FormSection title="EPIs e EPCs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-secondary">EPIs</p>
            {epis.map((e, i) => (
              <div key={i} className="flex gap-2">
                <Input value={e} onChange={(ev) => { const n = [...epis]; n[i] = ev.target.value; setEpis(n) }} placeholder="Nome do EPI" />
                <button type="button" onClick={() => removeField(epis, i, setEpis)} className="p-2 text-text-muted hover:text-danger transition-colors" aria-label="Remover"><X size={16} /></button>
              </div>
            ))}
            <button type="button" onClick={() => addField(epis, setEpis)} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"><Plus size={12} /> Adicionar EPI</button>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-secondary">EPCs</p>
            {epcs.map((e, i) => (
              <div key={i} className="flex gap-2">
                <Input value={e} onChange={(ev) => { const n = [...epcs]; n[i] = ev.target.value; setEpcs(n) }} placeholder="Nome do EPC" />
                <button type="button" onClick={() => removeField(epcs, i, setEpcs)} className="p-2 text-text-muted hover:text-danger transition-colors" aria-label="Remover"><X size={16} /></button>
              </div>
            ))}
            <button type="button" onClick={() => addField(epcs, setEpcs)} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"><Plus size={12} /> Adicionar EPC</button>
          </div>
        </div>
      </FormSection>

      <FormSection title="Treinamentos">
        <div className="space-y-2">
          {treinamentos.map((t, i) => (
            <div key={i} className="flex gap-2">
              <Input value={t} onChange={(e) => { const n = [...treinamentos]; n[i] = e.target.value; setTreinamentos(n) }} placeholder="Treinamento recomendado" />
              <button type="button" onClick={() => removeField(treinamentos, i, setTreinamentos)} className="p-2 text-text-muted hover:text-danger transition-colors" aria-label="Remover"><X size={16} /></button>
            </div>
          ))}
          <button type="button" onClick={() => addField(treinamentos, setTreinamentos)} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"><Plus size={12} /> Adicionar treinamento</button>
        </div>
      </FormSection>

      <FormSection title="Configurações">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="rounded border-border text-primary-500 focus:ring-primary-500/70" />
            Ativo
          </label>
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="checkbox" checked={publico} onChange={(e) => setPublico(e.target.checked)} className="rounded border-border text-primary-500 focus:ring-primary-500/70" />
            Público (visível para todos)
          </label>
        </div>
      </FormSection>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isEditing ? 'Salvar alterações' : 'Adicionar item'}
        </Button>
      </div>
    </form>
  )
}
