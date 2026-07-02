# AUDITORIA OFFLINE FIRST — RISCO360

## 1. ARQUITETURA

```
Service Layer → try Supabase → fail → IndexedDB
                    ↓
            Cache local (read)
                    ↓
            Sync Queue → processSyncQueue() → Supabase
```

---

## 2. INDEXEDDB SCHEMA

**Arquivo:** `src/lib/offline-db.ts`

| Store | Key Path | Índices |
|---|---|---|
| `metadata` | `key` | (none) |
| `empresas` | `id` | `remote_id` (unique), `sync_status`, `source` |
| `setores` | `id` | `remote_id`, `empresa_id`, `sync_status`, `source` |
| `levantamentos` | `id` | `remote_id`, `setor_id`, `empresa_id`, `sync_status`, `status`, `source` |
| `biblioteca_tecnica` | `id` | `sync_status`, `source` |
| `relatorios` | `id` | `levantamento_id`, `sync_status`, `source` |
| `evidencias` | `id` | `levantamento_id`, `setor_id`, `sync_status` |
| `evidencia_blobs` | `id` | `created_at` |
| `sync_queue` | `id` | `entity`, `status`, `created_at` |
| `user_preferences` | `key` | (none) |

**Versão:** 2 (hardcoded, sem migrations destrutivas)

---

## 3. SYNC QUEUE

**Arquivo:** `src/services/offline/sync-queue.service.ts`

### 3.1 Estrutura do Item

```typescript
interface SyncQueueItem {
  id: string
  entity: SyncEntity  // 'empresa' | 'setor' | 'levantamento' | 'biblioteca_tecnica' | 'relatorio' | 'evidencia'
  entity_id: string
  operation: 'create' | 'update' | 'delete'
  payload: unknown
  status: 'pending' | 'syncing' | 'synced' | 'error' | 'conflict'
  attempts: number
  last_error: string | null
  created_at: string
  updated_at: string
}
```

### 3.2 Ordem de Prioridade

1. empresa (1)
2. setor (2)
3. biblioteca_tecnica (3)
4. levantamento (4)
5. evidencia (5)
6. relatorio (6)

### 3.3 Dependências

```typescript
const SYNC_ENTITY_DEPENDENCIES = {
  setor: ['empresa'],
  levantamento: ['empresa', 'setor'],
  evidencia: ['levantamento'],
  relatorio: ['levantamento'],
}
```

**Bom:** Dependências bem modeladas. ✅

### 3.4 Concorrência

```typescript
let syncInProgress = false  // syncNextBatch
let processingQueue = false  // processSyncQueue
```

**Problema:** Flags diferentes para operações relacionadas. `syncNextBatch` pode executar durante `processSyncQueue`. Risco: **Médio**.

---

## 4. PROBLEMAS CRÍTICOS ENCONTRADOS

### C1. Itens 'syncing' Presos Após Refresh

**Arquivo:** `sync-queue.service.ts:37-48`

```typescript
async function listPendingSyncItems(): Promise<SyncQueueItem[]> {
  const pending = await index.getAll('pending')
  const error = await index.getAll('error')
  return [...pending, ...error]
}
```

Itens com `status: 'syncing'` NÃO são recuperados. Se o usuário der refresh durante um sync, esses itens ficam invisíveis para sempre.

**Impacto:** Dados nunca sincronizados. **CRÍTICO**

**Solução:** Resetar `'syncing'` para `'pending'` no startup. Esforço: 30 min.

---

### C2. Sem Reconciliação de Conflitos

**Arquivo:** `sync.service.ts:180-206`

```typescript
const { data, error } = await client
  .from('empresas')
  .update(updatePayload)  // ALL fields, no diff
  .eq('id', local.remote_id)
```

O **último dispositivo a sincronizar sempre vence**. Não há:
- Comparação de timestamps
- Merge field-level
- UI de resolução de conflitos
- Server-side conflict detection

**Impacto:** Dados sobrescritos silenciosamente em ambiente multi-dispositivo. **CRÍTICO**

**Solução:** Adicionar `updated_at` server-side, comparar antes do update, criar mecanismo de resolução. Esforço: 2-3 semanas.

---

### C3. Quota Excedida — Sem Tratamento

Nenhum tratamento de `QuotaExceededError` em toda a codebase. Fotos armazenadas como Blob em `evidencia_blobs` sem compressão prévia.

**Cenário de falha:**
1. `salvarEvidenciaOffline` escreve em `evidencias` (sucesso)
2. `salvarBlobOffline` falha por quota (erro)
3. Registro de evidência existe sem blob referenciado

**Impacto:** Dados órfãos. **ALTO**

**Solução:** Monitorar uso de quota, comprimir antes de armazenar, limpar blobs órfãos automaticamente. Esforço: 1 semana.

---

## 5. CENÁRIOS SIMULADOS

### Cenário 1: Offline por 30 dias

| Aspecto | Resultado |
|---|---|
| Perda de dados? | ❌ Não |
| Corrupção? | ❌ Não |
| Sync completo? | ⚠️ Sim, mas lento (10 itens por vez, sem priorização) |
| Risco de memória? | ⚠️ `listPendingSyncItems()` carrega TUDO em memória |
| Fotos acumuladas? | ⚠️ Podem exceder quota do IndexedDB |

### Cenário 2: Queda durante sync

| Aspecto | Resultado |
|---|---|
| Itens synced? | ✅ Marcados corretamente |
| Itens pending? | ✅ Retentados |
| Itens syncing? | **❌ PRESOS — invisíveis ao sistema** |
| Recovery automático? | ❌ Não |

### Cenário 3: Dois dispositivos concorrentes

| Aspecto | Resultado |
|---|---|
| Dispositivo A cria, B cria duplicata | ⚠️ Detectado por CNPJ/nome, link existente |
| Dispositivo A edita, B edita mesmo registro | **❌ LAST-WRITER-WINS — sem merge** |
| Dispositivo A deleta, B edita | ✅ Conflito detectado (data=null) |
| Dispositivo A edita, B deleta | **❌ Edição de A é perdida** |

### Cenário 4: Upload de evidência interrompido

| Aspecto | Resultado |
|---|---|
| Drop durante upload blob | ✅ Blob preservado, retry possível |
| Drop após upload, antes de metadata insert | ❌ **Orphan storage** — arquivo sem registro |
| Drop após metadata insert, antes de local update | ❌ **Impossible retry** — insert duplicado |

### Cenário 5: Cache do navegador limpo

| Aspecto | Resultado |
|---|---|
| Dados não sincronizados? | **❌ PERDA TOTAL** |
| Dados sincronizados? | ✅ Recuperáveis do Supabase |
| IDs locais não mapeados? | ❌ Perda de referência |
| Blobs de evidência? | ❌ Perda se não enviados |

---

## 6. PONTOS FORTES

1. **Ordem de dependências** correta (empresa → setor → levantamento → evidencia)
2. **Cache-on-read** — toda leitura do Supabase é cacheadada localmente
3. **Detecção de duplicatas** por CNPJ/nome no create
4. **Cascade delete offline** — marca filhos como deletados
5. **Blobs órfãos** têm função de limpeza (`limparBlobsOrfaos`)
6. **Testes** — 7 arquivos de teste para o offline (sync-queue, offline-*)
7. **`wasOfflineRef`** — detecta transição offline→online para trigger automático de sync

---

## 7. SCORE OFFLINE FIRST: 70 / 100

| Critério | Nota | Justificativa |
|---|---|---|
| Storage (IndexedDB) | 8/10 | Schema bem definido, mas sem índice em `deleted` |
| Sync Queue | 7/10 | Dependências corretas, mas sem paginação ou batch |
| Conflitos | 3/10 | Sem reconciliação real — last-writer-wins |
| Recovery | 4/10 | Itens syncing presos, sem startup recovery |
| Quota Management | 2/10 | Nenhum tratamento |
| Testes | 8/10 | Boa cobertura |

---

## 8. RECOMENDAÇÕES

### Imediato (1-2 dias)
1. Resetar `'syncing'` para `'pending'` no startup (`sync-queue.service.ts`)
2. Adicionar `URL.revokeObjectURL` nas rotas de erro (`real-evidencias.service.ts`)
3. Corrigir `preserveExif: false` + `maxSizeMB: 3` em `image-compression.ts`

### Curto Prazo (1-2 semanas)
4. Adicionar `updated_at` server-side check antes de update (conflict detection)
5. Adicionar `index.count()` em vez de `getAll()` no `getSyncQueueStats`
6. Criar UI de resolução de conflitos (what você quer manter: local ou servidor?)
7. Adicionar tratamento de `QuotaExceededError` com feedback ao usuário

### Médio Prazo (2-4 semanas)
8. Implementar field-level merge com last-writer-wins + server timestamp
9. Adicionar notificações push para sync concluído
10. Adicionar compressão de blob antes de armazenar em IndexedDB
11. Batch writes em cascade delete (transaction única)
