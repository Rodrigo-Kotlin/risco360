export const queryKeys = {
  empresas: {
    all: ['empresas'] as const,
    byId: (id: string) => ['empresas', id] as const,
  },
  setores: {
    all: ['setores'] as const,
    byId: (id: string) => ['setores', id] as const,
  },
  levantamentos: {
    all: ['levantamentos'] as const,
    byId: (id: string) => ['levantamentos', id] as const,
  },
  relatorios: {
    all: ['relatorios'] as const,
    byId: (id: string) => ['relatorios', id] as const,
  },
  dashboard: {
    all: ['dashboard-data'] as const,
  },
}
