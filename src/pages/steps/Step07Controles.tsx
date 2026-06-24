import { useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlanoAcaoForm } from '@/components/forms/PlanoAcaoForm'
import { Pencil, Trash2, Plus, ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react'
import type { PlanoAcaoItem, RiscoOcupacional } from '@/types/risco'

interface Step07ControlesProps {
  controles: PlanoAcaoItem[]
  riscos?: RiscoOcupacional[]
  onSave: (data: PlanoAcaoItem[], nextStep?: number) => Promise<boolean>
  saving: boolean
  onPrevious?: () => void
}

const PRIORIDADE_COR: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  baixa: 'default',
  media: 'success',
  alta: 'warning',
  urgente: 'danger',
}

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

export function Step07Controles({ controles, riscos, onSave, saving, onPrevious }: Step07ControlesProps) {
  const [items, setItems] = useState<PlanoAcaoItem[]>(controles)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PlanoAcaoItem | undefined>(undefined)

  const riscoOptions = (riscos ?? []).map((r) => ({
    value: r.id,
    label: `${r.codigo ?? ''} ${r.agente}`.trim(),
  }))

  const handleSaveItem = async (item: PlanoAcaoItem) => {
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
        <p className="text-sm text-text-secondary">
          {items.length} aç(ão/ões) de controle registrada(s)
        </p>
        <Button onClick={() => { setEditing(undefined); setModalOpen(true) }} size="sm">
          <Plus size={14} /> Novo plano de ação
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={undefined}
          title="Nenhum plano de ação"
          description="Defina as ações de controle para eliminar ou reduzir os riscos identificados."
          action={{ label: 'Adicionar ação', onClick: () => { setEditing(undefined); setModalOpen(true) } }}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} padding={false}>
              <div className="p-4 md:p-5">
                <CardHeader>
                  <div className="min-w-0">
                    <CardTitle>{item.descricao}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon"
                      onClick={() => { setEditing(item); setModalOpen(true) }}
                      aria-label="Editar ação">
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}
                      aria-label="Excluir ação">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant={PRIORIDADE_COR[item.prioridade] ?? 'default'}>{item.prioridade}</Badge>
                  <Badge>{STATUS_LABEL[item.status] ?? item.status}</Badge>
                  {item.tipo_controle && <Badge>{item.tipo_controle}</Badge>}
                </div>
                {item.responsavel && (
                  <p className="text-sm text-text-secondary">Responsável: {item.responsavel}</p>
                )}
                {item.prazo && (
                  <p className="text-sm text-text-secondary">Prazo: {item.prazo}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(undefined) }}
        title={editing ? 'Editar ação' : 'Nova ação'} size="lg">
        <PlanoAcaoForm initial={editing} riscoOptions={riscoOptions} onSave={handleSaveItem}
          onCancel={() => { setModalOpen(false); setEditing(undefined) }} />
      </Modal>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Button variant="secondary" onClick={onPrevious} disabled={!onPrevious}>
          <ArrowLeft size={16} /> Anterior
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={async () => { await onSave(items) }} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar
          </Button>
          <Button onClick={async () => { await onSave(items, 8) }} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}