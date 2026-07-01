import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { NivelRiscoBadge } from '@/components/forms/NivelRiscoBadge'
import { BibliotecaRiscoSelector } from '@/components/forms/BibliotecaRiscoSelector'
import { calcularNivelRisco } from '@/lib/risk-calculator'
import { generateId } from '@/lib/utils'
import { RiscoSchema, type RiscoFormData } from '@/lib/validation/schemas/risco'
import { Save, Loader2, X, Calculator, BookOpen } from 'lucide-react'
import type { RiscoOcupacional, CategoriaRisco, MeioPropagacao } from '@/types/risco'
import type { BibliotecaTecnicaItem } from '@/types/biblioteca'

interface RiscoFormProps {
  initial?: RiscoOcupacional
  onSave: (risco: RiscoOcupacional) => Promise<void>
  onCancel: () => void
  bibliotecaItens?: BibliotecaTecnicaItem[]
}

const CATEGORIA_OPTIONS: { value: CategoriaRisco; label: string }[] = [
  { value: 'fisico', label: 'Físico' },
  { value: 'quimico', label: 'Químico' },
  { value: 'biologico', label: 'Biológico' },
  { value: 'ergonomico', label: 'Ergonômico' },
  { value: 'acidente', label: 'Acidente' },
  { value: 'mecanico', label: 'Mecânico' },
  { value: 'psicossocial', label: 'Psicossocial' },
]

const MEIO_PROPAGACAO_OPTIONS: { value: MeioPropagacao; label: string }[] = [
  { value: 'ar', label: 'Ar' },
  { value: 'caminhar', label: 'Caminhar' },
  { value: 'conducao_conveccao_radiacao', label: 'Condução/Convecção/Radiação' },
  { value: 'contato', label: 'Contato' },
  { value: 'cutanea_dermica', label: 'Cutânea/Dérmica' },
  { value: 'digestiva_oral', label: 'Digestiva/Oral' },
  { value: 'luz', label: 'Luz' },
  { value: 'movimento_acao', label: 'Movimento/Ação' },
  { value: 'nao_aplicavel', label: 'Não aplicável' },
  { value: 'parenteral', label: 'Parenteral' },
  { value: 'percepcao', label: 'Percepção' },
  { value: 'posto_de_trabalho', label: 'Posto de trabalho' },
  { value: 'sobrecarga_biomecanica', label: 'Sobrecarga biomecânica' },
  { value: 'respiratoria', label: 'Respiratória' },
  { value: 'sonora', label: 'Sonora' },
]

const CATEGORIA_MAP: Record<string, CategoriaRisco> = {
  fisico: 'fisico',
  físico: 'fisico',
  quimico: 'quimico',
  químico: 'quimico',
  biologico: 'biologico',
  biológico: 'biologico',
  ergonomico: 'ergonomico',
  ergonômico: 'ergonomico',
  acidente: 'acidente',
  mecanico: 'mecanico',
  mecânico: 'mecanico',
  psicossocial: 'psicossocial',
}

function normalizeCategoria(val: string | null | undefined): CategoriaRisco {
  if (!val) return 'fisico'
  const lower = val.toLowerCase().trim()
  return CATEGORIA_MAP[lower] ?? 'fisico'
}

export function RiscoForm({ initial, onSave, onCancel, bibliotecaItens }: RiscoFormProps) {
  const [bibliotecaModalOpen, setBibliotecaModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bibliotecaItemId, setBibliotecaItemId] = useState<string | null>(initial?.biblioteca_item_id ?? null)
  const [bibliotecaTitulo, setBibliotecaTitulo] = useState<string | null>(initial?.biblioteca_titulo ?? null)
  const [medidasControle, setMedidasControle] = useState(initial?.medidas_controle ?? [])
  const [epis, setEpis] = useState(initial?.epis ?? [])
  const bibliotecaItemIdRef = useRef<string | null>(initial?.biblioteca_item_id ?? null)
  const bibliotecaTituloRef = useRef<string | null>(initial?.biblioteca_titulo ?? null)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<RiscoFormData>({
    resolver: zodResolver(RiscoSchema) as never,
    defaultValues: {
      codigo: initial?.codigo ?? '',
      categoria: initial?.categoria ?? 'fisico',
      agente: initial?.agente ?? '',
      descricao: initial?.descricao ?? '',
      fonte_geradora: initial?.fonte_geradora ?? '',
      meios_propagacao: initial?.meios_propagacao ?? [],
      caracterizacao: initial?.caracterizacao ?? '',
      dano_possivel: initial?.dano_possivel ?? '',
      fonte_avaliacao: initial?.fonte_avaliacao ?? '',
      probabilidade: initial?.probabilidade?.toString() ?? '',
      severidade: initial?.severidade?.toString() ?? '',
      sugestoes_exposicao: initial?.sugestoes_exposicao ?? '',
      meio_propagacao_label: initial?.meio_propagacao_label ?? '',
      sinalizacao: initial?.sinalizacao ?? '',
      acoes_recomendadas: initial?.acoes_recomendadas?.join('\n') ?? '',
      observacoes: initial?.observacoes ?? '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const meiosPropagacao: string[] = watch('meios_propagacao') ?? []
  const probStr = watch('probabilidade')
  const sevStr = watch('severidade')
  const probNum = parseFloat(probStr ?? '')
  const sevNum = parseFloat(sevStr ?? '')
  const nivelCalculado = (!isNaN(probNum) && !isNaN(sevNum)) ? calcularNivelRisco(probNum, sevNum) : undefined

  const toggleMeioPropagacao = (value: MeioPropagacao) => {
    const current: string[] = getValues('meios_propagacao') ?? []
    const next = current.includes(value)
      ? current.filter((m) => m !== value)
      : [...current, value]
    setValue('meios_propagacao', next)
  }

  const applyBibliotecaItem = (item: BibliotecaTecnicaItem) => {
    setValue('categoria', normalizeCategoria(item.categoria))
    if (item.perigo && !getValues('agente')) setValue('agente', item.perigo)
    if (item.descricao && !getValues('descricao')) setValue('descricao', item.descricao)
    if (item.fonte_geradora && !getValues('fonte_geradora')) setValue('fonte_geradora', item.fonte_geradora)
    if (item.meios_propagacao && item.meios_propagacao.length > 0 && meiosPropagacao.length === 0) {
      const mapped: string[] = []
      for (const mp of item.meios_propagacao) {
        const mpLower = mp.toLowerCase().replace(/[^a-z0-9_]/g, '_')
        const found = MEIO_PROPAGACAO_OPTIONS.find(
          (opt) => opt.label.toLowerCase().replace(/[^a-z0-9_]/g, '_') === mpLower || opt.value === mpLower
        )
        if (found) mapped.push(found.value)
      }
      if (mapped.length > 0) setValue('meios_propagacao', mapped)
    }
    if (item.danos_possiveis && item.danos_possiveis.length > 0 && !getValues('dano_possivel')) {
      setValue('dano_possivel', item.danos_possiveis.join(', '))
    }
    if (item.fonte && !getValues('fonte_avaliacao')) setValue('fonte_avaliacao', item.fonte)
    if (item.sugestao_exposicao && !getValues('sugestoes_exposicao')) setValue('sugestoes_exposicao', item.sugestao_exposicao)
    if (item.acoes_recomendadas && item.acoes_recomendadas.length > 0 && !getValues('acoes_recomendadas')?.trim()) {
      setValue('acoes_recomendadas', item.acoes_recomendadas.join('\n'))
    }
    if (item.medidas_controle && item.medidas_controle.length > 0 && medidasControle.length === 0) {
      setMedidasControle(item.medidas_controle)
    }
    if (item.epis && item.epis.length > 0 && epis.length === 0) {
      setEpis(item.epis)
    }
    bibliotecaItemIdRef.current = item.id
    bibliotecaTituloRef.current = item.titulo
    setBibliotecaItemId(item.id)
    setBibliotecaTitulo(item.titulo)
    setBibliotecaModalOpen(false)
  }

  const onSubmitForm = async (data: RiscoFormData) => {
    setSaving(true)
    try {
      const prob = parseFloat(data.probabilidade ?? '')
      const sev = parseFloat(data.severidade ?? '')
      await onSave({
        id: initial?.id ?? generateId(),
        codigo: data.codigo || null,
        categoria: data.categoria,
        agente: data.agente,
        descricao: data.descricao || null,
        fonte_geradora: data.fonte_geradora || null,
        meios_propagacao: data.meios_propagacao as MeioPropagacao[],
        nivel_risco: (!isNaN(prob) && !isNaN(sev)) ? calcularNivelRisco(prob, sev) : (initial?.nivel_risco ?? 'medio'),
        caracterizacao: data.caracterizacao || null,
        dano_possivel: data.dano_possivel || null,
        medidas_controle: medidasControle,
        epis: epis,
        fonte_avaliacao: data.fonte_avaliacao || null,
        probabilidade: isNaN(prob) ? null : prob,
        severidade: isNaN(sev) ? null : sev,
        sugestoes_exposicao: data.sugestoes_exposicao || null,
        meio_propagacao_label: data.meio_propagacao_label || null,
        sinalizacao: data.sinalizacao || null,
        acoes_recomendadas: (data.acoes_recomendadas ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
        observacoes: data.observacoes || null,
        biblioteca_item_id: bibliotecaItemIdRef.current,
        biblioteca_titulo: bibliotecaTituloRef.current,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4" noValidate>
      {bibliotecaItens && bibliotecaItens.length > 0 && !initial && (
        <div className="flex items-start gap-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <BookOpen size={16} className="text-primary-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary-800">Preencher da Biblioteca Técnica</p>
            <p className="text-xs text-primary-600 mt-0.5">
              Selecione um item da biblioteca para preencher automaticamente os campos do risco
            </p>
            <Button size="sm" variant="outline" type="button" className="mt-2"
              onClick={() => setBibliotecaModalOpen(true)}>
              <BookOpen size={14} /> Selecionar item
            </Button>
          </div>
        </div>
      )}

      {bibliotecaItemId && bibliotecaTitulo && (
        <div className="flex items-center gap-2 p-2 bg-surface-muted rounded-lg">
          <BookOpen size={14} className="text-primary-600 shrink-0" />
          <p className="text-xs text-text-secondary flex-1">
            Preenchido a partir de: <span className="font-medium text-text-primary">{bibliotecaTitulo}</span>
          </p>
          <button type="button" onClick={() => { bibliotecaItemIdRef.current = null; bibliotecaTituloRef.current = null; setBibliotecaItemId(null); setBibliotecaTitulo(null) }}
            className="text-xs text-red-600 hover:text-red-700">
            Remover vínculo
          </button>
        </div>
      )}

      {bibliotecaModalOpen && bibliotecaItens && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 bg-black/40"
          onClick={() => setBibliotecaModalOpen(false)}>
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-4"
            onClick={(e) => e.stopPropagation()}>
            <BibliotecaRiscoSelector
              items={bibliotecaItens}
              onSelect={applyBibliotecaItem}
              onClose={() => setBibliotecaModalOpen(false)}
            />
          </div>
        </div>
      )}

      <FormSection title={initial ? 'Editar risco' : 'Novo risco'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Código" placeholder="Ex: R001"
            {...register('codigo')}
          />
          <Select label="Categoria" options={CATEGORIA_OPTIONS} required
            error={errors.categoria?.message}
            {...register('categoria')}
          />
          <Input label="Agente" placeholder="Ex: Ruído" required
            error={errors.agente?.message}
            {...register('agente')}
          />
          <Input label="Fonte geradora" placeholder="Ex: Prensa hidráulica"
            {...register('fonte_geradora')}
          />
        </div>

        <Textarea label="Descrição" rows={2} placeholder="Descrição do risco…"
          {...register('descricao')}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-text-primary">Meios de propagação</p>
          <div className="flex flex-wrap gap-2">
            {MEIO_PROPAGACAO_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleMeioPropagacao(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  meiosPropagacao.includes(opt.value)
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'bg-white border-border text-text-secondary hover:border-text-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Caracterização" placeholder="Caracterização qualitativa"
            {...register('caracterizacao')}
          />
          <Input label="Dano possível" placeholder="Ex: Perda auditiva"
            {...register('dano_possivel')}
          />
          <Input label="Fonte da avaliação" placeholder="Ex: NR-15, NHO 01"
            {...register('fonte_avaliacao')}
          />
          <Input label="Meio de propagação (label)" placeholder="Descrição livre"
            {...register('meio_propagacao_label')}
          />
          <Input label="Sinalização" placeholder="Ex: Placa de alerta"
            {...register('sinalizacao')}
          />
          <div className="flex items-end gap-2">
            <Input label="Probabilidade (1-5)" type="number" min={1} max={5}
              {...register('probabilidade')}
            />
            <Input label="Severidade (1-5)" type="number" min={1} max={5}
              {...register('severidade')}
            />
          </div>
        </div>

        {nivelCalculado && (
          <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-lg">
            <Calculator size={16} className="text-text-muted" />
            <span className="text-sm text-text-secondary">Nível de risco calculado:</span>
            <NivelRiscoBadge nivel={nivelCalculado} />
          </div>
        )}

        <Input label="Sugestões de exposição" placeholder="Ex: Limite de tolerância NR-15"
          {...register('sugestoes_exposicao')}
        />

        <Textarea label="Ações recomendadas (uma por linha)" rows={3}
          placeholder="Ação 1&#10;Ação 2&#10;Ação 3"
          {...register('acoes_recomendadas')}
        />

        <Textarea label="Observações" rows={2} placeholder="Observações…"
          {...register('observacoes')}
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
