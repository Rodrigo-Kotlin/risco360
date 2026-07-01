import type { ServiceResult } from '@/types/common'
import type { PaginationParams, PaginatedServiceResult } from '@/types/pagination'
import type {
  Relatorio,
  RelatorioCreateInput,
  RelatorioUpdateInput,
  StatusRelatorio,
} from '@/types/relatorio'

export interface IRelatorioService {
  listarRelatorios(params?: PaginationParams): Promise<PaginatedServiceResult<Relatorio>>
  buscarRelatorioPorId(id: string): Promise<ServiceResult<Relatorio>>
  listarRelatoriosPorLevantamento(levantamentoId: string): Promise<ServiceResult<Relatorio[]>>
  criarRelatorio(input: RelatorioCreateInput): Promise<ServiceResult<Relatorio>>
  atualizarRelatorio(id: string, input: RelatorioUpdateInput): Promise<ServiceResult<Relatorio>>
  excluirRelatorio(id: string): Promise<ServiceResult<boolean>>
  atualizarStatusRelatorio(id: string, status: StatusRelatorio): Promise<ServiceResult<Relatorio>>
}
