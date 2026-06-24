import { describe, it, expect } from 'vitest'
import { getProximoStatusLevantamento } from '@/lib/levantamento-status'
import { STATUS_LEVANTAMENTO_VALIDOS } from '@/types/levantamento'
import { getFriendlyDataError } from '@/lib/errors'

describe('getProximoStatusLevantamento', () => {
  it('rascunho avança para em_andamento', () => {
    expect(getProximoStatusLevantamento('rascunho')).toBe('em_andamento')
  })

  it('em_andamento avança para concluido', () => {
    expect(getProximoStatusLevantamento('em_andamento')).toBe('concluido')
  })

  it('concluido retorna null (sem próximo status)', () => {
    expect(getProximoStatusLevantamento('concluido')).toBeNull()
  })

  it('arquivado retorna null (sem próximo status)', () => {
    expect(getProximoStatusLevantamento('arquivado')).toBeNull()
  })
})

describe('STATUS_LEVANTAMENTO_VALIDOS', () => {
  it('contém apenas status permitidos pelo banco', () => {
    expect(STATUS_LEVANTAMENTO_VALIDOS).toEqual([
      'rascunho',
      'em_andamento',
      'concluido',
      'arquivado',
    ])
  })

  it('não contém status obsoletos', () => {
    expect(STATUS_LEVANTAMENTO_VALIDOS).not.toContain('em_campo')
    expect(STATUS_LEVANTAMENTO_VALIDOS).not.toContain('em_revisao')
    expect(STATUS_LEVANTAMENTO_VALIDOS).not.toContain('exportado')
    expect(STATUS_LEVANTAMENTO_VALIDOS).not.toContain('pendente')
    expect(STATUS_LEVANTAMENTO_VALIDOS).not.toContain('finalizado')
    expect(STATUS_LEVANTAMENTO_VALIDOS).not.toContain('cancelado')
  })

  it('não contém variações com acento', () => {
    expect(STATUS_LEVANTAMENTO_VALIDOS).not.toContain('concluído')
    expect(STATUS_LEVANTAMENTO_VALIDOS).not.toContain('em andamento')
  })
})

describe('getFriendlyDataError - erro 23514 de constraint status', () => {
  it('retorna mensagem amigável para erro de constraint de status', () => {
    const error = {
      code: '23514',
      message: 'new row for relation "levantamentos" violates check constraint "chk_levantamentos_status"',
      details: 'Failing row contains...',
    }
    const result = getFriendlyDataError(error)
    expect(result).toBe('Status inválido para o levantamento. Recarregue a página e tente novamente.')
  })

  it('não retorna mensagem de constraint para outros erros', () => {
    const error = {
      code: '42501',
      message: 'permission denied for table levantamentos',
    }
    const result = getFriendlyDataError(error)
    expect(result).not.toBe('Status inválido para o levantamento. Recarregue a página e tente novamente.')
  })

  it('não retorna mensagem de "não encontrado ou sem permissão" para constraint de status', () => {
    const error = {
      code: '23514',
      message: 'new row for relation "levantamentos" violates check constraint "chk_levantamentos_status"',
    }
    const result = getFriendlyDataError(error)
    expect(result).not.toContain('não encontrado')
    expect(result).not.toContain('permissão')
  })
})

describe('atualizarStatusLevantamento - validação de status inválido', () => {
  it('não aceita status inválido e retorna erro amigável', async () => {
    const { atualizarStatusLevantamento } = await import('@/services/levantamentos.service')
    const result = await atualizarStatusLevantamento('any-id', 'em_campo' as never)
    expect(result.error).toBeTruthy()
    expect(result.error).toContain('Status de levantamento inválido')
    expect(result.data).toBeNull()
  })
})
