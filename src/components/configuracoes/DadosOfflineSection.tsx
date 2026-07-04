import { Card, CardTitle, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SincronizacaoSection } from './SincronizacaoSection'
import { CloudOff, HardDrive } from 'lucide-react'
import type { SyncQueueItem } from '@/types/sync'

interface OfflineCounts {
  empresas: number; setores: number; levantamentos: number
  evidencias: number; biblioteca_tecnica: number; relatorios: number; sync_pendentes: number
}

interface OfflineStatus { available: boolean; dbName: string; version: number }

interface DataProviderStatus {
  available: boolean; source: string; mockMode: boolean; migrated: boolean; initialized: boolean
  supportsOfflineWrites: boolean; syncEnabled: boolean
  syncStatus: { pending: number; syncing: number; error: number; synced: number; conflict: number; failedPermanent: number; total: number }
}

interface SyncQueueStats {
  pending: number; syncing: number; error: number; synced: number; conflict: number; failedPermanent: number; total: number
}

interface DadosOfflineSectionProps {
  offlineCounts: OfflineCounts; offlineStatus: OfflineStatus; migrated: boolean
  dataProviderStatus: DataProviderStatus; syncQueueStats: SyncQueueStats
  syncingNow: boolean; syncMessage: string; failedItems: SyncQueueItem[]; loadingOffline: boolean
  isSupabaseConfigured: boolean
  onSyncNow: () => void; onRetryFailed: () => void; onClearSynced: () => void
  onClearQueue: () => void; onResetOffline: () => void; onRefresh: () => void
}

export function DadosOfflineSection(props: DadosOfflineSectionProps) {
  const {
    offlineCounts, offlineStatus, migrated, dataProviderStatus,
    syncQueueStats, syncingNow, syncMessage, failedItems, loadingOffline,
    isSupabaseConfigured, onSyncNow, onRetryFailed, onClearSynced,
    onClearQueue, onResetOffline, onRefresh,
  } = props

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
            <HardDrive size={20} />
          </div>
          <div className="flex-1">
            <CardTitle>Dados offline (IndexedDB)</CardTitle>
            <p className="text-body-small text-text-secondary mt-0.5">Armazenamento local persistente</p>
          </div>
          <Badge variant={offlineStatus.available ? 'success' : 'warning'}>
            {offlineStatus.available ? 'Disponível' : 'Indisponível'}
          </Badge>
        </div>
      </CardHeader>
      <div className="px-5 pb-5 space-y-3">
        {loadingOffline ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
        ) : (
          <>
            <div className="bg-surface-muted rounded-lg p-3 text-body-medium space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Empresas locais</span>
                <span className="font-medium">{offlineCounts.empresas}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Setores locais</span>
                <span className="font-medium">{offlineCounts.setores}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Levantamentos locais</span>
                <span className="font-medium">{offlineCounts.levantamentos}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Evidências locais</span>
                <span className="font-medium">{offlineCounts.evidencias}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Biblioteca técnica local</span>
                <span className="font-medium">{offlineCounts.biblioteca_tecnica}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Relatórios locais</span>
                <span className="font-medium">{offlineCounts.relatorios}</span>
              </div>
              <div className="border-t border-border pt-1.5 mt-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-text-secondary"><CloudOff size={14} />Pendentes</span>
                  <span className="font-medium">{syncQueueStats.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-text-secondary">Sincronizando</span>
                  <span className="font-medium">{syncQueueStats.syncing}</span>
                </div>
                {syncQueueStats.error > 0 && (
                  <div className="flex items-center justify-between text-danger">
                    <span className="flex items-center gap-1 text-text-secondary">Erros</span>
                    <span className="font-medium">{syncQueueStats.error}</span>
                  </div>
                )}
                {syncQueueStats.conflict > 0 && (
                  <div className="flex items-center justify-between text-warning">
                    <span className="flex items-center gap-1 text-text-secondary">Conflitos</span>
                    <span className="font-medium">{syncQueueStats.conflict}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-text-secondary">Sincronizados</span>
                  <span className="font-medium">{syncQueueStats.synced}</span>
                </div>
              </div>
              <div className="border-t border-border pt-1.5 mt-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Status do IndexedDB</span>
                  <span className="font-medium text-label-medium">
                    {offlineStatus.available ? offlineStatus.dbName : 'Indisponível'}
                    {offlineStatus.available && ` v${offlineStatus.version}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Migração do mock</span>
                  <span className="font-medium">{migrated ? 'Concluída' : 'Pendente'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Fonte de dados</span>
                  <span className="font-medium">{dataProviderStatus.source}</span>
                </div>
              </div>
              {isSupabaseConfigured && (
                <div className="border-t border-border pt-1.5 mt-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Sincronização remota</span>
                    <span className="font-medium text-label-medium text-success">Ativa (empresas/setores/levantamentos)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Escrita offline empresas</span>
                    <span className="font-medium text-label-medium">
                      <Badge variant={dataProviderStatus.supportsOfflineWrites ? 'success' : 'muted'}>
                        {dataProviderStatus.supportsOfflineWrites ? 'Ativa' : 'Apenas leitura'}
                      </Badge>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Escrita offline setores</span>
                    <span className="font-medium text-label-medium">
                      <Badge variant={dataProviderStatus.supportsOfflineWrites ? 'success' : 'muted'}>
                        {dataProviderStatus.supportsOfflineWrites ? 'Ativa' : 'Apenas leitura'}
                      </Badge>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Escrita offline levantamentos</span>
                    <span className="font-medium text-label-medium">
                      <Badge variant={dataProviderStatus.supportsOfflineWrites ? 'success' : 'muted'}>
                        {dataProviderStatus.supportsOfflineWrites ? 'Ativa' : 'Apenas leitura'}
                      </Badge>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Escrita offline evidências</span>
                    <span className="font-medium text-label-medium"><Badge variant="success">Ativa</Badge></span>
                  </div>
                  <p className="text-body-small text-text-muted mt-2">
                    Sincronização ativa para empresas, setores, levantamentos e evidências fotográficas.
                  </p>
                </div>
              )}
            </div>

            <SincronizacaoSection
              syncQueueStats={syncQueueStats}
              syncingNow={syncingNow}
              syncMessage={syncMessage}
              failedItems={failedItems}
              isSupabaseConfigured={isSupabaseConfigured}
              onSyncNow={onSyncNow}
              onRetryFailed={onRetryFailed}
              onClearSynced={onClearSynced}
              onClearQueue={onClearQueue}
              onResetOffline={onResetOffline}
              onRefresh={onRefresh}
            />

            <p className="text-body-small text-text-muted">
              Os dados offline são armazenados no IndexedDB do navegador e persistem mesmo após fechar o navegador.
            </p>
          </>
        )}
      </div>
    </Card>
  )
}
