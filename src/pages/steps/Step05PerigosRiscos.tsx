import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { RiscoForm } from '@/components/forms/RiscoForm'
import { RiscoCard } from '@/components/forms/RiscoCard'
import { Plus, ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react'
import type { RiscoOcupacional } from '@/types/risco'

interface Step05PerigosRiscosProps {
  riscos: RiscoOcupacional[]
  onSave: (data: RiscoOcupacional[], nextStep?: number) => Promise<boolean>
  saving: boolean
  onPrevious?: () => void
}

export function Step05PerigosRiscos({ riscos, onSave, saving, onPrevious }: Step05PerigosRiscosProps) {
  const [items, setItems] = useState<RiscoOcupacional[]>(riscos)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RiscoOcupacional | undefined>(undefined)

  const handleSaveItem = async (item: RiscoOcupacional) => {
    const updated = editing
      ? items.map((r) => (r.id === item.id ? item : r))
      : [...items, item]
    setItems(updated)
    setModalOpen(false)
    setEditing(undefined)
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-body-medium text-text-secondary">
          {items.length} risco(s) identificado(s)
        </p>
        <Button onClick={() => { setEditing(undefined); setModalOpen(true) }} size="sm" className="min-h-[48px]">
          <Plus size={14} /> Novo risco
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={undefined}
          title="Nenhum risco cadastrado"
          description="Identifique os perigos e avalie os riscos ocupacionais presentes no local."
          action={{ label: 'Adicionar risco', onClick: () => { setEditing(undefined); setModalOpen(true) } }}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <RiscoCard
              key={item.id}
              risco={item}
              onEdit={() => { setEditing(item); setModalOpen(true) }}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(undefined) }}
        title={editing ? 'Editar risco' : 'Novo risco'} size="lg">
        <RiscoForm initial={editing} onSave={handleSaveItem}
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
          <Button onClick={async () => { await onSave(items, 6) }} disabled={saving} className="min-h-[48px]">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}
