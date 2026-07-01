import { Card, CardTitle, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, XCircle, ShieldCheck, ShieldOff, Mail, Beaker, RefreshCw, Trash2, LogOut, Database } from 'lucide-react'
import type { BadgeVariant } from '@/types/ui'

interface StatusConexaoSectionProps {
  isSupabaseConfigured: boolean
  supabaseStatus: string
  supabaseVariant: BadgeVariant
  isAuthenticated: boolean
  authStatus: string
  userEmail?: string
  envEnableMockMode: boolean
  envIsDev: boolean
  isMockModeEnabled: boolean
  hasMockData: boolean
  mockUserEmail: string
  onSeedMock: () => void
  onClearMock: () => void
  onMockLogout: () => void
}

export function StatusConexaoSection({
  isSupabaseConfigured,
  supabaseStatus,
  supabaseVariant,
  isAuthenticated,
  authStatus,
  userEmail,
  envEnableMockMode,
  envIsDev,
  isMockModeEnabled,
  hasMockData,
  mockUserEmail,
  onSeedMock,
  onClearMock,
  onMockLogout,
}: StatusConexaoSectionProps) {
  return (
    <>
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
          {userEmail && (
            <div className="flex items-center gap-2 pl-[22px]">
              <Mail size={12} className="text-text-muted shrink-0" />
              <span>{userEmail}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {envEnableMockMode ? <CheckCircle2 size={14} className="text-warning shrink-0" /> : <XCircle size={14} className="text-text-muted shrink-0" />}
            <span>Modo mock: <span className="font-medium">{envEnableMockMode ? 'Ativado' : 'Desativado'}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 shrink-0 text-center text-text-muted">~</span>
            <span>Ambiente: <span className="font-medium">{envIsDev ? 'Desenvolvimento' : 'Produção'}</span></span>
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
                <span className="font-medium text-text-primary">{mockUserEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Dados mockados</span>
                <span className="font-medium text-text-primary">{hasMockData ? 'Disponíveis' : 'Vazios'}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={onSeedMock}>
                <RefreshCw size={14} /> Resetar dados mockados
              </Button>
              <Button size="sm" variant="secondary" onClick={onClearMock}>
                <Trash2 size={14} /> Limpar dados mockados
              </Button>
              <Button size="sm" variant="danger" onClick={onMockLogout}>
                <LogOut size={14} /> Sair da conta mockada
              </Button>
            </div>
            <p className="text-body-small text-text-muted">
              Os dados mockados são armazenados apenas no navegador (localStorage) e não afetam o Supabase.
            </p>
          </div>
        </Card>
      )}
    </>
  )
}
