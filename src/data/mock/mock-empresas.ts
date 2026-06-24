import type { Empresa } from '@/types/empresa'
import { mockUserId } from './mock-user'

export const mockEmpresaId = 'mock-empresa-001'

export const mockEmpresas: Empresa[] = [
  {
    id: mockEmpresaId,
    razao_social: 'Empresa Modelo Risco360 LTDA',
    nome_fantasia: 'Empresa Modelo Risco360',
    cnpj: '12.345.678/0001-90',
    cnae: '71.12-0-00',
    grau_risco: '2',
    endereco: 'Avenida Tapajós, nº 1000',
    numero: '1000',
    bairro: 'Centro',
    cidade: 'Santarém',
    uf: 'PA',
    cep: '68040-000',
    responsavel: 'João Pereira da Silva',
    telefone: '(93) 99999-0000',
    email: 'contato@empresamodelo.local',
    observacoes: 'Empresa modelo Risco360 para testes de desenvolvimento.',
    user_id: mockUserId,
    created_at: '2026-01-15T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
]
