import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Save, Loader2 } from 'lucide-react'

interface PerfilSectionProps {
  nome: string
  telefone: string
  cargo: string
  empresa: string
  userEmail?: string
  profileLoading: boolean
  saving: boolean
  onNomeChange: (v: string) => void
  onTelefoneChange: (v: string) => void
  onCargoChange: (v: string) => void
  onEmpresaChange: (v: string) => void
  onSave: () => void
}

export function PerfilSection({
  nome, telefone, cargo, empresa, userEmail,
  profileLoading, saving,
  onNomeChange, onTelefoneChange, onCargoChange, onEmpresaChange,
  onSave,
}: PerfilSectionProps) {
  return (
    <FormSection
      title="Perfil"
      description="Suas informações pessoais"
      actions={
        <Button size="sm" onClick={onSave} disabled={saving || profileLoading}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Salvar
        </Button>
      }
    >
      {profileLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gray-200 rounded-lg w-full" />
          <div className="h-10 bg-gray-200 rounded-lg w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome completo"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Seu nome"
          />
          <Input
            label="E-mail"
            value={userEmail ?? ''}
            readOnly
            disabled
            hint="Gerenciado pela autenticação"
          />
          <Input
            label="Telefone"
            value={telefone}
            onChange={(e) => onTelefoneChange(e.target.value)}
            placeholder="(00) 00000-0000"
          />
          <Input
            label="Cargo"
            value={cargo}
            onChange={(e) => onCargoChange(e.target.value)}
            placeholder="Seu cargo"
          />
          <Input
            label="Empresa"
            value={empresa}
            onChange={(e) => onEmpresaChange(e.target.value)}
            placeholder="Nome da empresa"
          />
        </div>
      )}
    </FormSection>
  )
}
