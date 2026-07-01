import { Badge } from '@/components/ui/Badge'
import { NIVEL_RISCO_LABEL } from '@/lib/risk-calculator'
import type { NivelRisco } from '@/types/risco'

const nivelMap: Record<NivelRisco, 'riskLow' | 'riskMedium' | 'riskHigh' | 'riskCritical' | 'default'> = {
  irrelevante: 'default',
  baixo: 'riskLow',
  medio: 'riskMedium',
  alto: 'riskHigh',
  critico: 'riskCritical',
}

export function NivelRiscoBadge({ nivel }: { nivel: NivelRisco }) {
  return <Badge variant={nivelMap[nivel]} className="min-h-[48px]">{NIVEL_RISCO_LABEL[nivel]}</Badge>
}
