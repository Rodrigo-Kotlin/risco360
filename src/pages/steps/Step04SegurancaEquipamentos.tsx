import { useState } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Save, Loader2, ArrowLeft, ArrowRight, Plus, X, GripVertical } from 'lucide-react'
import { CONDICAO_POSTOS_OPCOES, LAYOUT_POSTO_OPCOES, MOBILIARIO_OPCOES, MAQUINAS_EQUIPAMENTOS_OPCOES, SEGURANCA_EMERGENCIA_ITENS } from '@/constants/formulario-options'
import { generateId, ensureArray } from '@/lib/utils'
import type { SegurancaEquipamentos, ItemInventarioAmbiente } from '@/types/levantamento'

interface Step04SegurancaEquipamentosProps {
  data: SegurancaEquipamentos | null | undefined
  onSave: (data: SegurancaEquipamentos, nextStep?: number) => Promise<boolean>
  saving: boolean
  onPrevious?: () => void
}

function ItensInventarioChips({ opcoes, itens, onChange, tipo, label }: {
  opcoes: { value: string; label: string }[]
  itens: ItemInventarioAmbiente[]
  onChange: (itens: ItemInventarioAmbiente[]) => void
  tipo: ItemInventarioAmbiente['tipo']
  label?: string
}) {
  const [customNome, setCustomNome] = useState('')

  const toggleChip = (optLabel: string) => {
    const exists = itens.find((i) => i.nome === optLabel)
    if (exists) {
      onChange(itens.filter((i) => i.id !== exists.id))
    } else {
      onChange([...itens, { id: generateId(), nome: optLabel, quantidade: null, observacao: null, tipo }])
    }
  }

  const updateQtd = (id: string, quantidade: number | null) => {
    onChange(itens.map((i) => i.id === id ? { ...i, quantidade } : i))
  }

  const remove = (id: string) => {
    onChange(itens.filter((i) => i.id !== id))
  }

  const addCustom = () => {
    if (customNome.trim() && !itens.find((i) => i.nome.toLowerCase() === customNome.trim().toLowerCase())) {
      onChange([...itens, { id: generateId(), nome: customNome.trim(), quantidade: null, observacao: null, tipo }])
      setCustomNome('')
    }
  }

  return (
    <div className="space-y-3">
      {label && <p className="text-label-large text-text-primary">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {opcoes.map((opt) => {
          const selected = itens.some((i) => i.nome === opt.label)
          return (
            <button key={opt.value} type="button" onClick={() => toggleChip(opt.label)}
              className={`px-3 py-3 text-label-medium font-medium rounded-full border transition-colors min-h-[48px] ${selected
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'bg-white border-border text-text-secondary hover:border-text-muted'
                }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {itens.length > 0 && (
        <div className="space-y-2">
          {itens.map((item) => (
            <div key={item.id} className="flex flex-wrap items-start gap-2 p-2 bg-surface-muted rounded-lg">
              <span className="text-label-large text-text-primary min-w-[120px] flex items-center gap-1">
                <GripVertical size={12} className="text-text-muted shrink-0" />
                {item.nome}
              </span>
              <Input type="number" min="0" value={item.quantidade ?? ''}
                onChange={(e) => updateQtd(item.id, e.target.value ? parseInt(e.target.value, 10) : null)}
                placeholder="Qtd" className="w-20"
              />
              <button type="button" onClick={() => remove(item.id)}
                className="text-text-muted hover:text-danger transition-colors p-1"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function converterItensAntigos(itemNomes: string[], tipo: ItemInventarioAmbiente['tipo']): ItemInventarioAmbiente[] {
  return itemNomes.map((nome) => ({ id: generateId(), nome, quantidade: null, observacao: null, tipo }))
}

function converterStringArrayParaItens(arr: string[]): ItemInventarioAmbiente[] {
  return arr.map((nome) => ({ id: generateId(), nome, quantidade: null, observacao: null, tipo: 'incendio_emergencia' as const }))
}

export function Step04SegurancaEquipamentos({ data, onSave, saving, onPrevious }: Step04SegurancaEquipamentosProps) {
  const [form, setForm] = useState<SegurancaEquipamentos>(() => {
    const raw = data ?? {
      sistema_incendio_emergencia: [],
      sistema_incendio_emergencia_itens: [],
      possui_ges: null,
      descricao_ges: null,
      mobiliarios: [],
      mobiliario_observacao: null,
      mobiliario_itens: [],
      maquinas_equipamentos: [],
      maquinas_equipamentos_itens: [],
      ferramentas: [],
      ferramentas_itens: [],
      layout_posto: null,
      condicao_postos: null,
      observacoes: null,
    }

    const rawInc = ensureArray(raw.sistema_incendio_emergencia)
    const rawIncItens = ensureArray(raw.sistema_incendio_emergencia_itens)
    const incItens = rawIncItens.length === 0 && rawInc.length > 0
      ? converterStringArrayParaItens(rawInc)
      : rawIncItens

    const rawMob = ensureArray(raw.mobiliarios)
    const rawMobItens = ensureArray(raw.mobiliario_itens)
    const mobItens = rawMobItens.length === 0 && rawMob.length > 0
      ? converterItensAntigos(rawMob, 'mobiliario')
      : rawMobItens

    const rawMaq = ensureArray(raw.maquinas_equipamentos)
    const rawMaqItens = ensureArray(raw.maquinas_equipamentos_itens)
    const maqItens = rawMaqItens.length === 0 && rawMaq.length > 0
      ? converterItensAntigos(rawMaq, 'maquina_equipamento')
      : rawMaqItens

    const rawFer = ensureArray(raw.ferramentas)
    const rawFerItens = ensureArray(raw.ferramentas_itens)
    const ferItens = rawFerItens.length === 0 && rawFer.length > 0
      ? converterItensAntigos(rawFer, 'ferramenta')
      : rawFerItens

    return { ...raw, sistema_incendio_emergencia: rawInc, sistema_incendio_emergencia_itens: incItens, mobiliarios: rawMob, mobiliario_itens: mobItens, maquinas_equipamentos: rawMaq, maquinas_equipamentos_itens: maqItens, ferramentas: rawFer, ferramentas_itens: ferItens }
  })

  const set = <K extends keyof SegurancaEquipamentos>(key: K, value: SegurancaEquipamentos[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (next?: number) => {
    const mobiliariosNomes = form.mobiliario_itens.map((i) => i.nome)
    const maquinasNomes = form.maquinas_equipamentos_itens.map((i) => i.nome)
    const ferramentasNomes = form.ferramentas_itens.map((i) => i.nome)
    const incNomes = form.sistema_incendio_emergencia_itens.map((i) => i.nome)
    await onSave({
      ...form,
      mobiliarios: mobiliariosNomes,
      maquinas_equipamentos: maquinasNomes,
      ferramentas: ferramentasNomes,
      sistema_incendio_emergencia: incNomes,
    }, next)
  }

  return (
    <div className="space-y-6">
      <FormSection title="Sistemas de Incêndio e Emergência">
        <ItensInventarioChips opcoes={SEGURANCA_EMERGENCIA_ITENS} itens={form.sistema_incendio_emergencia_itens}
          onChange={(v) => set('sistema_incendio_emergencia_itens', v)}
          tipo="incendio_emergencia"
        />
        <hr className="border-border" />
        <ItensInventarioChips opcoes={MOBILIARIO_OPCOES} itens={form.mobiliario_itens}
          onChange={(v) => set('mobiliario_itens', v)}
          tipo="mobiliario"
        />
        <hr className="border-border" />
        <ItensInventarioChips opcoes={MAQUINAS_EQUIPAMENTOS_OPCOES} itens={form.maquinas_equipamentos_itens}
          onChange={(v) => set('maquinas_equipamentos_itens', v)}
          tipo="maquina_equipamento"
        />
      </FormSection>

      <FormSection title="Layout e Condição do Posto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select aria-label="Layout do posto" value={form.layout_posto ?? ''}
            onChange={(e) => set('layout_posto', e.target.value || null)}
            options={LAYOUT_POSTO_OPCOES} placeholder="Selecione…"
          />
          <Select aria-label="Condição dos postos de trabalho" value={form.condicao_postos ?? ''}
            onChange={(e) => set('condicao_postos', e.target.value || null)}
            options={CONDICAO_POSTOS_OPCOES} placeholder="Selecione…"
          />
        </div>
      </FormSection>

      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" onClick={onPrevious} disabled={!onPrevious} className="min-h-[48px]">
            <ArrowLeft size={16} /> Anterior
          </Button>
          <Button onClick={async () => { await handleSave(5) }} disabled={saving} className="min-h-[48px]">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Próximo
          </Button>
        </div>
        <Button variant="secondary" className="w-full min-h-[48px]" onClick={async () => { await handleSave() }} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar rascunho
        </Button>
      </div>
    </div>
  )
}
