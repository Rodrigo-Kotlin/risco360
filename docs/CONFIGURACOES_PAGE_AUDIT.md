# Auditoria: ConfiguracoesPage.tsx

**Arquivo:** `src/pages/ConfiguracoesPage.tsx`
**Linhas:** 565
**Última modificação:** FASE 5.3

---

## Responsabilidades atuais

1. **Exibição de layout** (PageHeader, Header, MainContainer)
2. **Gerenciamento de perfil do usuário** — carregar dados, editar nome/telefone/cargo/empresa, salvar
3. **Status de conexão Supabase** — exibir configurado/não configurado, autenticado/não
4. **Modo mock** — exibir/gerenciar dados mockados, seed, limpar, logout
5. **Dados offline (IndexedDB)** — exibir contagens por entidade, status do banco, migração, fonte de dados
6. **Fila de sincronização** — exibir pendentes/sincronizando/erros/conflitos/sincronizados
7. **Ações de sincronização** — sincronizar agora, tentar novamente, limpar sincronizados, limpar fila, resetar dados offline
8. **Itens com erro** — listar itens com falha na sincronização
9. **Cartões administrativos** — Notificações, Aparência, PWA, Evidências

## Hook `useAuth()` — consumido

- `user`, `isAuthenticated`, `logout`

## Hook `useToast()` — consumido

- `toast`

## Serviços consumidos

| Serviço | Funções |
|---|---|
| `profile.service` | `getCurrentProfile`, `updateCurrentProfile` |
| `mock-storage.service` | `hasMockData`, `clearMockData`, `seedAllMockDataIfEmpty` |
| `offline/offline-storage.service` | `contarOffline`, `getOfflineStatus`, `resetOfflineData` |
| `offline/sync-queue.service` | `limparTodaFila`, `getSyncQueueStats`, `clearSyncedQueueItems`, `retryAllFailedItems`, `listFailedSyncItems` |
| `data-provider` | `getDataProviderStatus`, `resetDataProviderInitialization` |
| `sync.service` | `syncNextBatch` |
| `lib/migration` | `isMockMigrated` |

## Utilitários/lib

- `isSupabaseConfigured` (lib/supabase)
- `isMockModeEnabled`, `MOCK_USER_EMAIL` (lib/mock-mode)
- `env` (lib/env)

## Estados locais (useState)

| Estado | Tipo | Finalidade |
|---|---|---|
| `profileLoading` | `boolean` | Loading do perfil |
| `saving` | `boolean` | Salvando perfil |
| `nome` | `string` | Campo do formulário |
| `telefone` | `string` | Campo do formulário |
| `cargo` | `string` | Campo do formulário |
| `empresa` | `string` | Campo do formulário |
| `offlineCounts` | `object` | Contagens de dados offline por entidade |
| `offlineStatus` | `object` | Status do IndexedDB |
| `migrated` | `boolean` | Migração mock concluída |
| `dataProviderStatus` | `object` | Status do data provider |
| `syncQueueStats` | `object` | Estatísticas da fila de sincronização |
| `syncingNow` | `boolean` | Sincronizando no momento |
| `syncMessage` | `string` | Mensagem de feedback da sincronização |
| `loadingOffline` | `boolean` | Loading dos dados offline |
| `failedItems` | `SyncQueueItem[]` | Itens com erro na fila |

## Efeitos colaterais (useEffect)

1. Carregar perfil quando `isAuthenticated` muda
2. Carregar dados offline/sync/migração/data provider na montagem

## Handlers

| Handler | Ação |
|---|---|
| `handleSaveProfile` | Valida e salva perfil via `updateCurrentProfile` |
| `handleResetOfflineData` | Confirmação → `resetOfflineData` → `resetDataProviderInitialization` → reload |
| `handleClearSyncQueue` | `limparTodaFila` → recarrega contagens |
| `handleClearSyncedOnly` | `clearSyncedQueueItems` → recarrega contagens |
| `handleRetryAllFailed` | `retryAllFailedItems` → recarrega stats → `handleSyncNow` |
| `handleRefreshOffline` | Recarrega contagens + stats + failed |
| `handleSyncNow` | `syncNextBatch` → recarrega stats + failed → toast |

## Agrupamentos naturais

### Grupo A — Perfil (linhas 33-36, 47-62, 88-99, 192-242)
- Estados: `profileLoading`, `saving`, `nome`, `telefone`, `cargo`, `empresa`
- Serviços: `getCurrentProfile`, `updateCurrentProfile`
- UI: `FormSection` com `Input`s + botão Salvar

### Grupo B — Status Conexão (linhas 171-173, 244-339)
- Estados: nenhum (derivado de `useAuth`, `isSupabaseConfigured`, `env`, `isMockModeEnabled`)
- UI: Card Supabase + Card Modo Mock

### Grupo C — Dados Offline + Sincronização (linhas 38-46, 64-86, 101-169, 341-540)
- Estados: `offlineCounts`, `offlineStatus`, `migrated`, `dataProviderStatus`, `syncQueueStats`, `syncingNow`, `syncMessage`, `loadingOffline`, `failedItems`
- Serviços: todos os offline/sync/data-provider/migration
- UI: Card Dados Offline (contagens + fila + ações + erros)

### Grupo D — Ferramentas Administrativas (linhas 175-180, 542-560)
- Estados: nenhum (derivado)
- UI: Grid de cards (Notificações, Aparência, PWA, Evidências)

---

## Plano de extração

### Hooks
- `useProfileData` → encapsula Grupo A
- `useSyncDiagnostics` → encapsula Grupo C

### Componentes
- `PerfilSection` → UI do Grupo A
- `StatusConexaoSection` → UI do Grupo B
- `DadosOfflineSection` → UI do Grupo C (composição)
- `SincronizacaoSection` → sub-UI de ações de sync dentro do Grupo C
- `FerramentasAdministrativasSection` → UI do Grupo D

### Meta
- `ConfiguracoesPage.tsx` → ~100-150 linhas (apenas orquestração)
