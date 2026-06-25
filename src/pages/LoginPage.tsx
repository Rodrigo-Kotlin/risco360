import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { APP_NAME } from '@/constants/app'
import { ROUTES } from '@/routes/routes.constants'
import { resetPasswordForEmail } from '@/services/auth.service'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { isSupabaseConfigured } from '@/lib/supabase'
import { isMockModeEnabled, MOCK_USER_EMAIL, MOCK_USER_PASSWORD } from '@/lib/mock-mode'
import { ServerCrash, CheckCircle2, ArrowLeft, Mail, Beaker, Eye, EyeOff } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

type AuthMode = 'login' | 'register'
type PageMode = 'auth' | 'resetPassword'

export default function LoginPage() {
  const { signIn, signUp, error, isLoading, isAuthenticated, clearError } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const loginAttempted = useRef(false)

  const [pageMode, setPageMode] = useState<PageMode>('auth')
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [sendingReset, setSendingReset] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (loginAttempted.current && isAuthenticated && !isLoading) {
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? ROUTES.empresas
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, location])

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
      loginAttempted.current = true
      await signIn(email, password)
    } else {
      if (!validateRegister()) return
      clearFieldErrors()
      loginAttempted.current = true
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

  if (!isSupabaseConfigured && !isMockModeEnabled) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-warning/10 text-warning mb-5">
          <ServerCrash size={28} />
        </div>
        <h1 className="text-xl font-bold text-text-primary">{APP_NAME}</h1>
        <p className="mt-1 text-sm text-text-secondary mb-6">
          Plataforma de gestão de riscos ocupacionais
        </p>
        <div className="bg-card border border-border-light rounded-xl p-6 shadow-card text-center space-y-3">
          <p className="text-sm font-medium text-warning">Servidor não configurado</p>
          <p className="text-xs text-text-muted leading-relaxed">
            Configure as variáveis de ambiente{' '}
            <code className="text-primary-500 bg-primary-50 px-1 rounded">VITE_SUPABASE_URL</code> e{' '}
            <code className="text-primary-500 bg-primary-50 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>.
          </p>
        </div>
      </div>
    )
  }

  if (pageMode === 'resetPassword') {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500 text-white mb-5">
          <Mail size={28} />
        </div>
        <h1 className="text-xl font-bold text-text-primary">Recuperar senha</h1>
        <p className="mt-1 text-sm text-text-secondary mb-6">
          Receba um link para redefinir sua senha
        </p>
        <div className="bg-card border border-border-light rounded-xl p-6 shadow-card text-left">
          <form onSubmit={handleResetPassword} className="space-y-4">
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
          <div className="mt-5 pt-4 border-t border-border-light">
            <button
              type="button"
              onClick={() => setPageMode('auth')}
              className="flex items-center justify-center gap-1.5 mx-auto text-sm text-primary-500 hover:text-primary-600 font-medium"
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
    <div className="text-center">
      <div className="flex flex-col items-center gap-1 mb-5">
        <Logo size="lg" />
        <p className="text-sm text-text-secondary">Plataforma de gestão de riscos ocupacionais</p>
      </div>

      <div className="mt-6 bg-white border border-border-light rounded-xl p-6 shadow-card text-left">
        {isMockModeEnabled && (
          <div className="flex items-center justify-center gap-1.5 mb-4 pb-4 border-b border-border-light">
            <Beaker size={14} className="text-warning" />
            <span className="text-xs text-warning font-medium">Modo mock ativo para desenvolvimento</span>
          </div>
        )}

        {isSupabaseConfigured && !isMockModeEnabled && (
          <div className="flex items-center justify-center gap-1.5 mb-4 pb-4 border-b border-border-light">
            <CheckCircle2 size={14} className="text-success" />
            <span className="text-xs text-success font-medium">Servidor configurado</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              error={fieldErrors.password}
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearAll() }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-text-muted hover:text-text-secondary transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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

          {error && (
            <p className="text-xs text-danger text-center" role="alert">{error}</p>
          )}

          <Button type="submit" className="w-full h-11" loading={isLoading}>
            {authMode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        {authMode === 'login' && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => setPageMode('resetPassword')}
              className="text-xs text-text-muted hover:text-primary-500 transition-colors"
            >
              Esqueci minha senha
            </button>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-border-light">
          <p className="text-xs text-text-muted text-center">
            {authMode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
          </p>
          <button
            type="button"
            onClick={toggleAuthMode}
            className="block mx-auto mt-1 text-sm text-primary-500 hover:text-primary-600 font-medium"
            aria-label={authMode === 'login' ? 'Ir para cadastro' : 'Ir para login'}
          >
            {authMode === 'login' ? 'Criar conta' : 'Fazer login'}
          </button>
        </div>
      </div>

      {isMockModeEnabled && (
        <div className="mt-4 bg-white border border-border-light rounded-xl p-4 shadow-card text-left">
          <p className="text-xs text-text-muted text-center mb-2">
            Credenciais de desenvolvimento
          </p>
          <div className="space-y-1">
            <p className="text-xs text-text-secondary text-center">
              <span className="font-medium">Usuário:</span> {MOCK_USER_EMAIL}
            </p>
            <p className="text-xs text-text-secondary text-center">
              <span className="font-medium">Senha:</span> {MOCK_USER_PASSWORD}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
