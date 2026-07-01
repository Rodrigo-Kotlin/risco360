import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardTitle, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { FormSection } from '@/components/ui/FormSection'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { isMockModeEnabled, MOCK_USER_EMAIL } from '@/lib/mock-mode'
import { env } from '@/lib/env'
import { getCurrentProfile, updateCurrentProfile } from '@/services/profile.service'
import { hasMockData, clearMockData, seedAllMockDataIfEmpty } from '@/services/mock-storage.service'
import { contarOffline, getOfflineStatus, resetOfflineData } from '@/services/offline/offline-storage.service'
import { limparTodaFila, getSyncQueueStats, clearSyncedQueueItems, retryAllFailedItems, listFailedSyncItems } from '@/services/offline/sync-queue.service'
import { getDataProviderStatus, resetDataProviderInitialization } from '@/services/data-provider'
import { isMockMigrated } from '@/lib/migration'
import { syncNextBatch } from '@/services/sync.service'
import type { BadgeVariant } from '@/types/ui'
import type { SyncQueueItem } from '@/types/sync'
import { Bell, Monitor, Palette, HardDrive, Database, CheckCircle2, XCircle, ShieldCheck, ShieldOff, Save, Loader2, Mail, Beaker, RefreshCw, Trash2, LogOut, CloudOff, Image, Upload, AlertTriangle, AlertCircle, RotateCcw } from 'lucide-react'

export default function ConfiguracoesPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const { toast } = useToast()

  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cargo, setCargo] = useState('')
  const [empresa, setEmpresa] = useState('')

  const [offlineCounts, setOfflineCounts] = useState({ empresas: 0, setores: 0, levantamentos: 0, evidencias: 0, biblioteca_tecnica: 0, relatorios: 0, sync_pendentes: 0 })
  const [offlineStatus, setOfflineStatus] = useState({ available: false, dbName: '', version: 0 })
  const [migrated, setMigrated] = useState(false)
  const [dataProviderStatus, setDataProviderStatus] = useState({ available: false, source: '', mockMode: false, migrated: false, initialized: false, supportsOfflineWrites: false, syncEnabled: false, syncStatus: { pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, total: 0 } })
  const [syncQueueStats, setSyncQueueStats] = useState({ pending: 0, syncing: 0, error: 0, synced: 0, conflict: 0, total: 0 })
  const [syncingNow, setSyncingNow] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [loadingOffline, setLoadingOffline] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isAuthenticated) { setProfileLoading(false); return }
    setProfileLoading(true)
    let mounted = true
    getCurrentProfile().then((result) => {
      if (!mounted) return
      setProfileLoading(false)
      if (result.error || !result.data) return
      setNome(result.data.nome)
      setTelefone(result.data.telefone ?? '')
      setCargo(result.data.cargo ?? '')
      setEmpresa(result.data.empresa ?? '')
    })
    return () => { mounted = false }
  }, [isAuthenticated])

  const [failedItems, setFailedItems] = useState<SyncQueueItem[]>([])

  useEffect(() => {
    async function load() {
      setLoadingOffline(true)
      const [counts, status, isMigrated, syncStats, failed] = await Promise.all([
        contarOffline(),
        getOfflineStatus(),
        isMockMigrated(),
        getSyncQueueStats(),
        listFailedSyncItems(),
      ])
      setOfflineCounts(counts)
      setOfflineStatus(status)
      setMigrated(isMigrated)
      setSyncQueueStats(syncStats)
      setFailedItems(failed)
      const dpStatus = await getDataProviderStatus()
      setDataProviderStatus(dpStatus)
      setLoadingOffline(false)
    }
    load()
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    const result = await updateCurrentProfile({
      nome: nome.trim(),
      telefone: telefone.trim() || undefined,
      cargo: cargo.trim() || undefined,
      empresa: empresa.trim() || undefined,
    })
    setSaving(false)
    if (result.error) { toast(result.error, 'error'); return }
    toast('Perfil atualizado com sucesso', 'success')
  }

  const handleResetOfflineData = async () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja resetar todos os dados offline? Esta ação não pode ser desfeita.'
    )
    if (!confirmed) return
    await resetOfflineData()
    resetDataProviderInitialization()
    toast('Dados offline resetados. Recarregue a página.', 'info')
    window.location.reload()
  }

  const handleClearSyncQueue = async () => {
    await limparTodaFila()
    const [counts, syncStats] = await Promise.all([contarOffline(), getSyncQueueStats()])
    setOfflineCounts(counts)
    setSyncQueueStats(syncStats)
    setFailedItems([])
    toast('Fila de sincronização limpa.', 'success')
  }

  const handleClearSyncedOnly = async () => {
    await clearSyncedQueueItems()
    const [counts, syncStats] = await Promise.all([contarOffline(), getSyncQueueStats()])
    setOfflineCounts(counts)
    setSyncQueueStats(syncStats)
    toast('Itens sincronizados removidos da fila.', 'success')
  }

  const handleRetryAllFailed = async () => {
    const count = await retryAllFailedItems()
    const syncStats = await getSyncQueueStats()
    setSyncQueueStats(syncStats)
    setFailedItems([])
    toast(`${count} itens reenfileirados para sincronização.`, 'success')
    if (count > 0) {
      handleSyncNow()
    }
  }

  const handleRefreshOffline = async () => {
    setLoadingOffline(true)
    const [counts, syncStats, failed] = await Promise.all([contarOffline(), getSyncQueueStats(), listFailedSyncItems()])
    setOfflineCounts(counts)
    setSyncQueueStats(syncStats)
    setFailedItems(failed)
    setLoadingOffline(false)
    toast('Dados offline atualizados.', 'success')
  }

  const handleSyncNow = async () => {
    setSyncingNow(true)
    setSyncMessage('Sincronizando dados pendentes...')
    toast('Sincronizando dados pendentes...', 'info')
    const result = await syncNextBatch(10)
    const [stats, failed] = await Promise.all([getSyncQueueStats(), listFailedSyncItems()])
    setSyncQueueStats(stats)
    setFailedItems(failed)
    setSyncingNow(false)
    if (result.errors > 0) {
      setSyncMessage('Alguns itens não foram sincronizados. Verifique a lista de erros abaixo.')
      toast('Alguns itens não foram sincronizados.', 'error')
    } else if (result.synced > 0) {
      setSyncMessage('Empresas, setores, levantamentos e evidências sincronizados.')
      toast('Empresas, setores, levantamentos e evidências sincronizados.', 'success')
    } else {
      setSyncMessage('')
      toast('Nenhum dado pendente para sincronizar.', 'success')
    }
  }

  const supabaseStatus = isSupabaseConfigured ? 'Configurado' : 'Não configurado'
  const supabaseVariant: BadgeVariant = isSupabaseConfigured ? 'success' : 'danger'
  const authStatus = isAuthenticated ? 'Autenticado' : 'Não autenticado'

  const configCards = [
    { title: 'Notificações', icon: Bell, description: 'Alertas e lembretes do sistema', status: 'Em breve', variant: 'muted' as BadgeVariant },
    { title: 'Aparência', icon: Palette, description: 'Tema claro e escuro', status: 'Em breve', variant: 'muted' as BadgeVariant },
    { title: 'PWA', icon: Monitor, description: 'Aplicativo instalável', status: 'Pronto', variant: 'success' as BadgeVariant },
    { title: 'Evidências', icon: Image, description: 'Captura e upload de imagens', status: offlineStatus.available || isSupabaseConfigured ? 'Pronto' : 'Em breve', variant: (offlineStatus.available || isSupabaseConfigured ? 'success' : 'muted') as BadgeVariant },
  ]

  return (
    <>
      <Header title="Configurações" description="Preferências do sistema" />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title="Configurações"
            description="Gerencie suas preferências e conexões"
          />

          <FormSection
            title="Perfil"
            description="Suas informações pessoais"
            actions={
              <Button size="sm" onClick={handleSaveProfile} disabled={saving || profileLoading}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Salvar
              </Button>
            }
          >
            {profileLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-10 bg-gray-200 rounded-lg w-full" />
                <div className="h-10 bg-gray-200 rounded-lg w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                />
                <Input
                  label="E-mail"
                  value={user?.email ?? ''}
                  readOnly
                  disabled
                  hint="Gerenciado pela autenticação"
                />
                <Input
                  label="Telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
                <Input
                  label="Cargo"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Seu cargo"
                />
                <Input
                  label="Empresa"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Nome da empresa"
                />
              </div>
            )}
          </FormSection>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-text-secondary">
                  <Database size={20} />
                </div>
                <div className="flex-1">
                  <CardTitle>Status do Supabase</CardTitle>
                  <p className="text-body-small text-text-secondary mt-0.5">Conexão com banco de dados</p>
                </div>
                <Badge variant={supabaseVariant}>{supabaseStatus}</Badge>
              </div>
            </CardHeader>
            <div className="px-5 pb-5 space-y-2 text-body-small text-text-secondary">
              <div className="flex items-center gap-2">
                {isSupabaseConfigured ? <CheckCircle2 size={14} className="text-success shrink-0" /> : <XCircle size={14} className="text-danger shrink-0" />}
                <span>Supabase: <span className="font-medium">{supabaseStatus}</span></span>
              </div>
              <div className="flex items-center gap-2">
                {isAuthenticated ? <ShieldCheck size={14} className="text-success shrink-0" /> : <ShieldOff size={14} className="text-text-muted shrink-0" />}
                <span>Autenticação: <span className="font-medium">{authStatus}</span></span>
              </div>
              {user?.email && (
                <div className="flex items-center gap-2 pl-[22px]">
                  <Mail size={12} className="text-text-muted shrink-0" />
                  <span>{user.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                {env.enableMockMode ? <CheckCircle2 size={14} className="text-warning shrink-0" /> : <XCircle size={14} className="text-text-muted shrink-0" />}
                <span>Modo mock: <span className="font-medium">{env.enableMockMode ? 'Ativado' : 'Desativado'}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 shrink-0 text-center text-text-muted">~</span>
                <span>Ambiente: <span className="font-medium">{env.isDev ? 'Desenvolvimento' : 'Produção'}</span></span>
              </div>
            </div>
          </Card>

          {isMockModeEnabled && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                    <Beaker size={20} />
                  </div>
                  <div className="flex-1">
                    <CardTitle>Modo mock de desenvolvimento</CardTitle>
                    <p className="text-body-small text-text-secondary mt-0.5">Dados locais para teste</p>
                  </div>
                  <Badge variant="warning">Ativado</Badge>
                </div>
              </CardHeader>
              <div className="px-5 pb-5 space-y-3">
                <div className="bg-surface-muted rounded-lg p-3 text-body-medium space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Usuário mockado</span>
                    <span className="font-medium text-text-primary">{MOCK_USER_EMAIL}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Dados mockados</span>
                    <span className="font-medium text-text-primary">{hasMockData() ? 'Disponíveis' : 'Vazios'}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => { seedAllMockDataIfEmpty(); toast('Dados mockados restaurados!', 'success'); window.location.reload() }}
                  >
                    <RefreshCw size={14} /> Resetar dados mockados
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => { clearMockData(); toast('Dados mockados limpos!', 'success'); window.location.reload() }}
                  >
                    <Trash2 size={14} /> Limpar dados mockados
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      await logout()
                      window.location.href = '/login'
                    }}
                  >
                    <LogOut size={14} /> Sair da conta mockada
                  </Button>
                </div>
                    <p className="text-body-small text-text-muted">
                  Os dados mockados são armazenados apenas no navegador (localStorage) e não afetam o Supabase.
                </p>
              </div>
            </Card>
          )}

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
                        <span className="flex items-center gap-1 text-text-secondary">
                          <CloudOff size={14} />
                          Pendentes
                        </span>
                        <span className="font-medium">{syncQueueStats.pending}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-text-secondary">
                          Sincronizando
                        </span>
                        <span className="font-medium">{syncQueueStats.syncing}</span>
                      </div>
                      {syncQueueStats.error > 0 && (
                        <div className="flex items-center justify-between text-danger">
                          <span className="flex items-center gap-1 text-text-secondary">
                            Erros
                          </span>
                          <span className="font-medium">{syncQueueStats.error}</span>
                        </div>
                      )}
                      {syncQueueStats.conflict > 0 && (
                        <div className="flex items-center justify-between text-warning">
                          <span className="flex items-center gap-1 text-text-secondary">
                            Conflitos
                          </span>
                          <span className="font-medium">{syncQueueStats.conflict}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-text-secondary">
                          Sincronizados
                        </span>
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
                          <span className="font-medium text-label-medium">
                            <Badge variant="success">Ativa</Badge>
                          </span>
                        </div>
                        <p className="text-body-small text-text-muted mt-2">
                          Sincronização ativa para empresas, setores, levantamentos e evidências fotográficas.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={handleRefreshOffline}>
                      <RefreshCw size={14} /> Atualizar dados locais
                    </Button>
                    {isSupabaseConfigured && (
                      <Button size="sm" variant="primary" onClick={handleSyncNow} disabled={syncingNow || syncQueueStats.pending + syncQueueStats.error + syncQueueStats.conflict === 0}>
                        {syncingNow ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {syncingNow ? 'Sincronizando...' : 'Sincronizar agora'}
                      </Button>
                    )}
                    {syncQueueStats.error + syncQueueStats.conflict > 0 && (
                      <Button size="sm" variant="secondary" onClick={handleRetryAllFailed}>
                        <RotateCcw size={14} className="text-warning" /> Tentar novamente ({syncQueueStats.error + syncQueueStats.conflict})
                      </Button>
                    )}
                    {syncQueueStats.synced > 0 && (
                      <Button size="sm" variant="secondary" onClick={handleClearSyncedOnly}>
                        <Trash2 size={14} /> Limpar sincronizados ({syncQueueStats.synced})
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={handleClearSyncQueue}>
                      <Trash2 size={14} /> Limpar fila inteira
                    </Button>
                    <Button size="sm" variant="danger" onClick={handleResetOfflineData}>
                      <Trash2 size={14} /> Resetar dados offline
                    </Button>
                  </div>
                  {syncMessage && (
                    <p className="text-body-small text-text-secondary">{syncMessage}</p>
                  )}
                  {failedItems.length > 0 && (
                    <div className="bg-danger/5 border border-danger/20 rounded-lg p-3 space-y-2">
                      <p className="text-label-medium font-medium text-danger flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Itens com erro ({failedItems.length})
                      </p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {failedItems.map(item => (
                          <div key={item.id} className="text-body-small text-text-secondary flex items-start gap-2">
                            <AlertCircle size={10} className="shrink-0 mt-0.5 text-danger" />
                            <span className="flex-1 break-words">
                              <strong>{item.entity}:</strong> {item.last_error ?? 'Erro desconhecido'}
                              <span className="text-text-muted"> (tentativas: {item.attempts})</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                <p className="text-body-small text-text-muted">
                    Os dados offline são armazenados no IndexedDB do navegador e persistem mesmo após fechar o navegador.
                  </p>
                </>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {configCards.map((section) => {
              const Icon = section.icon
              return (
                <Card key={section.title}>
                  <CardHeader>
                    <div className="flex items-center justify-between w-full">
                      <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-text-secondary">
                        <Icon size={20} />
                      </div>
                      <Badge variant={section.variant}>{section.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  <p className="text-body-small text-text-secondary mt-1">{section.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </MainContainer>
    </>
  )
}
