import { describe, it, expect } from 'vitest'
import { BOTTOM_NAV_ITEMS, DRAWER_NAV_ITEMS, NAV_ITEMS, APP_NAME } from '@/constants/app'

describe('NAV_ITEMS', () => {
  it('contém Empresas', () => {
    expect(NAV_ITEMS.some(i => i.label === 'Empresas')).toBe(true)
  })

  it('contém Setores', () => {
    expect(NAV_ITEMS.some(i => i.label === 'Setores')).toBe(true)
  })

  it('contém Biblioteca Técnica', () => {
    expect(NAV_ITEMS.some(i => i.label === 'Biblioteca Técnica')).toBe(true)
  })

  it('contém Relatórios', () => {
    expect(NAV_ITEMS.some(i => i.label === 'Relatórios')).toBe(true)
  })

  it('contém Configurações', () => {
    expect(NAV_ITEMS.some(i => i.label === 'Configurações')).toBe(true)
  })

  it('contém Dashboard no DRAWER_NAV_ITEMS', () => {
    expect(DRAWER_NAV_ITEMS.some(i => i.label === 'Dashboard')).toBe(true)
  })

  it('BOTTOM_NAV_ITEMS tem 4 itens', () => {
    expect(BOTTOM_NAV_ITEMS.length).toBe(4)
  })

  it('contém Levantamentos no BOTTOM_NAV_ITEMS', () => {
    expect(BOTTOM_NAV_ITEMS.some(i => i.label === 'Levantamentos')).toBe(true)
  })

  it('todos os itens têm label, href e icon', () => {
    for (const item of NAV_ITEMS) {
      expect(item.label).toBeTruthy()
      expect(item.href).toBeTruthy()
      expect(item.icon).toBeTruthy()
    }
  })
})

describe('APP_NAME', () => {
  it('é Risco360', () => {
    expect(APP_NAME).toBe('Risco360')
  })
})
