import { Services } from './service-registry'

export const listarEmpresas: typeof Services.empresas.listarEmpresas = (...args) =>
  Services.empresas.listarEmpresas(...args)

export const buscarEmpresaPorId: typeof Services.empresas.buscarEmpresaPorId = (...args) =>
  Services.empresas.buscarEmpresaPorId(...args)

export const criarEmpresa: typeof Services.empresas.criarEmpresa = (...args) =>
  Services.empresas.criarEmpresa(...args)

export const atualizarEmpresa: typeof Services.empresas.atualizarEmpresa = (...args) =>
  Services.empresas.atualizarEmpresa(...args)

export const excluirEmpresa: typeof Services.empresas.excluirEmpresa = (...args) =>
  Services.empresas.excluirEmpresa(...args)

export const buscarEmpresasPorTermo: typeof Services.empresas.buscarEmpresasPorTermo = (...args) =>
  Services.empresas.buscarEmpresasPorTermo(...args)
