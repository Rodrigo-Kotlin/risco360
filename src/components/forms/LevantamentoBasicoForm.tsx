import { useState, type FormEvent } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Save, Loader2 } from 'lucide-react'
import type { LevantamentoCreateInput, TipoLevantamento } from '@/types/levantamento'

const TIPO_OPTIONS: { value: TipoLevantamento; label: string }[] = [
  { value: 'LPR_AEP', label: 'LPR + AEP - Levantamento Setorial Integrado' },
]

interface LevantamentoBasicoFormProps {
  initialData?: Partial<LevantamentoCreateInput>
  empresas: { value: string; label: string }[]
  onSubmit: (data: LevantamentoCreateInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function LevantamentoBasicoForm({ initialData, empresas, onSubmit, onCancel, loading }: LevantamentoBasicoFormProps) {
  const [tipo, setTipo] = useState<TipoLevantamento>(initialData?.tipo ?? 'LPR_AEP')
  const [empresa_id, setEmpresaId] = useState(initialData?.empresa_id ?? '')
  const [empresa_nome, setEmpresaNome] = useState(initialData?.empresa_nome ?? '')
  const [cnpj, setCnpj] = useState(initialData?.cnpj ?? '')
  const [unidade, setUnidade] = useState(initialData?.unidade ?? '')
  const [setor, setSetor] = useState(initialData?.setor ?? '')
  const [responsavel_empresa, setResponsavelEmpresa] = useState(initialData?.responsavel_empresa ?? '')
  const [auditor_tecnico, setAuditorTecnico] = useState(initialData?.auditor_tecnico ?? '')
  const [registro_mte, setRegistroMte] = useState(initialData?.registro_mte ?? '')
  const [data_levantamento, setDataLevantamento] = useState(initialData?.data_levantamento ?? '')
  const [data_lancamento_sgg, setDataLancamentoSgg] = useState(initialData?.data_lancamento_sgg ?? '')
  const [responsavel_lancamento, setResponsavelLancamento] = useState(initialData?.responsavel_lancamento ?? '')
  const [observacoes, setObservacoes] = useState(initialData?.observacoes ?? '')

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!tipo) errs.tipo = 'Tipo é obrigatório'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const data: LevantamentoCreateInput = {
      tipo,
      empresa_id: empresa_id || undefined,
      empresa_nome: empresa_nome.trim() || undefined,
      cnpj: cnpj.trim() || undefined,
      unidade: unidade.trim() || undefined,
      setor: setor.trim() || undefined,
      responsavel_empresa: responsavel_empresa.trim() || undefined,
      auditor_tecnico: auditor_tecnico.trim() || undefined,
      registro_mte: registro_mte.trim() || undefined,
      data_levantamento: data_levantamento || undefined,
      data_lancamento_sgg: data_lancamento_sgg || undefined,
      responsavel_lancamento: responsavel_lancamento.trim() || undefined,
      observacoes: observacoes.trim() || undefined,
    }

    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Informações básicas" description="Dados gerais do levantamento">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tipo de levantamento"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoLevantamento)}
            options={TIPO_OPTIONS}
            placeholder="Selecione o tipo…"
            error={errors.tipo}
            required
          />
          <Select
            label="Empresa"
            value={empresa_id}
            onChange={(e) => setEmpresaId(e.target.value)}
            options={empresas}
            placeholder="Selecione uma empresa…"
          />
          <Input
            label="Nome da empresa"
            value={empresa_nome}
            onChange={(e) => setEmpresaNome(e.target.value)}
            placeholder="Nome da empresa (livre)"
          />
          <Input
            label="CNPJ"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="00.000.000/0001-00"
          />
          <Input
            label="Unidade"
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
            placeholder="Filial / departamento"
          />
          <Input
            label="Setor"
            value={setor}
            onChange={(e) => setSetor(e.target.value)}
            placeholder="Setor avaliado"
          />
          <Input
            label="Responsável da empresa"
            value={responsavel_empresa}
            onChange={(e) => setResponsavelEmpresa(e.target.value)}
            placeholder="Nome do responsável"
          />
          <Input
            label="Auditor técnico"
            value={auditor_tecnico}
            onChange={(e) => setAuditorTecnico(e.target.value)}
            placeholder="Nome do auditor"
          />
          <Input
            label="Registro MTE"
            value={registro_mte}
            onChange={(e) => setRegistroMte(e.target.value)}
            placeholder="Registro no Ministério do Trabalho"
          />
          <Input
            label="Data do levantamento"
            type="date"
            value={data_levantamento}
            onChange={(e) => setDataLevantamento(e.target.value)}
          />
          <Input
            label="Data de lançamento SGG"
            type="date"
            value={data_lancamento_sgg}
            onChange={(e) => setDataLancamentoSgg(e.target.value)}
          />
          <Input
            label="Responsável pelo lançamento"
            value={responsavel_lancamento}
            onChange={(e) => setResponsavelLancamento(e.target.value)}
            placeholder="Nome de quem lançou"
          />
        </div>
      </FormSection>

      <FormSection title="Observações">
        <Textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Observações adicionais…"
          rows={3}
        />
      </FormSection>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {initialData ? 'Salvar alterações' : 'Criar formulário setorial'}
        </Button>
      </div>
    </form>
  )
}
