import type { ServiceResult } from '@/types/common'
import type { PaginationParams, PaginatedServiceResult } from '@/types/pagination'
import type { Empresa, EmpresaCreateInput, EmpresaUpdateInput } from '@/types/empresa'

export interface IEmpresaService {
  listarEmpresas(params?: PaginationParams): Promise<PaginatedServiceResult<Empresa>>
  buscarEmpresaPorId(id: string): Promise<ServiceResult<Empresa>>
  criarEmpresa(input: EmpresaCreateInput): Promise<ServiceResult<Empresa>>
  atualizarEmpresa(id: string, input: EmpresaUpdateInput): Promise<ServiceResult<Empresa>>
  excluirEmpresa(id: string): Promise<ServiceResult<boolean>>
  buscarEmpresasPorTermo(termo: string): Promise<ServiceResult<Empresa[]>>
}
