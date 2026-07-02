import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useProfileData } from '@/hooks/configuracoes/useProfileData'
import { useSyncDiagnostics } from '@/hooks/configuracoes/useSyncDiagnostics'
import { PageHeader } from '@/components/ui/PageHeader'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { PerfilSection } from '@/components/configuracoes/PerfilSection'
import { StatusConexaoSection } from '@/components/configuracoes/StatusConexaoSection'
import { DadosOfflineSection } from '@/components/configuracoes/DadosOfflineSection'
import { FerramentasAdministrativasSection } from '@/components/configuracoes/FerramentasAdministrativasSection'
import { Card, CardTitle, CardHeader } from '@/components/ui/Card'
import { isSupabaseConfigured } from '@/lib/supabase'
import { isMockModeEnabled, MOCK_USER_EMAIL } from '@/lib/mock-mode'
import { env } from '@/lib/env'
import { hasMockData, seedAllMockDataIfEmpty, clearMockData } from '@/services/mock-storage.service'

export default function ConfiguracoesPage() {
  const { isAuthenticated, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const profile = useProfileData()
  const diag = useSyncDiagnostics()

  const supabaseStatus = isSupabaseConfigured ? 'Configurado' : 'Não configurado'
  const supabaseVariant = isSupabaseConfigured ? 'success' : 'danger'
  const authStatus = isAuthenticated ? 'Autenticado' : 'Não autenticado'

  return (
    <>
      <Header title="Configurações" description="Preferências do sistema" />
      <MainContainer>
        <div className="space-y-6">
          <PageHeader
            title="Configurações"
            description="Gerencie suas preferências e conexões"
          />

          <PerfilSection
            nome={profile.nome}
            telefone={profile.telefone}
            cargo={profile.cargo}
            empresa={profile.empresa}
            userEmail={profile.user?.email}
            profileLoading={profile.profileLoading}
            saving={profile.saving}
            onNomeChange={profile.setNome}
            onTelefoneChange={profile.setTelefone}
            onCargoChange={profile.setCargo}
            onEmpresaChange={profile.setEmpresa}
            onSave={profile.handleSaveProfile}
          />

          <StatusConexaoSection
            isSupabaseConfigured={isSupabaseConfigured}
            supabaseStatus={supabaseStatus}
            supabaseVariant={supabaseVariant}
            isAuthenticated={isAuthenticated}
            authStatus={authStatus}
            userEmail={profile.user?.email}
            envEnableMockMode={env.enableMockMode}
            envIsDev={env.isDev}
            isMockModeEnabled={isMockModeEnabled}
            hasMockData={hasMockData()}
            mockUserEmail={MOCK_USER_EMAIL}
            onSeedMock={() => { seedAllMockDataIfEmpty(); window.location.reload() }}
            onClearMock={() => { clearMockData(); window.location.reload() }}
            onMockLogout={async () => { await logout(); window.location.href = '/login' }}
          />

          <DadosOfflineSection
            offlineCounts={diag.offlineCounts}
            offlineStatus={diag.offlineStatus}
            migrated={diag.migrated}
            dataProviderStatus={diag.dataProviderStatus}
            syncQueueStats={diag.syncQueueStats}
            syncingNow={diag.syncingNow}
            syncMessage={diag.syncMessage}
            failedItems={diag.failedItems}
            loadingOffline={diag.loadingOffline}
            isSupabaseConfigured={isSupabaseConfigured}
            onSyncNow={diag.handleSyncNow}
            onRetryFailed={diag.handleRetryAllFailed}
            onClearSynced={diag.handleClearSyncedOnly}
            onClearQueue={diag.handleClearSyncQueue}
            onResetOffline={diag.handleResetOfflineData}
            onRefresh={diag.handleRefreshOffline}
          />

          <FerramentasAdministrativasSection
            offlineAvailable={diag.offlineStatus.available}
          />

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                </div>
                <div className="flex-1">
                  <CardTitle>Aparência</CardTitle>
                  <p className="text-body-small text-text-secondary mt-0.5">Personalize o tema do sistema</p>
                </div>
              </div>
            </CardHeader>
            <div className="px-5 pb-5">
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 px-4 py-2 rounded-lg text-body-medium font-medium transition-colors ${
                      theme === t
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'bg-surface-alt text-text-secondary hover:bg-surface-muted'
                    }`}
                  >
                    {t === 'light' ? 'Claro' : t === 'dark' ? 'Escuro' : 'Sistema'}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </MainContainer>
    </>
  )
}
