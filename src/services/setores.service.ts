import { Services } from './service-registry'

export const listarSetores: typeof Services.setores.listarSetores = (...args) =>
  Services.setores.listarSetores(...args)

export const listarSetoresPorEmpresa: typeof Services.setores.listarSetoresPorEmpresa = (...args) =>
  Services.setores.listarSetoresPorEmpresa(...args)

export const buscarSetorPorId: typeof Services.setores.buscarSetorPorId = (...args) =>
  Services.setores.buscarSetorPorId(...args)

export const criarSetor: typeof Services.setores.criarSetor = (...args) =>
  Services.setores.criarSetor(...args)

export const atualizarSetor: typeof Services.setores.atualizarSetor = (...args) =>
  Services.setores.atualizarSetor(...args)

export const excluirSetor: typeof Services.setores.excluirSetor = (...args) =>
  Services.setores.excluirSetor(...args)
