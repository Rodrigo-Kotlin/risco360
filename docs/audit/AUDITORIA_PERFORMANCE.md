# AUDITORIA DE PERFORMANCE — RISCO360

---

## 1. BUNDLE SIZE

### Chunks de Produção (`dist/assets/`)

| Chunk | Tamanho | Notas |
|---|---|---|
| `xlsx-*.js` | **414.8 KB** | Biblioteca de planilhas — carregada sob demanda ✅ |
| `vendor-*.js` | **294.1 KB** | React 19 + React DOM |
| `supabase-*.js` | **197.7 KB** | Supabase client |
| `index-*.js` | **180.1 KB** | App principal |
| `messages-*.js` | **61.1 KB** | Mensagens/strings |
| `icons-*.js` | **24.8 KB** | Lucide icons |
| Demais chunks | 0.9-37 KB | Code splitting efetivo |

**Total JS (antes da compressão):** ~1.4 MB

### Quick Wins de Bundle

| Item | Economia Estimada | Esforço |
|---|---|---|
| Eager-load LoginPage (remover lazy) | 0 (latência, não tamanho) | 5 min |
| Dividir `messages` por locale | ~30 KB | 1 hora |
| Tree-shake Supabase não utilizado | ~50-80 KB | 2 horas |
| Separar `xlsx` em chunk próprio | Já está em chunk separado ✅ | — |

---

## 2. CHUNK WARNINGS

**Problema:** `vite.config.ts` não define `chunkSizeWarningLimit`. Vite default é 500KB.

**Chunks que excederiam 500KB se não fosse o split manual:**
- `xlsx`: 415KB (abaixo de 500KB, mas alto)
- `vendor`: 294KB ✅
- `supabase`: 198KB ✅

---

## 3. CACHING HEADERS

**Arquivo:** `public/_headers`

| Padrão | Cache | Notas |
|---|---|---|
| `/assets/*` | `max-age=31536000, immutable` | ✅ 1 ano |
| `/icons/*` | `max-age=31536000, immutable` | ✅ 1 ano |
| `/index.html` | `no-cache` | ✅ Correto para SPA |
| `/sw.js` | `no-cache` | ✅ Correto para SW |
| `/manifest.webmanifest` | `no-cache` | ✅ Correto |

---

## 4. REACT.MEMO

**Zero componentes usam `React.memo`.** Impacto:

| Componente | Por que precisa | Impacto |
|---|---|---|
| `SearchInput` | Re-renderiza a cada keystroke do pai | Alto |
| `FilterBar` | Re-renderiza ao navegar | Alto |
| `DataTable` | Re-renderiza toda tabela | Alto |
| `Badge` | Renderizado em listas | Médio |
| `SyncStatusChip` | Renderizado em listas | Médio |
| `NivelRiscoBadge` | Renderizado em cards | Médio |
| `EmptyState` | Renderizado condicionalmente | Baixo |
| `Skeleton` | Renderizado durante loading | Baixo |
| `StatCard` | Renderizado em dashboards | Médio |
| `FormSection` | Renderizado em formulários | Baixo |

---

## 5. SELECT * — OVERFETCHING

**48 queries** usam `select('*')`. As mais críticas:

| Query | Tabela | Colunas | JSONB Fields | Impacto |
|---|---|---|---|---|
| `listarLevantamentos()` | levantamentos | 46 | 15+ | **Crítico** |
| `listarBiblioteca()` | biblioteca_tecnica | 27 | 8+ | **Alto** |
| `listarEmpresas()` | empresas | 22 | 0 | Médio |
| `listarSetores()` | setores | 11 | 0 | Baixo |

**Solução:** Para listagens, selecionar apenas `id, nome, status, created_at, updated_at`. Para detalhes, selecionar tudo.

---

## 6. N+1 QUERIES

### Offline Cascade Delete

```
excluirEmpresaOffline()
  → for (setor of setores) {
      excluirSetorOffline()
        → for (levantamento of levantamentos) {
            excluirLevantamentoOffline()
              → for (relatorio of relatorios) {
                  db.put() individual
                }
          }
    }
```

**Impacto:** Com 10 setores, 5 levantamentos cada, 2 relatorios cada = 10 + 50 + 100 = **160 operações individuais**.

**Solução:** Usar transação IDB com batch puts.

### Cache-on-Read Loop

```typescript
const { data } = await supabase.from('empresas').select('*')
for (const empresa of data) {
  await cacheEmpresaLocalmente(empresa)  // N writes
}
```

**Impacto:** Baixo (tipicamente < 100 empresas), mas desnecessário.

**Solução:** Usar `db.putMany()` em vez de loop.

---

## 7. PAGINAÇÃO FALTANTE

**8 endpoints sem paginação:**

| Endpoint | Risco | Usuário típico |
|---|---|---|
| `buscarEmpresasPorTermo` | Alto | Consultorias com 200+ empresas |
| `pesquisarBibliotecaTecnica` | Alto | Bibliotecas com 1000+ itens |
| `buscarItensBibliotecaPorCategoria` | Médio | |
| `buscarLevantamentosPorStatus` | Médio | |
| `listarLevantamentosPorSetor` | Baixo | Poucos por setor |
| `listarSetoresPorEmpresa` | Médio | |
| `buscarLevantamentosPorEmpresa` | Médio | |

---

## 8. IMAGENS

### Configuração Atual

```typescript
// src/lib/image-compression.ts
maxSizeMB: 10       // ⚠️ Muito alto
maxWidthOrHeight: 1600
useWebWorker: true   // ✅
preserveExif: true   // ⚠️ Mantém metadados desnecessários
initialQuality: 0.8  // ⚠️ Poderia ser 0.7
```

### Recomendações

| Parâmetro | Atual | Recomendado | Economia |
|---|---|---|---|
| `maxSizeMB` | 10 | 3 | ~70% |
| `initialQuality` | 0.8 | 0.7 | ~20% |
| `preserveExif` | true | false | ~5-15% |
| `fileType` | — | `image/webp` (qdo suportado) | ~25-35% |

---

## 9. MEMORY LEAKS POTENCIAIS

| Local | Problema | Risco |
|---|---|---|
| `Toast.tsx:34` | Timeout não limpo no unmount | Baixo |
| `useCnpjLookup.ts:87` | setTimeout sem cleanup no effect | Baixo |
| `real-evidencias.service.ts` | `URL.createObjectURL` sem revoke em error path | Médio |

---

## 10. SCORE DE PERFORMANCE: 60 / 100

| Critério | Nota |
|---|---|
| Bundle Size | 6/10 |
| Code Splitting | 8/10 |
| Caching | 9/10 |
| React.memo | 0/10 |
| SELECT * | 3/10 |
| Paginação | 5/10 |
| N+1 | 5/10 |
| Imagens | 6/10 |
| Lazy Loading | 8/10 |
| Memória | 7/10 |

---

## 11. QUICK WINS DE PERFORMANCE

| # | Ação | Impacto | Esforço |
|---|---|---|---|
| 1 | Adicionar `React.memo` em 12 componentes folha | Alto | 1 hora |
| 2 | Reduzir `maxSizeMB: 10 → 3` e `quality: 0.8 → 0.7` | Alto | 5 min |
| 3 | Adicionar `loading="lazy"` em todas as `<img>` | Médio | 10 min |
| 4 | Adicionar `.limit(50)` em endpoints sem paginação | Médio | 15 min |
| 5 | Selecionar colunas específicas em listagens (substituir 10 `select(*)`) | Alto | 2 horas |
| 6 | Batch cache writes (substituir for...of) | Médio | 30 min |
| 7 | Eager-load LoginPage | Baixo | 5 min |
| 8 | Adicionar chunkSizeWarningLimit no vite.config | Baixo | 2 min |
| 9 | Adicionar debounce cleanup em useCnpjLookup | Baixo | 5 min |
| 10 | Adicionar `preserveExif: false` | Baixo | 2 min |
