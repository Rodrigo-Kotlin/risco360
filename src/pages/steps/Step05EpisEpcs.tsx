import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Plus, Trash2, Pencil, Shield, ShieldCheck } from 'lucide-react'
import { WizardNavigation } from '@/components/ui/WizardNavigation'
import { cn } from '@/lib/utils'
import type { EpisEpcsEvidencias, EpisItem, EpcItem, EvidenciaItem } from '@/types/levantamento'
import { EPI_OPCOES, EPC_OPCOES } from '@/constants/formulario-options'
import { ensureArray } from '@/lib/utils'

function normalizeEpisEpcsEvidencias(data: unknown): EpisEpcsEvidencias {
  if (!data || typeof data !== 'object') {
    return { epis: [], epcs: [], evidencias: [], observacoes: null }
  }
  const d = data as Record<string, unknown>
  return {
    epis: ensureArray(d.epis as EpisItem[] | undefined | null),
    epcs: ensureArray(d.epcs as EpcItem[] | undefined | null),
    evidencias: ensureArray(d.evidencias as EvidenciaItem[] | undefined | null),
    observacoes: typeof d.observacoes === 'string' ? d.observacoes : null,
  }
}

function safeEpisItems(items: EpisItem[] | null | undefined): EpisItem[] {
  return ensureArray(items)
}

function safeEpcItems(items: EpcItem[] | null | undefined): EpcItem[] {
  return ensureArray(items)
}

interface Step05EpisEpcsProps {
  data: EpisEpcsEvidencias | null | undefined
  onSave: (data: EpisEpcsEvidencias, nextStep?: number) => Promise<boolean>
  saving: boolean
  onPrevious?: () => void
}

function EpisSection({ items, onChange }: { items: EpisItem[] | null | undefined; onChange: (items: EpisItem[]) => void }) {
  const safeItems = safeEpisItems(items)
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [ca, setCa] = useState('')
  const [obs, setObs] = useState('')
  const [editingIdx, setEditingIdx] = useState<number | null>(null)

  const save = () => {
    if (!nome.trim()) return
    const item: EpisItem = { nome: nome.trim(), ca: ca || null, observacao: obs || null }
    if (editingIdx !== null) {
      onChange(safeItems.map((e, i) => i === editingIdx ? item : e))
    } else {
      onChange([...safeItems, item])
    }
    setNome(''); setCa(''); setObs(''); setEditingIdx(null); setOpen(false)
  }

  const edit = (idx: number) => {
    setNome(safeItems[idx].nome); setCa(safeItems[idx].ca ?? ''); setObs(safeItems[idx].observacao ?? '')
    setEditingIdx(idx); setOpen(true)
  }

  const addPredefined = (label: string) => {
    if (safeItems.some((e) => e.nome === label)) return
    onChange([...safeItems, { nome: label, ca: null, observacao: null }])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-label-large text-text-primary">EPIs encontrados ({safeItems.length})</p>
        <Button size="sm" variant="secondary" onClick={() => { setOpen(true); setEditingIdx(null); setNome(''); setCa(''); setObs('') }} className="min-h-[48px]">
          <Plus size={14} /> Adicionar EPI
        </Button>
      </div>
      {safeItems.length === 0 && !open && (
        <p className="text-body-small text-text-muted">Nenhum EPI registrado.</p>
      )}
      {safeItems.map((epi, i) => (
        <Card key={i} className="p-3">
          <div className="flex items-start justify-between">
          <div className="text-body-medium">
            <p className="font-medium">{epi.nome}</p>
            {epi.ca && <p className="text-text-muted text-label-medium">CA: {epi.ca}</p>}
            {epi.observacao && <p className="text-text-muted text-label-medium">{epi.observacao}</p>}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => edit(i)} className="min-h-[48px] w-12 h-12"><Pencil size={14} /></Button>
              <Button variant="ghost" size="icon" onClick={() => onChange(safeItems.filter((_, j) => j !== i))} className="text-danger min-h-[48px] w-12 h-12"><Trash2 size={14} /></Button>
            </div>
          </div>
        </Card>
      ))}
      <div className="flex flex-wrap gap-1.5">
        {EPI_OPCOES.map((opt) => {
          const selected = safeItems.some((e) => e.nome === opt.label)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => addPredefined(opt.label)}
              aria-pressed={selected}
              className={`px-3 py-3 text-label-medium rounded-full border transition-colors min-h-[48px] ${
                selected
                  ? 'bg-primary-500/10 border-primary-500 text-primary-600 cursor-default'
                  : 'bg-surface border-border text-text-secondary hover:border-primary-500 hover:text-primary-600'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {open && (
        <Card className="p-4 space-y-3">
          <Input label="Nome do EPI" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Óculos de segurança" />
          <Input label="CA" value={ca} onChange={(e) => setCa(e.target.value)} placeholder="Certificado de Aprovação" />
          <Textarea label="Observação" value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder="Observações…" />
          <div className="flex gap-2">
            <Button onClick={save} disabled={!nome.trim()} className="min-h-[48px]">{editingIdx !== null ? 'Atualizar' : 'Adicionar'}</Button>
            <Button variant="secondary" onClick={() => { setOpen(false); setEditingIdx(null) }} className="min-h-[48px]">Cancelar</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

function EpcsSection({ items, onChange }: { items: EpcItem[] | null | undefined; onChange: (items: EpcItem[]) => void }) {
  const safeItems = safeEpcItems(items)
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [obs, setObs] = useState('')
  const [editingIdx, setEditingIdx] = useState<number | null>(null)

  const save = () => {
    if (!nome.trim()) return
    const item: EpcItem = { nome: nome.trim(), observacao: obs || null }
    if (editingIdx !== null) {
      onChange(safeItems.map((e, i) => i === editingIdx ? item : e))
    } else {
      onChange([...safeItems, item])
    }
    setNome(''); setObs(''); setEditingIdx(null); setOpen(false)
  }

  const addPredefined = (label: string) => {
    if (safeItems.some((e) => e.nome === label)) return
    onChange([...safeItems, { nome: label, observacao: null }])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-label-large text-text-primary">EPCs encontrados ({safeItems.length})</p>
        <Button size="sm" variant="secondary" onClick={() => { setOpen(true); setEditingIdx(null); setNome(''); setObs('') }} className="min-h-[48px]">
          <Plus size={14} /> Adicionar EPC
        </Button>
      </div>
      {safeItems.length === 0 && !open && (
        <p className="text-body-small text-text-muted">Nenhum EPC registrado.</p>
      )}
      {safeItems.map((epc, i) => (
        <Card key={i} className="p-3">
          <div className="flex items-start justify-between">
            <div className="text-body-medium">
              <p className="font-medium">{epc.nome}</p>
              {epc.observacao && <p className="text-text-muted text-label-medium">{epc.observacao}</p>}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setNome(epc.nome); setObs(epc.observacao ?? ''); setEditingIdx(i); setOpen(true) }} className="min-h-[48px] w-12 h-12"><Pencil size={14} /></Button>
              <Button variant="ghost" size="icon" onClick={() => onChange(safeItems.filter((_, j) => j !== i))} className="text-danger min-h-[48px] w-12 h-12"><Trash2 size={14} /></Button>
            </div>
          </div>
        </Card>
      ))}
      <div className="flex flex-wrap gap-1.5">
        {EPC_OPCOES.map((opt) => {
          const selected = safeItems.some((e) => e.nome === opt.label)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => addPredefined(opt.label)}
              aria-pressed={selected}
              className={`px-3 py-3 text-label-medium rounded-full border transition-colors min-h-[48px] ${
                selected
                  ? 'bg-primary-500/10 border-primary-500 text-primary-600 cursor-default'
                  : 'bg-surface border-border text-text-secondary hover:border-primary-500 hover:text-primary-600'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {open && (
        <Card className="p-4 space-y-3">
          <Input label="Nome do EPC" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Extintor, sinalização" />
          <Textarea label="Observação" value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder="Observações…" />
          <div className="flex gap-2">
            <Button onClick={save} disabled={!nome.trim()} className="min-h-[48px]">{editingIdx !== null ? 'Atualizar' : 'Adicionar'}</Button>
            <Button variant="secondary" onClick={() => { setOpen(false); setEditingIdx(null) }} className="min-h-[48px]">Cancelar</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

type TabId = 'epis' | 'epcs'

const TABS: { id: TabId; label: string; icon: typeof Shield; count?: number }[] = [
  { id: 'epis', label: 'EPIs', icon: Shield },
  { id: 'epcs', label: 'EPCs', icon: ShieldCheck },
]

export function Step05EpisEpcs({ data, onSave, saving, onPrevious }: Step05EpisEpcsProps) {
  const [form, setForm] = useState<EpisEpcsEvidencias>(
    normalizeEpisEpcsEvidencias(data)
  )
  const [activeTab, setActiveTab] = useState<TabId>('epis')

  const handleSave = async (next?: number) => {
    await onSave(form, next)
  }

  const tabCounts: Record<TabId, number> = {
    epis: safeEpisItems(form.epis).length,
    epcs: safeEpcItems(form.epcs).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex border-b border-border-light overflow-x-auto -mx-1 px-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const count = tabCounts[tab.id]
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-3 text-label-medium font-medium whitespace-nowrap border-b-2 transition-colors -mb-px min-h-[48px]',
                isActive
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border-light'
              )}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
            >
              <Icon size={14} aria-hidden="true" />
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  'text-label-medium px-1.5 py-0.5 rounded-full',
                  isActive ? 'bg-primary-500/10 text-primary-600' : 'bg-surface-muted text-text-muted'
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id="panel-epis" hidden={activeTab !== 'epis'}>
        {activeTab === 'epis' && (
          <EpisSection items={form.epis} onChange={(epis) => setForm((prev) => ({ ...prev, epis }))} />
        )}
      </div>

      <div role="tabpanel" id="panel-epcs" hidden={activeTab !== 'epcs'}>
        {activeTab === 'epcs' && (
          <EpcsSection items={form.epcs} onChange={(epcs) => setForm((prev) => ({ ...prev, epcs }))} />
        )}
      </div>

      <WizardNavigation
        saving={saving}
        onPrevious={onPrevious}
        onNext={async () => { await handleSave(6) }}
        onSave={async () => { await handleSave() }}
      />
    </div>
  )
}
