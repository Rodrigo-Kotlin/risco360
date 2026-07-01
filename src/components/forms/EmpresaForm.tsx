import { useCallback, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { EmpresaSchema, type EmpresaFormData } from '@/lib/validation/schemas/empresa'
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
  const autoFilledRef = useRef<Set<string>>(new Set())
  const lastCnpjRef = useRef<string>('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(EmpresaSchema),
    defaultValues: {
      razao_social: initialData?.razao_social ?? '',
      nome_fantasia: initialData?.nome_fantasia ?? '',
      cnpj: initialData?.cnpj ?? '',
      cnae: initialData?.cnae ?? '',
      grau_risco: initialData?.grau_risco ?? '',
      endereco: initialData?.endereco ?? '',
      numero: initialData?.numero ?? '',
      bairro: initialData?.bairro ?? '',
      cidade: initialData?.cidade ?? '',
      uf: initialData?.uf ?? '',
      cep: initialData?.cep ?? '',
      responsavel: initialData?.responsavel ?? '',
      telefone: initialData?.telefone ?? '',
      email: initialData?.email ?? '',
      observacoes: initialData?.observacoes ?? '',
      cnae_principal: initialData?.cnae_principal ?? '',
      cnae_principal_descricao: initialData?.cnae_principal_descricao ?? '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const cnpjValue = watch('cnpj')
  const { loading: cnpjLoading, error: cnpjError, empresa: cnpjEmpresa, buscar: buscarCnpj, limpar: limparCnpj } = useCnpjLookup()

  const preencherAutomaticamente = useCallback(() => {
    if (!cnpjEmpresa) return

    const fields: Array<[keyof EmpresaFormData, string]> = [
      ['razao_social', cnpjEmpresa.razao_social],
      ['nome_fantasia', cnpjEmpresa.nome_fantasia ?? ''],
      ['endereco', cnpjEmpresa.endereco ?? ''],
      ['numero', cnpjEmpresa.numero ?? ''],
      ['bairro', cnpjEmpresa.bairro ?? ''],
      ['cidade', cnpjEmpresa.cidade ?? ''],
      ['uf', cnpjEmpresa.uf ?? ''],
      ['cep', cnpjEmpresa.cep ?? ''],
      ['cnae', cnpjEmpresa.cnae_principal ?? ''],
      ['cnae_principal', cnpjEmpresa.cnae_principal ?? ''],
      ['cnae_principal_descricao', cnpjEmpresa.cnae_principal_descricao ?? ''],
    ]

    for (const [key, value] of fields) {
      if (!autoFilledRef.current.has(key)) {
        setValue(key, value)
        autoFilledRef.current.add(key)
      }
    }

    if (cnpjEmpresa.grau_risco_nr4 !== null && !autoFilledRef.current.has('grau_risco')) {
      setValue('grau_risco', String(cnpjEmpresa.grau_risco_nr4))
      autoFilledRef.current.add('grau_risco')
    }
  }, [cnpjEmpresa, setValue])

  useEffect(() => {
    if (cnpjEmpresa) {
      preencherAutomaticamente()
    }
  }, [cnpjEmpresa, preencherAutomaticamente])

  useEffect(() => {
    const limpo = normalizarCnpj(cnpjValue ?? '')

    if (limpo.length === 14 && limpo !== lastCnpjRef.current) {
      lastCnpjRef.current = limpo
      autoFilledRef.current = new Set()
      buscarCnpj(cnpjValue ?? '')
    } else if (limpo.length < 14 && limpo !== lastCnpjRef.current) {
      lastCnpjRef.current = limpo
      limparCnpj()
    }
  }, [cnpjValue, buscarCnpj, limparCnpj])

  const onSubmitForm = async (data: EmpresaFormData) => {
    const payload: EmpresaCreateInput = {
      razao_social: data.razao_social.trim(),
      nome_fantasia: data.nome_fantasia?.trim() || undefined,
      cnpj: data.cnpj?.trim() || undefined,
      cnae: data.cnae?.trim() || undefined,
      grau_risco: data.grau_risco || undefined,
      endereco: data.endereco?.trim() || undefined,
      numero: data.numero?.trim() || undefined,
      bairro: data.bairro?.trim() || undefined,
      cidade: data.cidade?.trim() || undefined,
      uf: data.uf || undefined,
      cep: data.cep?.trim() || undefined,
      responsavel: data.responsavel?.trim() || undefined,
      telefone: data.telefone?.trim() || undefined,
      email: data.email?.trim() || undefined,
      observacoes: data.observacoes?.trim() || undefined,
      cnae_principal: data.cnae_principal?.trim() || undefined,
      cnae_principal_descricao: data.cnae_principal_descricao?.trim() || undefined,
      cnaes_secundarios: cnpjEmpresa?.cnaes_secundarios,
      grau_risco_nr4: cnpjEmpresa?.grau_risco_nr4 ?? null,
    }

    await onSubmit(payload)
  }

  const cnpjRegister = register('cnpj')

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6" noValidate>
      <FormSection title="Dados da empresa" description="Informações cadastrais">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Razão social"
            error={errors.razao_social?.message}
            required
            placeholder="Nome completo da empresa"
            {...register('razao_social')}
          />
          <Input
            label="Nome fantasia"
            placeholder="Nome fantasia"
            {...register('nome_fantasia')}
          />
          <div className="space-y-1">
            <Input
              label="CNPJ"
              placeholder="00.000.000/0001-00"
              icon={cnpjLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {...cnpjRegister}
              onChange={(e) => {
                cnpjRegister.onChange(e)
              }}
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
            placeholder="CNAE principal"
            {...register('cnae')}
          />
          <Select
            label="Grau de risco"
            options={GRAU_RISCO_OPTIONS}
            placeholder="Selecione…"
            error={errors.grau_risco?.message}
            {...register('grau_risco')}
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="contato@empresa.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Telefone"
            placeholder="(00) 00000-0000"
            {...register('telefone')}
          />
          <Input
            label="Responsável"
            placeholder="Nome do contato"
            {...register('responsavel')}
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
            placeholder="Rua, Avenida…"
            {...register('endereco')}
          />
          <Input
            label="Número"
            placeholder="Nº"
            {...register('numero')}
          />
          <Input
            label="Bairro"
            placeholder="Bairro"
            {...register('bairro')}
          />
          <Input
            label="Cidade"
            placeholder="Cidade"
            {...register('cidade')}
          />
          <Select
            label="UF"
            options={UF_OPTIONS}
            placeholder="Selecione…"
            {...register('uf')}
          />
          <Input
            label="CEP"
            placeholder="00.000-000"
            {...register('cep')}
          />
        </div>
      </FormSection>

      <FormSection title="Observações" description="Informações adicionais">
        <Textarea
          placeholder="Observações sobre a empresa…"
          rows={3}
          {...register('observacoes')}
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
