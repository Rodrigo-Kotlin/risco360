import type { ServiceResult } from '@/types/common'
import type { PaginationParams, PaginatedServiceResult } from '@/types/pagination'
import type {
  Levantamento,
  LevantamentoCreateInput,
  LevantamentoUpdateInput,
  StatusLevantamento,
  TipoLevantamento,
} from '@/types/levantamento'

export interface ILevantamentoService {
  listarLevantamentos(params?: PaginationParams): Promise<PaginatedServiceResult<Levantamento>>
  buscarLevantamentoPorId(id: string): Promise<ServiceResult<Levantamento>>
  criarLevantamento(input: LevantamentoCreateInput): Promise<ServiceResult<Levantamento>>
  atualizarLevantamento(id: string, input: LevantamentoUpdateInput): Promise<ServiceResult<Levantamento>>
  excluirLevantamento(id: string): Promise<ServiceResult<boolean>>
  duplicarLevantamento(id: string): Promise<ServiceResult<Levantamento>>
  atualizarStatusLevantamento(id: string, status: StatusLevantamento): Promise<ServiceResult<Levantamento>>
  atualizarPercentualLevantamento(id: string, percentual: number): Promise<ServiceResult<Levantamento>>
  buscarLevantamentosPorEmpresa(empresaId: string): Promise<ServiceResult<Levantamento[]>>
  buscarLevantamentosPorStatus(status: StatusLevantamento): Promise<ServiceResult<Levantamento[]>>
  buscarLevantamentosPorTipo(tipo: TipoLevantamento): Promise<ServiceResult<Levantamento[]>>
  listarLevantamentosPorSetor(setorId: string): Promise<ServiceResult<Levantamento[]>>
  buscarFormularioSetorialPorSetor(setorId: string): Promise<ServiceResult<Levantamento | null>>
  criarFormularioSetorial(input: LevantamentoCreateInput & { setor_id: string; setor_nome: string }): Promise<ServiceResult<Levantamento>>
  abrirOuCriarFormularioSetorial(input: LevantamentoCreateInput & { setor_id: string; setor_nome: string }): Promise<ServiceResult<Levantamento>>
}
