import { describe, it, expect } from 'vitest'
import { normalizarCnpj, validarCnpj } from '../cnpj.service'

describe('cnpj.service', () => {
  describe('normalizarCnpj', () => {
    it('remove pontuação do CNPJ', () => {
      expect(normalizarCnpj('12.345.678/0001-90')).toBe('12345678000190')
    })

    it('remove apenas dígitos', () => {
      expect(normalizarCnpj('11.222.333/0001-81')).toBe('11222333000181')
    })

    it('mantém CNPJ já limpo', () => {
      expect(normalizarCnpj('12345678000190')).toBe('12345678000190')
    })

    it('trata string vazia', () => {
      expect(normalizarCnpj('')).toBe('')
    })
  })

  describe('validarCnpj', () => {
    it('aceita CNPJ válido', () => {
      expect(validarCnpj('11.222.333/0001-81')).toBe(true)
    })

    it('aceita CNPJ válido sem pontuação', () => {
      expect(validarCnpj('11222333000181')).toBe(true)
    })

    it('rejeita CNPJ com dígitos inválidos', () => {
      expect(validarCnpj('11.111.111/1111-11')).toBe(false)
    })

    it('rejeita CNPJ com todos dígitos iguais', () => {
      expect(validarCnpj('00.000.000/0000-00')).toBe(false)
    })

    it('rejeita CNPJ muito curto', () => {
      expect(validarCnpj('12.345.678/0001')).toBe(false)
    })

    it('rejeita CNPJ muito longo', () => {
      expect(validarCnpj('12.345.678/0001-90123')).toBe(false)
    })

    it('rejeita CNPJ vazio', () => {
      expect(validarCnpj('')).toBe(false)
    })

    it('rejeita CNPJ com letras', () => {
      expect(validarCnpj('AB.CDE.FGH/IJKL-MN')).toBe(false)
    })

    it('rejeita CNPJ com primeiro dígito verificador errado', () => {
      expect(validarCnpj('12.345.678/0001-80')).toBe(false)
    })

    it('rejeita CNPJ com segundo dígito verificador errado', () => {
      expect(validarCnpj('12.345.678/0001-91')).toBe(false)
    })
  })
})
