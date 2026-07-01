import type { ServiceResult } from '@/types/common'
import type {
  BibliotecaTecnicaItem,
  BibliotecaTecnicaCreateInput,
  BibliotecaTecnicaUpdateInput,
} from '@/types/biblioteca'

export interface IBibliotecaTecnicaService {
  listarItensBiblioteca(): Promise<ServiceResult<BibliotecaTecnicaItem[]>>
  buscarItemBibliotecaPorId(id: string): Promise<ServiceResult<BibliotecaTecnicaItem>>
  buscarItensBibliotecaPorCategoria(categoria: string): Promise<ServiceResult<BibliotecaTecnicaItem[]>>
  buscarItensBibliotecaPorTipoRisco(tipoRisco: string): Promise<ServiceResult<BibliotecaTecnicaItem[]>>
  pesquisarBibliotecaTecnica(termo: string): Promise<ServiceResult<BibliotecaTecnicaItem[]>>
  criarItemBiblioteca(input: BibliotecaTecnicaCreateInput): Promise<ServiceResult<BibliotecaTecnicaItem>>
  atualizarItemBiblioteca(id: string, input: BibliotecaTecnicaUpdateInput): Promise<ServiceResult<BibliotecaTecnicaItem>>
  excluirItemBiblioteca(id: string): Promise<ServiceResult<boolean>>
  ativarItemBiblioteca(id: string): Promise<ServiceResult<BibliotecaTecnicaItem>>
  desativarItemBiblioteca(id: string): Promise<ServiceResult<BibliotecaTecnicaItem>>
}
