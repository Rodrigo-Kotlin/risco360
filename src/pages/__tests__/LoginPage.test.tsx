import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../LoginPage'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

vi.mock('@/hooks/useAuth')
vi.mock('@/hooks/useToast')
vi.mock('@/services/auth.service', () => ({
  resetPasswordForEmail: vi.fn(),
}))
vi.mock('@/lib/mock-mode', () => ({
  isMockModeEnabled: true,
  MOCK_USER_EMAIL: 'demo@risco360.local',
  MOCK_USER_PASSWORD: 'Risco360@123',
}))
vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: false,
}))

const mockSignIn = vi.fn()
const mockSignUp = vi.fn()

function setupAuth(overrides = {}) {
  const defaults = {
    user: null,
    session: null,
    profile: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    signIn: mockSignIn,
    signUp: mockSignUp,
    logout: vi.fn(),
    refreshSession: vi.fn(),
    clearError: vi.fn(),
  }
  vi.mocked(useAuth).mockReturnValue({ ...defaults, ...overrides })
}

function setupToast() {
  vi.mocked(useToast).mockReturnValue({ toast: vi.fn() })
}

function renderPage() {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  setupToast()
})

describe('LoginPage — renderização', () => {
  it('renderiza formulário de login com campos obrigatórios', () => {
    setupAuth()
    renderPage()

    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('mostra credenciais mock em modo desenvolvimento', () => {
    setupAuth()
    renderPage()

    expect(screen.getByText(/demo@risco360\.local/i)).toBeInTheDocument()
    expect(screen.getByText(/Risco360@123/i)).toBeInTheDocument()
  })
})

describe('LoginPage — validação (login)', () => {
  it('mostra erro ao submeter com email vazio', async () => {
    setupAuth()
    renderPage()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(screen.getByText(/E-mail é obrigatório/i)).toBeInTheDocument()
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('mostra erro ao submeter com senha vazia', async () => {
    setupAuth()
    renderPage()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('seu@email.com'), 'teste@email.com')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(screen.getByText(/Senha é obrigatória/i)).toBeInTheDocument()
    expect(mockSignIn).not.toHaveBeenCalled()
  })
})

describe('LoginPage — toggle cadastro', () => {
  it('alterna para formulário de cadastro', async () => {
    setupAuth()
    renderPage()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /ir para cadastro/i }))

    expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument()
  })

  it('mostra erro de senhas diferentes no cadastro', async () => {
    setupAuth()
    renderPage()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /ir para cadastro/i }))

    await user.type(screen.getByPlaceholderText('Seu nome completo'), 'João')
    await user.type(screen.getByPlaceholderText('seu@email.com'), 'joao@email.com')
    const passwordInputs = screen.getAllByPlaceholderText('••••••••')
    await user.type(passwordInputs[0], '123456')
    await user.type(screen.getByLabelText(/confirmar senha/i), '654321')

    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    expect(screen.getByText(/não coincidem/i)).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })
})

describe('LoginPage — submissão', () => {
  it('chama signIn com email e senha no login', async () => {
    setupAuth()
    renderPage()
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('seu@email.com'), 'teste@email.com')
    await user.type(screen.getByPlaceholderText('••••••••'), '123456')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(mockSignIn).toHaveBeenCalledWith('teste@email.com', '123456')
  })
})
