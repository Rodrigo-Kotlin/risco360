# Baseline de Qualidade — RISCO360

> Data/hora da execução: 2026-07-04 11:40 (BRT)
> Node: v24.15.0
> npm: 10.4.0
> Sistema: Windows (win32)

---

## npm run typecheck

**Status:** Passou

**Resumo:** Nenhum erro de tipo encontrado.

**Observação:** TypeScript 6.0.2, sem erros nos dois tsconfigs (app + node).

---

## npm run lint

**Status:** Falhou

**Resumo:**
- 15 erros
- 3 warnings

**Erros (15):**
| Arquivo | Erro |
|---|---|
| `src/hooks/configuracoes/useSyncDiagnostics.ts:2` | `useAuth` defined but never used |
| `src/hooks/configuracoes/useSyncDiagnostics.ts:4` | `isSupabaseConfigured` defined but never used |
| `src/hooks/configuracoes/useSyncDiagnostics.ts:45` | Calling setState synchronously within an effect |
| `src/pages/LevantamentoDetalhePage.tsx:39` | `toast` assigned but never used |
| `src/pages/LevantamentoDetalhePage.tsx:64` | `load` assigned but never used |
| `src/pages/steps/Step04SegurancaEquipamentos.tsx:6` | `Plus` defined but never used |
| `src/pages/steps/Step04SegurancaEquipamentos.tsx:44` | `addCustom` assigned but never used |
| `src/services/providers/mock.provider.ts:15` | `Profile` defined but never used |
| `src/services/providers/mock.provider.ts:75,82,114,119` | `Unexpected any` (4 ocorrências) |
| `src/services/service-registry.ts:26,27` | `ServiceResult`, `UploadEvidenciaResult`, `UploadEvidenciaInput` defined but never used (3 ocorrências) |

**Warnings (3):**
- `src/components/forms/EmpresaForm.tsx:80` — React Hook Form `watch()` incompatible with React Compiler
- `src/components/forms/RiscoForm.tsx:115` — React Hook Form `watch()` incompatible with React Compiler
- `src/pages/LoginPage.tsx:57` — React Hook Form `watch()` incompatible with React Compiler

**Observação:** Erros serão tratados na **Fase 5 — Qualidade mínima + CI**.

---

## npm run test

**Status:** Falhou (1 teste falhando)

**Resumo:**
- 71 passed, 1 failed (de 72 test files)
- 782 passed, 1 failed (de 783 tests)
- 1 unhandled error

**Teste falhando:**
`SincronizacaoPage > exibe loading skeleton enquanto carrega`
- Arquivo: `src/pages/__tests__/SincronizacaoPage.test.tsx:157`
- Causa: `expected 0 to be greater than 0` — nenhum elemento com classe `.animate-pulse` encontrado durante loading.
- Provável causa: O componente não renderiza skeleton durante o carregamento inicial, ou o mock não está emitindo o estado de loading corretamente.

**Unhandled error:**
`EnvironmentTeardownError: Closing rpc while "onUserConsoleLog" was pending` — erro assíncrono residual no arquivo `ConsolidadoEmpresaPage.test.tsx`.

**Observação:** Correção agendada para **Fase 5 — Qualidade mínima + CI**.

---

## npm run build

**Status:** Passou

**Resumo:** Build de produção gerado com sucesso.

- 1915 módulos transformados
- 64 chunks gerados
- PWA: 95 entries precached (1640.83 KiB)
- Service worker gerado em `dist/sw.js`

**Observação:** Sem warnings ou erros.

---

## npm audit

**Status:** 2 vulnerabilidades críticas

**Resumo:**

| Pacote | Versão | Severidade | Advisory |
|---|---|---|---|
| `xlsx` | ^0.18.5 | **high** | Prototype Pollution (GHSA-4r6h-8v6p-xvw6) |
| `xlsx` | ^0.18.5 | **high** | ReDoS (GHSA-5pgg-2g8v-p4x9) |

**Correção:** `npm audit fix --force` (instala `@types/xlsx@0.0.35`, breaking change).

**Observação:** Tratado na **Fase 4 — Segurança e dependências**.

---

## Riscos remanescentes

| Risco | Impacto | Fase |
|---|---|---|
| `.env.local` com credenciais reais no repositório local | Exposição de credenciais | Fase 0 (documentado, mas .gitignore já exclui) |
| 15 erros de lint (unused vars, any, setState in effect) | Qualidade de código | Fase 5 |
| 1 teste falhando (SincronizacaoPage loading skeleton) | Falso negativo em CI | Fase 5 |
| `xlsx` com 2 CVEs high | Segurança | Fase 4 |
| Migrations com prefixo inconsistente (`001_` vs `0001_`) | Ordem de execução | Fase 1 |
