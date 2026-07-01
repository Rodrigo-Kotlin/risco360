import { describe, it, expect } from 'vitest'
import { RiscoSchema } from '../schemas/risco'

describe('RiscoSchema', () => {
  it('aceita dados com agente e categoria válidos', () => {
    const result = RiscoSchema.safeParse({
      categoria: 'fisico',
      agente: 'Ruído',
    })
    expect(result.success).toBe(true)
  })

  it('aceita todas as categorias válidas', () => {
    for (const categoria of ['fisico', 'quimico', 'biologico', 'ergonomico', 'acidente', 'mecanico', 'psicossocial']) {
      const result = RiscoSchema.safeParse({ categoria, agente: 'Teste' })
      expect(result.success).toBe(true)
    }
  })

  it('rejeita categoria inválida', () => {
    const result = RiscoSchema.safeParse({
      categoria: 'invalida',
      agente: 'Ruído',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita agente vazio (trim)', () => {
    const result = RiscoSchema.safeParse({
      categoria: 'fisico',
      agente: '   ',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Agente é obrigatório.')
    }
  })

  it('rejeita agente vazio', () => {
    const result = RiscoSchema.safeParse({
      categoria: 'fisico',
      agente: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Agente é obrigatório.')
    }
  })

  it('rejeita objeto vazio', () => {
    const result = RiscoSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('aceita meios_propagacao como array vazio', () => {
    const result = RiscoSchema.safeParse({
      categoria: 'fisico',
      agente: 'Ruído',
      meios_propagacao: [],
    })
    expect(result.success).toBe(true)
  })

  it('aceita todos os campos opcionais preenchidos', () => {
    const result = RiscoSchema.safeParse({
      categoria: 'fisico',
      agente: 'Ruído',
      codigo: 'R001',
      descricao: 'Descrição',
      fonte_geradora: 'Máquinas',
      meios_propagacao: ['ar', 'sonora'],
      caracterizacao: 'Caract',
      dano_possivel: 'Perda auditiva',
      fonte_avaliacao: 'NR-15',
      probabilidade: '3',
      severidade: '4',
      sugestoes_exposicao: '85 dB(A)',
      meio_propagacao_label: 'Ar',
      sinalizacao: 'Sinal',
      acoes_recomendadas: 'Ação',
      observacoes: 'Obs',
    })
    expect(result.success).toBe(true)
  })
})
