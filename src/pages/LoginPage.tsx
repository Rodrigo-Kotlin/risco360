import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { APP_NAME } from '@/constants/app'
import { resetPasswordForEmail } from '@/services/auth.service'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { isSupabaseConfigured } from '@/lib/supabase'
import { isMockModeEnabled, MOCK_USER_EMAIL, MOCK_USER_PASSWORD } from '@/lib/mock-mode'
import { Shield, ServerCrash, CheckCircle2, ArrowLeft, Mail, Beaker } from 'lucide-react'

type AuthMode = 'login' | 'register'
type PageMode = 'auth' | 'resetPassword'

export default function LoginPage() {
  const { signIn, signUp, error, isLoading, clearError } = useAuth()
  const { toast } = useToast()

  const [pageMode, setPageMode] = useState<PageMode>('auth')
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [sendingReset, setSendingReset] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function clearFieldErrors() {
    if (Object.keys(fieldErrors).length > 0) setFieldErrors({})
  }

  function clearAll() {
    clearFieldErrors()
    clearError()
  }

  function validateRegister(): boolean {
    const errors: Record<string, string> = {}

    if (!nome.trim()) errors.nome = 'Nome é obrigatório.'
    if (!email.trim()) errors.email = 'E-mail é obrigatório.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'E-mail inválido.'
    if (!password) errors.password = 'Senha é obrigatória.'
    else if (password.length < 6) errors.password = 'A senha deve ter pelo menos 6 caracteres.'
    if (!confirmPassword) errors.confirmPassword = 'Confirmação de senha é obrigatória.'
    else if (password !== confirmPassword) errors.confirmPassword = 'As senhas não coincidem.'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  function validateLogin(): boolean {
    const errors: Record<string, string> = {}

    if (!email.trim()) errors.email = 'E-mail é obrigatório.'
    if (!password) errors.password = 'Senha é obrigatória.'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  function toggleAuthMode() {
    setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))
    clearAll()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (authMode === 'login') {
      if (!validateLogin()) return
      clearFieldErrors()
      await signIn(email, password)
    } else {
      if (!validateRegister()) return
      clearFieldErrors()
      const needsConfirmation = await signUp(nome, email, password)
      if (needsConfirmation) {
        toast('Cadastro realizado! Verifique seu e-mail para confirmar.', 'success')
      } else {
        toast('Cadastro realizado! Redirecionando…', 'success')
      }
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault()
    setSendingReset(true)

    const { error: resetError } = await resetPasswordForEmail(resetEmail)

    if (resetError) {
      toast(resetError, 'error')
    } else {
      toast('E-mail de recuperação enviado! Verifique sua caixa de entrada.', 'success')
      setPageMode('auth')
    }

    setSendingReset(false)
  }

  if (!isSupabaseConfigured) {
    if (isMockModeEnabled) {
      return (
        <div className="space-y-8 animate-slide-up">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500 text-white mb-4">
              <Shield size={28} />
            </div>
            <h1 className="text-xl font-bold text-text-primary">{APP_NAME}</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Plataforma de gestão de riscos ocupacionais
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-center gap-1.5 mb-5 pb-4 border-b border-border">
              <Beaker size={14} className="text-warning" />
              <span className="text-xs text-warning font-medium">Modo mock ativo para desenvolvimento</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  error={fieldErrors.email}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearAll() }}
                />
                <Input
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  required
                  error={fieldErrors.password}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearAll() }}
                />
              </div>

              {(error || Object.keys(fieldErrors).length > 0) && (
                <div className="space-y-1">
                  {error && <p className="text-xs text-danger text-center" role="alert">{error}</p>}
                  {Object.entries(fieldErrors).map(([key, msg]) => (
                    <p key={key} className="text-xs text-danger text-center" role="alert">{msg}</p>
                  ))}
                </div>
              )}

              <Button type="submit" className="w-full" loading={isLoading}>
                Entrar
              </Button>
            </form>

            <div className="mt-5 pt-5 border-t border-border space-y-2">
              <p className="text-xs text-text-muted text-center">
                Credenciais de desenvolvimento:
              </p>
              <div className="bg-surface-muted rounded-lg p-3 text-center space-y-1">
                <p className="text-xs text-text-secondary">
                  <span className="font-medium">Usuário:</span> {MOCK_USER_EMAIL}
                </p>
                <p className="text-xs text-text-secondary">
                  <span className="font-medium">Senha:</span> {MOCK_USER_PASSWORD}
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6 animate-slide-up">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-warning/10 text-warning mb-4">
            <ServerCrash size={28} />
          </div>
          <h1 className="text-xl font-bold text-text-primary">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Plataforma de gestão de riscos ocupacionais
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-card text-center space-y-3">
          <p className="text-sm font-medium text-warning">Servidor não configurado</p>
          <p className="text-xs text-text-muted leading-relaxed">
            Configure as variáveis de ambiente <code className="text-primary-500 bg-primary-50 px-1 rounded">VITE_SUPABASE_URL</code> e{' '}
            <code className="text-primary-500 bg-primary-50 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> no arquivo <code className="text-primary-500 bg-primary-50 px-1 rounded">.env</code>.
          </p>
          <p className="text-xs text-text-muted">
            Consulte <code className="text-primary-500 bg-primary-50 px-1 rounded">.env.example</code> para referência.
          </p>
        </div>
      </div>
    )
  }

  if (pageMode === 'resetPassword') {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500 text-white mb-4">
            <Mail size={28} />
          </div>
          <h1 className="text-xl font-bold text-text-primary">Recuperar senha</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Receba um link para redefinir sua senha
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <form onSubmit={handleResetPassword} className="space-y-5">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />

            <Button type="submit" className="w-full" loading={sendingReset}>
              Enviar link de recuperação
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-border">
            <button
              type="button"
              onClick={() => setPageMode('auth')}
              className="flex items-center gap-1.5 mx-auto text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              <ArrowLeft size={16} />
              Voltar ao login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500 text-white mb-4">
          <Shield size={28} />
        </div>
        <h1 className="text-xl font-bold text-text-primary">{APP_NAME}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Plataforma de gestão de riscos ocupacionais
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-center gap-1.5 mb-5 pb-4 border-b border-border">
          <CheckCircle2 size={14} className="text-success" />
          <span className="text-xs text-success font-medium">Servidor configurado</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            {authMode === 'register' && (
              <Input
                label="Nome"
                type="text"
                placeholder="Seu nome completo"
                required
                error={fieldErrors.nome}
                value={nome}
                onChange={(e) => { setNome(e.target.value); clearAll() }}
              />
            )}
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              required
              error={fieldErrors.email}
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearAll() }}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              required
              error={fieldErrors.password}
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearAll() }}
            />
            {authMode === 'register' && (
              <Input
                label="Confirmar senha"
                type="password"
                placeholder="••••••••"
                required
                error={fieldErrors.confirmPassword}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearAll() }}
              />
            )}
          </div>

          {(error || Object.keys(fieldErrors).length > 0) && (
            <div className="space-y-1">
              {error && <p className="text-xs text-danger text-center" role="alert">{error}</p>}
              {Object.entries(fieldErrors).map(([key, msg]) => (
                <p key={key} className="text-xs text-danger text-center" role="alert">{msg}</p>
              ))}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
          >
            {authMode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        {authMode === 'login' && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => setPageMode('resetPassword')}
              className="text-xs text-primary-500 hover:text-primary-600 underline underline-offset-2"
            >
              Esqueci minha senha
            </button>
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-xs text-text-muted text-center">
            {authMode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
          </p>
          <button
            type="button"
            onClick={toggleAuthMode}
            className="block mx-auto mt-1 text-sm text-primary-500 hover:text-primary-600 font-medium underline underline-offset-2"
          >
            {authMode === 'login' ? 'Criar conta' : 'Fazer login'}
          </button>
        </div>
      </div>
    </div>
  )
}
