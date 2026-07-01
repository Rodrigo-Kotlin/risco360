import type { ServiceResult } from '@/types/common'
import type { PaginationParams, PaginatedServiceResult } from '@/types/pagination'
import type { Setor, SetorCreateInput, SetorUpdateInput } from '@/types/empresa'

export interface ISetorService {
  listarSetores(params?: PaginationParams): Promise<PaginatedServiceResult<Setor>>
  listarSetoresPorEmpresa(empresaId: string): Promise<ServiceResult<Setor[]>>
  buscarSetorPorId(id: string): Promise<ServiceResult<Setor>>
  criarSetor(input: SetorCreateInput): Promise<ServiceResult<Setor>>
  atualizarSetor(id: string, input: SetorUpdateInput): Promise<ServiceResult<Setor>>
  excluirSetor(id: string): Promise<ServiceResult<boolean>>
}
