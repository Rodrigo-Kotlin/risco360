import { useState, useRef, type FormEvent } from 'react'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { NivelRiscoBadge } from '@/components/forms/NivelRiscoBadge'
import { BibliotecaRiscoSelector } from '@/components/forms/BibliotecaRiscoSelector'
import { calcularNivelRisco } from '@/lib/risk-calculator'
import { generateId } from '@/lib/utils'
import { Save, Loader2, X, Calculator, BookOpen } from 'lucide-react'
import type { RiscoOcupacional, CategoriaRisco, MeioPropagacao } from '@/types/risco'
import type { BibliotecaTecnicaItem } from '@/types/biblioteca'

interface RiscoFormProps {
  initial?: RiscoOcupacional
  onSave: (risco: RiscoOcupacional) => Promise<void>
  onCancel: () => void
  bibliotecaItens?: BibliotecaTecnicaItem[]
}

const CATEGORIA_OPTIONS: { value: CategoriaRisco; label: string }[] = [
  { value: 'fisico', label: 'Físico' },
  { value: 'quimico', label: 'Químico' },
  { value: 'biologico', label: 'Biológico' },
  { value: 'ergonomico', label: 'Ergonômico' },
  { value: 'acidente', label: 'Acidente' },
  { value: 'mecanico', label: 'Mecânico' },
  { value: 'psicossocial', label: 'Psicossocial' },
]

const MEIO_PROPAGACAO_OPTIONS: { value: MeioPropagacao; label: string }[] = [
  { value: 'ar', label: 'Ar' },
  { value: 'caminhar', label: 'Caminhar' },
  { value: 'conducao_conveccao_radiacao', label: 'Condução/Convecção/Radiação' },
  { value: 'contato', label: 'Contato' },
  { value: 'cutanea_dermica', label: 'Cutânea/Dérmica' },
  { value: 'digestiva_oral', label: 'Digestiva/Oral' },
  { value: 'luz', label: 'Luz' },
  { value: 'movimento_acao', label: 'Movimento/Ação' },
  { value: 'nao_aplicavel', label: 'Não aplicável' },
  { value: 'parenteral', label: 'Parenteral' },
  { value: 'percepcao', label: 'Percepção' },
  { value: 'posto_de_trabalho', label: 'Posto de trabalho' },
  { value: 'respiratoria', label: 'Respiratória' },
  { value: 'sobrecarga_biomecanica', label: 'Sobrecarga biomecânica' },
  { value: 'sonora', label: 'Sonora' },
]

const CATEGORIA_MAP: Record<string, CategoriaRisco> = {
  fisico: 'fisico',
  físico: 'fisico',
  quimico: 'quimico',
  químico: 'quimico',
  biologico: 'biologico',
  biológico: 'biologico',
  ergonomico: 'ergonomico',
  ergonômico: 'ergonomico',
  acidente: 'acidente',
  mecanico: 'mecanico',
  mecânico: 'mecanico',
  psicossocial: 'psicossocial',
}

function normalizeCategoria(val: string | null | undefined): CategoriaRisco {
  if (!val) return 'fisico'
  const lower = val.toLowerCase().trim()
  return CATEGORIA_MAP[lower] ?? 'fisico'
}

export function RiscoForm({ initial, onSave, onCancel, bibliotecaItens }: RiscoFormProps) {
  const [codigo, setCodigo] = useState(initial?.codigo ?? '')
  const [categoria, setCategoria] = useState<CategoriaRisco>(initial?.categoria ?? 'fisico')
  const [agente, setAgente] = useState(initial?.agente ?? '')
  const [descricao, setDescricao] = useState(initial?.descricao ?? '')
  const [fonteGeradora, setFonteGeradora] = useState(initial?.fonte_geradora ?? '')
  const [meiosPropagacao, setMeiosPropagacao] = useState<MeioPropagacao[]>(initial?.meios_propagacao ?? [])
  const [caracterizacao, setCaracterizacao] = useState(initial?.caracterizacao ?? '')
  const [danoPossivel, setDanoPossivel] = useState(initial?.dano_possivel ?? '')
  const [fonteAvaliacao, setFonteAvaliacao] = useState(initial?.fonte_avaliacao ?? '')
  const [probabilidade, setProbabilidade] = useState(initial?.probabilidade?.toString() ?? '')
  const [severidade, setSeveridade] = useState(initial?.severidade?.toString() ?? '')
  const [sugestoesExposicao, setSugestoesExposicao] = useState(initial?.sugestoes_exposicao ?? '')
  const [meioPropagacaoLabel, setMeioPropagacaoLabel] = useState(initial?.meio_propagacao_label ?? '')
  const [sinalizacao, setSinalizacao] = useState(initial?.sinalizacao ?? '')
  const [acoesRecomendadas, setAcoesRecomendadas] = useState(initial?.acoes_recomendadas?.join('\n') ?? '')
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? '')
  const bibliotecaItemIdRef = useRef<string | null>(initial?.biblioteca_item_id ?? null)
  const bibliotecaTituloRef = useRef<string | null>(initial?.biblioteca_titulo ?? null)
  const [bibliotecaItemId, setBibliotecaItemId] = useState<string | null>(initial?.biblioteca_item_id ?? null)
  const [bibliotecaTitulo, setBibliotecaTitulo] = useState<string | null>(initial?.biblioteca_titulo ?? null)
  const [medidasControle, setMedidasControle] = useState(initial?.medidas_controle ?? [])
  const [epis, setEpis] = useState(initial?.epis ?? [])
  const [bibliotecaModalOpen, setBibliotecaModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const probNum = parseFloat(probabilidade)
  const sevNum = parseFloat(severidade)
  const nivelCalculado = (!isNaN(probNum) && !isNaN(sevNum)) ? calcularNivelRisco(probNum, sevNum) : undefined

  const toggleMeioPropagacao = (value: MeioPropagacao) => {
    setMeiosPropagacao((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
    )
  }

  const applyBibliotecaItem = (item: BibliotecaTecnicaItem) => {
    setCategoria(normalizeCategoria(item.categoria))
    if (item.perigo && !agente) setAgente(item.perigo)
    if (item.descricao && !descricao) setDescricao(item.descricao)
    if (item.fonte_geradora && !fonteGeradora) setFonteGeradora(item.fonte_geradora)
    if (item.meios_propagacao && item.meios_propagacao.length > 0 && meiosPropagacao.length === 0) {
      const mapped: MeioPropagacao[] = []
      for (const mp of item.meios_propagacao) {
        const mpLower = mp.toLowerCase().replace(/[^a-z0-9_]/g, '_')
        const found = MEIO_PROPAGACAO_OPTIONS.find(
          (opt) => opt.label.toLowerCase().replace(/[^a-z0-9_]/g, '_') === mpLower || opt.value === mpLower
        )
        if (found) mapped.push(found.value)
      }
      if (mapped.length > 0) setMeiosPropagacao(mapped)
    }
    if (item.danos_possiveis && item.danos_possiveis.length > 0 && !danoPossivel) {
      setDanoPossivel(item.danos_possiveis.join(', '))
    }
    if (item.fonte && !fonteAvaliacao) setFonteAvaliacao(item.fonte)
    if (item.sugestao_exposicao && !sugestoesExposicao) setSugestoesExposicao(item.sugestao_exposicao)
    if (item.acoes_recomendadas && item.acoes_recomendadas.length > 0 && !acoesRecomendadas.trim()) {
      setAcoesRecomendadas(item.acoes_recomendadas.join('\n'))
    }
    if (item.medidas_controle && item.medidas_controle.length > 0 && medidasControle.length === 0) {
      setMedidasControle(item.medidas_controle)
    }
    if (item.epis && item.epis.length > 0 && epis.length === 0) {
      setEpis(item.epis)
    }
    bibliotecaItemIdRef.current = item.id
    bibliotecaTituloRef.current = item.titulo
    setBibliotecaItemId(item.id)
    setBibliotecaTitulo(item.titulo)
    setBibliotecaModalOpen(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const prob = probNum
      const sev = sevNum
      await onSave({
        id: initial?.id ?? generateId(),
        codigo: codigo || null,
        categoria,
        agente,
        descricao: descricao || null,
        fonte_geradora: fonteGeradora || null,
        meios_propagacao: meiosPropagacao,
        nivel_risco: (!isNaN(prob) && !isNaN(sev)) ? calcularNivelRisco(prob, sev) : (initial?.nivel_risco ?? 'medio'),
        caracterizacao: caracterizacao || null,
        dano_possivel: danoPossivel || null,
        medidas_controle: medidasControle,
        epis: epis,
        fonte_avaliacao: fonteAvaliacao || null,
        probabilidade: isNaN(prob) ? null : prob,
        severidade: isNaN(sev) ? null : sev,
        sugestoes_exposicao: sugestoesExposicao || null,
        meio_propagacao_label: meioPropagacaoLabel || null,
        sinalizacao: sinalizacao || null,
        acoes_recomendadas: acoesRecomendadas.split('\n').map((s) => s.trim()).filter(Boolean),
        observacoes: observacoes || null,
        biblioteca_item_id: bibliotecaItemIdRef.current,
        biblioteca_titulo: bibliotecaTituloRef.current,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {bibliotecaItens && bibliotecaItens.length > 0 && !initial && (
        <div className="flex items-start gap-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <BookOpen size={16} className="text-primary-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary-800">Preencher da Biblioteca Técnica</p>
            <p className="text-xs text-primary-600 mt-0.5">
              Selecione um item da biblioteca para preencher automaticamente os campos do risco
            </p>
            <Button size="sm" variant="outline" type="button" className="mt-2"
              onClick={() => setBibliotecaModalOpen(true)}>
              <BookOpen size={14} /> Selecionar item
            </Button>
          </div>
        </div>
      )}

      {bibliotecaItemId && bibliotecaTitulo && (
        <div className="flex items-center gap-2 p-2 bg-surface-muted rounded-lg">
          <BookOpen size={14} className="text-primary-600 shrink-0" />
          <p className="text-xs text-text-secondary flex-1">
            Preenchido a partir de: <span className="font-medium text-text-primary">{bibliotecaTitulo}</span>
          </p>
          <button type="button" onClick={() => { bibliotecaItemIdRef.current = null; bibliotecaTituloRef.current = null; setBibliotecaItemId(null); setBibliotecaTitulo(null) }}
            className="text-xs text-red-600 hover:text-red-700">
            Remover vínculo
          </button>
        </div>
      )}

      {bibliotecaModalOpen && bibliotecaItens && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 bg-black/40"
          onClick={() => setBibliotecaModalOpen(false)}>
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-4"
            onClick={(e) => e.stopPropagation()}>
            <BibliotecaRiscoSelector
              items={bibliotecaItens}
              onSelect={applyBibliotecaItem}
              onClose={() => setBibliotecaModalOpen(false)}
            />
          </div>
        </div>
      )}

      <FormSection title={initial ? 'Editar risco' : 'Novo risco'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ex: R001"
          />
          <Select label="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaRisco)}
            options={CATEGORIA_OPTIONS} required
          />
          <Input label="Agente" value={agente} onChange={(e) => setAgente(e.target.value)}
            placeholder="Ex: Ruído" required
          />
          <Input label="Fonte geradora" value={fonteGeradora} onChange={(e) => setFonteGeradora(e.target.value)}
            placeholder="Ex: Prensa hidráulica"
          />
        </div>

        <Textarea label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)}
          rows={2} placeholder="Descrição do risco…"
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-text-primary">Meios de propagação</p>
          <div className="flex flex-wrap gap-2">
            {MEIO_PROPAGACAO_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleMeioPropagacao(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  meiosPropagacao.includes(opt.value)
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'bg-white border-border text-text-secondary hover:border-text-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Caracterização" value={caracterizacao} onChange={(e) => setCaracterizacao(e.target.value)}
            placeholder="Caracterização qualitativa"
          />
          <Input label="Dano possível" value={danoPossivel} onChange={(e) => setDanoPossivel(e.target.value)}
            placeholder="Ex: Perda auditiva"
          />
          <Input label="Fonte da avaliação" value={fonteAvaliacao}
            onChange={(e) => setFonteAvaliacao(e.target.value)}
            placeholder="Ex: NR-15, NHO 01"
          />
          <Input label="Meio de propagação (label)" value={meioPropagacaoLabel}
            onChange={(e) => setMeioPropagacaoLabel(e.target.value)}
            placeholder="Descrição livre"
          />
          <Input label="Sinalização" value={sinalizacao} onChange={(e) => setSinalizacao(e.target.value)}
            placeholder="Ex: Placa de alerta"
          />
          <div className="flex items-end gap-2">
            <Input label="Probabilidade (1-5)" type="number" min={1} max={5}
              value={probabilidade} onChange={(e) => setProbabilidade(e.target.value)}
            />
            <Input label="Severidade (1-5)" type="number" min={1} max={5}
              value={severidade} onChange={(e) => setSeveridade(e.target.value)}
            />
          </div>
        </div>

        {nivelCalculado && (
          <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-lg">
            <Calculator size={16} className="text-text-muted" />
            <span className="text-sm text-text-secondary">Nível de risco calculado:</span>
            <NivelRiscoBadge nivel={nivelCalculado} />
          </div>
        )}

        <Input label="Sugestões de exposição" value={sugestoesExposicao}
          onChange={(e) => setSugestoesExposicao(e.target.value)}
          placeholder="Ex: Limite de tolerância NR-15"
        />

        <Textarea label="Ações recomendadas (uma por linha)" value={acoesRecomendadas}
          onChange={(e) => setAcoesRecomendadas(e.target.value)}
          rows={3} placeholder="Ação 1&#10;Ação 2&#10;Ação 3"
        />

        <Textarea label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
          rows={2} placeholder="Observações…"
        />
      </FormSection>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          <X size={16} /> Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar
        </Button>
      </div>
    </form>
  )
}
