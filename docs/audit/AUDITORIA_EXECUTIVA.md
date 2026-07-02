# AUDITORIA TÉCNICA CORPORATIVA — RISCO360

**Data:** 2026-07-01  
**Versão:** 0.1.0  
**Stack:** React 19 + TypeScript 6 + Vite 8 + Supabase + PostgreSQL + IndexedDB Offline-First  
**Testes:** 688 unitários + 6 E2E  
**Build:** Limpo | Typecheck: 0 erros | Lint: 13 erros pré-existentes  

---

## NOTA GLOBAL DO RISCO360: **68 / 100**

| Dimensão | Nota | Status |
|---|---|---|
| Arquitetura | 72 | ✅ Sólida — Repository + Service Registry + Provider Pattern |
| Frontend | 65 | ⚠️ Componentes grandes, sem RHF na maioria dos formulários |
| Backend (Supabase/DB) | 78 | ✅ Boa estrutura de migrações, RLS, índices compostos |
| Banco de Dados | 75 | ✅ Schema bem normalizado, índices adequados. SELECT * generalizado |
| Offline First | 70 | ⚠️ Arquitetura robusta, mas sem reconciliação de conflitos |
| Segurança | 65 | ⚠️ CSP ausente, RLS correta, mas SQL injection via .or() |
| Performance | 60 | ⚠️ SELECT * em 48 queries, sem React.memo, bundle xlsx 415KB |
| UX | 72 | ✅ Acessibilidade excelente, mas sem dark mode, sem focus trap |
| PWA | 62 | ⚠️ Offline excelente, mas sem beforeinstallprompt |
| SST (Negócio) | 55 | ❌ Sem PGR/LTCAT/PCMSO — funcionalidade crítica ausente |
| Escalabilidade | 60 | ⚠️ Sem paginação em 8 endpoints, N+1 em cascata offline |
| Qualidade de Código | 68 | ⚠️ 39 casts as unknown as, 5 componentes órfãos, 870 linhas mortas |
| Produto | 62 | ⚠️ Base sólida, mas faltam documentos regulatórios essenciais |

---

## TOP 10 RISCOS

| # | Risco | Severidade | Arquivo |
|---|---|---|---|
| 1 | **Sem PGR/LTCAT/PCMSO** — App coleta dados mas não gera documentos regulatórios obrigatórios | **Crítico** | Projeto inteiro |
| 2 | **Itens 'syncing' presos após refresh** — Sem recuperação em startup, dados invisíveis ao sync | **Crítico** | `sync-queue.service.ts:37-48` |
| 3 | **SQL Injection via .or()** — String interpolation sem sanitização | **Crítico** | `real-empresas.service.ts:244` |
| 4 | **Mock credentials hardcoded** — `Risco360@123` no código fonte | **Crítico** | `mock-mode.ts:4-5` |
| 5 | **5 componentes órfãos de wizard** — 727 linhas de código morto | **Alto** | `src/pages/steps/` |
| 6 | **SELECT * em 48 queries** — Overfetching massivo, especialmente levantamentos (46 colunas JSONB) | **Alto** | `real-*.service.ts` |
| 7 | **Zero React.memo** — Re-renderizações desnecessárias em toda árvore de componentes | **Alto** | Toda `src/components/` |
| 8 | **Sem beforeinstallprompt** — PWA não instalável via fluxo nativo do navegador | **Alto** | `main.tsx`, `vite.config.ts` |
| 9 | **Sem CSP headers** — Vulnerabilidade a XSS | **Alto** | `public/_headers` |
| 10 | **N+1 em cascata offline** — Exclusão de empresa itera todos os filhos individualmente | **Médio** | `offline-empresas.service.ts:106-136` |

---

## TOP 10 MELHORIAS

| # | Melhoria | Impacto | Esforço |
|---|---|---|---|
| 1 | Adicionar geração de PGR/LTCAT/PCMSO | Alto | 3-6 meses |
| 2 | Migrar 18 formulários manuais para RHF + Zod | Alto | 2-4 semanas |
| 3 | Implementar reconciliação de conflitos com timestamp | Alto | 2-3 semanas |
| 4 | Substituir SELECT * por colunas específicas | Médio | 1 semana |
| 5 | Adicionar React.memo em componentes folha | Médio | 2 dias |
| 6 | Adicionar CSP + HSTS headers | Alto | 1 hora |
| 7 | Adicionar beforeinstallprompt + update notification | Alto | 2 dias |
| 8 | Adicionar dark mode | Médio | 1 semana |
| 9 | Adicionar paginação em 8 endpoints sem range | Médio | 2 dias |
| 10 | Adicionar focus trap + focus restoration em Modal | Médio | 1 dia |

---

## TOP 10 QUICK WINS

| # | Quick Win | Impacto | Esforço |
|---|---|---|---|
| 1 | Adicionar CSP headers (`public/_headers`) | Segurança | 10 min |
| 2 | Remover console.log de produção (4 locais) | Qualidade | 5 min |
| 3 | Eager-load LoginPage (remover lazy()) | Performance | 5 min |
| 4 | Corrigir `preserveExif: false` + `quality: 0.7` | Performance | 5 min |
| 5 | Adicionar `loading="lazy"` em todas as `<img>` | Performance | 10 min |
| 6 | Remover 5 componentes órfãos de wizard | Manutenção | 15 min |
| 7 | Adicionar debounce cleanup em `useCnpjLookup` | Estabilidade | 5 min |
| 8 | Adicionar `noValidate` em todos os `<form>` manuais | UX | 10 min |
| 9 | Remover 4 mensagens não utilizadas de `messages.ts` | Qualidade | 2 min |
| 10 | Adicionar `chunkSizeWarningLimit` no vite.config | Monitoramento | 2 min |

---

## TOP 10 DIFERENCIAIS COMPETITIVOS

| # | Diferencial | Detalhe |
|---|---|---|
| 1 | **Offline-First nativo** — Único app SST brasileiro com IndexedDB + sync queue | Nenhum concorrente (SGG, SOC, Senior SST) opera offline |
| 2 | **PWA completo** — Instalável, service worker, cache imutável de 1 ano | Concorrentes são web apps tradicionais |
| 3 | **React 19 + TypeScript 6** — Stack moderna e tipada | Concorrentes usam legados (Delphi, ASP.NET, jQuery) |
| 4 | **688 testes automatizados** — Cobertura de schemas, serviços, componentes | Raro em produtos SST brasileiros |
| 5 | **Mobile-first com acessibilidade** — Touch targets 48px, aria-*, foco visível | Superior aos concorrentes desktop-first |
| 6 | **Dual-mode (Supabase + Mock)** — Desenvolvimento e teste sem dependência externa | Agilidade no desenvolvimento |
| 7 | **CNAE → Grau de Risco NR-4** — 329 códigos mapeados | Base de conhecimento SST incorporada |
| 8 | **Compressão de imagens com WebWorker** — Upload otimizado sem travar UI | Concorrentes não fazem compressão client-side |
| 9 | **Arquitetura modular (Repository + Service Registry)** — Baixo acoplamento | Facilita manutenção e evolução |
| 10 | **Soft Delete generalizado** — Nenhum dado é perdido em exclusões | Recovery possível em qualquer operação |

---

## O QUE FALTA PARA O RISCO360 SE TORNAR REFERÊNCIA NACIONAL EM SST

### 1. Geração de Documentos Regulatórios (CRÍTICO)
O investimento mais urgente. Sem PGR, LTCAT e PCMSO, o produto é uma ferramenta de coleta, não uma plataforma SST completa. Concorrentes geram esses documentos automaticamente.

### 2. eSocial Integration
A portaria SEPRT 477/2021 exige envio de eventos S-2210, S-2220, S-2240. Sem isso, empresas precisam de outro sistema para cumprir obrigações legais.

### 3. Inteligência Artificial SST
RAG sobre biblioteca técnica, sugestão automática de riscos baseada em CNAE+setor, geração de inventário e plano de ação. Seria um diferencial competitivo enorme.

### 4. Reconciliation Engine
Conflitos de sincronização precisam de resolução automática (last-writer-wins com timestamp do servidor) + UI de resolução manual para casos complexos.

### 5. Dashboard Analítico
Comparar indicadores entre empresas, setores, períodos. Tendências de exposição. Heat maps de risco por setor. Insights acionáveis para o SESMT.

### 6. Assinatura Digital Avançada
Suporte a ICP-Brasil para assinatura de documentos regulatórios. Hoje usa canvas de assinatura simples.

### 7. Multi-tenancy com Hierarquia
Empresas com múltiplas filiais, grupos econômicos, consultorias com múltiplos clientes. Controle de acesso granular por grupo.

### 8. API Pública
Integração com sistemas terceiros (TOTVS, SAP, Senior) via REST API documentada + webhooks.

### 9. App Mobile Nativo
Embora o PWA seja funcional, um app React Native ou Flutter com câmera nativa, geolocalização e notificações push teria melhor experiência.

### 10. Certificações e Compliance
LGPD, ISO 27001, validação INMETRO para equipamentos de medição. Necessário para mercado enterprise.

---

**Documentos detalhados:**
- `AUDITORIA_FRONTEND.md` — Componentes, hooks, formulários, React Query
- `AUDITORIA_BACKEND.md` — Banco de dados, migrações, índices, RLS
- `AUDITORIA_OFFLINE_FIRST.md` — IndexedDB, sync queue, cenários de falha
- `AUDITORIA_SEGURANCA.md` — OWASP Top 10, RLS, JWT, vulnerabilidades
- `AUDITORIA_PERFORMANCE.md` — Bundle, queries, memoização, imagens
- `AUDITORIA_UX_UI.md` — Acessibilidade, Material Design 3, responsividade
- `AUDITORIA_PWA.md` — Manifest, service worker, instalação
- `AUDITORIA_IA.md` — Potencial para RAG, embeddings, IA generativa SST
- `AUDITORIA_SST.md` — NR-01, NR-07, NR-09, NR-15, NR-17
- `TECH_DEBT_REPORT.md` — Código morto, casts, duplicação
- `ROADMAP_RISCO360_2026.md` — Quick wins, curto, médio, longo prazo
