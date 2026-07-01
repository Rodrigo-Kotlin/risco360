import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { NivelRiscoBadge } from '@/components/forms/NivelRiscoBadge'
import { Pencil, Trash2, AlertTriangle } from 'lucide-react'
import type { RiscoOcupacional } from '@/types/risco'

interface RiscoCardProps {
  risco: RiscoOcupacional
  onEdit: () => void
  onDelete: () => void
}

const CATEGORIA_LABEL: Record<string, string> = {
  fisico: 'Físico',
  quimico: 'Químico',
  biologico: 'Biológico',
  ergonomico: 'Ergonômico',
  acidente: 'Acidente',
  mecanico: 'Mecânico',
  psicossocial: 'Psicossocial',
}

export function RiscoCard({ risco, onEdit, onDelete }: RiscoCardProps) {
  return (
    <Card padding={false}>
      <div className="p-4 md:p-5">
        <CardHeader>
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle size={16} className="shrink-0 text-text-muted" />
            <CardTitle className="truncate">{risco.agente}</CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar risco" className="w-12 h-12">
              <Pencil size={14} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Excluir risco" className="w-12 h-12">
              <Trash2 size={14} />
            </Button>
          </div>
        </CardHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">{CATEGORIA_LABEL[risco.categoria] ?? risco.categoria}</Badge>
            <NivelRiscoBadge nivel={risco.nivel_risco} />
          </div>

          {risco.descricao && (
            <p className="text-body-medium text-text-secondary">{risco.descricao}</p>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-body-medium">
            {risco.fonte_geradora && (
              <>
                <span className="text-text-muted">Fonte geradora:</span>
                <span className="text-text-primary">{risco.fonte_geradora}</span>
              </>
            )}
            {risco.meios_propagacao && risco.meios_propagacao.length > 0 && (
              <>
                <span className="text-text-muted">Meio de propagação:</span>
                <span className="text-text-primary">{risco.meios_propagacao.join(', ')}</span>
              </>
            )}
            {risco.dano_possivel && (
              <>
                <span className="text-text-muted">Dano possível:</span>
                <span className="text-text-primary">{risco.dano_possivel}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
