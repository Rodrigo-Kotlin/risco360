import { useState } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { WizardNavigation } from '@/components/ui/WizardNavigation'
import { Building2, FileText, User, Hash, Calendar } from 'lucide-react'
import type { Levantamento, LevantamentoCreateInput } from '@/types/levantamento'

interface Step01IdentificacaoProps {
  levantamento: Levantamento
  onSave: (data: Partial<LevantamentoCreateInput>, nextStep?: number) => Promise<boolean>
  saving: boolean
}

export function Step01Identificacao({ levantamento, onSave, saving }: Step01IdentificacaoProps) {
  const today = new Date().toISOString().slice(0, 10)
  const [auditorTecnico, setAuditorTecnico] = useState(levantamento.auditor_tecnico ?? '')
  const [registroMte, setRegistroMte] = useState(levantamento.registro_mte ?? '')
  const [dataLevantamento] = useState(levantamento.data_levantamento ?? today)

  const handleSave = async () => {
    await onSave({
      auditor_tecnico: auditorTecnico || undefined,
      registro_mte: registroMte || undefined,
      data_levantamento: dataLevantamento || undefined,
    }, 2)
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 bg-surface-muted">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-primary-600 shrink-0" />
            <div>
              <p className="text-label-medium text-text-muted">Empresa / Cliente</p>
              <p className="text-label-large text-text-primary">{levantamento.empresa_nome ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Hash size={20} className="text-primary-600 shrink-0" />
            <div>
              <p className="text-label-medium text-text-muted">CNPJ</p>
              <p className="text-label-large text-text-primary">{levantamento.cnpj ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-primary-600 shrink-0" />
            <div>
              <p className="text-label-medium text-text-muted">Setor / Departamento</p>
              <p className="text-label-large text-text-primary">{levantamento.setor_nome ?? levantamento.setor ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-primary-600 shrink-0" />
            <div>
              <p className="text-label-medium text-text-muted">Data do levantamento</p>
              <p className="text-label-large text-text-primary">{dataLevantamento || today}</p>
            </div>
          </div>
        </div>
      </Card>

      <FormSection title="Informações do responsável técnico">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Auditor técnico" value={auditorTecnico}
            onChange={(e) => setAuditorTecnico(e.target.value)}
            placeholder="Nome do auditor responsável"
            icon={<User size={16} />}
          />
          <Input label="Registro MTE" value={registroMte}
            onChange={(e) => setRegistroMte(e.target.value)}
            placeholder="Registro no Ministério do Trabalho"
            icon={<FileText size={16} />}
          />
        </div>
      </FormSection>

      <WizardNavigation
        saving={saving}
        isFirst
        onNext={handleSave}
        onSave={async () => {
          await onSave({
            auditor_tecnico: auditorTecnico || undefined,
            registro_mte: registroMte || undefined,
            data_levantamento: dataLevantamento || undefined,
          })
        }}
      />
    </div>
  )
}