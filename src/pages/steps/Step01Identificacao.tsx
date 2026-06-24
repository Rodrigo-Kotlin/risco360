import { useState } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ArrowRight, Loader2, Save, Building2, FileText, User, Hash, Calendar } from 'lucide-react'
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
  const [dataLevantamento, setDataLevantamento] = useState(levantamento.data_levantamento ?? today)
  const [dataLancamentoSgg, setDataLancamentoSgg] = useState(levantamento.data_lancamento_sgg ?? '')
  const [responsavelLancamento, setResponsavelLancamento] = useState(levantamento.responsavel_lancamento ?? '')
  const [observacoesIniciais, setObservacoesIniciais] = useState(levantamento.observacoes_iniciais ?? '')

  const handleSave = async () => {
    await onSave({
      auditor_tecnico: auditorTecnico || undefined,
      registro_mte: registroMte || undefined,
      data_levantamento: dataLevantamento || undefined,
      data_lancamento_sgg: dataLancamentoSgg || undefined,
      responsavel_lancamento: responsavelLancamento || undefined,
      observacoes_iniciais: observacoesIniciais || undefined,
    }, 2)
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 bg-surface-muted">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-primary-600 shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Empresa / Cliente</p>
              <p className="text-sm font-medium text-text-primary">{levantamento.empresa_nome ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Hash size={20} className="text-primary-600 shrink-0" />
            <div>
              <p className="text-xs text-text-muted">CNPJ</p>
              <p className="text-sm font-medium text-text-primary">{levantamento.cnpj ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-primary-600 shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Setor / Departamento</p>
              <p className="text-sm font-medium text-text-primary">{levantamento.setor_nome ?? levantamento.setor ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-primary-600 shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Data do levantamento</p>
              <p className="text-sm font-medium text-text-primary">{dataLevantamento || today}</p>
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

      <FormSection title="Datas e lançamento">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Data do levantamento" type="date" value={dataLevantamento}
            onChange={(e) => setDataLevantamento(e.target.value)}
          />
          <Input label="Data lançamento SGG" type="date" value={dataLancamentoSgg}
            onChange={(e) => setDataLancamentoSgg(e.target.value)}
          />
          <Input label="Responsável pelo lançamento" value={responsavelLancamento}
            onChange={(e) => setResponsavelLancamento(e.target.value)}
            placeholder="Nome de quem lançou o levantamento"
          />
        </div>
      </FormSection>

      <FormSection title="Observações iniciais">
        <Textarea value={observacoesIniciais}
          onChange={(e) => setObservacoesIniciais(e.target.value)}
          rows={3} placeholder="Observações sobre o início do levantamento…"
        />
      </FormSection>

      <div className="flex flex-col gap-3 pt-2 border-t border-border">
        <div className="flex items-center justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Próximo
          </Button>
        </div>
        <Button variant="secondary" onClick={async () => { await onSave({
          auditor_tecnico: auditorTecnico || undefined,
          registro_mte: registroMte || undefined,
          data_levantamento: dataLevantamento || undefined,
          data_lancamento_sgg: dataLancamentoSgg || undefined,
          responsavel_lancamento: responsavelLancamento || undefined,
          observacoes_iniciais: observacoesIniciais || undefined,
        })}} disabled={saving} className="w-full">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar rascunho
        </Button>
      </div>
    </div>
  )
}