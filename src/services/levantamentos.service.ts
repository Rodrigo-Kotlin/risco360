import { Services } from './service-registry'

export const listarLevantamentos: typeof Services.levantamentos.listarLevantamentos = (...args) =>
  Services.levantamentos.listarLevantamentos(...args)

export const buscarLevantamentoPorId: typeof Services.levantamentos.buscarLevantamentoPorId = (...args) =>
  Services.levantamentos.buscarLevantamentoPorId(...args)

export const criarLevantamento: typeof Services.levantamentos.criarLevantamento = (...args) =>
  Services.levantamentos.criarLevantamento(...args)

export const atualizarLevantamento: typeof Services.levantamentos.atualizarLevantamento = (...args) =>
  Services.levantamentos.atualizarLevantamento(...args)

export const excluirLevantamento: typeof Services.levantamentos.excluirLevantamento = (...args) =>
  Services.levantamentos.excluirLevantamento(...args)

export const duplicarLevantamento: typeof Services.levantamentos.duplicarLevantamento = (...args) =>
  Services.levantamentos.duplicarLevantamento(...args)

export const atualizarStatusLevantamento: typeof Services.levantamentos.atualizarStatusLevantamento = (...args) =>
  Services.levantamentos.atualizarStatusLevantamento(...args)

export const atualizarPercentualLevantamento: typeof Services.levantamentos.atualizarPercentualLevantamento = (...args) =>
  Services.levantamentos.atualizarPercentualLevantamento(...args)

export const buscarLevantamentosPorEmpresa: typeof Services.levantamentos.buscarLevantamentosPorEmpresa = (...args) =>
  Services.levantamentos.buscarLevantamentosPorEmpresa(...args)

export const buscarLevantamentosPorStatus: typeof Services.levantamentos.buscarLevantamentosPorStatus = (...args) =>
  Services.levantamentos.buscarLevantamentosPorStatus(...args)

export const buscarLevantamentosPorTipo: typeof Services.levantamentos.buscarLevantamentosPorTipo = (...args) =>
  Services.levantamentos.buscarLevantamentosPorTipo(...args)

export const listarLevantamentosPorSetor: typeof Services.levantamentos.listarLevantamentosPorSetor = (...args) =>
  Services.levantamentos.listarLevantamentosPorSetor(...args)

export const buscarFormularioSetorialPorSetor: typeof Services.levantamentos.buscarFormularioSetorialPorSetor = (...args) =>
  Services.levantamentos.buscarFormularioSetorialPorSetor(...args)

export const criarFormularioSetorial: typeof Services.levantamentos.criarFormularioSetorial = (...args) =>
  Services.levantamentos.criarFormularioSetorial(...args)

export const abrirOuCriarFormularioSetorial: typeof Services.levantamentos.abrirOuCriarFormularioSetorial = (...args) =>
  Services.levantamentos.abrirOuCriarFormularioSetorial(...args)
