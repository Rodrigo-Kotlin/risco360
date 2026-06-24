import { useState, type FormEvent } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Save, Loader2 } from 'lucide-react'
import type { Empresa, EmpresaCreateInput, EmpresaUpdateInput } from '@/types/empresa'

const UF_OPTIONS = [
  { value: 'AC', label: 'AC' }, { value: 'AL', label: 'AL' }, { value: 'AP', label: 'AP' },
  { value: 'AM', label: 'AM' }, { value: 'BA', label: 'BA' }, { value: 'CE', label: 'CE' },
  { value: 'DF', label: 'DF' }, { value: 'ES', label: 'ES' }, { value: 'GO', label: 'GO' },
  { value: 'MA', label: 'MA' }, { value: 'MT', label: 'MT' }, { value: 'MS', label: 'MS' },
  { value: 'MG', label: 'MG' }, { value: 'PA', label: 'PA' }, { value: 'PB', label: 'PB' },
  { value: 'PR', label: 'PR' }, { value: 'PE', label: 'PE' }, { value: 'PI', label: 'PI' },
  { value: 'RJ', label: 'RJ' }, { value: 'RN', label: 'RN' }, { value: 'RS', label: 'RS' },
  { value: 'RO', label: 'RO' }, { value: 'RR', label: 'RR' }, { value: 'SC', label: 'SC' },
  { value: 'SP', label: 'SP' }, { value: 'SE', label: 'SE' }, { value: 'TO', label: 'TO' },
]

const GRAU_RISCO_OPTIONS = [
  { value: '1', label: 'Grau 1 - Baixo' },
  { value: '2', label: 'Grau 2 - Médio' },
  { value: '3', label: 'Grau 3 - Alto' },
  { value: '4', label: 'Grau 4 - Muito Alto' },
]

interface EmpresaFormProps {
  initialData?: Empresa
  onSubmit: (data: EmpresaCreateInput | EmpresaUpdateInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function EmpresaForm({ initialData, onSubmit, onCancel, loading }: EmpresaFormProps) {
  const isEditing = !!initialData

  const [razao_social, setRazaoSocial] = useState(initialData?.razao_social ?? '')
  const [nome_fantasia, setNomeFantasia] = useState(initialData?.nome_fantasia ?? '')
  const [cnpj, setCnpj] = useState(initialData?.cnpj ?? '')
  const [cnae, setCnae] = useState(initialData?.cnae ?? '')
  const [grau_risco, setGrauRisco] = useState(initialData?.grau_risco ?? '')
  const [endereco, setEndereco] = useState(initialData?.endereco ?? '')
  const [numero, setNumero] = useState(initialData?.numero ?? '')
  const [bairro, setBairro] = useState(initialData?.bairro ?? '')
  const [cidade, setCidade] = useState(initialData?.cidade ?? '')
  const [uf, setUf] = useState(initialData?.uf ?? '')
  const [cep, setCep] = useState(initialData?.cep ?? '')
  const [responsavel, setResponsavel] = useState(initialData?.responsavel ?? '')
  const [telefone, setTelefone] = useState(initialData?.telefone ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [observacoes, setObservacoes] = useState(initialData?.observacoes ?? '')

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!razao_social.trim()) errs.razao_social = 'Razão social é obrigatória'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const data: EmpresaCreateInput = {
      razao_social: razao_social.trim(),
      nome_fantasia: nome_fantasia.trim() || undefined,
      cnpj: cnpj.trim() || undefined,
      cnae: cnae.trim() || undefined,
      grau_risco: grau_risco || undefined,
      endereco: endereco.trim() || undefined,
      numero: numero.trim() || undefined,
      bairro: bairro.trim() || undefined,
      cidade: cidade.trim() || undefined,
      uf: uf || undefined,
      cep: cep.trim() || undefined,
      responsavel: responsavel.trim() || undefined,
      telefone: telefone.trim() || undefined,
      email: email.trim() || undefined,
      observacoes: observacoes.trim() || undefined,
    }

    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Dados da empresa" description="Informações cadastrais">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Razão social"
            value={razao_social}
            onChange={(e) => setRazaoSocial(e.target.value)}
            error={errors.razao_social}
            required
            placeholder="Nome completo da empresa"
          />
          <Input
            label="Nome fantasia"
            value={nome_fantasia}
            onChange={(e) => setNomeFantasia(e.target.value)}
            placeholder="Nome fantasia"
          />
          <Input
            label="CNPJ"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="00.000.000/0001-00"
          />
          <Input
            label="CNAE"
            value={cnae}
            onChange={(e) => setCnae(e.target.value)}
            placeholder="CNAE principal"
          />
          <Select
            label="Grau de risco"
            value={grau_risco}
            onChange={(e) => setGrauRisco(e.target.value)}
            options={GRAU_RISCO_OPTIONS}
            placeholder="Selecione…"
          />
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contato@empresa.com"
          />
          <Input
            label="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
          />
          <Input
            label="Responsável"
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            placeholder="Nome do contato"
          />
        </div>
      </FormSection>

      <FormSection title="Endereço" description="Informações de localização">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Logradouro"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Rua, Avenida…"
          />
          <Input
            label="Número"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="Nº"
          />
          <Input
            label="Bairro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            placeholder="Bairro"
          />
          <Input
            label="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Cidade"
          />
          <Select
            label="UF"
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            options={UF_OPTIONS}
            placeholder="Selecione…"
          />
          <Input
            label="CEP"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            placeholder="00.000-000"
          />
        </div>
      </FormSection>

      <FormSection title="Observações" description="Informações adicionais">
        <Textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Observações sobre a empresa…"
          rows={3}
        />
      </FormSection>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isEditing ? 'Salvar alterações' : 'Cadastrar empresa'}
        </Button>
      </div>
    </form>
  )
}
