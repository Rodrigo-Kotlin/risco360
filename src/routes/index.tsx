import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { AppErrorBoundary } from '@/components/ui/AppErrorBoundary'
import { ROUTES } from '@/routes/routes.constants'
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'
import { useAuth } from '@/hooks/useAuth'
import { env } from '@/lib/env'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const EmpresasPage = lazy(() => import('@/pages/EmpresasPage'))
const EmpresaDetalhePage = lazy(() => import('@/pages/EmpresaDetalhePage'))
const EmpresaFormPage = lazy(() => import('@/pages/EmpresaFormPage'))
const LevantamentosPage = lazy(() => import('@/pages/LevantamentosPage'))
const LevantamentoDetalhePage = lazy(() => import('@/pages/LevantamentoDetalhePage'))
const NovoLevantamentoPage = lazy(() => import('@/pages/NovoLevantamentoPage'))
const LevantamentoWizardPage = lazy(() => import('@/pages/LevantamentoWizardPage'))
const BibliotecaPage = lazy(() => import('@/pages/BibliotecaPage'))
const RelatoriosPage = lazy(() => import('@/pages/RelatoriosPage'))
const SetorDetalhePage = lazy(() => import('@/pages/SetorDetalhePage'))
const SetoresPage = lazy(() => import('@/pages/SetoresPage'))
const SetorFormPage = lazy(() => import('@/pages/SetorFormPage'))
const ConfiguracoesPage = lazy(() => import('@/pages/ConfiguracoesPage'))
const EmpresaConsolidadoPage = lazy(() => import('@/pages/EmpresaConsolidadoPage'))
const EmpresaPdfConferenciaPage = lazy(() => import('@/pages/EmpresaPdfConferenciaPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  // em mock mode, sempre autenticado
  const requiresAuth = !env.enableMockMode

  if (requiresAuth && !isLoading && !isAuthenticated) {
    navigate(ROUTES.login, { replace: true })
    return null
  }

  return (
    <AuthenticatedLayout>
      <Outlet />
    </AuthenticatedLayout>
  )
}

const router = createBrowserRouter([
  {
    index: true,
    element: <Navigate to={ROUTES.empresas} replace />,
  },

  {
    path: ROUTES.login,
    element: <Lazy><LoginPage /></Lazy>,
    errorElement: <AppErrorBoundary />,
  },

  {
    element: <ProtectedRoute />,
    errorElement: <AppErrorBoundary />,
    children: [
      { path: ROUTES.dashboard,                    element: <Lazy><DashboardPage /></Lazy> },
      { path: ROUTES.empresas,                     element: <Lazy><EmpresasPage /></Lazy> },
      { path: ROUTES.empresasNova,                 element: <Lazy><EmpresaFormPage /></Lazy> },
      { path: ROUTES.empresasDetalhe,              element: <Lazy><EmpresaDetalhePage /></Lazy> },
      { path: ROUTES.empresasEditar,               element: <Lazy><EmpresaFormPage /></Lazy> },
      { path: ROUTES.setorDetalhe,                 element: <Lazy><SetorDetalhePage /></Lazy> },
      { path: ROUTES.setorLevantamento,            element: <Lazy><NovoLevantamentoPage /></Lazy> },
      { path: ROUTES.setores,                      element: <Lazy><SetoresPage /></Lazy> },
      { path: ROUTES.setoresNovo,                  element: <Lazy><SetorFormPage /></Lazy> },
      { path: ROUTES.setorNovoComEmpresa,          element: <Lazy><SetorFormPage /></Lazy> },
      { path: ROUTES.setoresDetalhe,               element: <Lazy><SetorDetalhePage /></Lazy> },
      { path: ROUTES.setoresEditar,                element: <Lazy><SetorFormPage /></Lazy> },
      { path: ROUTES.setorNovoLevantamento,        element: <Lazy><NovoLevantamentoPage /></Lazy> },
      { path: ROUTES.setorLevantamentoDetalhe,     element: <Lazy><LevantamentoDetalhePage /></Lazy> },
      { path: ROUTES.levantamentos,                element: <Lazy><LevantamentosPage /></Lazy> },
      { path: ROUTES.levantamentosNovo,            element: <Navigate to={ROUTES.empresas} replace /> },
      { path: ROUTES.levantamentosDetalhe,         element: <Lazy><LevantamentoDetalhePage /></Lazy> },
      { path: ROUTES.levantamentosEditar,          element: <Lazy><LevantamentoWizardPage /></Lazy> },
      { path: ROUTES.biblioteca,                   element: <Lazy><BibliotecaPage /></Lazy> },
      { path: ROUTES.relatorios,                   element: <Lazy><RelatoriosPage /></Lazy> },
      { path: ROUTES.configuracoes,                element: <Lazy><ConfiguracoesPage /></Lazy> },
      { path: ROUTES.empresaConsolidado,           element: <Lazy><EmpresaConsolidadoPage /></Lazy> },
      { path: ROUTES.empresaPdfConferencia,        element: <Lazy><EmpresaPdfConferenciaPage /></Lazy> },
    ],
  },

  {
    path: '*',
    errorElement: <AppErrorBoundary />,
    element: <Lazy><NotFoundPage /></Lazy>,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
