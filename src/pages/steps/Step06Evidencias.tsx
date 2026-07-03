import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { WizardNavigation } from '@/components/ui/WizardNavigation'
import { Plus, Trash2, ImageIcon, AlertCircle, Loader2, Maximize2, X } from 'lucide-react'
import type { EpisEpcsEvidencias, EvidenciaItem } from '@/types/levantamento'
import { uploadEvidenciaFotografica, revogarPreviewEvidencia, obterPreviewLocal } from '@/services/evidencias.service'
import { removerBlobOffline } from '@/services/offline/offline-evidencia-blobs.service'
import { ensureArray } from '@/lib/utils'

function deriveSigla(nome: string | null | undefined): string {
  if (!nome) return 'EMPRESA'
  const cleaned = nome.replace(/[^a-zA-ZÀ-ÿ0-9]/g, '').toUpperCase()
  return cleaned.slice(0, 8) || 'EMPRESA'
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Falha ao carregar imagem')) }
    img.src = url
  })
}

async function aplicarTimestampCanvas(file: File): Promise<Blob> {
  const img = await loadImage(file)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR')
  const timeStr = now.toLocaleTimeString('pt-BR')
  const text = `${dateStr} ${timeStr}`

  const fontSize = Math.max(14, Math.round(canvas.width * 0.018))
  ctx.font = `bold ${fontSize}px Arial, sans-serif`

  const padding = Math.round(fontSize * 0.7)
  const textWidth = ctx.measureText(text).width
  const boxX = canvas.width - textWidth - padding * 2 - padding
  const boxY = canvas.height - fontSize - padding * 2 - padding

  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.beginPath()
  ctx.roundRect(boxX, boxY, textWidth + padding * 2, fontSize + padding * 2, 4)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, boxX + padding, boxY + fontSize / 2 + padding)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.92)
  })
}

function safeEvidenciaItems(items: EvidenciaItem[] | null | undefined): EvidenciaItem[] {
  return ensureArray(items)
}

interface Step06EvidenciasProps {
  data: EpisEpcsEvidencias | null | undefined
  empresaNome?: string | null
  onSave: (data: EpisEpcsEvidencias, nextStep?: number) => Promise<boolean>
  saving: boolean
  onPrevious?: () => void
}

export function Step06Evidencias({ data, empresaNome, onSave, saving, onPrevious }: Step06EvidenciasProps) {
  const d = data && typeof data === 'object' ? data : { epis: [], epcs: [], evidencias: [], observacoes: null }
  const initialEvidencias = safeEvidenciaItems((d as EpisEpcsEvidencias).evidencias)
  const [evidencias, setEvidencias] = useState<EvidenciaItem[]>(initialEvidencias)
  const itemsRef = useRef(evidencias)
  useEffect(() => { itemsRef.current = evidencias }, [evidencias])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const sigla = deriveSigla(empresaNome)

  const buildFileName = useCallback((idx: number, ext: string): string => {
    const seq = String(idx + 1).padStart(4, '0')
    return `${sigla}-${seq}.${ext}`
  }, [sigla])

  const addImage = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp'
    input.capture = 'environment'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const now = new Date()
      const currentItems = itemsRef.current
      const idx = currentItems.length
      const ext = file.name.split('.').pop() ?? 'jpg'
      const fileName = buildFileName(idx, ext)

      const stampedBlob = await aplicarTimestampCanvas(file)
      const stampedFile = new File([stampedBlob], fileName, { type: 'image/jpeg' })
      const localPreview = URL.createObjectURL(stampedFile)

      setEvidencias((prev) => [...prev, {
        legenda: fileName,
        observacao: `Arquivo: ${fileName}`,
        data: now.toISOString().slice(0, 10),
        hora: now.toTimeString().slice(0, 5),
        mime_type: 'image/jpeg',
        size_bytes: stampedBlob.size,
        preview_url: localPreview,
        upload_status: 'uploading',
      }])

      setErrorMessage(null)

      const result = await uploadEvidenciaFotografica({ file: stampedFile, legenda: fileName, origem: 'camera' })

      const latestItems = itemsRef.current

      if (result.error) {
        setErrorMessage(result.error)
        setEvidencias(latestItems.map((ev, j) =>
          j === idx ? { ...ev, upload_status: 'error' } : ev
        ))
        return
      }

      const r = result.data!
      const finalPreviewUrl = r.local_blob_id
        ? (await obterPreviewLocal(r.local_blob_id, null)) ?? r.preview_url
        : r.preview_url

      setEvidencias(latestItems.map((ev, j) =>
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
  }, [buildFileName])

  const removeImage = useCallback((idx: number) => {
    const item = evidencias[idx]
    if (!item) return
    if (item.preview_url && item.preview_url.startsWith('blob:')) {
      revogarPreviewEvidencia(item.preview_url)
    }
    if (item.local_blob_id) {
      removerBlobOffline(item.local_blob_id)
    }
    setEvidencias((prev) => prev.filter((_, j) => j !== idx))
  }, [evidencias])

  const handleSave = async (next?: number) => {
    await onSave({ ...(d as EpisEpcsEvidencias), evidencias }, next)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-body-medium text-text-secondary">{evidencias.length} evidência(s) registrada(s)</p>
          <p className="text-label-medium text-text-muted">As fotos recebem automaticamente data/hora e são nomeadas como {sigla}-0001.jpg</p>
        </div>
        <Button size="sm" variant="secondary" onClick={addImage}
          disabled={evidencias.some((ev) => ev.upload_status === 'uploading')}
          className="min-h-[48px]">
          {evidencias.some((ev) => ev.upload_status === 'uploading')
            ? <Loader2 size={14} className="animate-spin" />
            : <Plus size={14} />}
          {evidencias.some((ev) => ev.upload_status === 'uploading') ? 'Enviando...' : 'Capturar imagem'}
        </Button>
      </div>

      {evidencias.length === 0 && (
        <p className="text-body-medium text-text-muted">Nenhuma evidência registrada. Toque em "Capturar imagem" para fotografar o ambiente.</p>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-2 text-label-medium text-danger bg-danger/5 rounded-lg">
          <AlertCircle size={14} />
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {evidencias.map((ev, i) => (
          <Card key={i} className="p-2 overflow-hidden group">
            <div className="relative">
              {ev.preview_url ? (
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-surface-muted cursor-pointer"
                  onClick={() => setLightboxIdx(i)}>
                  <img src={ev.preview_url} alt={ev.legenda ?? `Evidência ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize2 size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-lg bg-surface-muted flex items-center justify-center">
                  <ImageIcon size={24} className="text-text-muted" />
                </div>
              )}
              {ev.upload_status === 'uploading' && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg">
                  <Loader2 size={20} className="animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="mt-1.5 space-y-1">
              <p className="text-label-medium font-medium truncate">{ev.legenda ?? 'Sem legenda'}</p>
              {(ev.data || ev.hora) && (
                <p className="text-label-medium text-text-muted">
                  {ev.data} {ev.hora}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {ev.upload_status === 'error' && <span className="text-label-medium text-danger">Erro</span>}
                  {ev.upload_status === 'pending' && <span className="text-label-medium text-warning">Pendente</span>}
                  {ev.upload_status === 'uploaded' && <span className="text-label-medium text-success">Enviado</span>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeImage(i)}
                  className="text-danger min-h-[48px] w-12 h-12" disabled={ev.upload_status === 'uploading'}>
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {lightboxIdx !== null && evidencias[lightboxIdx]?.preview_url && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}>
          <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setLightboxIdx(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
              aria-label="Fechar">
              <X size={24} />
            </button>
            <img src={evidencias[lightboxIdx].preview_url!}
              alt={evidencias[lightboxIdx].legenda ?? `Evidência ${lightboxIdx + 1}`}
              className="max-w-full max-h-[85vh] rounded-lg object-contain" />
            {evidencias[lightboxIdx].legenda && (
              <p className="text-white/80 text-body-medium mt-2 text-center">{evidencias[lightboxIdx].legenda}</p>
            )}
          </div>
        </div>
      )}

      <WizardNavigation
        saving={saving}
        onPrevious={onPrevious}
        onNext={async () => { await handleSave(7) }}
        onSave={async () => { await handleSave() }}
      />
    </div>
  )
}
