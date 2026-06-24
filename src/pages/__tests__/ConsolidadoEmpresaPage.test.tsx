import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/components/ui/Toast'
import { ROUTES } from '@/routes/routes.constants'
import ConsolidadoEmpresaPage from '../EmpresaConsolidadoPage'
import { seedAllMockDataIfEmpty, getMockData } from '@/services/mock-storage.service'
import type { Empresa } from '@/types/empresa'

vi.mock('@/lib/mock-mode', () => ({
  isMockModeEnabled: true,
  MOCK_STORAGE_KEYS: {
    auth: 'risco360_mock_auth',
    empresas: 'risco360_mock_empresas',
    setores: 'risco360_mock_setores',
    levantamentos: 'risco360_mock_levantamentos',
    biblioteca: 'risco360_mock_biblioteca',
    relatorios: 'risco360_mock_relatorios',
  },
}))

function renderPage(empresaId: string) {
  return render(
    <MemoryRouter initialEntries={[`/empresas/${empresaId}/consolidado`]}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path={ROUTES.empresaConsolidado} element={<ConsolidadoEmpresaPage />} />
            <Route path={ROUTES.empresas} element={<div>Empresas Page</div>} />
            <Route path={ROUTES.empresasDetalhe} element={<div>Empresa Detalhe</div>} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('ConsolidadoEmpresaPage', () => {
  beforeEach(() => {
    localStorage.clear()
    seedAllMockDataIfEmpty()
  })

  it('renderiza título Consolidado da Empresa', async () => {
    const empresas = getMockData<Empresa>('empresas')
    renderPage(empresas[0].id)
    expect(await screen.findByText('Consolidado da Empresa')).toBeTruthy()
  })

  it('exibe totais de setores', async () => {
    const empresas = getMockData<Empresa>('empresas')
    renderPage(empresas[0].id)
    const elements = await screen.findAllByText('Setores')
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  it('exibe totais de riscos', async () => {
    const empresas = getMockData<Empresa>('empresas')
    renderPage(empresas[0].id)
    expect(await screen.findByText('Riscos Identificados')).toBeTruthy()
  })

  it('exibe totais de medições', async () => {
    const empresas = getMockData<Empresa>('empresas')
    renderPage(empresas[0].id)
    const elements = await screen.findAllByText('Medições')
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  it('exibe totais de ações', async () => {
    const empresas = getMockData<Empresa>('empresas')
    renderPage(empresas[0].id)
    expect(await screen.findByText('Ações do Plano')).toBeTruthy()
  })

  it('exibe botão de exportar XLSX', async () => {
    const empresas = getMockData<Empresa>('empresas')
    renderPage(empresas[0].id)
    expect(await screen.findByText('Exportar XLSX (10 abas)')).toBeTruthy()
  })

  it('exibe botão de CSV Riscos', async () => {
    const empresas = getMockData<Empresa>('empresas')
    renderPage(empresas[0].id)
    expect(await screen.findByText('CSV Riscos')).toBeTruthy()
  })

  it('exibe botão de CSV Medições', async () => {
    const empresas = getMockData<Empresa>('empresas')
    renderPage(empresas[0].id)
    expect(await screen.findByText('CSV Medições')).toBeTruthy()
  })

  it('exibe botão de CSV Plano de Ação', async () => {
    const empresas = getMockData<Empresa>('empresas')
    renderPage(empresas[0].id)
    expect(await screen.findByText('CSV Plano de Ação')).toBeTruthy()
  })

  it('exibe tabela de setores', async () => {
    const empresas = getMockData<Empresa>('empresas')
    renderPage(empresas[0].id)
    expect(await screen.findByText('Setor')).toBeTruthy()
    expect(await screen.findByText('Status')).toBeTruthy()
    expect(await screen.findByText('Riscos')).toBeTruthy()
  })

  it('exibe erro para empresa inexistente', async () => {
    renderPage('id-invalido')
    expect(await screen.findByText('Empresa não encontrada ou sem dados.')).toBeTruthy()
  })
})
