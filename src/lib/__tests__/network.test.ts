import { describe, it, expect } from 'vitest'
import { isNetworkError, isOfflineError } from '../network'

describe('isNetworkError', () => {
  it('retorna true para TypeError com "failed to fetch"', () => {
    expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true)
  })

  it('retorna true para "NetworkError" (case insensitive)', () => {
    expect(isNetworkError(new TypeError('NetworkError when attempting to fetch'))).toBe(true)
  })

  it('retorna true para "network error"', () => {
    expect(isNetworkError(new Error('network error'))).toBe(true)
  })

  it('retorna true para "network"', () => {
    expect(isNetworkError(new Error('network timeout'))).toBe(true)
  })

  it('retorna true para "fetch"', () => {
    expect(isNetworkError(new Error('fetch error'))).toBe(true)
  })

  it('retorna true para "TypeError"', () => {
    expect(isNetworkError(new TypeError('some typeerror'))).toBe(true)
  })

  it('retorna true para "load failed"', () => {
    expect(isNetworkError(new Error('load failed'))).toBe(true)
  })

  it('retorna true para "connection"', () => {
    expect(isNetworkError(new Error('connection refused'))).toBe(true)
  })

  it('retorna true para string', () => {
    expect(isNetworkError('TypeError: Failed to fetch')).toBe(true)
  })

  it('retorna false para erro de validação (duplicate key)', () => {
    expect(isNetworkError(new Error('duplicate key value violates unique constraint'))).toBe(false)
  })

  it('retorna false para erro de RLS', () => {
    expect(isNetworkError(new Error('new row violates row-level security policy for relation "empresas"'))).toBe(false)
  })

  it('retorna false para erro de autenticação', () => {
    expect(isNetworkError(new Error('JWT expired'))).toBe(false)
  })

  it('retorna false para null', () => {
    expect(isNetworkError(null)).toBe(false)
  })

  it('retorna false para undefined', () => {
    expect(isNetworkError(undefined)).toBe(false)
  })

  it('retorna false para objeto sem message', () => {
    expect(isNetworkError({ code: 500 })).toBe(false)
  })
})

describe('isOfflineError', () => {
  it('retorna true para "failed to fetch"', () => {
    expect(isOfflineError(new Error('Failed to fetch'))).toBe(true)
  })

  it('retorna true para "NetworkError"', () => {
    expect(isOfflineError(new TypeError('NetworkError'))).toBe(true)
  })

  it('retorna true para erro de rede genérico', () => {
    expect(isOfflineError(new Error('network timeout'))).toBe(true)
  })

  it('retorna false para erro de validação', () => {
    expect(isOfflineError(new Error('duplicate key'))).toBe(false)
  })

  it('retorna false para erro de RLS', () => {
    expect(isOfflineError(new Error('row-level security policy'))).toBe(false)
  })
})
