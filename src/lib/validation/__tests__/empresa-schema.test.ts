import { describe, it, expect } from 'vitest'
import { EmpresaSchema } from '../schemas/empresa'

describe('EmpresaSchema', () => {
  it('aceita dados com apenas razao_social', () => {
    const result = EmpresaSchema.safeParse({ razao_social: 'Empresa Ltda' })
    expect(result.success).toBe(true)
  })

  it('aceita todos os campos opcionais como string vazia', () => {
    const result = EmpresaSchema.safeParse({
      razao_social: 'Empresa Ltda',
      nome_fantasia: '',
      cnpj: '',
      cnae: '',
      grau_risco: '',
      endereco: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: '',
      responsavel: '',
      telefone: '',
      email: '',
      observacoes: '',
      cnae_principal: '',
      cnae_principal_descricao: '',
    })
    expect(result.success).toBe(true)
  })

  it('aceita todos os campos opcionais como undefined', () => {
    const result = EmpresaSchema.safeParse({ razao_social: 'Empresa Ltda' })
    expect(result.success).toBe(true)
  })

  it('rejeita razao_social vazio (trim)', () => {
    const result = EmpresaSchema.safeParse({ razao_social: '   ' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Razão social é obrigatória.')
    }
  })

  it('rejeita razao_social vazio', () => {
    const result = EmpresaSchema.safeParse({ razao_social: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Razão social é obrigatória.')
    }
  })

  it('rejeita objeto vazio', () => {
    const result = EmpresaSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('aceita campos com valores preenchidos', () => {
    const result = EmpresaSchema.safeParse({
      razao_social: 'Empresa Ltda',
      nome_fantasia: 'Fantasia',
      cnpj: '11.222.333/0001-44',
      cnae: '12345',
      grau_risco: '3',
      endereco: 'Rua A',
      numero: '100',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01001-000',
      responsavel: 'João',
      telefone: '(11) 99999-9999',
      email: 'contato@empresa.com',
      observacoes: 'Obs',
      cnae_principal: '12345',
      cnae_principal_descricao: 'Descrição',
    })
    expect(result.success).toBe(true)
  })
})
