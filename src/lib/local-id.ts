export function createLocalId(prefix: string): string {
  return `local_${prefix}_${crypto.randomUUID()}`
}

export function isLocalId(id: string): boolean {
  return id.startsWith('local_')
}

export const LOCAL_ID_PREFIXES = {
  empresa: 'local_empresa_',
  setor: 'local_setor_',
  levantamento: 'local_levantamento_',
  evidencia: 'local_evidencia_',
  relatorio: 'local_relatorio_',
  sync: 'local_sync_',
} as const
