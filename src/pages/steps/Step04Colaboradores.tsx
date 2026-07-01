import { useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ColaboradorForm } from '@/components/forms/ColaboradorForm'
import { Pencil, Trash2, Plus, ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react'
import type { ColaboradorExposto } from '@/types/levantamento'

interface Step04ColaboradoresProps {
  colaboradores: ColaboradorExposto[]
  onSave: (data: ColaboradorExposto[], nextStep?: number) => Promise<boolean>
  saving: boolean
  onPrevious?: () => void
}

export function Step04Colaboradores({ colaboradores, onSave, saving, onPrevious }: Step04ColaboradoresProps) {
  const [items, setItems] = useState<ColaboradorExposto[]>(colaboradores)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ColaboradorExposto | undefined>(undefined)

  const handleSaveItem = async (item: ColaboradorExposto) => {
    const updated = editing
      ? items.map((c) => (c.id === item.id ? item : c))
      : [...items, item]
    setItems(updated)
    setModalOpen(false)
    setEditing(undefined)
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-body-medium text-text-secondary">
          {items.length} colaborador(es) registrado(s)
        </p>
        <Button onClick={() => { setEditing(undefined); setModalOpen(true) }} size="sm" className="min-h-[48px]">
          <Plus size={14} /> Novo colaborador
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={undefined}
          title="Nenhum colaborador"
          description="Registre os colaboradores expostos aos riscos identificados."
          action={{ label: 'Adicionar colaborador', onClick: () => { setEditing(undefined); setModalOpen(true) } }}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} padding={false}>
              <div className="p-4 md:p-5">
                <CardHeader>
                  <div className="min-w-0">
                    <CardTitle>{item.nome ?? 'Sem nome'}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(item); setModalOpen(true) }}
                      aria-label="Editar colaborador" className="min-h-[48px] w-12 h-12">
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}
                      aria-label="Excluir colaborador" className="min-h-[48px] w-12 h-12">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-body-medium">
                  {item.funcao && <div><span className="text-text-muted">Função:</span> {item.funcao}</div>}
                  {item.setor && <div><span className="text-text-muted">Setor:</span> {item.setor}</div>}
                  {item.jornada && <div><span className="text-text-muted">Jornada:</span> {item.jornada}</div>}
                  {item.tempo_exposicao && <div><span className="text-text-muted">Tempo exposição:</span> {item.tempo_exposicao}</div>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(undefined) }}
        title={editing ? 'Editar colaborador' : 'Novo colaborador'} size="lg">
        <ColaboradorForm initial={editing} onSave={handleSaveItem}
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
          <Button onClick={async () => { await onSave(items, 5) }} disabled={saving} className="min-h-[48px]">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}
