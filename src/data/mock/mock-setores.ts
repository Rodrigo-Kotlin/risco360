import type { Setor } from '@/types/empresa'
import { mockUserId } from './mock-user'
import { mockEmpresaId } from './mock-empresas'

export const mockSetorAdmId = 'mock-setor-adm-001'
export const mockSetorComId = 'mock-setor-com-001'
export const mockSetorFinId = 'mock-setor-fin-001'
export const mockSetorRhId = 'mock-setor-rh-001'

export const mockSetores: Setor[] = [
  {
    id: mockSetorAdmId,
    empresa_id: mockEmpresaId,
    nome: 'Administrativo',
    descricao: 'Setor administrativo e de gestão',
    localizacao: 'Prédio principal, 1° andar',
    responsavel_local: 'Maria Oliveira',
    observacoes: 'Funcionamento 08h-18h',
    user_id: mockUserId,
    created_at: '2026-01-20T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  {
    id: mockSetorComId,
    empresa_id: mockEmpresaId,
    nome: 'Comercial',
    descricao: 'Setor comercial e vendas',
    localizacao: 'Prédio principal, térreo',
    responsavel_local: 'Carlos Santos',
    observacoes: null,
    user_id: mockUserId,
    created_at: '2026-01-20T08:05:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  {
    id: mockSetorFinId,
    empresa_id: mockEmpresaId,
    nome: 'Financeiro',
    descricao: 'Setor financeiro e contábil',
    localizacao: 'Prédio principal, 2° andar',
    responsavel_local: 'Ana Costa',
    observacoes: null,
    user_id: mockUserId,
    created_at: '2026-01-20T08:10:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  {
    id: mockSetorRhId,
    empresa_id: mockEmpresaId,
    nome: 'RH',
    descricao: 'Setor de recursos humanos',
    localizacao: 'Prédio principal, 1° andar',
    responsavel_local: 'Pedro Almeida',
    observacoes: null,
    user_id: mockUserId,
    created_at: '2026-01-20T08:15:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
]
