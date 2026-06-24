import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/Card'
import { FormSection } from '@/components/ui/FormSection'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { NivelRiscoBadge } from '@/components/forms/NivelRiscoBadge'
import { AssinaturaForm } from '@/components/forms/AssinaturaForm'
import { CheckCircle2, ArrowLeft, Loader2, ClipboardCheck, UserCheck, Building2, FileText } from 'lucide-react'
import type { Levantamento, ParecerTecnico, Assinatura } from '@/types/levantamento'

interface Step08RevisaoConclusaoProps {
  levantamento: Levantamento
  percentual: number
  onSaveParecer: (data: ParecerTecnico, nextStep?: number) => Promise<boolean>
  onSaveAssinaturas: (data: { assinatura_tecnico?: Assinatura; assinatura_empresa?: Assinatura }, nextStep?: number) => Promise<boolean>
  onConcluir: () => Promise<void>
  saving: boolean
  onPrevious?: () => void
}

const STEP_LABELS = [
  'Identificação da empresa e setor',
  'Características físicas do local',
  'Iluminação, ventilação e conforto',
  'Segurança, GES, mobiliários, máquinas e equipamentos',
  'EPIs, EPCs e evidências',
  'Medições quantitativas pontuais',
  'Perigos, riscos, medidas de controle e AEP',
  'Revisão e conclusão do setor',
]

export function Step08RevisaoConclusao({
  levantamento, percentual, onSaveParecer, onSaveAssinaturas, onConcluir, saving, onPrevious,
}: Step08RevisaoConclusaoProps) {
  const [conclusao, setConclusao] = useState(levantamento.parecer?.conclusao ?? '')
  const [recomendacoes, setRecomendacoes] = useState(levantamento.parecer?.recomendacoes ?? '')
  const [restricoes, setRestricoes] = useState(levantamento.parecer?.restricoes ?? '')
  const [dataParecer, setDataParecer] = useState(levantamento.parecer?.data ?? new Date().toISOString().slice(0, 10))
  const [assinaturaTecnico, setAssinaturaTecnico] = useState<Assinatura>(
    levantamento.assinatura_tecnico ?? { nome: null, cargo: null, registro_profissional: null, data: null }
  )
  const [assinaturaEmpresa, setAssinaturaEmpresa] = useState<Assinatura>(
    levantamento.assinatura_empresa ?? { nome: null, cargo: null, registro_profissional: null, data: null }
  )
  const [modalTecnicoOpen, setModalTecnicoOpen] = useState(false)
  const [modalEmpresaOpen, setModalEmpresaOpen] = useState(false)
  const [concluding, setConcluding] = useState(false)

  const itemsChecados = [
    { label: STEP_LABELS[0], check: !!(levantamento.empresa_nome && levantamento.setor_nome && levantamento.data_levantamento) },
    { label: STEP_LABELS[1], check: Object.values(levantamento.caracteristicas_fisicas ?? {}).some((v) => v != null && v !== '') },
    { label: STEP_LABELS[2], check: Object.values(levantamento.iluminacao_ventilacao_conforto ?? {}).some((v) => v != null && v !== '') },
    { label: STEP_LABELS[3], check: !!(levantamento.seguranca_equipamentos?.sistema_incendio_emergencia || (levantamento.seguranca_equipamentos?.mobiliarios ?? []).length > 0) },
    { label: STEP_LABELS[4], check: (levantamento.epis_epcs_evidencias?.epis ?? []).length > 0 },
    { label: STEP_LABELS[5], check: (levantamento.medicoes ?? []).length > 0 },
    { label: STEP_LABELS[6], check: (levantamento.riscos ?? []).length > 0 },
    { label: STEP_LABELS[7], check: !!(conclusao || assinaturaTecnico.nome) },
  ]

  const totalRiscos = (levantamento.riscos ?? []).length
  const criticos = (levantamento.riscos ?? []).filter((r) => r.nivel_risco === 'critico').length
  const altos = (levantamento.riscos ?? []).filter((r) => r.nivel_risco === 'alto').length
  const totalMedicoes = (levantamento.medicoes ?? []).length
  const totalAcoes = (levantamento.controles ?? []).length

  const handleSaveTecnico = async (data: Assinatura) => {
    setAssinaturaTecnico(data); setModalTecnicoOpen(false)
    await onSaveAssinaturas({ assinatura_tecnico: data })
  }

  const handleSaveEmpresa = async (data: Assinatura) => {
    setAssinaturaEmpresa(data); setModalEmpresaOpen(false)
    await onSaveAssinaturas({ assinatura_empresa: data })
  }

  const handleSaveParecer = async () => {
    await onSaveParecer({
      conclusao: conclusao || null, recomendacoes: recomendacoes || null,
      restricoes: restricoes || null, data: dataParecer || null,
    })
  }

  const handleConcluir = async () => {
    setConcluding(true)
    try {
      await handleSaveParecer()
      await onSaveAssinaturas({ assinatura_tecnico: assinaturaTecnico, assinatura_empresa: assinaturaEmpresa })
      await onConcluir()
    } finally {
      setConcluding(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardTitle className="mb-4">Resumo do levantamento — {levantamento.setor_nome ?? 'Setor'}</CardTitle>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-primary">Progresso geral</span>
              <span className="text-sm font-medium">{percentual}%</span>
            </div>
            <ProgressBar value={percentual} variant={percentual === 100 ? 'success' : 'default'} showLabel />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-surface-muted rounded-lg text-center">
              <p className="text-2xl font-bold text-text-primary">{totalRiscos}</p>
              <p className="text-xs text-text-muted">Riscos totais</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-danger">{criticos}</p>
              <p className="text-xs text-danger">Críticos</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-orange-700">{altos}</p>
              <p className="text-xs text-orange-700">Altos</p>
            </div>
            <div className="p-3 bg-surface-muted rounded-lg text-center">
              <p className="text-2xl font-bold text-text-primary">{totalMedicoes}</p>
              <p className="text-xs text-text-muted">Medições</p>
            </div>
          </div>

          <div className="text-sm text-text-secondary flex gap-4">
            <span className="flex items-center gap-1"><FileText size={14} /> {totalAcoes} aç(ão/ões)</span>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <CardTitle className="mb-4">Etapas concluídas</CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {itemsChecados.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-sm">
              {s.check ? (
                <CheckCircle2 size={16} className="text-success shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />
              )}
              <span className={s.check ? 'text-text-primary' : 'text-text-muted'}>{s.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {levantamento.riscos && levantamento.riscos.length > 0 && (
        <Card className="p-5">
          <CardTitle className="mb-4">Riscos identificados</CardTitle>
          <div className="space-y-2">
            {levantamento.riscos.slice(0, 10).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span className="text-text-primary truncate">{r.agente}</span>
                <NivelRiscoBadge nivel={r.nivel_risco} />
              </div>
            ))}
            {levantamento.riscos.length > 10 && (
              <p className="text-xs text-text-muted">+ {levantamento.riscos.length - 10} riscos ocultos</p>
            )}
          </div>
        </Card>
      )}

      <FormSection title="Parecer Técnico" description="Conclusão e recomendações">
        <div className="space-y-4">
          <Textarea label="Conclusão técnica" value={conclusao}
            onChange={(e) => setConclusao(e.target.value)}
            rows={4} placeholder="Descreva a conclusão técnica do levantamento…" />
          <Textarea label="Recomendações finais" value={recomendacoes}
            onChange={(e) => setRecomendacoes(e.target.value)}
            rows={4} placeholder="Recomendações para mitigação dos riscos…" />
          <Textarea label="Restrições" value={restricoes}
            onChange={(e) => setRestricoes(e.target.value)}
            rows={3} placeholder="Restrições ou limitações do levantamento…" />
          <Input label="Data de conclusão" type="date" value={dataParecer}
            onChange={(e) => setDataParecer(e.target.value)} />
        </div>
      </FormSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-text-muted" />
              <CardTitle>Responsável técnico</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setModalTecnicoOpen(true)}>
              {assinaturaTecnico.nome ? 'Editar' : 'Adicionar'}
            </Button>
          </div>
          {assinaturaTecnico.nome ? (
            <div className="text-sm space-y-1">
              <p><span className="text-text-muted">Nome:</span> {assinaturaTecnico.nome}</p>
              {assinaturaTecnico.cargo && <p><span className="text-text-muted">Cargo:</span> {assinaturaTecnico.cargo}</p>}
              {assinaturaTecnico.registro_profissional && <p><span className="text-text-muted">Registro:</span> {assinaturaTecnico.registro_profissional}</p>}
            </div>
          ) : (
            <p className="text-sm text-text-muted">Nenhum responsável registrado</p>
          )}
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-text-muted" />
              <CardTitle>Responsável da empresa</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setModalEmpresaOpen(true)}>
              {assinaturaEmpresa.nome ? 'Editar' : 'Adicionar'}
            </Button>
          </div>
          {assinaturaEmpresa.nome ? (
            <div className="text-sm space-y-1">
              <p><span className="text-text-muted">Nome:</span> {assinaturaEmpresa.nome}</p>
              {assinaturaEmpresa.cargo && <p><span className="text-text-muted">Cargo:</span> {assinaturaEmpresa.cargo}</p>}
              {assinaturaEmpresa.registro_profissional && <p><span className="text-text-muted">Registro:</span> {assinaturaEmpresa.registro_profissional}</p>}
            </div>
          ) : (
            <p className="text-sm text-text-muted">Nenhum responsável registrado</p>
          )}
        </Card>
      </div>

      <Modal open={modalTecnicoOpen} onClose={() => setModalTecnicoOpen(false)}
        title="Responsável técnico" size="md">
        <AssinaturaForm title="Técnico responsável" initial={assinaturaTecnico}
          onSave={handleSaveTecnico} onCancel={() => setModalTecnicoOpen(false)} />
      </Modal>
      <Modal open={modalEmpresaOpen} onClose={() => setModalEmpresaOpen(false)}
        title="Responsável da empresa" size="md">
        <AssinaturaForm title="Responsável da empresa" initial={assinaturaEmpresa}
          onSave={handleSaveEmpresa} onCancel={() => setModalEmpresaOpen(false)} />
      </Modal>

      <div className="flex flex-col gap-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" onClick={onPrevious} disabled={!onPrevious}>
            <ArrowLeft size={16} /> Anterior
          </Button>
          <Button onClick={handleConcluir} disabled={saving || concluding} variant="success">
            {saving || concluding ? <Loader2 size={16} className="animate-spin" /> : <ClipboardCheck size={16} />}
            Concluir levantamento
          </Button>
        </div>
        <Button variant="secondary" onClick={handleSaveParecer} disabled={saving} className="w-full">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <ClipboardCheck size={16} />}
          Salvar rascunho
        </Button>
      </div>
    </div>
  )
}