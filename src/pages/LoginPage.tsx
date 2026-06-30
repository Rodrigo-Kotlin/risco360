import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { APP_NAME } from '@/constants/app'
import { ROUTES } from '@/routes/routes.constants'
import { resetPasswordForEmail } from '@/services/auth.service'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { isSupabaseConfigured } from '@/lib/supabase'
import { isMockModeEnabled, MOCK_USER_EMAIL, MOCK_USER_PASSWORD } from '@/lib/mock-mode'
import { LoginSchema, RegisterSchema, ResetPasswordSchema, type RegisterInput, type ResetPasswordInput } from '@/lib/validation/schemas/auth'

type AuthFormValues = RegisterInput
import { ServerCrash, CheckCircle2, ArrowLeft, Mail, Beaker, Eye, EyeOff } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

type AuthMode = 'login' | 'register'
type PageMode = 'auth' | 'resetPassword'

interface AuthFormProps {
  onResetPasswordRequested: () => void
}

function AuthForm({ onResetPasswordRequested }: AuthFormProps) {
  const { signIn, signUp, error, isLoading, isAuthenticated, clearError } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const loginAttempted = useRef(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)

  const schema = authMode === 'login' ? LoginSchema : RegisterSchema

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(schema) as never,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    if (loginAttempted.current && isAuthenticated && !isLoading) {
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? ROUTES.empresas
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, location])

  useEffect(() => {
    const sub = watch(() => clearError())
    return () => sub.unsubscribe()
  }, [watch, clearError])

  const isRegister = authMode === 'register'

  const onSubmit = async (data: AuthFormValues) => {
    loginAttempted.current = true
    if (authMode === 'login') {
      const { email, password } = data
      await signIn(email, password)
    } else {
      const { nome, email, password } = data
      const needsConfirmation = await signUp(nome, email, password)
      if (needsConfirmation) {
        toast('Cadastro realizado! Verifique seu e-mail para confirmar.', 'success')
      } else {
        toast('Cadastro realizado! Redirecionando…', 'success')
      }
    }
  }

  function toggleAuthMode() {
    setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))
    clearError()
  }

  return (
    <div className="bg-white border border-border-light rounded-xl p-6 shadow-card text-left">
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {isRegister && (
          <Input
            label="Nome"
            type="text"
            placeholder="Seu nome completo"
            required
            error={errors.nome?.message}
            {...register('nome')}
          />
        )}
        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="relative">
          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            error={errors.password?.message}
            {...register('password')}
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
        {isRegister && (
          <Input
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
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
            onClick={onResetPasswordRequested}
            className="text-xs text-text-muted hover:text-primary-500 transition-colors"
          >
            Esqueci minha senha
          </button>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-border-light">
        <p className="text-xs text-text-muted text-center">
          {isRegister ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
        </p>
        <button
          type="button"
          onClick={toggleAuthMode}
          className="block mx-auto mt-1 text-sm text-primary-500 hover:text-primary-600 font-medium"
          aria-label={isRegister ? 'Ir para login' : 'Ir para cadastro'}
        >
          {isRegister ? 'Fazer login' : 'Criar conta'}
        </button>
      </div>
    </div>
  )
}

interface ResetPasswordFormProps {
  onBackToLogin: () => void
}

function ResetPasswordForm({ onBackToLogin }: ResetPasswordFormProps) {
  const { toast } = useToast()
  const [sending, setSending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    setSending(true)
    const { error: resetError } = await resetPasswordForEmail(data.resetEmail)
    if (resetError) {
      toast(resetError, 'error')
    } else {
      toast('E-mail de recuperação enviado! Verifique sua caixa de entrada.', 'success')
      onBackToLogin()
    }
    setSending(false)
  }

  return (
    <div className="bg-card border border-border-light rounded-xl p-6 shadow-card text-left">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          required
          error={errors.resetEmail?.message}
          {...register('resetEmail')}
        />
        <Button type="submit" className="w-full" loading={sending}>
          Enviar link de recuperação
        </Button>
      </form>
      <div className="mt-5 pt-4 border-t border-border-light">
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center justify-center gap-1.5 mx-auto text-sm text-primary-500 hover:text-primary-600 font-medium"
        >
          <ArrowLeft size={16} />
          Voltar ao login
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [pageMode, setPageMode] = useState<PageMode>('auth')

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? ROUTES.empresas
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

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
        <ResetPasswordForm onBackToLogin={() => setPageMode('auth')} />
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="flex flex-col items-center gap-1 mb-5">
        <Logo size="lg" />
        <p className="text-sm text-text-secondary">Plataforma de gestão de riscos ocupacionais</p>
      </div>

      <AuthForm onResetPasswordRequested={() => setPageMode('resetPassword')} />

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
