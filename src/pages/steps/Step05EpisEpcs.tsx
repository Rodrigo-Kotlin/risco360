import { useState, useCallback } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Save, Loader2, ArrowLeft, ArrowRight, Plus, Trash2, Pencil, ImageIcon, AlertCircle } from 'lucide-react'
import type { EpisEpcsEvidencias, EpisItem, EpcItem, EvidenciaItem } from '@/types/levantamento'
import { EPI_OPCOES, EPC_OPCOES } from '@/constants/formulario-options'
import { uploadEvidenciaFotografica, revogarPreviewEvidencia, formatarTamanhoArquivo, obterPreviewLocal } from '@/services/evidencias.service'
import { removerBlobOffline } from '@/services/offline/offline-evidencia-blobs.service'
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

function safeEvidenciaItems(items: EvidenciaItem[] | null | undefined): EvidenciaItem[] {
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
        <p className="text-sm font-medium text-text-primary">EPIs encontrados ({safeItems.length})</p>
        <Button size="sm" variant="secondary" onClick={() => { setOpen(true); setEditingIdx(null); setNome(''); setCa(''); setObs('') }}>
          <Plus size={14} /> Adicionar EPI
        </Button>
      </div>
      {safeItems.length === 0 && !open && (
        <p className="text-sm text-text-muted">Nenhum EPI registrado.</p>
      )}
      {safeItems.map((epi, i) => (
        <Card key={i} className="p-3">
          <div className="flex items-start justify-between">
            <div className="text-sm">
              <p className="font-medium">{epi.nome}</p>
              {epi.ca && <p className="text-text-muted text-xs">CA: {epi.ca}</p>}
              {epi.observacao && <p className="text-text-muted text-xs">{epi.observacao}</p>}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => edit(i)}><Pencil size={14} /></Button>
              <Button variant="ghost" size="icon" onClick={() => onChange(safeItems.filter((_, j) => j !== i))} className="text-danger"><Trash2 size={14} /></Button>
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
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                selected
                  ? 'bg-primary/10 border-primary text-primary cursor-default'
                  : 'bg-surface border-border text-text-secondary hover:border-primary hover:text-primary'
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
            <Button onClick={save} disabled={!nome.trim()}>{editingIdx !== null ? 'Atualizar' : 'Adicionar'}</Button>
            <Button variant="secondary" onClick={() => { setOpen(false); setEditingIdx(null) }}>Cancelar</Button>
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
        <p className="text-sm font-medium text-text-primary">EPCs encontrados ({safeItems.length})</p>
        <Button size="sm" variant="secondary" onClick={() => { setOpen(true); setEditingIdx(null); setNome(''); setObs('') }}>
          <Plus size={14} /> Adicionar EPC
        </Button>
      </div>
      {safeItems.length === 0 && !open && (
        <p className="text-sm text-text-muted">Nenhum EPC registrado.</p>
      )}
      {safeItems.map((epc, i) => (
        <Card key={i} className="p-3">
          <div className="flex items-start justify-between">
            <div className="text-sm">
              <p className="font-medium">{epc.nome}</p>
              {epc.observacao && <p className="text-text-muted text-xs">{epc.observacao}</p>}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setNome(epc.nome); setObs(epc.observacao ?? ''); setEditingIdx(i); setOpen(true) }}><Pencil size={14} /></Button>
              <Button variant="ghost" size="icon" onClick={() => onChange(safeItems.filter((_, j) => j !== i))} className="text-danger"><Trash2 size={14} /></Button>
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
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                selected
                  ? 'bg-primary/10 border-primary text-primary cursor-default'
                  : 'bg-surface border-border text-text-secondary hover:border-primary hover:text-primary'
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
            <Button onClick={save} disabled={!nome.trim()}>{editingIdx !== null ? 'Atualizar' : 'Adicionar'}</Button>
            <Button variant="secondary" onClick={() => { setOpen(false); setEditingIdx(null) }}>Cancelar</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

function EvidenciasSection({ items, onChange }: { items: EvidenciaItem[] | null | undefined; onChange: (items: EvidenciaItem[]) => void }) {
  const safeItems = safeEvidenciaItems(items)
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const addImage = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp'
    input.capture = 'environment'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const now = new Date()
      const idx = safeItems.length

      onChange([...safeItems, {
        legenda: file.name,
        observacao: `Arquivo: ${file.name}`,
        data: now.toISOString().slice(0, 10),
        hora: now.toTimeString().slice(0, 5),
        mime_type: file.type,
        size_bytes: file.size,
        upload_status: 'uploading',
      }])

      setUploadingIdx(idx)
      setErrorMessage(null)

      const result = await uploadEvidenciaFotografica({ file, legenda: file.name, origem: 'camera' })

      if (result.error) {
        setErrorMessage(result.error)
        setUploadingIdx(null)
        onChange(safeItems.map((ev, j) =>
          j === idx ? { ...ev, upload_status: 'error' } : ev
        ))
        return
      }

      const r = result.data!
      const finalPreviewUrl = r.local_blob_id
        ? (await obterPreviewLocal(r.local_blob_id, null)) ?? r.preview_url
        : r.preview_url

      onChange(safeItems.map((ev, j) =>
        j === idx ? {
          ...ev,
          local_id: r.localId,
          storage_path: r.storage_path,
          preview_url: finalPreviewUrl,
          mime_type: r.mime_type,
          size_bytes: r.size_bytes,
          upload_status: r.upload_status,
          local_blob_id: r.local_blob_id,
          sync_status: r.upload_status === 'pending' ? 'pending' as const : 'synced' as const,
        } : ev
      ))
    }
    input.click()
  }, [safeItems, onChange])

  const removeImage = useCallback((idx: number) => {
    const item = safeItems[idx]
    if (!item) return
    if (item.preview_url && item.preview_url.startsWith('blob:')) {
      revogarPreviewEvidencia(item.preview_url)
    }
    if (item.local_blob_id) {
      removerBlobOffline(item.local_blob_id)
    }
    onChange(safeItems.filter((_, j) => j !== idx))
  }, [safeItems, onChange])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">Imagens / evidências ({safeItems.length})</p>
        <Button size="sm" variant="secondary" onClick={addImage} disabled={uploadingIdx !== null}>
          {uploadingIdx !== null ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {uploadingIdx !== null ? 'Enviando...' : 'Capturar imagem'}
        </Button>
      </div>
      {safeItems.length === 0 && (
        <p className="text-sm text-text-muted">Nenhuma evidência registrada. Toque em "Capturar imagem" para fotografar o ambiente.</p>
      )}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2 text-xs text-danger bg-danger/5 rounded-lg">
          <AlertCircle size={14} />
          {errorMessage}
        </div>
      )}
      {safeItems.map((ev, i) => (
        <Card key={i} className="p-3">
          <div className="flex gap-3">
            {ev.preview_url ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-muted">
                <img src={ev.preview_url} alt={ev.legenda ?? ''} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-surface-muted flex items-center justify-center shrink-0">
                <ImageIcon size={20} className="text-text-muted" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{ev.legenda ?? 'Sem legenda'}</p>
              {ev.mime_type && ev.size_bytes && (
                <p className="text-xs text-text-muted">{ev.mime_type} — {formatarTamanhoArquivo(ev.size_bytes)}</p>
              )}
              {(ev.data || ev.hora) && (
                <p className="text-xs text-text-muted">{ev.data ?? ''} {ev.hora ?? ''}</p>
              )}
              {ev.upload_status === 'uploading' && (
                <div className="flex items-center gap-1 mt-1">
                  <Loader2 size={12} className="animate-spin text-primary" />
                  <span className="text-xs text-primary">Enviando...</span>
                </div>
              )}
              {ev.upload_status === 'error' && (
                <p className="text-xs text-danger mt-1">Erro no envio</p>
              )}
              {ev.upload_status === 'uploaded' && (
                <p className="text-xs text-success mt-1">Enviado</p>
              )}
              {ev.upload_status === 'pending' && (
                <p className="text-xs text-warning mt-1">Aguardando sincronização</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {ev.sync_status === 'pending' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/30">
                  pendente
                </span>
              )}
              {ev.sync_status === 'synced' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/10 text-success border border-success/30">
                  sincronizado
                </span>
              )}
              {ev.sync_status === 'error' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/30">
                  erro
                </span>
              )}
              <Button variant="ghost" size="icon" onClick={() => removeImage(i)} className="text-danger" disabled={ev.upload_status === 'uploading'}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function Step05EpisEpcs({ data, onSave, saving, onPrevious }: Step05EpisEpcsProps) {
  const [form, setForm] = useState<EpisEpcsEvidencias>(
    normalizeEpisEpcsEvidencias(data)
  )

  const handleSave = async (next?: number) => {
    await onSave(form, next)
  }

  return (
    <div className="space-y-6">
      <FormSection title="EPIs — Equipamentos de Proteção Individual">
        <EpisSection items={form.epis} onChange={(epis) => setForm((prev) => ({ ...prev, epis }))} />
      </FormSection>

      <FormSection title="EPCs — Equipamentos de Proteção Coletiva">
        <EpcsSection items={form.epcs} onChange={(epcs) => setForm((prev) => ({ ...prev, epcs }))} />
      </FormSection>

      <FormSection title="Imagens e evidências do ambiente">
        <EvidenciasSection items={form.evidencias} onChange={(evidencias) => setForm((prev) => ({ ...prev, evidencias }))} />
      </FormSection>

      <FormSection title="Observações">
        <Textarea value={form.observacoes ?? ''}
          onChange={(e) => setForm((prev) => ({ ...prev, observacoes: e.target.value || null }))}
          rows={3} placeholder="Observações sobre EPIs, EPCs e evidências…"
        />
      </FormSection>

      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onPrevious} disabled={!onPrevious} className="flex-1">
            <ArrowLeft size={16} /> Anterior
          </Button>
          <Button onClick={async () => { await handleSave(6) }} disabled={saving} className="flex-1">
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
