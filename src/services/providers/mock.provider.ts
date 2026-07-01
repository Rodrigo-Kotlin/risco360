import * as mockEmpresas from '../mock-empresas.service'
import * as mockSetores from '../mock-setores.service'
import * as mockLevantamentos from '../mock-levantamentos.service'
import * as mockRelatorios from '../mock-relatorios.service'
import * as mockBiblioteca from '../mock-biblioteca.service'
import { mockProfile } from '@/data/mock/mock-user'
import { salvarEvidenciaOffline, excluirEvidenciaOffline } from '../offline/offline-evidencias.service'
import type { IEmpresaService } from '../contracts/empresa-service'
import type { ISetorService } from '../contracts/setor-service'
import type { ILevantamentoService } from '../contracts/levantamento-service'
import type { IRelatorioService } from '../contracts/relatorio-service'
import type { IBibliotecaTecnicaService } from '../contracts/biblioteca-service'
import type { IProfileService } from '../contracts/profile-service'
import type { ServiceResult } from '@/types/common'
import type { Profile } from '@/types'
import type { UploadEvidenciaResult, UploadEvidenciaInput } from '../evidencias.service'

export const mockEmpresaService: IEmpresaService = {
  listarEmpresas: mockEmpresas.listarEmpresas,
  buscarEmpresaPorId: mockEmpresas.buscarEmpresaPorId,
  criarEmpresa: mockEmpresas.criarEmpresa,
  atualizarEmpresa: mockEmpresas.atualizarEmpresa,
  excluirEmpresa: mockEmpresas.excluirEmpresa,
  buscarEmpresasPorTermo: async (termo) => {
    const result = await mockEmpresas.listarEmpresas()
    const filtered = (result.data ?? []).filter(
      (e) =>
        e.razao_social.toLowerCase().includes(termo.toLowerCase()) ||
        e.nome_fantasia?.toLowerCase().includes(termo.toLowerCase()) ||
        e.cnpj?.includes(termo)
    )
    return { data: filtered, error: null }
  },
}

export const mockSetorService: ISetorService = {
  listarSetores: mockSetores.listarSetores,
  listarSetoresPorEmpresa: mockSetores.listarSetoresPorEmpresa,
  buscarSetorPorId: mockSetores.buscarSetorPorId,
  criarSetor: mockSetores.criarSetor,
  atualizarSetor: mockSetores.atualizarSetor,
  excluirSetor: mockSetores.excluirSetor,
}

export const mockLevantamentoService: ILevantamentoService = {
  listarLevantamentos: mockLevantamentos.listarLevantamentos,
  buscarLevantamentoPorId: mockLevantamentos.buscarLevantamentoPorId,
  criarLevantamento: mockLevantamentos.criarLevantamento,
  atualizarLevantamento: mockLevantamentos.atualizarLevantamento,
  excluirLevantamento: mockLevantamentos.excluirLevantamento,
  duplicarLevantamento: mockLevantamentos.duplicarLevantamento,
  atualizarStatusLevantamento: mockLevantamentos.atualizarStatusLevantamento,
  atualizarPercentualLevantamento: mockLevantamentos.atualizarPercentualLevantamento,
  buscarLevantamentosPorEmpresa: mockLevantamentos.buscarLevantamentosPorEmpresa,
  buscarLevantamentosPorStatus: mockLevantamentos.buscarLevantamentosPorStatus,
  buscarLevantamentosPorTipo: mockLevantamentos.buscarLevantamentosPorTipo as ILevantamentoService['buscarLevantamentosPorTipo'],
  listarLevantamentosPorSetor: mockLevantamentos.listarLevantamentosPorSetor,
  buscarFormularioSetorialPorSetor: mockLevantamentos.buscarFormularioSetorialPorSetor,
  criarFormularioSetorial: mockLevantamentos.criarFormularioSetorial,
  abrirOuCriarFormularioSetorial: mockLevantamentos.abrirOuCriarFormularioSetorial,
}

export const mockRelatorioService: IRelatorioService = {
  listarRelatorios: mockRelatorios.listarRelatorios,
  buscarRelatorioPorId: async (id) => {
    const result = await mockRelatorios.listarRelatorios()
    return { data: (result.data ?? []).find((r) => r.id === id) ?? null, error: null }
  },
  listarRelatoriosPorLevantamento: mockRelatorios.listarRelatoriosPorLevantamento,
  criarRelatorio: mockRelatorios.criarRelatorio,
  atualizarRelatorio: async (id, input) => {
    const result = await mockRelatorios.listarRelatorios()
    const idx = (result.data ?? []).findIndex((r) => r.id === id)
    if (idx === -1) return { data: null, error: 'Relatório não encontrado.' }
    return { data: { ...result.data![idx], ...input, id } as any, error: null }
  },
  excluirRelatorio: mockRelatorios.excluirRelatorio,
  atualizarStatusRelatorio: async (id, status) => {
    const result = await mockRelatorios.listarRelatorios()
    const idx = (result.data ?? []).findIndex((r) => r.id === id)
    if (idx === -1) return { data: null, error: 'Relatório não encontrado.' }
    return { data: { ...result.data![idx], status, id } as any, error: null }
  },
}

export const mockBibliotecaService: IBibliotecaTecnicaService = {
  listarItensBiblioteca: mockBiblioteca.listarBiblioteca,
  buscarItemBibliotecaPorId: mockBiblioteca.buscarBibliotecaItemPorId,
  buscarItensBibliotecaPorCategoria: async (categoria) => {
    const result = await mockBiblioteca.listarBiblioteca()
    return { data: (result.data ?? []).filter((b) => b.categoria === categoria), error: null }
  },
  buscarItensBibliotecaPorTipoRisco: async (tipoRisco) => {
    const result = await mockBiblioteca.listarBiblioteca()
    return { data: (result.data ?? []).filter((b) => b.tipo_risco === tipoRisco), error: null }
  },
  pesquisarBibliotecaTecnica: async (termo) => {
    const result = await mockBiblioteca.listarBiblioteca()
    const filtered = (result.data ?? []).filter(
      (b) =>
        b.titulo.toLowerCase().includes(termo.toLowerCase()) ||
        b.descricao?.toLowerCase().includes(termo.toLowerCase()) ||
        b.perigo?.toLowerCase().includes(termo.toLowerCase()) ||
        b.risco?.toLowerCase().includes(termo.toLowerCase())
    )
    return { data: filtered, error: null }
  },
  criarItemBiblioteca: mockBiblioteca.criarBibliotecaItem,
  atualizarItemBiblioteca: mockBiblioteca.atualizarBibliotecaItem,
  excluirItemBiblioteca: mockBiblioteca.excluirBibliotecaItem,
  ativarItemBiblioteca: async (id) => {
    const item = await mockBiblioteca.buscarBibliotecaItemPorId(id)
    if (item.error || !item.data) return { data: null, error: 'Item não encontrado.' }
    return mockBiblioteca.atualizarBibliotecaItem(id, { ativo: true } as any)
  },
  desativarItemBiblioteca: async (id) => {
    const item = await mockBiblioteca.buscarBibliotecaItemPorId(id)
    if (item.error || !item.data) return { data: null, error: 'Item não encontrado.' }
    return mockBiblioteca.atualizarBibliotecaItem(id, { ativo: false } as any)
  },
}

export const mockProfileService: IProfileService = {
  getCurrentProfile: async () => ({ data: mockProfile, error: null }),
  updateCurrentProfile: async (updates) => {
    const updated = { ...mockProfile, ...updates, updated_at: new Date().toISOString() }
    return { data: updated, error: null }
  },
}

export const mockEvidenciaService = {
  uploadEvidenciaFotografica: async (
    input: UploadEvidenciaInput,
    context?: { empresa_id?: string; setor_id?: string; levantamento_id?: string }
  ): Promise<ServiceResult<UploadEvidenciaResult>> => {
    try {
      const file = input.file
      const now = new Date()
      const base64 = await fileToBase64(file)
      const offlineResult = await salvarEvidenciaOffline({
        levantamento_id: context?.levantamento_id ?? '',
        empresa_id: context?.empresa_id ?? null,
        setor_id: context?.setor_id ?? null,
        caption: input.legenda ?? file.name,
        observacao: input.observacao ?? `Arquivo: ${file.name}`,
        mime_type: file.type,
        size: file.size,
        blob_data: base64,
        captured_date: now.toISOString().slice(0, 10),
        captured_time: now.toTimeString().slice(0, 5),
        file: null,
        arquivo_nome: file.name,
      })
      if (offlineResult.error) return { data: null, error: offlineResult.error }
      const previewUrl = URL.createObjectURL(file)
      return {
        data: {
          localId: offlineResult.data!.id,
          storage_path: null,
          preview_url: previewUrl,
          mime_type: file.type,
          size_bytes: file.size,
          upload_status: 'uploaded',
        },
        error: null,
      }
    } catch {
      return { data: null, error: 'Erro ao salvar evidência offline.' }
    }
  },
  removerEvidencia: async (localId: string): Promise<ServiceResult<boolean>> => {
    return excluirEvidenciaOffline(localId)
  },
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsDataURL(file)
  })
}
