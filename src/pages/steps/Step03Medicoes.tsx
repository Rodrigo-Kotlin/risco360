import { useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { MedicaoForm } from '@/components/forms/MedicaoForm'
import { Pencil, Trash2, Plus, ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react'
import type { Medicao } from '@/types/levantamento'

interface Step03MedicoesProps {
  medicoes: Medicao[]
  onSave: (data: Medicao[], nextStep?: number) => Promise<boolean>
  saving: boolean
  onPrevious?: () => void
}

export function Step03Medicoes({ medicoes, onSave, saving, onPrevious }: Step03MedicoesProps) {
  const [items, setItems] = useState<Medicao[]>(medicoes)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Medicao | undefined>(undefined)

  const handleSaveItem = async (item: Medicao) => {
    const updated = editing
      ? items.map((m) => (m.id === item.id ? item : m))
      : [...items, item]
    setItems(updated)
    setModalOpen(false)
    setEditing(undefined)
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((m) => m.id !== id))
  }

  const openNew = () => {
    setEditing(undefined)
    setModalOpen(true)
  }

  const openEdit = (item: Medicao) => {
    setEditing(item)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-body-medium text-text-secondary">
            {items.length} medição(ões) registrada(s)
          </p>
        </div>
        <Button onClick={openNew} size="sm" className="min-h-[48px]">
          <Plus size={14} /> Nova medição
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={undefined}
          title="Nenhuma medição"
          description="Adicione medições de agentes ambientais como ruído, vibração, calor, etc."
          action={{ label: 'Adicionar medição', onClick: openNew }}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} padding={false}>
              <div className="p-4 md:p-5">
                <CardHeader>
                  <div className="min-w-0">
                    <CardTitle>{item.tipo} — {item.agente}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}
                      aria-label="Editar medição" className="min-h-[48px] w-12 h-12">
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}
                      aria-label="Excluir medição" className="min-h-[48px] w-12 h-12">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-body-medium">
                  {item.valor != null && (
                    <div>
                      <span className="text-text-muted">Valor:</span>{' '}
                      <span className="text-text-primary">{item.valor} {item.unidade ?? ''}</span>
                    </div>
                  )}
                  {item.limite_tolerancia != null && (
                    <div>
                      <span className="text-text-muted">Limite:</span>{' '}
                      <span className="text-text-primary">{item.limite_tolerancia} {item.unidade ?? ''}</span>
                    </div>
                  )}
                  {item.metodo && (
                    <div>
                      <span className="text-text-muted">Método:</span>{' '}
                      <span className="text-text-primary">{item.metodo}</span>
                    </div>
                  )}
                  {item.local && (
                    <div>
                      <span className="text-text-muted">Local:</span>{' '}
                      <span className="text-text-primary">{item.local}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(undefined) }}
        title={editing ? 'Editar medição' : 'Nova medição'} size="lg">
        <MedicaoForm initial={editing} onSave={handleSaveItem}
          onCancel={() => { setModalOpen(false); setEditing(undefined) }} />
      </Modal>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Button variant="secondary" onClick={onPrevious} disabled={!onPrevious} className="min-h-[48px]">
          <ArrowLeft size={16} /> Anterior
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={async () => { await onSave(items) }} disabled={saving} className="min-h-[48px]">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar
          </Button>
          <Button onClick={async () => { await onSave(items, 4) }} disabled={saving} className="min-h-[48px]">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}
