# AUDITORIA FRONTEND — RISCO360

## 1. VISÃO GERAL

| Métrica | Valor |
|---|---|
| Componentes TSX | 108 (62 produção + 46 testes/layout) |
| Páginas | 19 + 14 steps wizard = 33 |
| Hooks | 12 produção |
| Contextos | 3 (Auth, Layout, Toast) |
| Total linhas TSX | ~14.000 |
| React.memo | 0 |
| React.lazy | 27 (todas as rotas + steps) |

---

## 2. COMPONENTES ACIMA DE 300 LINHAS

### Crítico (500+)

| Arquivo | Linhas | Responsabilidades | Risco |
|---|---|---|---|
| `EmpresaPdfConferenciaPage.tsx` | 564 | 5 subcomponentes inline, CSS inline, 22 imports | **Crítico** |
| `Step05EpisEpcs.tsx` | 501 | EPIs + EPCs + Evidências, upload imperativo | **Alto** |

### Alto (300-500)

| Arquivo | Linhas | Risco |
|---|---|---|
| `LevantamentoWizardPage.tsx` | 361 | Stepper inline, lazy loading steps | Alto |
| `RiscoForm.tsx` | 324 | RHF + Zod + manual useState misturados | Alto |
| `EmpresaForm.tsx` | 309 | RHF + Zod, mas grande | Médio |

---

## 3. HOOKS ACIMA DE 100 LINHAS

| Hook | Linhas | Risco |
|---|---|---|
| `useLevantamentoWizard.ts` | 185 | Múltiplas responsabilidades: navegação, save, load, validação | Alto |
| `useSyncDiagnostics.ts` | 124 | 8 handlers, 7 estados, 6 serviços importados | Médio |
| `useCnpjLookup.ts` | 104 | Debounce manual, sem cleanup adequado (linha 87) | Médio |

---

## 4. FORMULÁRIOS — RHF + ZOD COVERAGE

| Arquivo | RHF | Zod | Manual | Linhas | Status |
|---|---|---|---|---|---|
| EmpresaForm.tsx | ✅ | ✅ | ❌ | 330 | RHF+Zod |
| RiscoForm.tsx | ✅ | ✅ | ⚠️ arrays | 347 | RHF+Zod |
| LoginPage.tsx | ✅ | ✅ | showPassword | 322 | RHF+Zod |
| ColaboradorForm.tsx | ❌ | ❌ | ✅ 8 campos | 91 | Manual |
| LevantamentoBasicoForm.tsx | ❌ | ❌ | ✅ 12 campos | 172 | Manual |
| PlanoAcaoForm.tsx | ❌ | ❌ | ✅ 8 campos | 120 | Manual |
| MedicaoForm.tsx | ❌ | ❌ | ✅ 15 campos | 144 | Manual |
| PontoMedicaoForm.tsx | ❌ | ❌ | ✅ 8 campos | 122 | Manual |
| AssinaturaForm.tsx | ❌ | ❌ | ✅ 4 campos | 66 | Manual |
| BibliotecaItemForm.tsx | ❌ | ❌ | ✅ 12+ dinâmicos | 241 | Manual |
| SetorFormPage.tsx | ❌ | ❌ | ✅ 5 campos | 237 | Manual |
| Steps 01-08 (8 arquivos) | ❌ | ❌ | ✅ ~50 campos total | ~1.400 | Manual |

**18 de 25 arquivos de formulário (72%) usam `useState` manual.**

---

## 5. REACT QUERY ANALYSIS

### 5.1 Query Keys
**Arquivo:** `src/lib/query-keys.ts`

```typescript
export const queryKeys = {
  empresas: { all: ['empresas'], detail: (id: string) => ['empresas', id] },
  setores: { all: ['setores'], detail: (id: string) => ['setores', id], porEmpresa: (id: string) => ['setores', 'empresa', id] },
  levantamentos: { all: ['levantamentos'], detail: (id: string) => ['levantamentos', id] },
  relatorios: { all: ['relatorios'], detail: (id: string) => ['relatorios', id] },
  dashboard: { all: ['dashboard'] },
  biblioteca: { all: ['biblioteca'], detail: (id: string) => ['biblioteca', id] },
  syncMetrics: { all: ['syncMetrics'] },
}
```

### 5.2 Queries Existentes

| Query | Arquivo | Invalidações | Cache OK? |
|---|---|---|---|
| `empresas.all` | EmpresasPage | EmpresaFormPage (linha 55-56) | ✅ |
| `empresas.detail(id)` | EmpresaDetalhePage | EmpresaFormPage | ✅ |
| `setores.all` | SetoresPage | SetorFormPage | ✅ |
| `levantamentos.all` | LevantamentosPage | NovoLevantamentoPage, UseLevantamentoWizard | ✅ |
| `relatorios.all` | RelatoriosPage | RelatoriosPage (linha 70-71) | ✅ |
| `dashboard.all` | DashboardPage | Vários | ✅ |
| `syncMetrics.all` | useSyncMetrics | useSyncQueue | ✅ |

### 5.3 Problemas Identificados

| Problema | Evidência | Risco |
|---|---|---|
| **Sem `useMutation`** — Padrão inconsistente (services + invalidate vs mutation) | Nenhum useMutation encontrado | Médio |
| **Sem `queryClient.prefetchQuery()`** — Nenhum prefetch para navegação antecipada | Busca global | Baixo |
| **Query keys sem parâmetros de filtro** — `['levantamentos']` invalida TUDO | `query-keys.ts` | Baixo |
| **Duplicação de invalidação** — Mesmo `queryClient.invalidateQueries` chamado em múltiplos lugares | Ex: `queryKeys.empresas.all` em 3 arquivos | Baixo |

---

## 6. CONTEXTOS

| Contexto | Provider | Consumidores | Tamanho | Problemas |
|---|---|---|---|---|
| `AuthContext` | `AuthContext.tsx` | Toda app | 229 linhas | Mock auto-authenticate bypass (C2) |
| `ToastContext` | `Toast.tsx` | Toda app | 63 linhas | Nenhum |
| `LayoutContext` | `LayoutContext.tsx` | Sidebar | 25 linhas | Nenhum |

---

## 7. RE-RENDERIZAÇÕES POTENCIAIS

**Zero `React.memo`** em toda a codebase. Impacto:
- `DataTable` re-renderiza a cada mudança no pai
- `SearchInput`, `FilterBar` sem memo
- `Badge`, `SyncStatusChip`, `NivelRiscoBadge` sem memo
- Toda lista recria itens no render

**Recomendação:** Adicionar `React.memo` em 12+ componentes folha.

---

## 8. CÓDIGO DUPLICADO

### 8.1 `statusBadge` duplicado
- `EmpresaConsolidadoPage.tsx:69-78`
- `LevantamentoDetalhePage.tsx:28-34`

### 8.2 `ensureArray` duplicado
- `src/lib/mappers.ts:21-23` (privado)
- `src/lib/utils.ts` (exportado, usado em toda parte)

### 8.3 Botões de navegação do wizard
Padrão "Anterior / Salvar / Próximo" duplicado em **8 step files**.

### 8.4 Step08 duplicado
- `Step08ParecerAssinaturas.tsx` (236 linhas) — **NÃO USADO** no wizard
- `Step08RevisaoConclusao.tsx` (231 linhas) — **USADO** no wizard

---

## 9. COMPONENTES ACOPLADOS

| Componente | Imports Diretos | Acoplamento |
|---|---|---|
| `Step05EpisEpcs.tsx` | 22 imports | Alto |
| `LoginPage.tsx` | 16 imports | Alto |
| `EmpresaPdfConferenciaPage.tsx` | 18 imports | Alto |
| `AuthenticationLayout.tsx` | 12 imports | Médio |

---

## 10. LAZY LOADING & CODE SPLITTING

**Bom:**
- 18 páginas com `React.lazy()` em `routes/index.tsx`
- 8 steps wizard com `React.lazy()`
- `xlsx` importado dinamicamente em `exportacao.service.ts`
- `manualChunks` no vite.config: vendor, supabase, icons

**Melhorável:**
- `LoginPage` lazy-loaded (deveria ser eager — é entry point)
- `messages` chunk de 61KB não dividido por locale
- Nenhum `React.Suspense` boundary além do de rotas

---

## 11. DEPENDÊNCIAS CIRCULARES

Não foram encontradas dependências circulares. A estrutura `services/` → `hooks/` → `pages/` é unidirecional.

---

## 12. RECOMENDAÇÕES PRIORIZADAS

### Crítico (1-2 semanas)
1. Migrar 18 formulários manuais para RHF + Zod
2. Criar schemas Zod para Levantamento, Setor, Colaborador, PlanoAcao, Medicao, Biblioteca
3. Adicionar validadores de formato brasileiro (CNPJ, CPF, CEP, telefone)

### Alto (1 semana)
4. Extrair subcomponentes de `EmpresaPdfConferenciaPage.tsx` (564 → <200 linhas)
5. Extrair subcomponentes de `Step05EpisEpcs.tsx` (501 → <200 linhas)
6. Unificar Step08 (remover `Step08ParecerAssinaturas.tsx`)
7. Adicionar `React.memo` em 12+ componentes folha

### Médio (2-3 dias)
8. Extrair `statusBadge` para utilitário compartilhado
9. Extrair `WizardStepperDesktop/Mobile` para componente separado
10. Adicionar `queryClient.prefetchQuery()` para rotas comuns
11. Adicionar debounce cleanup em `useCnpjLookup.ts:87`

### Baixo (1 dia)
12. Remover 5 componentes órfãos de wizard
13. Remover `ensureArray` duplicado de `mappers.ts`
14. Adicionar `noValidate` em todos os `<form>` manuais
