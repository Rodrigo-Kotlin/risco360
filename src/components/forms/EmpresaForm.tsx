import { useState, useCallback, useRef, useEffect, type FormEvent } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Save, Loader2, Search, CheckCircle2, AlertCircle, WifiOff } from 'lucide-react'
import { useCnpjLookup } from '@/hooks/useCnpjLookup'
import { obterDescricaoGrauRisco } from '@/data/cnae-grau-risco'
import { normalizarCnpj } from '@/services/cnpj.service'
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
  const [cnae_principal, setCnaePrincipal] = useState(initialData?.cnae_principal ?? '')
  const [cnae_principal_descricao, setCnaePrincipalDescricao] = useState(initialData?.cnae_principal_descricao ?? '')
  const [grau_risco_nr4, setGrauRiscoNr4] = useState<number | null>(initialData?.grau_risco_nr4 ?? null)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const { loading: cnpjLoading, error: cnpjError, empresa: cnpjEmpresa, buscar: buscarCnpj, limpar: limparCnpj } = useCnpjLookup()
  const autoFilledRef = useRef<Set<string>>(new Set())
  const lastCnpjRef = useRef<string>('')

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!razao_social.trim()) errs.razao_social = 'Razão social é obrigatória'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const preencherAutomaticamente = useCallback(() => {
    if (!cnpjEmpresa) return

    const fields: Array<{ setter: (v: string) => void; value: string; key: string }> = [
      { setter: setRazaoSocial, value: cnpjEmpresa.razao_social, key: 'razao_social' },
      { setter: setNomeFantasia, value: cnpjEmpresa.nome_fantasia, key: 'nome_fantasia' },
      { setter: setEndereco, value: cnpjEmpresa.endereco, key: 'endereco' },
      { setter: setNumero, value: cnpjEmpresa.numero, key: 'numero' },
      { setter: setBairro, value: cnpjEmpresa.bairro, key: 'bairro' },
      { setter: setCidade, value: cnpjEmpresa.cidade, key: 'cidade' },
      { setter: setUf, value: cnpjEmpresa.uf, key: 'uf' },
      { setter: setCep, value: cnpjEmpresa.cep, key: 'cep' },
      { setter: setCnae, value: cnpjEmpresa.cnae_principal, key: 'cnae' },
      { setter: setCnaePrincipal, value: cnpjEmpresa.cnae_principal, key: 'cnae_principal' },
      { setter: setCnaePrincipalDescricao, value: cnpjEmpresa.cnae_principal_descricao, key: 'cnae_principal_descricao' },
    ]

    for (const { setter, value, key } of fields) {
      if (!autoFilledRef.current.has(key)) {
        setter(value)
        autoFilledRef.current.add(key)
      }
    }

    if (cnpjEmpresa.grau_risco_nr4 !== null && !autoFilledRef.current.has('grau_risco')) {
      setGrauRisco(String(cnpjEmpresa.grau_risco_nr4))
      autoFilledRef.current.add('grau_risco')
    }
    if (cnpjEmpresa.grau_risco_nr4 !== null && !autoFilledRef.current.has('grau_risco_nr4')) {
      setGrauRiscoNr4(cnpjEmpresa.grau_risco_nr4)
      autoFilledRef.current.add('grau_risco_nr4')
    }
  }, [cnpjEmpresa])

  useEffect(() => {
    if (cnpjEmpresa) {
      preencherAutomaticamente()
    }
  }, [cnpjEmpresa, preencherAutomaticamente])

  const handleCnpjChange = useCallback((value: string) => {
    setCnpj(value)

    const limpo = normalizarCnpj(value)

    if (limpo.length === 14 && limpo !== lastCnpjRef.current) {
      lastCnpjRef.current = limpo
      autoFilledRef.current = new Set()
      buscarCnpj(value)
    } else if (limpo.length < 14 && limpo !== lastCnpjRef.current) {
      lastCnpjRef.current = limpo
      limparCnpj()
    }
  }, [buscarCnpj, limparCnpj])

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
      cnae_principal: cnae_principal.trim() || undefined,
      cnae_principal_descricao: cnae_principal_descricao.trim() || undefined,
      cnaes_secundarios: cnpjEmpresa?.cnaes_secundarios,
      grau_risco_nr4: grau_risco_nr4,
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
          <div className="space-y-1">
            <Input
              label="CNPJ"
              value={cnpj}
              onChange={(e) => handleCnpjChange(e.target.value)}
              placeholder="00.000.000/0001-00"
              icon={cnpjLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            />
            {cnpjLoading && (
              <p className="text-body-small text-text-muted flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" />
                Consultando CNPJ...
              </p>
            )}
            {cnpjEmpresa && !cnpjLoading && (
              <p className="text-body-small text-green-600 flex items-center gap-1">
                <CheckCircle2 size={12} />
                Empresa localizada
              </p>
            )}
            {cnpjError && !cnpjLoading && (
              <p className="text-body-small text-danger flex items-center gap-1">
                {cnpjError.includes('sem internet') ? <WifiOff size={12} /> : <AlertCircle size={12} />}
                {cnpjError}
              </p>
            )}
          </div>
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

      {cnpjEmpresa && !cnpjLoading && (
        <Card variant="info">
          <CardHeader>
            <CardTitle>Dados da consulta CNPJ</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-body-medium">
            <div className="flex items-center gap-2">
              <span className="text-text-muted">CNAE Principal:</span>
              <span className="font-medium">{cnpjEmpresa.cnae_principal}</span>
            </div>
            <div className="text-text-secondary">{cnpjEmpresa.cnae_principal_descricao}</div>
            {cnpjEmpresa.grau_risco_nr4 !== null && (
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Grau de Risco NR-4:</span>
                <Badge variant={cnpjEmpresa.grau_risco_nr4 >= 3 ? 'riskHigh' : cnpjEmpresa.grau_risco_nr4 === 2 ? 'riskMedium' : 'riskLow'}>
                  {obterDescricaoGrauRisco(cnpjEmpresa.grau_risco_nr4)}
                </Badge>
              </div>
            )}
            {cnpjEmpresa.cnaes_secundarios.length > 0 && (
              <div>
                <span className="text-text-muted">CNAEs Secundários:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {cnpjEmpresa.cnaes_secundarios.slice(0, 5).map((c) => (
                    <Badge key={c.codigo} variant="muted">
                      {c.codigo}
                    </Badge>
                  ))}
                  {cnpjEmpresa.cnaes_secundarios.length > 5 && (
                    <Badge variant="muted">+{cnpjEmpresa.cnaes_secundarios.length - 5}</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

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
