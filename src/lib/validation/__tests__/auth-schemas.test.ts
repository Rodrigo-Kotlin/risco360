import { describe, it, expect } from 'vitest'
import { LoginSchema, RegisterSchema, ResetPasswordSchema } from '../schemas/auth'

describe('LoginSchema', () => {
  it('aceita email e senha válidos', () => {
    const result = LoginSchema.safeParse({ email: 'teste@email.com', password: '123456' })
    expect(result.success).toBe(true)
  })

  it('rejeita email vazio', () => {
    const result = LoginSchema.safeParse({ email: '', password: '123456' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('E-mail é obrigatório')
    }
  })

  it('rejeita email inválido', () => {
    const result = LoginSchema.safeParse({ email: 'invalido', password: '123456' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('E-mail inválido')
    }
  })

  it('rejeita senha vazia', () => {
    const result = LoginSchema.safeParse({ email: 'teste@email.com', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Senha é obrigatória')
    }
  })
})

describe('RegisterSchema', () => {
  it('aceita dados válidos', () => {
    const result = RegisterSchema.safeParse({
      nome: 'João',
      email: 'joao@email.com',
      password: '123456',
      confirmPassword: '123456',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = RegisterSchema.safeParse({
      nome: '  ',
      email: 'joao@email.com',
      password: '123456',
      confirmPassword: '123456',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Nome é obrigatório')
    }
  })

  it('rejeita senha com menos de 6 caracteres', () => {
    const result = RegisterSchema.safeParse({
      nome: 'João',
      email: 'joao@email.com',
      password: '12345',
      confirmPassword: '12345',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message.includes('6 caracteres'))).toBe(true)
    }
  })

  it('rejeita senhas diferentes', () => {
    const result = RegisterSchema.safeParse({
      nome: 'João',
      email: 'joao@email.com',
      password: '123456',
      confirmPassword: '654321',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const confirmIssue = result.error.issues.find(i => i.path[0] === 'confirmPassword')
      expect(confirmIssue?.message).toContain('não coincidem')
    }
  })

  it('rejeita confirmação vazia', () => {
    const result = RegisterSchema.safeParse({
      nome: 'João',
      email: 'joao@email.com',
      password: '123456',
      confirmPassword: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('ResetPasswordSchema', () => {
  it('aceita email válido', () => {
    const result = ResetPasswordSchema.safeParse({ resetEmail: 'teste@email.com' })
    expect(result.success).toBe(true)
  })

  it('rejeita email vazio', () => {
    const result = ResetPasswordSchema.safeParse({ resetEmail: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('E-mail é obrigatório')
    }
  })

  it('rejeita email inválido', () => {
    const result = ResetPasswordSchema.safeParse({ resetEmail: 'invalido' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('E-mail inválido')
    }
  })
})
