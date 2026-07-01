import { Services } from './service-registry'

export const listarRelatorios: typeof Services.relatorios.listarRelatorios = (...args) =>
  Services.relatorios.listarRelatorios(...args)

export const buscarRelatorioPorId: typeof Services.relatorios.buscarRelatorioPorId = (...args) =>
  Services.relatorios.buscarRelatorioPorId(...args)

export const listarRelatoriosPorLevantamento: typeof Services.relatorios.listarRelatoriosPorLevantamento = (...args) =>
  Services.relatorios.listarRelatoriosPorLevantamento(...args)

export const criarRelatorio: typeof Services.relatorios.criarRelatorio = (...args) =>
  Services.relatorios.criarRelatorio(...args)

export const atualizarRelatorio: typeof Services.relatorios.atualizarRelatorio = (...args) =>
  Services.relatorios.atualizarRelatorio(...args)

export const excluirRelatorio: typeof Services.relatorios.excluirRelatorio = (...args) =>
  Services.relatorios.excluirRelatorio(...args)

export const atualizarStatusRelatorio: typeof Services.relatorios.atualizarStatusRelatorio = (...args) =>
  Services.relatorios.atualizarStatusRelatorio(...args)
