import { env } from './env'

export function getFriendlyAuthError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error ?? '').toLowerCase()

  if (
    message.includes('servidor não configurado') ||
    message.includes('supabase não configurado')
  ) {
    return 'Servidor não configurado. Verifique as variáveis de ambiente do Supabase.'
  }

  if (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('fetch')
  ) {
    return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'
  }

  if (
    message.includes('email not confirmed')
  ) {
    return 'Confirme seu e-mail antes de entrar.'
  }

  if (
    message.includes('invalid login') ||
    message.includes('invalid credentials')
  ) {
    return 'E-mail ou senha inválidos.'
  }

  if (
    message.includes('already registered') ||
    message.includes('already exists') ||
    message.includes('user already registered')
  ) {
    return 'E-mail já cadastrado.'
  }

  if (
    message.includes('rate limit') ||
    message.includes('too many requests')
  ) {
    return 'Muitas tentativas. Aguarde alguns instantes e tente novamente.'
  }

  if (message.includes('password recovery') || message.includes('reset password')) {
    return 'E-mail de recuperação enviado. Verifique sua caixa de entrada.'
  }

  if (message.includes('timeout')) {
    return 'A sessão expirou. Faça login novamente.'
  }

  return 'Não foi possível concluir a operação. Tente novamente.'
}

function getErrorCode(error: unknown): string | null {
  if (error && typeof error === 'object' && 'code' in error) {
    return String((error as { code: unknown }).code)
  }
  return null
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.toLowerCase()
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message).toLowerCase()
  }
  return String(error ?? '').toLowerCase()
}

export function getFriendlyDataError(error: unknown): string {
  const code = getErrorCode(error)
  const message = getErrorMessage(error)

  if (code === '23514' && message.includes('chk_levantamentos_status')) {
    return 'Status inválido para o levantamento. Recarregue a página e tente novamente.'
  }

  if (
    message.includes('servidor não configurado') ||
    message.includes('supabase não configurado')
  ) {
    return 'Servidor não configurado. Verifique as variáveis de ambiente do Supabase.'
  }

  if (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('fetch')
  ) {
    return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'
  }

  if (
    message.includes('permission') ||
    message.includes('policy') ||
    message.includes('rls') ||
    message.includes('row-level security')
  ) {
    return 'Você não tem permissão para acessar ou alterar este registro.'
  }

  if (
    message.includes('duplicate') ||
    message.includes('unique') ||
    message.includes('already exists')
  ) {
    return 'Já existe um registro com essas informações.'
  }

  if (
    message.includes('not found') ||
    message.includes('no rows')
  ) {
    return 'Registro não encontrado.'
  }

  if (message.includes('timeout')) {
    return 'A sessão expirou. Faça login novamente.'
  }

  return 'Não foi possível concluir a operação. Tente novamente.'
}

export function logDevError(context: string, error: unknown): void {
  if (env.isDev) {
    console.error(`[DevError] ${context}`, error)
  }
}
