export function cn(...classes: (string | boolean | undefined | null | 0 | 0n)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-').map(Number)
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
  }
  return new Date(date).toLocaleDateString('pt-BR')
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-').map(Number)
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
  }
  return new Date(date).toLocaleString('pt-BR')
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function ensureArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : []
}

export function removerAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function gerarPrefixoSetor(setorNome: string | null | undefined): string {
  if (!setorNome || typeof setorNome !== 'string') return 'SET'
  const semAcentos = removerAcentos(setorNome)
  const apenasLetras = semAcentos.replace(/[^a-zA-Z]/g, '')
  const maiusculas = apenasLetras.toUpperCase()
  if (maiusculas.length === 0) return 'SET'
  return maiusculas.slice(0, 3).padEnd(3, 'X')
}

export function gerarNomeArquivoEvidencia(params: {
  setorNome: string | null | undefined
  evidenciasExistentes: Array<{ arquivo_nome?: string | null; legenda?: string | null }>
  extensao: string
}): string {
  const prefixo = gerarPrefixoSetor(params.setorNome)
  const ext = params.extensao.replace(/^\./, '').toLowerCase()
  const extensoesValidas = ['jpg', 'jpeg', 'png', 'webp']
  const extFinal = extensoesValidas.includes(ext) ? ext : 'jpg'

  let maxNum = 0
  const regex = new RegExp(`^${prefixo}-(\\d{4})\\.\\w+$`)

  for (const ev of params.evidenciasExistentes) {
    const nome = ev.arquivo_nome ?? ev.legenda
    if (!nome) continue
    const match = nome.match(regex)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxNum) maxNum = num
    }
  }

  const proximo = maxNum + 1
  const seq = String(proximo).padStart(4, '0')
  return `${prefixo}-${seq}.${extFinal}`
}

export interface ItemQuantificadoOutput {
  id: string
  nome: string
  quantidade: number | null
  observacao: string | null
}

export function normalizeItensQuantificados(value: unknown): ItemQuantificadoOutput[] {
  if (!Array.isArray(value)) return []
  if (value.length === 0) return []

  const first = value[0]
  if (typeof first === 'string') {
    return value.map((nome) => ({
      id: generateId(),
      nome: String(nome),
      quantidade: null,
      observacao: null,
    }))
  }

  if (typeof first === 'object' && first !== null) {
    return value.map((item: Record<string, unknown>) => ({
      id: String(item.id ?? generateId()),
      nome: String(item.nome ?? item.titulo ?? item.label ?? ''),
      quantidade: item.quantidade != null ? Number(item.quantidade) : null,
      observacao: item.observacao != null ? String(item.observacao) : null,
    }))
  }

  return []
}

export function formatItemQuantificado(item: ItemQuantificadoOutput): string {
  const base = item.nome
  if (item.quantidade != null && item.quantidade > 0) {
    return `${base} — ${item.quantidade} un.`
  }
  return base
}

export function formatItemInventarioAmbiente(item: ItemQuantificadoOutput & { tipo?: string }): string {
  const base = item.nome
  if (item.quantidade != null && item.quantidade > 0) {
    return `${base} — ${item.quantidade} un.`
  }
  return base
}
