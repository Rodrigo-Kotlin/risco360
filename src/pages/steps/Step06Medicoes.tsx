import { useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PontoMedicaoForm } from '@/components/forms/PontoMedicaoForm'
import { normalizePontosMedicao } from '@/lib/normalizers'
import { Pencil, Trash2, Copy, Plus, ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react'
import type { PontoMedicaoQuantitativa } from '@/types/levantamento'

interface Step06MedicoesProps {
  medicoes: PontoMedicaoQuantitativa[]
  onSave: (data: PontoMedicaoQuantitativa[], nextStep?: number) => Promise<boolean>
  saving: boolean
  onPrevious?: () => void
}

export function Step06Medicoes({ medicoes, onSave, saving, onPrevious }: Step06MedicoesProps) {
  const [items, setItems] = useState<PontoMedicaoQuantitativa[]>(() => normalizePontosMedicao(medicoes))
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PontoMedicaoQuantitativa | undefined>(undefined)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleSaveItem = async (item: PontoMedicaoQuantitativa) => {
    const updated = editing
      ? items.map((m) => (m.id === item.id ? item : m))
      : [...items, item]
    setItems(updated)
    setShowForm(false)
    setEditing(undefined)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(undefined)
  }

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id)
  }

  const confirmDelete = () => {
    if (!confirmDeleteId) return
    setItems((prev) => prev.filter((m) => m.id !== confirmDeleteId))
    setConfirmDeleteId(null)
  }

  const handleDuplicate = (item: PontoMedicaoQuantitativa) => {
    const novo: PontoMedicaoQuantitativa = { ...item, id: crypto.randomUUID() }
    setItems((prev) => [...prev, novo])
  }

  const openNew = () => {
    setEditing(undefined)
    setShowForm(true)
  }

  const openEdit = (item: PontoMedicaoQuantitativa) => {
    setEditing(item)
    setShowForm(true)
  }

  const hasAnyMedicao = (item: PontoMedicaoQuantitativa) =>
    item.ruido_dba != null || item.iluminacao_lux != null ||
    item.temperatura_c != null || item.velocidade_ar_ms != null ||
    item.umidade_percent != null || item.radiacao_usvh != null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">{items.length} ponto(s) de medição registrado(s)</p>
          <p className="text-xs text-text-muted">Registre medições quantitativas por ponto avaliado</p>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus size={14} /> Novo ponto
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={undefined}
          title="Nenhum ponto de medição"
          description="Adicione pontos de medição quantitativas: ruído, iluminação, temperatura, umidade, etc."
          action={{ label: 'Adicionar ponto', onClick: openNew }}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} padding={false}>
              <div className="p-4 md:p-5">
                <CardHeader>
                  <div className="min-w-0">
                    <CardTitle>{item.ponto_local || 'Ponto'}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleDuplicate(item)} aria-label="Duplicar">
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label="Editar">
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} aria-label="Excluir">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardHeader>
                {hasAnyMedicao(item) ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {item.ruido_dba != null && (
                      <div>
                        <span className="text-text-muted">Ruído:</span>{' '}
                        <span className="text-text-primary">{item.ruido_dba} dB(A)</span>
                      </div>
                    )}
                    {item.iluminacao_lux != null && (
                      <div>
                        <span className="text-text-muted">Iluminação:</span>{' '}
                        <span className="text-text-primary">{item.iluminacao_lux} lux</span>
                      </div>
                    )}
                    {item.temperatura_c != null && (
                      <div>
                        <span className="text-text-muted">Temperatura:</span>{' '}
                        <span className="text-text-primary">{item.temperatura_c} °C</span>
                      </div>
                    )}
                    {item.velocidade_ar_ms != null && (
                      <div>
                        <span className="text-text-muted">Velocidade ar:</span>{' '}
                        <span className="text-text-primary">{item.velocidade_ar_ms} m/s</span>
                      </div>
                    )}
                    {item.umidade_percent != null && (
                      <div>
                        <span className="text-text-muted">Umidade:</span>{' '}
                        <span className="text-text-primary">{item.umidade_percent} %</span>
                      </div>
                    )}
                    {item.radiacao_usvh != null && (
                      <div>
                        <span className="text-text-muted">Radiação:</span>{' '}
                        <span className="text-text-primary">{item.radiacao_usvh} µSv/h</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted italic">Não medido</p>
                )}
                {item.observacoes && (
                  <p className="text-sm text-text-secondary mt-2 line-clamp-2">{item.observacoes}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="border border-border rounded-lg p-4 bg-surface-secondary">
          <PontoMedicaoForm initial={editing} onSave={handleSaveItem} onCancel={handleCancel} />
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        title="Excluir ponto de medição"
        description="Tem certeza que deseja excluir este ponto de medição? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
      />

      <div className="flex flex-col gap-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={onPrevious} disabled={!onPrevious}>
            <ArrowLeft size={16} /> Anterior
          </Button>
          <Button onClick={async () => { await onSave(items, 7) }} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Próximo
          </Button>
        </div>
        <Button variant="secondary" onClick={async () => { await onSave(items) }} disabled={saving} className="w-full">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar rascunho
        </Button>
      </div>
    </div>
  )
}
