import { describe, it, expect } from 'vitest'
import {
  normalizarCnpj,
  validarCnpj,
  formatarCnae,
  CnpjError,
  consultarCnpj,
  setCnpjProvider,
} from '../cnpj.service'
import type { CnpjProvider, EmpresaReceita } from '../cnpj.service'

describe('normalizarCnpj', () => {
  it('remove pontuação do CNPJ', () => {
    expect(normalizarCnpj('12.345.678/0001-90')).toBe('12345678000190')
  })

  it('remove apenas dígitos', () => {
    expect(normalizarCnpj('11.222.333/0001-81')).toBe('11222333000181')
  })

  it('mantém CNPJ já limpo', () => {
    expect(normalizarCnpj('12345678000190')).toBe('12345678000190')
  })

  it('trata string vazia', () => {
    expect(normalizarCnpj('')).toBe('')
  })
})

describe('validarCnpj', () => {
  it('aceita CNPJ válido', () => {
    expect(validarCnpj('11.222.333/0001-81')).toBe(true)
  })

  it('aceita CNPJ válido sem pontuação', () => {
    expect(validarCnpj('11222333000181')).toBe(true)
  })

  it('rejeita CNPJ com dígitos inválidos', () => {
    expect(validarCnpj('11.111.111/1111-11')).toBe(false)
  })

  it('rejeita CNPJ com todos dígitos iguais', () => {
    expect(validarCnpj('00.000.000/0000-00')).toBe(false)
  })

  it('rejeita CNPJ muito curto', () => {
    expect(validarCnpj('12.345.678/0001')).toBe(false)
  })

  it('rejeita CNPJ muito longo', () => {
    expect(validarCnpj('12.345.678/0001-90123')).toBe(false)
  })

  it('rejeita CNPJ vazio', () => {
    expect(validarCnpj('')).toBe(false)
  })

  it('rejeita CNPJ com letras', () => {
    expect(validarCnpj('AB.CDE.FGH/IJKL-MN')).toBe(false)
  })

  it('rejeita CNPJ com primeiro dígito verificador errado', () => {
    expect(validarCnpj('12.345.678/0001-80')).toBe(false)
  })

  it('rejeita CNPJ com segundo dígito verificador errado', () => {
    expect(validarCnpj('12.345.678/0001-91')).toBe(false)
  })
})

describe('formatarCnae', () => {
  it('formata número CNAE de 5 dígitos', () => {
    expect(formatarCnae(10112)).toBe('1011-2')
  })

  it('formata número CNAE com zeros à esquerda', () => {
    expect(formatarCnae(1113)).toBe('0111-3')
  })

  it('formata número CNAE 4 dígitos com padding', () => {
    expect(formatarCnae(1234)).toBe('0123-4')
  })

  it('formata zero', () => {
    expect(formatarCnae(0)).toBe('0000-0')
  })
})

describe('CnpjError', () => {
  it('cria erro com código e mensagem', () => {
    const err = new CnpjError('NOT_FOUND', 'CNPJ não encontrado')
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('CnpjError')
    expect(err.code).toBe('NOT_FOUND')
    expect(err.message).toBe('CNPJ não encontrado')
  })

  it('cria erro com código RATE_LIMIT', () => {
    const err = new CnpjError('RATE_LIMIT', 'Limite excedido')
    expect(err.code).toBe('RATE_LIMIT')
  })
})

describe('consultarCnpj com provider mock', () => {
  const mockEmpresa: EmpresaReceita = {
    razao_social: 'Mock LTDA',
    nome_fantasia: 'Mock',
    cnpj: '11222333000181',
    cnae_principal: '1011-2',
    cnae_principal_descricao: 'Frigorífico',
    cnaes_secundarios: [],
    endereco: 'Rua A',
    numero: '100',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01001000',
    telefone: '(11) 999999999',
    email: 'mock@empresa.com',
    situacao_cadastral: 'ATIVA',
  }

  it('retorna dados quando provider retorna sucesso', async () => {
    const mockProvider: CnpjProvider = {
      consultar: async () => mockEmpresa,
    }
    setCnpjProvider(mockProvider)

    const result = await consultarCnpj('11222333000181')
    expect(result).not.toBeNull()
    expect(result!.razao_social).toBe('Mock LTDA')
    expect(result!.telefone).toBe('(11) 999999999')
    expect(result!.email).toBe('mock@empresa.com')
  })

  it('retorna null para CNPJ inválido', async () => {
    const mockProvider: CnpjProvider = {
      consultar: async () => mockEmpresa,
    }
    setCnpjProvider(mockProvider)

    const result = await consultarCnpj('00000000000000')
    expect(result).toBeNull()
  })

  it('retorna null quando provider retorna null', async () => {
    const mockProvider: CnpjProvider = {
      consultar: async () => null,
    }
    setCnpjProvider(mockProvider)

    const result = await consultarCnpj('11222333000181')
    expect(result).toBeNull()
  })
})
