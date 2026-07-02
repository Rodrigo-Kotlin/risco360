# AUDITORIA BACKEND — RISCO360

## 1. SUPABASE CONFIGURATION

| Configuração | Valor | Status |
|---|---|---|
| Project URL | `awhkoftkncsqplfmpzph.supabase.co` | ✅ |
| Região | South America | ✅ |
| SDK | `@supabase/supabase-js` ^2.49.0 | ✅ |
| `persistSession` | `true` | ✅ |
| `autoRefreshToken` | `true` | ✅ |
| Singleton | `getSupabaseClient()` | ✅ |

**Segurança da chave:** `env.ts` valida que a chave anon não é `service_role` nem `sb_secret_*`.

---

## 2. ESQUEMA DO BANCO DE DADOS

### 2.1 Tabelas (8 + storage)

| Tabela | Colunas | Chave Estrangeira | Soft Delete | RLS |
|---|---|---|---|---|
| `profiles` | 9 | auth.users(id) CASCADE | ❌ | ✅ (2 policies) |
| `empresas` | 22 | auth.users(id) CASCADE | ✅ | ✅ (4 policies) |
| `setores` | 11 | empresas(id) CASCADE, auth.users(id) | ✅ | ✅ (4 policies) |
| `cargos` | 8 | empresas(id), setores(id) SET NULL | ❌ | ✅ (4 policies) |
| `levantamentos` | 46 | empresas(id) SET NULL, setores(id) SET NULL | ✅ | ✅ (4 policies) |
| `biblioteca_tecnica` | 27 | auth.users(id) CASCADE | ✅ | ✅ (4 policies, pública) |
| `relatorios` | 17 | levantamentos(id) CASCADE, empresas(id) | ✅ | ✅ (4 policies) |
| `evidencias` | 16 | auth.users(id), empresas, setores, levantamentos | ✅ | ✅ (4 policies) |
| `sync_log` | 10 | auth.users(id) | ❌ | ✅ (4 policies) |

**Total: 19 foreign keys, 38 RLS policies, 10 triggers**

### 2.2 Storage Buckets

| Bucket | Público | Policies |
|---|---|---|
| `evidencias` | ❌ | 4 (select/insert/update/delete por pasta do usuário) |

---

## 3. MIGRAÇÕES

| Migração | Linhas | Conteúdo |
|---|---|---|
| `001_initial_schema.sql` | 480 | Extensões, funções, 7 tabelas, RLS, índices, triggers |
| `0002_risco360_schema_consolidado.sql` | 617 | Soft delete, sync fields, evidencias, sync_log, storage |
| `0003_empresa_cnae_nr4.sql` | 62 | CNAE fields + grau_risco_nr4 |
| `0004_optimization_indexes.sql` | 68 | 8 índices compostos |

### 3.1 Funções PL/pgSQL

| Função | Tipo | Propósito |
|---|---|---|
| `set_updated_at()` | TRIGGER | Atualiza `updated_at` em BEFORE UPDATE |
| `handle_new_user()` | TRIGGER (AFTER INSERT auth.users) | Cria profile automaticamente |

---

## 4. ÍNDICES

### 4.1 Índices Simples (22)

| Tabela | Índices |
|---|---|
| `profiles` | email |
| `empresas` | user_id, cnpj, razao_social, deleted_at, cnae_principal, grau_risco_nr4 |
| `setores` | user_id, empresa_id, deleted_at |
| `cargos` | user_id, empresa_id, setor_id |
| `levantamentos` | user_id, empresa_id, setor_id, tipo, status, codigo, local_id, sync_status, deleted_at |
| `biblioteca_tecnica` | user_id, categoria, tipo_risco, deleted_at |
| `relatorios` | user_id, levantamento_id, empresa_id, deleted_at |
| `evidencias` | user_id, empresa_id, setor_id, levantamento_id, storage_path, sync_status, deleted_at |
| `sync_log` | user_id, entidade, local_id, status, created_at |

### 4.2 Índices Compostos (8, migração 0004)

| Índice | Query Coberta |
|---|---|
| `idx_empresas_deleted_at_created_at` | `listarEmpresas()` |
| `idx_setores_deleted_at_nome` | `listarSetores()` |
| `idx_setores_empresa_deleted_at_nome` | `listarSetoresPorEmpresa()` |
| `idx_levantamentos_deleted_at_updated_at` | `listarLevantamentos()` |
| `idx_levantamentos_empresa_deleted_at_updated_at` | `buscarLevantamentosPorEmpresa()` |
| `idx_levantamentos_status_deleted_at_updated_at` | `buscarLevantamentosPorStatus()` |
| `idx_relatorios_deleted_at_created_at` | `listarRelatorios()` |
| `idx_relatorios_levantamento_deleted_at_created_at` | `listarRelatoriosPorLevantamento()` |

### 4.3 Índice Único Parcial

```sql
CREATE UNIQUE INDEX levantamentos_setor_tipo_ativo_unique
  ON levantamentos(setor_id, tipo)
  WHERE deleted_at IS NULL AND status IN ('rascunho', 'em_andamento')
```

### 4.4 Índices Faltantes

| Tabela | Coluna | Impacto |
|---|---|---|
| `biblioteca_tecnica` | `publico` (usado em RLS `WHERE publico = true OR user_id = auth.uid()`) | **Alto** — full scan na RLS |
| `sync_queue` (IndexedDB) | `deleted` | Médio — filtragem em JS |

---

## 5. QUERIES — ANÁLISE

### 5.1 SELECT * — Todas as 48 queries

**Problema crítico:** 100% das queries usam `.select('*')`, incluindo `levantamentos` que tem 46 colunas com JSONB grandes.

| Arquivo | Ocorrências | Impacto |
|---|---|---|
| `real-levantamentos.service.ts` | 10 | **Alto** — cada listagem traz riscos, medicoes, etc |
| `real-biblioteca-tecnica.service.ts` | 9 | **Alto** — medidas_controle, epis, treinamentos em JSONB |
| `sync.service.ts` | 13 | **Médio** — operações internas |
| `real-empresas.service.ts` | 4 | **Médio** |
| `real-setores.service.ts` | 4 | **Médio** |
| `real-relatorios.service.ts` | 5 | **Médio** |
| `real-profile.service.ts` | 2 | **Baixo** |
| `reconciliacao.service.ts` | 1 | **Baixo** |

### 5.2 Paginação

| Endpoint | Paginação | Risco |
|---|---|---|
| `listarEmpresas()` | ✅ `.range()` | ✅ |
| `listarSetores()` | ✅ `.range()` | ✅ |
| `listarLevantamentos()` | ✅ `.range()` | ✅ |
| `listarRelatorios()` | ✅ `.range()` | ✅ |
| `buscarEmpresasPorTermo()` | ❌ | **Médio** |
| `pesquisarBibliotecaTecnica()` | ❌ | **Alto** — sem limite |
| `buscarItensBibliotecaPorCategoria()` | ❌ | **Médio** |
| `buscarItensBibliotecaPorTipoRisco()` | ❌ | **Médio** |
| `buscarLevantamentosPorStatus()` | ❌ | **Médio** |
| `buscarLevantamentosPorTipo()` | ❌ | **Médio** |
| `listarLevantamentosPorSetor()` | ❌ | **Baixo** (poucos registros) |
| `buscarLevantamentosPorEmpresa()` | ❌ | **Médio** |
| `listarSetoresPorEmpresa()` | ❌ | **Médio** |

### 5.3 N+1 Query Patterns

| Local | Padrão | Risco |
|---|---|---|
| `offline-empresas.service.ts:106-136` | Cascade delete: empresa → setores → levantamentos → relatorios (for...of aninhados) | **Alto** |
| `offline-setores.service.ts:108-127` | Cascade delete: setor → levantamentos → relatorios | **Alto** |
| `offline-levantamentos.service.ts:142-150` | Cascade delete: levantamento → relatorios | **Médio** |
| `real-empresas.service.ts:43-44` | Cache loop: N writes após 1 read | **Médio** |
| `real-setores.service.ts:44-45` | Cache loop | **Médio** |
| `real-levantamentos.service.ts:54-55` | Cache loop | **Médio** |

---

## 6. SOFT DELETE

**8 tabelas** com `deleted_at timestamptz`: empresas, setores, levantamentos, biblioteca_tecnica, relatorios, evidencias.

**Problema:** Todos os SELECTs filtram `.is('deleted_at', 'null')`, mas o DELETE na app chama `.delete()` (hard delete no Postgres via RLS). O soft delete é populado via sync offline.

---

## 7. STORED PROCEDURES

**Nenhuma stored procedure** além das trigger functions. Zero uso de `.rpc()` no frontend. Tudo via query builder do Supabase.

---

## 8. SCORE DO BANCO DE DADOS: 75 / 100

### Pontos Fortes
- Schema bem normalizado com FKs corretas
- 38 RLS policies corretamente scoped por `auth.uid()`
- Índices compostos cobrindo queries principais
- Índice único parcial para evitar levantamentos duplicados por setor
- Soft delete generalizado

### Pontos Fracos
- SELECT * em todas as queries (-10pts)
- 8 endpoints sem paginação (-5pts)
- N+1 em cascade offline (-3pts)
- Índice faltante em `biblioteca_tecnica(publico)` (-3pts)
- Sem full-text search (GIN/tsvector) para ILIKE searches (-2pts)
- Duplicação `medicoes` / `pontos_medicao` no schema (-2pts)

---

## 9. RECOMENDAÇÕES

### Imediato
1. Substituir `select('*')` por colunas específicas em queries de listagem
2. Adicionar índice em `biblioteca_tecnica(publico)` para RLS
3. Adicionar `.limit(50)` em `buscarEmpresasPorTermo` e `pesquisarBibliotecaTecnica`

### Curto Prazo
4. Adicionar paginação nos 8 endpoints sem `.range()`
5. Batch cache writes em vez de for...of individual
6. Remover coluna duplicada `medicoes` em favor de `pontos_medicao`

### Médio Prazo
7. Adicionar índices GIN/tsvector para ILIKE search
8. Adicionar stored procedures para operações complexas (relatório consolidado)
9. Adicionar `ON CONFLICT` handling explícito em todas as operações de sync
