# Auditoria da Sincronização Offline — RISCO360

## Fluxograma Atual

```
Usuário cria/altera dado
        │
        ▼
  Tenta Supabase primeiro
        │
        ├── Sucesso → retorna
        │
        └── Falha (rede) → escreve local + enfileira
                │
                ▼
        IndexedDB (offline store)
        sync_queue: status='pending'
                │
                ▼
        Auto-sync (on reconnect)
        Ou manual (botão)
                │
                ▼
        processSyncQueue()
        syncNextBatch(batchSize)
                │
                ▼
        sortSyncQueue() → respeita dependências
        canSyncItem() → verifica pais sincronizados
                │
                ▼
        processSyncItem()
                │
                ├── marca 'syncing'
                ├── roteia por entidade
                │   ├── empresa → syncEmpresa()
                │   ├── setor → syncSetor()
                │   ├── levantamento → syncLevantamento()
                │   ├── evidencia → syncEvidencia()
                │   └── relatorio → syncRelatorio()
                │
                ├── sucesso → marca 'synced'
                ├── erro de rede → marca 'error' + incrementa attempts
                ├── conflito (registro removido remoto) → marca 'conflict'
                └── excede MAX_ATTEMPTS (5) → marca 'error' definitivo
                        │
                        ▼
        clearSyncedQueueItems() → remove 'synced' da fila
```

## Estados Possíveis

| Status     | Significado                                  | Transições                                    |
|------------|----------------------------------------------|-----------------------------------------------|
| `pending`  | Aguardando sincronização                     | → `syncing` (processSyncItem)                 |
| `syncing`  | Em processamento no momento                  | → `synced` / `error` / `conflict`             |
| `synced`   | Sincronizado com sucesso                     | → removido (clearSyncedQueueItems)            |
| `error`    | Falha na sincronização (re-tentável)         | → `pending` (retrySyncItem)                   |
| `conflict` | Registro remoto não encontrado               | → `pending` (retrySyncItem)                   |

## Pontos de Falha

1. **Token de autenticação expirado** durante sincronização → erro não tratado como rede, cai em `error`
2. **Dependência não resolvida** (ex: setor sem empresa pai sincronizada) → erro, mas deveria pular (já faz `canSyncItem` mas só marca erro)
3. **MAX_ATTEMPTS (5)** sem limite de tempo → itens podem ficar presos em `error` para sempre
4. **Conflito sem resolução automática** → `conflict` requer ação manual (`retrySyncItem`)
5. **Evidência com blob corrompido** → falha no upload Storage, erro sem fallback
6. **Mutex simples** (`syncInProgress` booleano) → não protege contra concorrência em abas simultâneas
7. **Sem log de auditoria** → impossível rastrear histórico de tentativas
8. **Sem timeout por item** → um item travado bloqueia o lote

## Entidades Suportadas

| Entidade             | Operações       | Depende de              | Store IndexedDB    |
|----------------------|-----------------|-------------------------|--------------------|
| `empresa`            | C, U, D         | (nenhuma)               | `empresas`         |
| `setor`              | C, U, D         | `empresa`               | `setores`          |
| `levantamento`       | C, U, D         | `empresa`, `setor`      | `levantamentos`    |
| `evidencia`          | C, U, D         | `levantamento`          | `evidencias`       |
| `relatorio`          | C, U, D         | `levantamento`          | `relatorios`       |
| `biblioteca_tecnica` | (não sincroniza)| N/A                     | `biblioteca_tecnica`|

## Dependências

- `sync.service.ts` → `sync-queue.service.ts` (CRUD fila)
- `sync.service.ts` → `sync-helpers.ts` (ordenação, dependências)
- `sync.service.ts` → `offline-db.ts` (acesso IndexedDB)
- `sync.service.ts` → `base.service.ts` (cliente Supabase)
- `useSyncQueue.ts` → `sync.service.ts` (eventos + processamento)
- `OfflineBanner.tsx` → `sync-queue.service.ts` (contagem pendente)
- `DashboardPage.tsx` → `useDashboardData.ts` → `sync-queue.service.ts` (pendingSync)

## Prioridades

1. **empresa** (priority=1)
2. **setor** (priority=2)
3. **biblioteca_tecnica** (priority=3)
4. **levantamento** (priority=4)
5. **evidencia** (priority=5)
6. **relatorio** (priority=6)

## Estrutura de Arquivos

```
src/
  services/
    sync.service.ts              ← Orquestrador principal (856 linhas)
    offline/
      sync-queue.service.ts      ← CRUD da fila (184 linhas)
      sync-helpers.ts            ← Ordenação + dependências (60 linhas)
      offline-storage.service.ts ← Utilidades offline (129 linhas)
  hooks/
    useSyncQueue.ts              ← Hook reativo com auto-sync (82 linhas)
    useOnlineStatus.ts           ← Hook de conectividade (35 linhas)
  lib/
    offline-db.ts                ← Schema IndexedDB + acesso (203 linhas)
    local-id.ts                  ← Geração de IDs locais (16 linhas)
    network.ts                   ← Detecção de erro de rede (28 linhas)
  types/
    sync.ts                      ← Tipos compartilhados (52 linhas)
  components/
    ui/
      OfflineBanner.tsx          ← Banner com contagem pendente
```

## Observações

- `processSyncQueue()` faz até 20 iterações de `syncNextBatch(5)` = 100 itens máx por execução
- `clearSyncedQueueItems()` é chamado apenas ao final de `processSyncQueue()`, não após cada `syncNextBatch()`
- Eventos de progresso disparam `notifyListeners()` com `SyncEvent` (start/progress/success/error/complete)
- `getSyncQueueStats()` lê TODOS os itens da fila e conta por status — sem paginação, escala O(n)
