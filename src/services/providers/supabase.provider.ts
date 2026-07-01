import * as empresasService from '../real-empresas.service'
import * as setoresService from '../real-setores.service'
import * as levantamentosService from '../real-levantamentos.service'
import * as relatoriosService from '../real-relatorios.service'
import * as bibliotecaService from '../real-biblioteca-tecnica.service'
import * as profileService from '../real-profile.service'
import * as evidenciasService from '../real-evidencias.service'
import type { IEmpresaService } from '../contracts/empresa-service'
import type { ISetorService } from '../contracts/setor-service'
import type { ILevantamentoService } from '../contracts/levantamento-service'
import type { IRelatorioService } from '../contracts/relatorio-service'
import type { IBibliotecaTecnicaService } from '../contracts/biblioteca-service'
import type { IProfileService } from '../contracts/profile-service'

export const supabaseEmpresaService: IEmpresaService = {
  listarEmpresas: empresasService.listarEmpresas,
  buscarEmpresaPorId: empresasService.buscarEmpresaPorId,
  criarEmpresa: empresasService.criarEmpresa,
  atualizarEmpresa: empresasService.atualizarEmpresa,
  excluirEmpresa: empresasService.excluirEmpresa,
  buscarEmpresasPorTermo: empresasService.buscarEmpresasPorTermo,
}

export const supabaseSetorService: ISetorService = {
  listarSetores: setoresService.listarSetores,
  listarSetoresPorEmpresa: setoresService.listarSetoresPorEmpresa,
  buscarSetorPorId: setoresService.buscarSetorPorId,
  criarSetor: setoresService.criarSetor,
  atualizarSetor: setoresService.atualizarSetor,
  excluirSetor: setoresService.excluirSetor,
}

export const supabaseLevantamentoService: ILevantamentoService = {
  listarLevantamentos: levantamentosService.listarLevantamentos,
  buscarLevantamentoPorId: levantamentosService.buscarLevantamentoPorId,
  criarLevantamento: levantamentosService.criarLevantamento,
  atualizarLevantamento: levantamentosService.atualizarLevantamento,
  excluirLevantamento: levantamentosService.excluirLevantamento,
  duplicarLevantamento: levantamentosService.duplicarLevantamento,
  atualizarStatusLevantamento: levantamentosService.atualizarStatusLevantamento,
  atualizarPercentualLevantamento: levantamentosService.atualizarPercentualLevantamento,
  buscarLevantamentosPorEmpresa: levantamentosService.buscarLevantamentosPorEmpresa,
  buscarLevantamentosPorStatus: levantamentosService.buscarLevantamentosPorStatus,
  buscarLevantamentosPorTipo: levantamentosService.buscarLevantamentosPorTipo,
  listarLevantamentosPorSetor: levantamentosService.listarLevantamentosPorSetor,
  buscarFormularioSetorialPorSetor: levantamentosService.buscarFormularioSetorialPorSetor,
  criarFormularioSetorial: levantamentosService.criarFormularioSetorial,
  abrirOuCriarFormularioSetorial: levantamentosService.abrirOuCriarFormularioSetorial,
}

export const supabaseRelatorioService: IRelatorioService = {
  listarRelatorios: relatoriosService.listarRelatorios,
  buscarRelatorioPorId: relatoriosService.buscarRelatorioPorId,
  listarRelatoriosPorLevantamento: relatoriosService.listarRelatoriosPorLevantamento,
  criarRelatorio: relatoriosService.criarRelatorio,
  atualizarRelatorio: relatoriosService.atualizarRelatorio,
  excluirRelatorio: relatoriosService.excluirRelatorio,
  atualizarStatusRelatorio: relatoriosService.atualizarStatusRelatorio,
}

export const supabaseBibliotecaService: IBibliotecaTecnicaService = {
  listarItensBiblioteca: bibliotecaService.listarItensBiblioteca,
  buscarItemBibliotecaPorId: bibliotecaService.buscarItemBibliotecaPorId,
  buscarItensBibliotecaPorCategoria: bibliotecaService.buscarItensBibliotecaPorCategoria,
  buscarItensBibliotecaPorTipoRisco: bibliotecaService.buscarItensBibliotecaPorTipoRisco,
  pesquisarBibliotecaTecnica: bibliotecaService.pesquisarBibliotecaTecnica,
  criarItemBiblioteca: bibliotecaService.criarItemBiblioteca,
  atualizarItemBiblioteca: bibliotecaService.atualizarItemBiblioteca,
  excluirItemBiblioteca: bibliotecaService.excluirItemBiblioteca,
  ativarItemBiblioteca: bibliotecaService.ativarItemBiblioteca,
  desativarItemBiblioteca: bibliotecaService.desativarItemBiblioteca,
}

export const supabaseProfileService: IProfileService = {
  getCurrentProfile: profileService.getCurrentProfile,
  updateCurrentProfile: profileService.updateCurrentProfile,
}

export const supabaseEvidenciaService = {
  uploadEvidenciaFotografica: evidenciasService.uploadEvidenciaFotografica,
  removerEvidencia: evidenciasService.removerEvidencia,
}
