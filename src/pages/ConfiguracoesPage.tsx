import { useAuth } from '@/hooks/useAuth'
import { useProfileData } from '@/hooks/configuracoes/useProfileData'
import { useSyncDiagnostics } from '@/hooks/configuracoes/useSyncDiagnostics'
import { PageHeader } from '@/components/ui/PageHeader'
import { Header } from '@/components/layout/Header'
import { MainContainer } from '@/components/layout/MainContainer'
import { PerfilSection } from '@/components/configuracoes/PerfilSection'
import { StatusConexaoSection } from '@/components/configuracoes/StatusConexaoSection'
import { DadosOfflineSection } from '@/components/configuracoes/DadosOfflineSection'
import { FerramentasAdministrativasSection } from '@/components/configuracoes/FerramentasAdministrativasSection'
import { isSupabaseConfigured } from '@/lib/supabase'
import { isMockModeEnabled, MOCK_USER_EMAIL } from '@/lib/mock-mode'
import { env } from '@/lib/env'
import { hasMockData, seedAllMockDataIfEmpty, clearMockData } from '@/services/mock-storage.service'

export default function ConfiguracoesPage() {
  const { isAuthenticated, logout } = useAuth()
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
        </div>
      </MainContainer>
    </>
  )
}
