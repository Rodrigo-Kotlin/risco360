import { Services } from './service-registry'

export const listarItensBiblioteca: typeof Services.biblioteca.listarItensBiblioteca = (...args) =>
  Services.biblioteca.listarItensBiblioteca(...args)

export const buscarItemBibliotecaPorId: typeof Services.biblioteca.buscarItemBibliotecaPorId = (...args) =>
  Services.biblioteca.buscarItemBibliotecaPorId(...args)

export const buscarItensBibliotecaPorCategoria: typeof Services.biblioteca.buscarItensBibliotecaPorCategoria = (...args) =>
  Services.biblioteca.buscarItensBibliotecaPorCategoria(...args)

export const buscarItensBibliotecaPorTipoRisco: typeof Services.biblioteca.buscarItensBibliotecaPorTipoRisco = (...args) =>
  Services.biblioteca.buscarItensBibliotecaPorTipoRisco(...args)

export const pesquisarBibliotecaTecnica: typeof Services.biblioteca.pesquisarBibliotecaTecnica = (...args) =>
  Services.biblioteca.pesquisarBibliotecaTecnica(...args)

export const criarItemBiblioteca: typeof Services.biblioteca.criarItemBiblioteca = (...args) =>
  Services.biblioteca.criarItemBiblioteca(...args)

export const atualizarItemBiblioteca: typeof Services.biblioteca.atualizarItemBiblioteca = (...args) =>
  Services.biblioteca.atualizarItemBiblioteca(...args)

export const excluirItemBiblioteca: typeof Services.biblioteca.excluirItemBiblioteca = (...args) =>
  Services.biblioteca.excluirItemBiblioteca(...args)

export const ativarItemBiblioteca: typeof Services.biblioteca.ativarItemBiblioteca = (...args) =>
  Services.biblioteca.ativarItemBiblioteca(...args)

export const desativarItemBiblioteca: typeof Services.biblioteca.desativarItemBiblioteca = (...args) =>
  Services.biblioteca.desativarItemBiblioteca(...args)
