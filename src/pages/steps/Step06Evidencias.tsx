import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { WizardNavigation } from '@/components/ui/WizardNavigation'
import { Camera, Trash2, ImageIcon, AlertCircle, Loader2, Maximize2, X } from 'lucide-react'
import type { EpisEpcsEvidencias, EvidenciaItem } from '@/types/levantamento'
import { uploadEvidenciaFotografica, revogarPreviewEvidencia, obterPreviewLocal } from '@/services/evidencias.service'
import { removerBlobOffline } from '@/services/offline/offline-evidencia-blobs.service'
import { ensureArray, cn, gerarNomeArquivoEvidencia } from '@/lib/utils'

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
  setorNome?: string | null
  levantamentoId?: string | null
  empresaId?: string | null
  setorId?: string | null
  onSave: (data: EpisEpcsEvidencias, nextStep?: number) => Promise<boolean>
  saving: boolean
  onPrevious?: () => void
}

export function Step06Evidencias({ data, empresaNome: _empresaNome, setorNome, levantamentoId, empresaId, setorId, onSave, saving, onPrevious }: Step06EvidenciasProps) {
  const d = data && typeof data === 'object' ? data : { epis: [], epcs: [], evidencias: [], observacoes: null }
  const initialEvidencias = safeEvidenciaItems((d as EpisEpcsEvidencias).evidencias)
  const [evidencias, setEvidencias] = useState<EvidenciaItem[]>(initialEvidencias)
  const itemsRef = useRef(evidencias)
  useEffect(() => { itemsRef.current = evidencias }, [evidencias])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const isUploading = evidencias.some((ev) => ev.upload_status === 'uploading')

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
      const fileName = gerarNomeArquivoEvidencia({
        setorNome,
        evidenciasExistentes: currentItems,
        extensao: 'jpg',
      })

      const stampedBlob = await aplicarTimestampCanvas(file)
      const stampedFile = new File([stampedBlob], fileName, { type: 'image/jpeg' })
      const localPreview = URL.createObjectURL(stampedFile)

      const idx = currentItems.length

      setEvidencias((prev) => [...prev, {
        legenda: fileName,
        arquivo_nome: fileName,
        observacao: `Arquivo: ${fileName}`,
        data: now.toISOString().slice(0, 10),
        hora: now.toTimeString().slice(0, 5),
        mime_type: 'image/jpeg',
        size_bytes: stampedBlob.size,
        preview_url: localPreview,
        upload_status: 'uploading',
      }])

      setErrorMessage(null)

      const latestItems = itemsRef.current

      if (!levantamentoId) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Step06Evidencias: levantamentoId ausente — evidência órfã evitada')
        }
        setErrorMessage('Não foi possível vincular esta evidência ao levantamento atual. Reabra o levantamento e tente novamente.')
        setEvidencias(latestItems.map((ev, j) =>
          j === idx ? { ...ev, upload_status: 'error' } : ev
        ))
        return
      }

      const result = await uploadEvidenciaFotografica(
        { file: stampedFile, legenda: fileName, origem: 'camera' },
        {
          empresa_id: empresaId ?? undefined,
          setor_id: setorId ?? undefined,
          levantamento_id: levantamentoId,
        }
      )

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
  }, [setorNome, empresaId, levantamentoId, setorId])

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
      <p className="text-body-medium text-text-secondary">{evidencias.length} evidência(s) registrada(s)</p>

      <button
        type="button"
        onClick={addImage}
        disabled={isUploading}
        className={cn(
          'w-full flex flex-col items-center justify-center gap-3',
          'rounded-2xl border-2 border-dashed border-primary-200',
          'bg-primary-50/40 hover:bg-primary-50 active:bg-primary-100',
          'hover:border-primary-300 active:border-primary-400',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70 focus-visible:ring-offset-2',
          'cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          evidencias.length === 0 ? 'py-12 sm:py-16' : 'py-6 sm:py-8'
        )}
        aria-label="Capturar nova evidência fotográfica"
      >
        {isUploading ? (
          <Loader2 size={evidencias.length === 0 ? 44 : 32} className="animate-spin text-primary" aria-hidden="true" />
        ) : (
          <Camera size={evidencias.length === 0 ? 44 : 32} className="text-primary" aria-hidden="true" />
        )}
        <span className="text-title-small font-semibold text-text-primary">
          {isUploading ? 'Enviando...' : 'Capturar imagem'}
        </span>
        {evidencias.length === 0 && (
          <span className="text-body-small text-text-muted text-center max-w-xs">
            Registre uma evidência fotográfica do ponto avaliado
          </span>
        )}
      </button>

      {errorMessage && (
        <div className="flex items-center gap-2 p-2 text-label-medium text-danger bg-danger/5 rounded-lg" role="alert">
          <AlertCircle size={14} />
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {evidencias.map((ev, i) => {
          const nomeArquivo = ev.arquivo_nome ?? ev.legenda
          return (
          <Card key={i} className="p-2 overflow-hidden group">
            <div className="relative">
              {ev.preview_url ? (
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-surface-muted cursor-pointer"
                  onClick={() => setLightboxIdx(i)}>
                  <img src={ev.preview_url} alt={nomeArquivo ?? `Evidência ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize2 size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {nomeArquivo && (
                    <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-label-small px-1.5 py-0.5 rounded font-mono">
                      {nomeArquivo}
                    </span>
                  )}
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
              <p className="text-label-medium font-medium truncate">{nomeArquivo ?? 'Sem legenda'}</p>
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
                  className="text-danger min-h-[48px] w-12 h-12" disabled={ev.upload_status === 'uploading'}
                  aria-label={`Remover evidência ${nomeArquivo ?? i + 1}`}>
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          </Card>
          )
        })}
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
