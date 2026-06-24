import { useState } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Save, Loader2, ArrowLeft, ArrowRight, Plus, X, GripVertical } from 'lucide-react'
import { GES_OPCOES, CONDICAO_POSTOS_OPCOES, LAYOUT_POSTO_OPCOES, MOBILIARIO_OPCOES, MAQUINAS_EQUIPAMENTOS_OPCOES } from '@/constants/formulario-options'
import { generateId, ensureArray } from '@/lib/utils'
import type { SegurancaEquipamentos, ItemQuantificado, ItemInventarioAmbiente } from '@/types/levantamento'

interface Step04SegurancaEquipamentosProps {
  data: SegurancaEquipamentos | null | undefined
  onSave: (data: SegurancaEquipamentos, nextStep?: number) => Promise<boolean>
  saving: boolean
  onPrevious?: () => void
}

function ItensComQuantidade({ itens, onChange, label, placeholder }: {
  itens: ItemQuantificado[]
  onChange: (itens: ItemQuantificado[]) => void
  label: string
  placeholder?: string
}) {
  const [newNome, setNewNome] = useState('')

  const add = () => {
    if (newNome.trim()) {
      onChange([...itens, { id: generateId(), nome: newNome.trim(), quantidade: null, observacao: null }])
      setNewNome('')
    }
  }

  const update = (id: string, campo: 'quantidade' | 'observacao', valor: string | number | null) => {
    onChange(itens.map((i) => i.id === id ? { ...i, [campo]: valor } : i))
  }

  const remove = (id: string) => {
    onChange(itens.filter((i) => i.id !== id))
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-text-primary">{label}</p>
      {itens.length > 0 && (
        <div className="space-y-2">
          {itens.map((item) => (
            <div key={item.id} className="flex flex-wrap items-start gap-2 p-2 bg-surface-muted rounded-lg">
              <div className="flex-1 min-w-[120px]">
                <p className="text-sm font-medium text-text-primary">{item.nome}</p>
              </div>
              <Input type="number" min="0" value={item.quantidade ?? ''}
                onChange={(e) => update(item.id, 'quantidade', e.target.value ? parseInt(e.target.value, 10) : null)}
                placeholder="Qtd" className="w-20"
              />
              <Input value={item.observacao ?? ''}
                onChange={(e) => update(item.id, 'observacao', e.target.value || null)}
                placeholder="Observação" className="flex-1 min-w-[120px]"
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
      <div className="flex gap-2">
        <Input value={newNome} onChange={(e) => setNewNome(e.target.value)}
          placeholder={placeholder ?? 'Adicionar item…'}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        />
        <Button type="button" variant="secondary" size="icon" onClick={add} disabled={!newNome.trim()}>
          <Plus size={16} />
        </Button>
      </div>
    </div>
  )
}

function ItensInventarioChips({ opcoes, itens, onChange, tipo, label }: {
  opcoes: { value: string; label: string }[]
  itens: ItemInventarioAmbiente[]
  onChange: (itens: ItemInventarioAmbiente[]) => void
  tipo: ItemInventarioAmbiente['tipo']
  label: string
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

  const updateObs = (id: string, observacao: string | null) => {
    onChange(itens.map((i) => i.id === id ? { ...i, observacao } : i))
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
      <p className="text-sm font-medium text-text-primary">{label}</p>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((opt) => {
          const selected = itens.some((i) => i.nome === opt.label)
          return (
            <button key={opt.value} type="button" onClick={() => toggleChip(opt.label)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                selected
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
              <span className="text-sm font-medium text-text-primary min-w-[120px] flex items-center gap-1">
                <GripVertical size={12} className="text-text-muted shrink-0" />
                {item.nome}
              </span>
              <Input type="number" min="0" value={item.quantidade ?? ''}
                onChange={(e) => updateQtd(item.id, e.target.value ? parseInt(e.target.value, 10) : null)}
                placeholder="Qtd" className="w-20"
              />
              <Input value={item.observacao ?? ''}
                onChange={(e) => updateObs(item.id, e.target.value || null)}
                placeholder="Observação" className="flex-1 min-w-[140px]"
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
      <div className="flex gap-2">
        <Input value={customNome} onChange={(e) => setCustomNome(e.target.value)}
          placeholder="Adicionar customizado…"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
        />
        <Button type="button" variant="secondary" size="icon" onClick={addCustom} disabled={!customNome.trim()}>
          <Plus size={16} />
        </Button>
      </div>
    </div>
  )
}

function converterItensAntigos(itemNomes: string[], tipo: ItemInventarioAmbiente['tipo']): ItemInventarioAmbiente[] {
  return itemNomes.map((nome) => ({ id: generateId(), nome, quantidade: null, observacao: null, tipo }))
}

function converterStringArrayParaItens(arr: string[]): ItemQuantificado[] {
  return arr.map((nome) => ({ id: generateId(), nome, quantidade: null, observacao: null }))
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
      <FormSection title="Segurança e emergência">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <ItensComQuantidade itens={form.sistema_incendio_emergencia_itens}
              onChange={(v) => set('sistema_incendio_emergencia_itens', v)}
              label="Sistemas de incêndio e emergência"
              placeholder="Ex: Extintor, Hidrante…"
            />
          </Card>
          <div className="space-y-4">
            <Select label="É possível estabelecer GES?" value={form.possui_ges ?? ''}
              onChange={(e) => set('possui_ges', e.target.value || null)}
              options={GES_OPCOES} placeholder="Selecione…"
            />
            {form.possui_ges === 'sim' && (
              <Textarea label="Descrição do GES" value={form.descricao_ges ?? ''}
                onChange={(e) => set('descricao_ges', e.target.value || null)}
                rows={4} placeholder="Descreva o Grupo Especial de Segurança estabelecido…"
              />
            )}
          </div>
        </div>
      </FormSection>

      <FormSection title="Mobiliários, máquinas e equipamentos">
        <Card className="p-4 space-y-6">
          <ItensInventarioChips opcoes={MOBILIARIO_OPCOES} itens={form.mobiliario_itens}
            onChange={(v) => set('mobiliario_itens', v)}
            tipo="mobiliario" label="Mobiliários encontrados"
          />
          <Textarea label="Observações sobre mobiliário" value={form.mobiliario_observacao ?? ''}
            onChange={(e) => set('mobiliario_observacao', e.target.value || null)}
            rows={2} placeholder="Condições dos móveis, adaptações, necessidades…"
          />
          <ItensInventarioChips opcoes={MAQUINAS_EQUIPAMENTOS_OPCOES} itens={form.maquinas_equipamentos_itens}
            onChange={(v) => set('maquinas_equipamentos_itens', v)}
            tipo="maquina_equipamento" label="Máquinas / equipamentos"
          />
          <ItensComQuantidade itens={form.ferramentas_itens.map((i) => ({ id: i.id, nome: i.nome, quantidade: i.quantidade, observacao: i.observacao }))}
            onChange={(v) => set('ferramentas_itens', v.map((i) => ({ ...i, tipo: 'ferramenta' as const })))}
            label="Ferramentas utilizadas"
            placeholder="Ex: Chaves, alicates…"
          />
        </Card>
      </FormSection>

      <FormSection title="Layout e condição do posto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Layout do posto" value={form.layout_posto ?? ''}
            onChange={(e) => set('layout_posto', e.target.value || null)}
            options={LAYOUT_POSTO_OPCOES} placeholder="Selecione…"
          />
          <Select label="Condição dos postos de trabalho" value={form.condicao_postos ?? ''}
            onChange={(e) => set('condicao_postos', e.target.value || null)}
            options={CONDICAO_POSTOS_OPCOES} placeholder="Selecione…"
          />
        </div>
      </FormSection>

      <FormSection title="Observações">
        <Textarea value={form.observacoes ?? ''}
          onChange={(e) => set('observacoes', e.target.value || null)}
          rows={3} placeholder="Observações sobre segurança e equipamentos…"
        />
      </FormSection>

      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" onClick={onPrevious} disabled={!onPrevious}>
            <ArrowLeft size={16} /> Anterior
          </Button>
          <Button onClick={async () => { await handleSave(5) }} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Próximo
          </Button>
        </div>
        <Button variant="secondary" className="w-full" onClick={async () => { await handleSave() }} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar rascunho
        </Button>
      </div>
    </div>
  )
}
