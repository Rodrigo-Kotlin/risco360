import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getCachedCnpj,
  setCachedCnpj,
  clearCnpjCache,
  closeCnpjCacheDB,
} from '../cnpj-cache'
import type { EmpresaReceita } from '@/services/cnpj.service'

const mockEmpresa: EmpresaReceita = {
  razao_social: 'Empresa Teste LTDA',
  nome_fantasia: 'Teste',
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
  email: 'teste@empresa.com',
  situacao_cadastral: 'ATIVA',
}

describe('cnpj-cache', () => {
  beforeEach(async () => {
    await clearCnpjCache()
  })

  afterEach(async () => {
    await closeCnpjCacheDB()
  })

  it('retorna null para CNPJ não cacheado', async () => {
    const result = await getCachedCnpj('11222333000181')
    expect(result).toBeNull()
  })

  it('armazena e recupera dados do cache', async () => {
    await setCachedCnpj('11222333000181', mockEmpresa)
    const result = await getCachedCnpj('11222333000181')
    expect(result).not.toBeNull()
    expect(result!.razao_social).toBe('Empresa Teste LTDA')
  })

  it('normaliza CNPJ com pontuação na busca', async () => {
    await setCachedCnpj('11222333000181', mockEmpresa)
    const result = await getCachedCnpj('11.222.333/0001-81')
    expect(result).not.toBeNull()
  })

  it('normaliza CNPJ com pontuação ao armazenar', async () => {
    await setCachedCnpj('11.222.333/0001-81', mockEmpresa)
    const result = await getCachedCnpj('11222333000181')
    expect(result).not.toBeNull()
  })

  it('retorna null após limpar cache', async () => {
    await setCachedCnpj('11222333000181', mockEmpresa)
    await clearCnpjCache()
    const result = await getCachedCnpj('11222333000181')
    expect(result).toBeNull()
  })
})
