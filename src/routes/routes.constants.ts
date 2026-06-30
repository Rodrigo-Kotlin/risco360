export const ROUTES = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  empresas: '/empresas',
  empresasNova: '/empresas/nova',
  empresasDetalhe: '/empresas/:id',
  empresasEditar: '/empresas/:id/editar',
  setorDetalhe: '/empresas/:empresaId/setores/:setorId',
  setorLevantamento: '/empresas/:empresaId/setores/:setorId/levantamento',
  setores: '/setores',
  setoresNovo: '/setores/novo',
  setorNovoComEmpresa: '/empresas/:empresaId/setores/novo',
  setoresDetalhe: '/setores/:setorId',
  setoresEditar: '/setores/:setorId/editar',
  setorNovoLevantamento: '/setores/:setorId/levantamentos/novo',
  setorLevantamentoDetalhe: '/setores/:setorId/levantamentos/:levantamentoId',
  levantamentos: '/levantamentos',
  levantamentosNovo: '/levantamentos/novo',
  levantamentosDetalhe: '/levantamentos/:id',
  levantamentosEditar: '/levantamentos/:id/editar',
  biblioteca: '/biblioteca',
  relatorios: '/relatorios',
  configuracoes: '/configuracoes',
  sincronizacao: '/configuracoes/sincronizacao',
  empresaConsolidado: '/empresas/:empresaId/consolidado',
  empresaPdfConferencia: '/empresas/:empresaId/consolidado/pdf',
} as const

export function buildRoute(
  route: string,
  params: Record<string, string>
): string {
  let result = route
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, encodeURIComponent(value))
  }
  return result
}
