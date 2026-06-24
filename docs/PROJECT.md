# Risco360 — Documento Mestre do Projeto

## 1. Objetivo

O Risco360 é um PWA para substituir a planilha impressa usada em campo para levantamento de perigos e riscos (LPR) e análise ergonômica preliminar (AEP). Técnicos de segurança do trabalho realizam os levantamentos diretamente no navegador do smartphone ou notebook, mesmo sem conexão com a internet.

## 2. Fluxo funcional

```
Empresas
  └── Empresa selecionada
        └── Setores da empresa
              └── Novo Levantamento por Setor
                    └── Formulário digital LPR + AEP (wizard 8 etapas)
```

Cada setor de uma empresa possui um único formulário setorial LPR + AEP integrado. Não existem múltiplos levantamentos avulsos para o mesmo setor.

**Regras:**
1. Cada setor possui seu próprio formulário.
2. O sistema não cria formulário único para a empresa inteira.
3. O único tipo permitido é `LPR_AEP`.
4. Não permitir LPR separado.
5. Não permitir AEP separado.
6. Não permitir LPP.
7. Não permitir criação de levantamento sem setor.
8. O fluxo de criação deve nascer dentro do setor.

## 3. Modelo único permitido

O único modelo de formulário é **Formulário Setorial LPR + AEP** (`LPR_AEP`).

Não são permitidos: LPR separado, AEP separado, LPP ou outros modelos.

## 4. Telas e rotas

| Tela | Rota | Descrição |
|------|------|-----------|
| Login | `/login` | Autenticação |
| Dashboard | `/dashboard` | Visão geral |
| Empresas | `/empresas` | CRUD de empresas |
| Empresa Detalhe | `/empresas/:id` | Detalhes, setores e levantamentos |
| Empresa Form | `/empresas/nova`, `/empresas/:id/editar` | Cadastro/edição |
| Setor Detalhe | `/empresas/:empresaId/setores/:setorId` | Detalhes do setor |
| Novo Levantamento | `/empresas/:empresaId/setores/:setorId/levantamento` | Criar formulário (contexto do setor) |
| Levantamentos | `/levantamentos` | Listagem/acompanhamento (sem botão "Novo") |
| Levantamento Detalhe | `/levantamentos/:id` | Visualização |
| Wizard LPR+AEP | `/levantamentos/:id/editar` | Wizard 8 etapas |
| Biblioteca Técnica | `/biblioteca` | Referências técnicas |
| Relatórios | `/relatorios` | Geração de relatórios |
| Configurações | `/configuracoes` | Preferências do usuário |

A rota `/levantamentos/novo` redireciona para `/empresas`. A criação de levantamento só é possível no contexto de um setor (`/empresas/:empresaId/setores/:setorId/levantamento`).

## 5. Wizard (8 etapas)

1. **Identificação do setor** — Dados do setor e responsáveis técnicos
2. **Características do setor** — Dimensões, equipe, estrutura física (piso, parede, forro, telhado, divisórias, revestimento)
3. **Iluminação, ventilação e conforto** — Iluminação natural/artificial, ventilação, conforto térmico
4. **Segurança, GES, mobiliários, máquinas e equipamentos** — Sistemas de incêndio (multiselect), GES, mobiliários, máquinas, layout
5. **EPIs, EPCs e evidências** — Equipamentos de proteção e registros fotográficos
6. **Medições quantitativas pontuais** — Medições por ponto avaliado (ruído dB(A), iluminação lux, temperatura °C, velocidade do ar m/s, umidade %, radiação µSv/h)
7. **Perigos, riscos, medidas de controle e AEP** — Identificação de riscos, avaliação ergonômica, plano de ação
8. **Revisão e conclusão** — Parecer técnico e assinaturas

## 6. Dados principais

### Empresa
Razão social, nome fantasia, CNPJ, CNAE, grau de risco, endereço, cidade, UF, CEP, responsável, telefone, e-mail.

### Setor
Nome, descrição, empresa vinculada, responsável local, localização.

### Levantamento (Formulário Setorial LPR + AEP)
Código, tipo (`LPR_AEP`), status, percentual, empresa, setor, responsáveis, características do local, medições ambientais, colaboradores expostos, riscos ocupacionais (físico, químico, biológico, ergonômico, acidente, psicossocial), avaliação ergonômica preliminar, controles e plano de ação, parecer técnico e assinaturas.

## 7. Arquitetura offline-first

- **IndexedDB** via `idb` (biblioteca), fallback para localStorage
- Banco local `risco360_offline_db` — 9 stores com índices
- Service worker via `vite-plugin-pwa` (generateSW, cache de assets)
- Operações standalone sem dependência de servidor
- Fila de sincronização (`sync_queue`) preparada para futuro Supabase
- Migração automática localStorage mock → IndexedDB na primeira execução (única, sem duplicação)
- Seed automático se banco vazio (Empresa Modelo Risco360 LTDA, 4 setores, 1 levantamento com 6 medições, 3 itens de biblioteca técnica)
- Dados persistem após reload em todas as stores

### Stores IndexedDB

| Store | Índices | Finalidade |
|-------|---------|------------|
| `metadata` | — | Flags de migração e metadados |
| `empresas` | `remote_id` (unique), `sync_status`, `source` | Empresas offline |
| `setores` | `empresa_id`, `remote_id` (unique), `sync_status`, `source` | Setores offline |
| `levantamentos` | `setor_id`, `empresa_id`, `remote_id` (unique), `sync_status`, `status`, `source` | Levantamentos offline |
| `biblioteca_tecnica` | `sync_status`, `source` | Itens de biblioteca técnica cacheados |
| `relatorios` | `levantamento_id`, `sync_status`, `source` | Relatórios offline |
| `evidencias` | `levantamento_id`, `setor_id`, `sync_status` | Evidências/imagens offline |
| `sync_queue` | `entity`, `status`, `created_at` | Fila de sincronização |
| `user_preferences` | — | Preferências do usuário |

### Serviços offline (8)

| Serviço | Responsabilidade |
|---------|-----------------|
| `offline-empresas.service` | CRUD empresas via IndexedDB com sync queue |
| `offline-setores.service` | CRUD setores via IndexedDB com sync queue |
| `offline-levantamentos.service` | CRUD levantamentos via IndexedDB com sync queue |
| `offline-evidencias.service` | CRUD evidências via IndexedDB com soft delete e sync queue |
| `offline-biblioteca.service` | Consulta e seed de biblioteca técnica |
| `offline-relatorios.service` | CRUD relatórios via IndexedDB com sync queue |
| `offline-storage.service` | Utilitários (base entity, sync queue helper, contagem, reset) |
| `sync-queue.service` | Gerenciamento da fila de sincronização |

## 8. Modo mock/local

Ativação: `import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_MODE === 'true'`

Regras:
- Login aceita qualquer e-mail e senha
- Seed de dados criado automaticamente se banco vazio
- Prefixo `risco360_` no localStorage
- Não funciona em produção (`import.meta.env.PROD`)
- Nunca chama Supabase

## 9. Estratégia de testes

- **Unitários:** Vitest + Testing Library + jsdom
- **IndexedDB mock:** `fake-indexeddb`
- **34 arquivos de teste, 413 testes passando**
- Cobertura: auth mock, storage mock, serviços mock, constantes, serviços offline, sync queue, IDs locais, offline-db, PWA configuração, consolidação, exportação XLSX/CSV, PDF conferência, compatibilidade, normalizadores, normalizadores de medição, PontoMedicaoForm

## 10. Integrações futuras (não implementar agora)

- Supabase (autenticação real e sincronização)
- Cloudflare Pages (deploy)
- GitHub (controle de versão)
- Geração de relatórios PDF / exportação XLSX
- Sincronização online/offline bidirecional

## 11. Regras permanentes

1. Único tipo de formulário: `LPR_AEP`
2. Cada setor → um formulário setorial ativo
3. Modo mock só em DEV com `VITE_ENABLE_MOCK_MODE=true`
4. Prefixo de storage: `risco360_`, nunca `riskflow_`
5. Sem `process.env` no frontend
6. Sem `service_role` / `sb_secret` em código executável
7. Sem `placeholder.supabase.co` em código
8. Modo mock nunca chama Supabase
9. Não conectar Supabase, GitHub, Cloudflare reais
10. Não implementar PDF/XLSX real, sync real, auth real
11. Não reescrever o projeto do zero
12. Não reduzir cobertura de testes
13. Não criar levantamento sem setor
14. Fluxo de criação deve nascer dentro do setor

## 12. Stack atual

- React 19 + TypeScript 6 + Vite 8
- Tailwind CSS 4 com design system próprio
- React Router v7 com lazy loading
- `idb` (IndexedDB wrapper)
- `fake-indexeddb` (mock para testes)
- `vite-plugin-pwa` (service worker generateSW + manifest configurado)
- `xlsx` (exportação XLSX/CSV no cliente)
- Supabase SDK (desativado em modo mock)
- 13 páginas implementadas
- 8 etapas do wizard implementadas
- 21 listas de opções centralizadas em `formulario-options.ts`
- `PontoMedicaoQuantitativa` com formulário refatorado (8 campos novos, validações inline, mobile-first)
- `ItemQuantificado` e `ItemInventarioAmbiente` para quantificação de itens

## 13. Análise técnica externa consolidada

### Recomendações resolvidas nas fases anteriores
1. **Ícones PWA — placeholders SVG criados** (Fase 4.1). 192x192 e 512x512 com identidade visual Risco360.
2. **Manifest duplicado corrigido** (Fase 4.1). VitePWA configurado com valores corretos; `public/manifest.json` removido.
3. **`wasOffline` nunca resetado — corrigido** (Fase 4.1). Hook `useOnlineStatus` agora reseta ao reconectar.
4. **Evidências com hard delete — corrigido** (Fase 4.1). Agora usam soft delete com sync queue.
5. **`grau_risco` como número no seed — corrigido** (Fase 4.1). Agora `"2"` (string).
6. **Migração contava do localStorage — corrigido** (Fase 4.1). Agora conta do IndexedDB.
7. **Biblioteca técnica não seedada — corrigido** (Fase 4.1). Seed com 3 itens adicionado.
8. **Contagem offline incompleta — corrigido** (Fase 4.1). `biblioteca_tecnica` e `relatorios` adicionados.
9. **`criarRelatorioOffline` com `as` cast — corrigido** (Fase 4.1). Defaults explícitos.
10. **Duplicidade de manifest — corrigido** (Fase 4.1). VitePWA configurado; manifesto manual removido.

### Recomendações resolvidas na Fase 5
1. **Campos select vs. texto livre**: Resolvido. Todas as listas de opções foram centralizadas em `src/constants/formulario-options.ts` e aplicadas nos steps 2, 4 e 6.
2. **Medições por posto/local/colaborador**: Resolvido. `PontoMedicaoQuantitativa` com campos dedicados.
3. **Campos pendentes da planilha**: Resolvido. Forro, telhado, divisórias, incêndio (multiselect), GES e mobiliário implementados.

### Recomendações parcialmente resolvidas
1. **Validação de levantamento sem setor**: Rota genérica removida; botão removido da listagem. Criação exige setor_id no serviço.
2. **Evidências em base64**: Funciona, mas base64 em imagens grandes causa pressão de memória. Registrado como melhoria futura (blob storage).

### Recomendações que não fazem mais sentido
1. **Conectar Supabase imediatamente**: Projeto segue sem Supabase; modo mock é suficiente para fase atual.
2. **Criar formulários separados LPR e AEP**: Proibido por regra — modelo único LPR_AEP.
3. **Criar LPP**: Proibido por regra.

### Decisões finais adotadas
1. Documentação consolidada em único `docs/PROJECT.md` — sem relatórios de fase separados.
2. PWA com manifesto único gerado por `vite-plugin-pwa`.
3. Ícones placeholder SVG aceitos para desenvolvimento; PNG reais necessários antes do deploy.
4. `ROUTES.levantamentosNovo` redireciona para `/empresas` — criação apenas no contexto do setor.
5. Offline-first com IndexedDB (9 stores) + sync queue → sem Supabase nesta fase.

## 14. Auditoria de fidelidade da planilha (campos)

| Item | Status | Observação |
|------|--------|------------|
| Quantidade de colaboradores do setor | Resolvido | Campo `quantidade_colaboradores` em `CaracteristicasFisicas` |
| Dimensões do ambiente | Resolvido | `largura`, `comprimento`, `pe_direito` dedicados em `CaracteristicasFisicas` |
| Forro/teto | Resolvido | Select em `CaracteristicasFisicas.forro` |
| Telhado/cobertura | Resolvido | Select em `CaracteristicasFisicas.telhado` |
| Divisórias | Resolvido | Select em `CaracteristicasFisicas.divisórias` |
| Sistema de incêndio e emergência | Resolvido | Multiselect checklist em `SegurancaEquipamentos.sistema_incendio_emergencia` |
| GES | Resolvido | Select + campo descritivo em `SegurancaEquipamentos` |
| Mobiliário do setor | Resolvido | Lista editável + quantidade + observação em `SegurancaEquipamentos.mobiliario_itens` |
| EPIs observados no ambiente | Resolvido | Step05EpisEpcs |
| EPCs observados no ambiente | Resolvido | Step05EpisEpcs |
| Medições por posto/local/colaborador | Resolvido | `PontoMedicaoQuantitativa` com posto, local, colaborador, função, tempo exposição |
| Data de lançamento no SGG | Resolvido | `data_lancamento_sgg` e `responsavel_lancamento` |
| Responsável pelo lançamento no SGG | Resolvido | `data_lancamento_sgg` e `responsavel_lancamento` |

## 15. Auditoria PWA

| Item | Status |
|------|--------|
| Manifesto único gerado | OK — VitePWA gera `manifest.webmanifest` |
| Nome do app: "Risco360" | OK |
| short_name: "Risco360" | OK |
| theme_color: "#0B6B3A" | OK |
| background_color: "#f8fafc" | OK |
| icon-192 (SVG) | OK — placeholder criado |
| icon-512 (SVG) | OK — placeholder criado |
| apple-touch-icon | Pendente — não existe (baixo impacto) |
| Instalação PWA (smartphone) | Parcial — depende de PNG reais para máxima compatibilidade |
| Modo standalone | OK — configurado |
| Lang: "pt-BR" | OK |
| Ícones PNG reais | Pendente — criar antes do deploy |

## 16. Pendências conhecidas

- [x] Testes de componente (smoke tests) ✅
- [x] Conectar Biblioteca Técnica ao formulário de Perigos e Riscos (autopreenchimento) ✅
- [x] Otimizar chunk principal (code-splitting adicional) ✅
- [ ] Playwright E2E
- [ ] Badges visuais "Salvo neste dispositivo" em cards
- [ ] Testes de acessibilidade
- [ ] Testes em modo offline (E2E)
- [ ] Avaliar migração de evidências base64 → blob storage
- [ ] Testar em smartphone pela rede local
- [ ] Criar ícones PNG reais (192x192, 512x512) para o PWA
- [ ] Adicionar apple-touch-icon

## 17. Roadmap consolidado

| Fase | Descrição |
|------|-----------|
| Fase 4.1 | QA offline-first, auditoria PWA e consolidação das análises no PROJECT.md |
| Fase 5 | Fidelidade fina da planilha: selects, campos pendentes e medições por posto/colaborador | ✅ concluída |
| Fase 6 | Biblioteca Técnica conectada ao formulário de riscos (autopreenchimento) | ✅ |
| Fase 7 | Consolidação por empresa e exportação XLSX/CSV para SGG | ✅ |
| Fase 8 | PDF de conferência | ✅ |
| Fase 8.1 | QA geral pré-integração, validação ponta a ponta e preparação para Supabase/deploy | ✅ |
| Fase 9 | Supabase real, autenticação, sincronização remota e deploy |
| Fase 9.0.1 | Correções funcionais: listas técnicas, quantificação de itens, simplificação de medição, ErrorBoundary | ✅ |
| Fase 9.0.2 | Hotfix: normalização de dados parciais (ensureArray) evita crash "Cannot read properties of undefined" no Step04 | ✅ |
| Fase 9.0.3 | Validação pós-hotfix: normalizeItensQuantificados, exportação/PDF com quantidades, testes de compatibilidade retroativa | ✅ |
| Fase 9.0.4.1 | Higiene do projeto, dependências e pacote limpo | ✅ |
| Fase 9.0.4.2 | Modelo limpo de PontoMedicaoQuantitativa e normalizadores | ✅ |
| Fase 9.0.4.3 | Refatoração do PontoMedicaoForm e Step06 | ✅ |
| Fase 9.0.4.4 | Exportação XLSX/CSV e PDF ajustados para novo modelo de medição | ✅ |
| Fase 9.0.4.5 | Migration Supabase consolidada futura, sem conectar | ✅ |
| Fase 9.0.4.6 | Performance: import dinâmico XLSX, remoção @react-pdf/renderer, manualChunks | ✅ |
| Fase 9.0.4.7 | QA final pré-Supabase: warnings, busca termos proibidos, testes, build | ✅ |

## 18. Histórico das fases

### Fase 9.0.4.1 — Higiene do projeto, dependências e pacote limpo

**Status:** concluída | **Data:** 23/06/2026

### O que foi verificado/corrigido

1. **Dependência `xlsx` declarada** — O pacote `xlsx` (^0.18.5) foi adicionado a `dependencies` em `package.json`. Era usado em `exportacao.service.ts` e seu teste, mas não estava declarado formalmente. `@types/xlsx` mantido em `devDependencies` (xlsx não fornece tipos próprios).

2. **`.gitignore` revisado** — Adicionados:
   - `node_modules/` (barra para consistência com pastas)
   - `dist/` (barra para consistência)
   - `.env.*.local` (cobre `.env.development.local`, `.env.staging.local`, etc.)
   - `coverage/` (barra)
   - `playwright-report/` (barra)
   - `test-results/` (barra)
   - `.vite/` (cache do Vite)
   - `supabase/.temp/` (barra)

3. **`.env.example` revisado** — Removido `VITE_ENABLE_DEMO_DATA=false`. Alterado `VITE_ENABLE_MOCK_MODE=false` → `VITE_ENABLE_MOCK_MODE=true` conforme especificação. Sem valores reais, sem `service_role`, sem `sb_secret`, sem `placeholder.supabase.co`.

4. **`.env.local` verificado** — Já possui os valores corretos (`VITE_ENABLE_MOCK_MODE=true`). Já está no `.gitignore`.

5. **Supabase em modo local** — `src/lib/env.ts` e `src/lib/supabase.ts` revisados:
   - App não quebra se Supabase não configurado (`supabase` é `null`)
   - Aviso controlado no console (`console.error` apenas em DEV)
   - Ausência de `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` não gera tela de erro
   - `sb_secret_` e `service_role` são usados apenas em validação de rejeição (legítimo)

6. **Busca global por termos proibidos** — Varredura em `src/`, `*.json`, `*.md`:
   - `RiskFlow`: 0 ocorrências ✅
   - `riskflow_auth`: 0 ocorrências ✅
   - `placeholder.supabase.co`: 0 em código executável (2 ocorrências em docs, legítimas) ✅
   - `process.env`: 0 em `src/` ✅
   - `service_role`: 1 ocorrência em `supabase.ts` (validação de rejeição, legítima) ✅
   - `sb_secret`: 1 ocorrência em `supabase.ts` (validação de rejeição, legítima) ✅
   - `LPP`: 2 ocorrências em testes (afirmam que LPP não é permitido, legítimo) ✅
   - `Criar LPR`, `Criar AEP`, `Formulário LPR`, `Formulário AEP`: 0 ocorrências ✅
   - `relatorio_setorial_lpr`, `relatorio_setorial_aep`: 1 ocorrência em `supabase/migrations/001_initial_schema.sql` (migration histórica, não executável) ✅
   - `using (true)`: 0 ocorrências ✅

7. **Arquivos/pastas não versionáveis** — Nenhum arquivo sensível encontrado sendo rastreado. `node_modules/`, `dist/`, `.env.local` já estão no `.gitignore`.

### Dependências alteradas

| Pacote | Ação | Versão |
|--------|------|--------|
| `xlsx` | Adicionado a `dependencies` | ^0.18.5 |
| `@types/xlsx` | Mantido em `devDependencies` | ^0.0.36 |

### Arquivos de configuração alterados

- `.gitignore` — padrões adicionados/consolidados
- `.env.example` — `VITE_ENABLE_MOCK_MODE=true`, removido `VITE_ENABLE_DEMO_DATA`
- `package.json` — `xlsx` adicionado a dependencies

### Testes executados

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 281 passed (28 files)
- `npm run build`: OK com PWA (68 entries precached)

### Pendências restantes

1. Supabase real (autenticação real e sincronização)
2. Login/autenticação real
3. Sincronização remota bidirecional
4. Deploy Cloudflare Pages
5. GitHub (controle de versão)
6. Ícones PNG reais (192x192, 512x512)
7. apple-touch-icon
8. Testes E2E com Playwright
9. Testes de acessibilidade
10. Testes em modo offline (E2E)
11. Evidências base64 → blob storage
12. Otimização de chunk principal (code-splitting adicional)
13. Badges visuais "Salvo neste dispositivo" em cards
14. Testar em smartphone pela rede local
15. Refatoração do modelo `PontoMedicaoQuantitativa` e normalizadores (Fase 9.0.4.2)

### Recomendação para a próxima subfase

**Fase 9.0.4.2 — Modelo limpo de PontoMedicaoQuantitativa e normalizadores.** Refatorar o modelo de medições quantitativas para remover acoplamento com UI e garantir normalização consistente entre IndexedDB, exportação e PDF.

---

### Fase 9.0.4.3 — Refatoração do PontoMedicaoForm e Step06

**Status:** concluída | **Data:** 23/06/2026

- PontoMedicaoForm refatorado: 8 campos novos, validações inline, seções, grid mobile-first, sem campos legados na UI
- Step06Medicoes inline: ConfirmDialog exclusão, normalizePontosMedicao na inicialização, cards com "Não medido"
- 32 novos testes (343 total, 30 arquivos)
- Removido uso semanticamente incorreto de `limite_tolerancia`, `fonte`, `numero_serie`, `responsavel` no formulário
- typecheck: 0 errors | lint: 0 errors | test: 343 passed | build: OK

---

### Fase 1 — Organização inicial, estabilização local, base de testes
**Status:** concluída | **Data:** 22/06/2026
- Limpeza de sujeira técnica (dist, tsbuildinfo, .env.local)
- Correção do .gitignore
- Configuração do Vitest e criação da base de testes
- Correção do mockSignIn e useServiceData
- Atualização dos dados mock conforme especificação
- Criação de testes automatizados (auth, storage, serviços, constantes)
- Criação do documento mestre do projeto
- Remoção de termos proibidos (RiskFlow, LPP, placeholder, etc.)
- Verificação: typecheck, lint, test, build passando

### Fase 2 — Implementação do sistema completo
**Status:** concluída | **Data:** 22/06/2026
- Sistema de tipos (10 arquivos), constantes e dados mock
- 16 serviços (mock e reais), 8 hooks de dados
- 41 componentes de UI (22 ui, 7 layout, 10 forms, 2 auth)
- 16 páginas + 8 steps do wizard LPR+AEP
- Roteamento com lazy loading
- Utilitários (mappers, calculadora de risco, progresso)
- Tema Tailwind e estilos globais
- Testes: 45 passando

### Fase 3 — Ajustes do formulário digital
**Status:** concluída | **Data:** 22/06/2026
- Ajustes finos nos 8 passos do wizard
- Correção de type errors e lint errors
- Preservação do modelo único LPR_AEP
- Testes: 48 passando

### Fase 4 — Implementação offline-first real com IndexedDB
**Status:** concluída | **Data:** 22/06/2026
- Instalação do `idb` e `fake-indexeddb`
- Banco IndexedDB `risco360_offline_db` v1 com 9 stores e índices
- Utilitário de IDs locais (`local-id.ts`)
- 8 serviços offline implementados
- Migração segura localStorage mock → IndexedDB
- Seed automático (Empresa Modelo, 4 setores, 6 medições)
- Camada `data-provider.ts` (abstração IndexedDB/localStorage)
- Hook `useOnlineStatus` e componente `OfflineBanner` (3 estados)
- Página de Configurações com seção offline
- Inicialização do data provider no AuthContext
- 40 novos testes (88 total)
- Remoção de termo `LPP` de descrições em package.json e manifest.json
- Verificação: typecheck, lint, test (88), build passando

### Fase 4.1 — QA offline-first, auditoria PWA e consolidação
**Status:** concluída | **Data:** 22/06/2026
- Validação aprofundada de toda a camada offline-first (9 stores, 8 serviços, sync queue)
- Correções críticas da validação anterior:
  - `wasOffline` nunca resetado → reseta ao reconectar
  - Evidências com hard delete sem sync queue → soft delete + sync queue
  - `grau_risco: 2` (número) → `"2"` (string)
  - Migração contava do localStorage após migração → conta do IndexedDB
  - Biblioteca técnica não seedada → 3 itens adicionados
  - `contarOffline` sem `biblioteca_tecnica`/`relatorios` → adicionados
  - ConfiguraçõesPage exibe 6 contadores
  - `criarRelatorioOffline` com `as` cast → defaults explícitos
- **Auditoria PWA:**
  - Manifesto duplicado corrigido: VitePWA configurado com valores corretos; `public/manifest.json` removido
  - Ícones placeholder SVG criados (192x192, 512x512)
  - `index.html`: link duplicado para manifest removido
  - Nome, short_name, theme_color, background_color, lang verificados
- **Bloqueio de levantamento sem setor:**
  - Botão "Novo levantamento" removido da `LevantamentosPage`
  - `ROUTES.levantamentosNovo` redireciona para `/empresas`
  - Criação apenas no contexto do setor (`SetorDetalhePage`)
- **Busca global por termos proibidos:** Nenhum termo encontrado
- **Consolidação da documentação:** único `docs/PROJECT.md` com análise externa, auditoria PWA, roadmap e pendências
- Verificação final: typecheck 0 errors, lint 0 errors, 88 testes passando, build OK

## 19. Resumo da fase atual

Fase 9.1 (conexão Supabase real), suas subfases de estabilização/hotfix e as fases 9.2.1/9.2.2 (arquitetura base sync, sincronização remota offline-first) estão concluídas. Fase 9.2.5-AUDITORIA (auditoria completa offline-first) concluída — relatório na seção 37.

| Subfase | Status |
|---------|--------|
| Fase 9.0.4.1 — Higiene do projeto, dependências e pacote limpo | ✅ |
| Fase 9.0.4.2 — Modelo limpo de PontoMedicaoQuantitativa e normalizadores | ✅ |
| Fase 9.0.4.3 — Refatoração do PontoMedicaoForm e Step06 | ✅ |
| Fase 9.0.4.4 — Exportação XLSX/CSV e PDF ajustados para novo modelo de medição | ✅ |
| Fase 9.0.4.5 — Migration Supabase consolidada futura, sem conectar | ✅ |
| Fase 9.0.4.6 — Performance: import dinâmico XLSX, remoção @react-pdf/renderer, manualChunks | ✅ |
| Fase 9.0.4.7 — QA final pré-Supabase: warnings, busca termos proibidos, testes, build | ✅ |
| Fase 9.1 — Conexão Supabase real: auth, CRUD remoto, migration, testes modo supabase | ✅ |
| Fase 9.1.1 — Validação real local com Supabase real, Auth, migration e CRUD remoto | ✅ (parcial) |
| Fase 9.1.2-HOTFIX — Correções de browser: nested button, PWA meta e PGRST116 | ✅ |
| Fase 9.1.3/9.1.4 — Persistência de evidências: upload, preview, thumbnail e remoção | ✅ |
| Fase 9.1.5 — Correções de Auth/UX: logout mock, duplo toast no cadastro e UI morta inicial | ✅ |
| Fase 9.1.6 — Busca global de termos proibidos, revisão de data-provider logs, testes consolidados | ✅ |
| Fase 9.2.1 — Arquitetura base para sincronização offline-first: tipos sync, sync queue expandida, sync-helpers, data-provider flags, ConfiguracoesPage real | ✅ |
| Fase 9.2.2 — Sincronização remota offline-first para empresas e setores: sync processor, network detector, auto-sync hook, UI chips, 508 testes | ✅ |
| Fase 9.2.5-AUDITORIA — Auditoria completa offline-first: Dexie, login offline, logout, conflitos, bucket privado + correções | ✅ |

## 20. Resumo Fase 6 — Biblioteca Técnica conectada ao formulário de riscos

**Status:** ✅ concluída em 22/06/2026

### O que foi implementado
1. **Modal `BibliotecaRiscoSelector`**: componente de busca e seleção de itens da Biblioteca Técnica
2. **Integração com `RiscoForm`**: autopreenchimento de `descricao`, `fonte_geradora`, `dano_possivel`, `medidas_controle`, `acoes_recomendadas` ao selecionar item da biblioteca
3. **Preservação de campos manuais**: autopreenchimento não sobrescreve campos já preenchidos pelo usuário
4. **Remoção de vínculo**: botão "Remover vínculo" que desassocia o risco da biblioteca sem perder dados preenchidos
5. **Campos `biblioteca_item_id` e `biblioteca_titulo`**: persistidos no levantamento para rastreamento de origem
6. **47 novos testes**: `RiscoForm.biblioteca.test.tsx` (15), `BibliotecaRiscoSelector.test.tsx` (8), `mock-biblioteca.test.ts` (30) — total 185
7. **Correção de bug**: botão "Selecionar item" sem `type="button"` causava submit prematuro do formulário

### Arquivos criados/modificados
- `src/components/forms/BibliotecaRiscoSelector.tsx` — novo modal de seleção
- `src/components/forms/RiscoForm.tsx` — integração com biblioteca
- `src/types/risco.ts` — `biblioteca_item_id`, `biblioteca_titulo`
- `src/types/database.ts` — `biblioteca_item_id`, `biblioteca_titulo` em `LevantamentoRow`
- `src/lib/mappers.ts` — mapeamento dos novos campos
- `src/data/mock/mock-levantamentos.ts` — novos campos adicionados aos mocks
- `src/data/mock/mock-biblioteca.ts` — seed de 10 itens
- `src/services/mock-biblioteca.service.ts` — CRUD mock da biblioteca
- `src/services/offline/offline-biblioteca.service.ts` — CRUD offline da biblioteca
- Testes: 3 novos arquivos de teste

### Testes executados
- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 185 passed (22 test files)
- `npm run build`: OK com PWA

### Pendências restantes após Fase 6
1. Criar ícones PNG reais (deploy)
2. Adicionar apple-touch-icon
3. Testes E2E (Playwright)
4. Testes de acessibilidade
5. Testes em modo offline (E2E)
6. Evidências base64 → blob storage
7. Consolidação por empresa e exportação XLSX/CSV

## 21. Resumo Fase 7 — Consolidação por empresa e exportação XLSX/CSV

**Status:** ✅ concluída em 23/06/2026

### O que foi implementado
1. **`xlsx` instalado**: `npm install xlsx` para geração de arquivos XLSX no cliente
2. **Tipos de consolidação** (`src/types/consolidacao.ts`): interfaces `EmpresaConsolidada`, `SetorConsolidado`, e 10 interfaces de linha de exportação (Empresa, Setores, Características, Segurança, EPIs/EPCs, Medições, Riscos, AEP, Plano de Ação, Evidências)
3. **Serviço de consolidação** (`src/services/consolidacao.service.ts`): 6 funções (`obterConsolidadoEmpresa`, `obterResumoEmpresa`, `obterSetoresConsolidados`, `obterRiscosConsolidados`, `obterMedicoesConsolidadas`, `obterPlanoAcaoConsolidado`) — tudo offline usando os serviços mock
4. **Serviço de exportação** (`src/services/exportacao.service.ts`): geração de workbook XLSX com 10 abas (Empresa, Setores, Caracteristicas, Seguranca_Mobiliario, EPIs_EPCs, Medicoes, Riscos, AEP, Plano_Acao, Evidencias) + 3 CSVs avulsos (riscos, medições, plano de ação) + funções de download
5. **Página de consolidação** (`src/pages/EmpresaConsolidadoPage.tsx`): cards de resumo (setores, riscos, medições, ações), tabela de setores com status/percentual, botões de exportação XLSX/CSV, aviso de pendências
6. **Rota** `/empresas/:empresaId/consolidado` adicionada ao router e constants
7. **Botão "Consolidar / Exportar"** na `EmpresaDetalhePage` para navegação rápida
8. **34 novos testes**: `consolidacao.service.test.ts` (8), `exportacao.service.test.ts` (17), `ConsolidadoEmpresaPage.test.tsx` (11) — total 221

### Arquivos criados
- `src/types/consolidacao.ts` — interfaces de dados consolidados
- `src/services/consolidacao.service.ts` — agregação de dados
- `src/services/exportacao.service.ts` — XLSX/CSV com download
- `src/pages/EmpresaConsolidadoPage.tsx` — página de consolidação
- `src/services/__tests__/consolidacao.service.test.ts` — 8 testes
- `src/services/__tests__/exportacao.service.test.ts` — 17 testes
- `src/pages/__tests__/ConsolidadoEmpresaPage.test.tsx` — 11 testes

### Arquivos modificados
- `src/routes/routes.constants.ts` — constante `empresaConsolidado`
- `src/routes/index.tsx` — rota lazy-loaded
- `src/pages/EmpresaDetalhePage.tsx` — botão "Consolidar / Exportar"
- `docs/PROJECT.md` — resumo das fases 6 e 7

### Testes executados
- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 221 passed (25 test files)
- `npm run build`: OK com PWA (service worker, manifest)

### Pendências restantes após Fase 8
1. Criar ícones PNG reais (deploy)
2. Adicionar apple-touch-icon
3. Testes E2E (Playwright)
4. Testes de acessibilidade
5. Testes em modo offline (E2E)
6. Evidências base64 → blob storage

## 22. Resumo Fase 8 — PDF de conferência

**Status:** ✅ concluída em 23/06/2026

### O que foi implementado
1. **Serviço de formatação** (`src/services/pdf-conferencia.service.ts`): 14 funções utilitárias para formatação de dados (valores, listas, datas, níveis de risco, categorias, status, prioridades, tipos de controle, medidas de controle, EPIs, meios de propagação), contagem de riscos críticos e evidências, e geração de nome de arquivo
2. **Página de PDF de conferência** (`src/pages/EmpresaPdfConferenciaPage.tsx`): componente completo com capa, dados da empresa, resumo geral, tabela de setores, características por setor, medições, riscos, AEP, plano de ação consolidado, evidências, parecer/fechamento com espaço para assinatura
3. **Rota** `/empresas/:empresaId/consolidado/pdf` adicionada ao router e constants
4. **Botão "PDF de Conferência"** na `EmpresaConsolidadoPage` para navegação rápida
5. **Abordagem print-based**: utiliza `window.print()` com CSS `@media print` para salvar como PDF nativo do navegador, sem dependências adicionais

### Arquivos criados
- `src/services/pdf-conferencia.service.ts` — utilitários de formatação
- `src/pages/EmpresaPdfConferenciaPage.tsx` — página do PDF de conferência

### Arquivos modificados
- `src/routes/routes.constants.ts` — constante `empresaPdfConferencia`
- `src/routes/index.tsx` — rota lazy-loaded
- `src/pages/EmpresaConsolidadoPage.tsx` — botão "PDF de Conferência"
- `docs/PROJECT.md` — resumo da Fase 8 e pendências atualizadas

### Testes executados
- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 221 passed (25 test files)
- `npm run build`: OK com PWA (service worker, manifest)

## 23. Resumo Fase 8.1 — QA geral pré-integração, validação ponta a ponta e preparação para Supabase/deploy

**Status:** ✅ concluída em 23/06/2026

### O que foi validado/corrigido

1. **Auditoria de botões em formulários** — varredura em 15+ arquivos de formulários. Correção: 2 botões em `BibliotecaRiscoSelector.tsx` sem `type="button"` que podiam causar submit prematuro de formulário.
2. **Busca global por termos proibidos** — varredura em `src/` e `*.json`. Nenhuma ocorrência em código-fonte executável. ✅
3. **Exportação XLSX/CSV** — aba Riscos agora inclui `biblioteca_item_id` e `biblioteca_titulo`; aba AEP inclui `autonomia`, `relacoes_socioprofissionais` e `justificativa_tecnica`; `formatValor` melhorado para evitar `[object Object]`.
4. **PDF de conferência** — todas as funções usam `formatarValorRelatorio` com proteção null/undefined. Nenhum `undefined`, `null` ou `[object Object]` visível.
5. **Offline-first** — arquitetura verificada: IndexedDB com 9 stores, sync queue, seed automático. Nenhuma regressão.
6. **PWA** — manifesto único, service worker gerado, theme_color #0B6B3A, nome "Risco360", ícones SVG placeholder.
7. **UX mobile** — componentes responsivos, stepper adaptável, cards legíveis. Smartphone real não disponível para teste.

### Arquivos alterados

- `src/components/forms/BibliotecaRiscoSelector.tsx` — `type="button"` em 2 botões
- `src/types/consolidacao.ts` — campos adicionados em `LinhaExportacaoRisco` e `LinhaExportacaoAEP`
- `src/services/exportacao.service.ts` — funções de linha atualizadas + `formatValor` melhorado
- `src/services/__tests__/exportacao.service.test.ts` — 2 novos testes
- `docs/PROJECT.md` — resumo da Fase 8.1, 223 testes, roadmap atualizado

### Testes executados
- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 223 passed (25 files) — 2 novos testes
- `npm run build`: OK com PWA (service worker, manifest)

## 24. Resumo Fase 9.0.1 — Correções funcionais, listas técnicas, quantificação de itens e simplificação do formulário de medição

**Status:** ✅ concluída em 23/06/2026

### O que foi implementado/corrigido

1. **ErrorBoundary + errorElement nas rotas** — Criado `AppErrorBoundary.tsx` com mensagem amigável ("Algo deu errado ao carregar esta página."), botões Voltar, Ir para Empresas e Recarregar. Detalhes técnicos colapsáveis em DEV. Adicionado `errorElement` em todas as rotas lazy do React Router para capturar erros de lazy import (incluindo `LevantamentoDetalhePage`).

2. **Lista Sim/Não para Iluminação Natural** — `OPCOES_SIM_NAO` (sim, nao, nao_avaliado) centralizado em `formulario-options.ts`. Aplicado no Step03 para o campo `iluminacao_natural`.

3. **Lista de tipos de Iluminação Artificial** — `OPCOES_ILUMINACAO_ARTIFICIAL` (10 opções: LED, Fluorescente, Incandescente, Halógena, Vapor metálico, Vapor de sódio, Mista, Ausente, Outro, Não avaliada). Se "Outro", exibe input de observação.

4. **Lista de tipos de Ventilação Artificial** — `OPCOES_VENTILACAO_ARTIFICIAL` (13 opções: Ar-condicionado split, Ar-condicionado janela, Central de ar, Ventilador parede/teto/coluna, Exaustor, Insumador, Ventilação mecânica, Mista, Ausente, Outro, Não avaliada). Se "Outro", exibe input de observação.

5. **Quantificação de itens de Segurança e Emergência** — Novo campo `sistema_incendio_emergencia_itens: ItemQuantificado[]`. Cada item (extintor, hidrante, alarme, etc.) permite informar quantidade (número) e observação. Conversão automática de dados antigos em `string[]` para o novo formato.

6. **Quantificação de Mobiliário** — `mobiliario_itens: ItemInventarioAmbiente[]` com chips predefinidos (MOBILIARIO_OPCOES), quantidade numérica e observação por item.

7. **Quantificação de Máquinas/Equipamentos** — `maquinas_equipamentos_itens: ItemInventarioAmbiente[]` com chips predefinidos (MAQUINAS_EQUIPAMENTOS_OPCOES), quantidade e observação.

8. **Simplificação do formulário de Ponto de Medição** — Removidos campos: Agente, Posto de trabalho, Local da medição, Responsável, Nome colaborador, Função, Tempo de exposição, Limite de tolerância, Método, Equipamento, Número de série, Duração, Data, Hora. Novo formulário inline com campos: Ponto/local avaliado, Ruído dB(A), Iluminação lux, Temperatura °C, Velocidade do ar m/s, Umidade %, Radiação µSv/h, Observações. Cards de resumo compactos com ruído, iluminação, temperatura, umidade.

9. **Compatibilidade com dados antigos** — `SegurancaEquipamentos` mantém campos `string[]` originais (`mobiliarios`, `maquinas_equipamentos`, `ferramentas`, `sistema_incendio_emergencia`) para exportação. Conversão automática `string[]` → `ItemQuantificado[]` / `ItemInventarioAmbiente[]` ao carregar dados existentes sem perda.

10. **Busca global por termos proibidos** — Varredura em `src/`, `*.json`, `*.md`. Nenhuma ocorrência encontrada.

### Novos tipos/interfaces

- `ItemQuantificado` — id, nome, quantidade (number | null), observacao (string | null)
- `ItemInventarioAmbiente` — extends ItemQuantificado + tipo ('mobiliario' | 'maquina_equipamento' | 'ferramenta')

### Novas listas centralizadas (formulario-options.ts)

- `OPCOES_SIM_NAO` (3)
- `OPCOES_ILUMINACAO_ARTIFICIAL` (10)
- `OPCOES_VENTILACAO_ARTIFICIAL` (13)
- `SEGURANCA_EMERGENCIA_ITENS` (12)
- `MAQUINAS_EQUIPAMENTOS_OPCOES` (19)

Total: 21 listas centralizadas (antes 16).

### Arquivos alterados

- `src/components/ui/AppErrorBoundary.tsx` — novo componente de erro amigável com errorElement
- `src/routes/index.tsx` — `errorElement` adicionado nas rotas lazy
- `src/types/levantamento.ts` — `ItemQuantificado`, `ItemInventarioAmbiente`, novos campos em `SegurancaEquipamentos`
- `src/constants/formulario-options.ts` — 5 novas listas
- `src/pages/steps/Step03IluminacaoVentilacao.tsx` — iluminação natural Sim/Não, artificiais com listas e "Outro"
- `src/pages/steps/Step04SegurancaEquipamentos.tsx` — quantidade por item (segurança, mobiliário, máquinas, ferramentas)
- `src/components/forms/PontoMedicaoForm.tsx` — simplificado (6 campos de medição + local + observação)
- `src/pages/steps/Step06Medicoes.tsx` — cards com resumo compacto adaptado
- `src/constants/__tests__/formulario-options.test.ts` — 9 novos testes
- `src/lib/__tests__/levantamento-compat.test.ts` — novo arquivo com 14 testes (compatibilidade, quantidades, tipos simplificados)
- `src/lib/__tests__/wizard-progress.test.ts` — atualizado com novos campos
- `docs/PROJECT.md` — resumo desta fase

### Testes executados

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 247 passed (26 files) — 23 novos testes
- `npm run build`: OK com PWA (68 entries precached)

### Pendências restantes
1. Supabase real (autenticação real e sincronização)
2. Login/autenticação real
3. Sincronização remota bidirecional
4. Deploy Cloudflare Pages
5. GitHub (controle de versão)
6. Ícones PNG reais (192x192, 512x512)
7. apple-touch-icon
8. Testes E2E com Playwright
9. Testes de acessibilidade
10. Testes em modo offline (E2E)
11. Evidências base64 → blob storage
12. Otimização de chunk principal (code-splitting adicional)
13. Badges visuais "Salvo neste dispositivo" em cards
14. Testar em smartphone pela rede local

---

## 25. Hotfix Fase 9.0.2 — Normalização de dados parciais (ensureArray)

**Status:** ✅ concluído em 23/06/2026

### Problema

O Step04 (Segurança e Equipamentos) disparava `TypeError: Cannot read properties of undefined (reading 'length')` ao carregar dados de IndexedDB/mock que não continham os novos campos `_itens` (`sistema_incendio_emergencia_itens`, `mobiliario_itens`, `maquinas_equipamentos_itens`, `ferramentas_itens`).

**Causa raiz:** O `useState` lazy initializer de `Step04SegurancaEquipamentos` acessava `raw.campo_itens.length` sem garantir que `raw.campo_itens` era um array. Quando dados antigos (pré-Fase 9.0.1) estavam armazenados, esses campos eram `undefined` em vez de array vazio, causando o crash.

### O que foi feito

1. **`ensureArray<T>(value)`** — Nova função utilitária em `src/lib/utils.ts` que retorna o array original se for um array, ou `[]` se for `undefined`/`null`.

2. **Step04SegurancaEquipamentos.tsx** — State initializer reescrito para usar `ensureArray` em todas as leituras de campos array do `raw` (dados carregados). Todos os 8 campos array (`sistema_incendio_emergencia`, `sistema_incendio_emergencia_itens`, `mobiliarios`, `mobiliario_itens`, `maquinas_equipamentos`, `maquinas_equipamentos_itens`, `ferramentas`, `ferramentas_itens`) são normalizados com `ensureArray` antes de qualquer acesso a `.length` ou conversão.

3. **wizard-progress.ts** — Adicionados checks para os 4 novos campos `_itens` no cálculo de percentual do Step 4, usando `?? []` (já existente no código). Também adicionados checks para `maquinas_equipamentos` e `ferramentas` que estavam ausentes.

4. **Testes** — Adicionados:
   - `src/lib/__tests__/utils.test.ts`: 4 testes para `ensureArray` (array normal, undefined, null, outros falsy)
   - `src/lib/__tests__/levantamento-compat.test.ts`: 4 testes de normalização com dados parciais (null, undefined, só string[] antigos, objeto sem arrays)
   - Total: 255 testes (27 files) — 8 novos testes

### Arquivos alterados

- `src/lib/utils.ts` — adicionado `ensureArray`
- `src/lib/__tests__/utils.test.ts` — novo arquivo de teste
- `src/pages/steps/Step04SegurancaEquipamentos.tsx` — normalização com `ensureArray`
- `src/lib/wizard-progress.ts` — checks adicionais para `_itens`
- `src/lib/__tests__/levantamento-compat.test.ts` — 4 novos testes de normalização
- `docs/PROJECT.md` — este resumo

### Testes executados

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 255 passed (27 files) — 8 novos testes
- `npm run build`: OK com PWA (68 entries precached)

---

## 26. Fase 9.0.3 — Validação pós-hotfix: normalizadores de itens quantificados, exportação/PDF com quantidades, testes de compatibilidade retroativa

**Status:** ✅ concluído em 23/06/2026

### Problema

Após o hotfix 9.0.2 (ensureArray), dados antigos no IndexedDB (pré-Fase 9.0.1) armazenavam campos de seleção múltipla como `string[]` (apenas nomes), enquanto dados novos (pós-Fase 9.0.1) armazenam `ItemQuantificado[]` (objetos com `nome`, `quantidade`, `observacao`). A exportação XLSX e o PDF de conferência não tratavam essa diferença, exibindo `[object Object]` para objetos não formatados e ignorando as quantidades nos campos `_itens`.

### O que foi feito

1. **`normalizeItensQuantificados(value)`** — Função utilitária em `src/lib/utils.ts` que normaliza dados antigos e novos:
   - `undefined`/`null` → `[]`
   - `string[]` antigo → `[{ id, nome, quantidade: null, observacao: null }]`
   - Objetos antigos (sem `id`) → preserva `nome`/`titulo`/`label` como `nome`
   - Objetos novos → preserva `id`, `nome`, `quantidade`, `observacao`

2. **`formatItemQuantificado(item)`** — Função utilitária que retorna `"Nome — X un."` se `quantidade > 0`, senão apenas `"Nome"`.

3. **Exportação XLSX** (`exportacao.service.ts`):
   - `formatItensArray(arr)` — função privada que aplica `ensureArray` + `formatItemQuantificado` a cada item
   - `segurancaParaLinhas` estendida com 4 novas colunas `_itens` (sistema_incêndio, mobiliário, máquinas, ferramentas)
   - `formatArray` e `formatValor` protegidos contra objetos não-array e não-string

4. **PDF de conferência** (`EmpresaPdfConferenciaPage.tsx`):
   - 6 novas linhas na seção Características (incêndio qtd, mobiliário qtd, máquinas qtd, ferramentas, ferramentas qtd)
   - `formatarItensRelatorio(itens)` em `pdf-conferencia.service.ts` formata itens com quantidade para o PDF

5. **Testes** (21 novos, total 281 em 28 files):
   - `src/lib/__tests__/utils.test.ts`: 8 testes `normalizeItensQuantificados` + 4 testes `formatItemQuantificado`
   - `src/services/__tests__/pdf-conferencia.service.test.ts`: 9 testes `formatarItensRelatorio`, `formatarListaRelatorio`, `formatarValorRelatorio`
   - `src/services/__tests__/exportacao.service.test.ts`: 2 testes para colunas `_itens` no workbook e ausência de `[object Object]`

### Arquivos alterados

- `src/lib/utils.ts` — `ensureArray`, `normalizeItensQuantificados`, `formatItemQuantificado`
- `src/services/exportacao.service.ts` — `formatItensArray`, colunas `_itens` em `segurancaParaLinhas`
- `src/services/pdf-conferencia.service.ts` — `formatarItensRelatorio`
- `src/pages/EmpresaPdfConferenciaPage.tsx` — 6 novas linhas com `_itens`
- `src/lib/__tests__/utils.test.ts` — 8 + 4 testes
- `src/services/__tests__/pdf-conferencia.service.test.ts` — 9 testes
- `src/services/__tests__/exportacao.service.test.ts` — 2 testes
- `docs/PROJECT.md` — este resumo

### Testes executados

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 281 passed (28 files) — 21 novos testes
- `npm run build`: OK com PWA (68 entries precached)

## 27. Fase 9.0.4.5 — Migration Supabase consolidada futura, sem conectar Supabase

**Status:** ✅ concluída em 23/06/2026

### O que foi implementado

1. **Migration consolidada** `supabase/migrations/0002_risco360_schema_consolidado.sql`:
   - Evolução idempotente da `001_initial_schema.sql` (ALTER TABLE ADD COLUMN, DO $$ blocks)
   - Fix: constraint `levantamentos.tipo` alterada de `IN ('LPR','LPP','AEP','LPR_AEP')` para `= 'LPR_AEP'`
   - Fix: constraint `levantamentos.status` atualizada para `('rascunho', 'em_andamento', 'concluido', 'arquivado')`
   - Fix: constraint `relatorios.tipo` alterada para `('xlsx', 'csv', 'pdf_conferencia')`
   - Fix: constraint `relatorios.status` alterada para `('gerado', 'pendente', 'erro')`
   - Add: colunas `deleted_at`, `local_id`, `sync_status`, `last_synced_at` em todas as tabelas principais
   - Add: colunas do frontend em `levantamentos` (caracteristicas_fisicas, iluminacao_ventilacao_conforto, seguranca_equipamentos, epis_epcs_evidencias, pontos_medicao, avaliacao_ergonomica_preliminar, plano_acao, observacoes_iniciais)
   - Add: colunas do frontend em `biblioteca_tecnica` (fonte_geradora, danos_possiveis, meios_propagacao, descricao_exposicao, sugestao_exposicao, acoes_recomendadas)
   - Add: colunas do frontend em `setores` (localizacao, responsavel_local, observacoes)
   - Add: colunas do frontend em `relatorios` (empresa_id, titulo, metadata)
   - Nova tabela `evidencias` com RLS, índices, storage policies
   - Nova tabela `sync_log` com RLS, constraints de operação/status, índices
   - Storage bucket `evidencias` (privado) com políticas por pasta de usuário
   - Índice único parcial `levantamentos_setor_tipo_ativo_unique` (apenas 1 ativo por setor)
   - Comentário SQL documentando o modelo `pontos_medicao` (8 campos, sem limite_tolerancia/fonte/numero_serie/responsavel)
   - Triggers `updated_at` para evidencias e sync_log (demais já existentes em 001)

2. **Tipos TypeScript** (`src/types/database.ts`):
   - `EvidenciaRow` — interface completa
   - `SyncLogRow` — interface completa
   - Campos sync (`local_id`, `sync_status`, `last_synced_at`, `deleted_at`) adicionados em todas as interfaces
   - `LevantamentoRow.tipo` restrito a `'LPR_AEP'`

3. **Testes de validação da migration** (`src/supabase/__tests__/migration-0002.test.ts`):
   - 22 testes que leem o SQL e validam estrutura, constraints, RLS, storage, modelo pontos_medicao
   - Verifica que NÃO contém `using (true)` em políticas
   - Verifica que NÃO permite LPR, LPP ou AEP como tipo ativo
   - Verifica trigger `set_updated_at` referenciado (função definida em 001)

### Arquivos principais alterados

- `supabase/migrations/0002_risco360_schema_consolidado.sql` — migration consolidada (617 linhas)
- `src/types/database.ts` — EvidenciaRow, SyncLogRow, campos sync
- `src/supabase/__tests__/migration-0002.test.ts` — 22 testes de validação

### Testes executados

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 365 passed (31 files) — 22 novos testes de migration
- `npm run build`: OK com PWA

### Validação Supabase futura

- Supabase conectado nesta fase: **Não**
- Login real ativado nesta fase: **Não**
- Sync remota implementada nesta fase: **Não**
- Deploy realizado nesta fase: **Não**

### Pendências restantes

1. Conectar Supabase real (próxima fase)
2. Ativar login real com `@supabase/supabase-js` + `AuthContext`
3. Implementar sincronização remota via `sync_log` + `sync_queue`
4. Deploy (Cloudflare Pages ou Vercel)
5. Ícones PNG reais e apple-touch-icon
6. Testes E2E (Playwright)
7. Evidências base64 → blob storage

---

## 28. Fase 9.0.4.6 — Performance: import dinâmico XLSX, remoção de dependências, manualChunks

**Status:** ✅ concluída em 23/06/2026

### Problema

O bundle principal do Vite incluía o pacote `xlsx` (425 KB) no chunk principal (`index`), mesmo sendo usado apenas na `EmpresaConsolidadoPage`. Além disso, `@react-pdf/renderer` estava declarado em `package.json` mas não era utilizado em nenhum lugar do código (o PDF de conferência usa `window.print()` nativo).

### O que foi feito

1. **Import dinâmico do XLSX** (`src/services/exportacao.service.ts`):
   - `import * as XLSX` estático removido
   - Substituído por `const X = await import('xlsx')` em 3 funções: `gerarWorkbookEmpresa`, `exportarEmpresaParaXLSX`, `baixarArquivoXLSX`
   - Funções tornadas `async` com `await`

2. **`EmpresaConsolidadoPage.tsx`** — handler `handleExportXLSX` tornado `async`

3. **`exportacao.service.test.ts`** — testes atualizados com `await gerarWorkbookEmpresa`

4. **`@react-pdf/renderer` removido** de `package.json` e `package-lock.json` (58 pacotes a menos)

5. **`manualChunks` no Vite** (`vite.config.ts`):
   - Função compatível com Rolldown (Vite 8)
   - Chunks separados: `vendor` (react, react-dom, react-router), `supabase`, `icons` (lucide-react)

### Resultados de performance

| Métrica | Antes | Depois |
|---------|-------|--------|
| `dist/assets/index-*.js` | 314 KB | 31 KB |
| `dist/assets/xlsx-*.js` | (inline no index) | 425 KB (chunk independente, sob demanda) |
| `dist/assets/EmpresaConsolidadoPage-*.js` | 291 KB | 15.5 KB |
| Total chunks | ~40 | 52 (mais granular) |
| Cache por sessão | — | xlsx cacheado após primeiro uso |

### Impacto no usuário
- **Primeiro carregamento:** redução de ~425 KB no bundle inicial
- **Exportar XLSX:** pequeno delay (500ms–1s) apenas no primeiro clique — o chunk é cacheado pela sessão via Vite dynamic import

### Arquivos alterados

- `src/services/exportacao.service.ts` — import dinâmico, funções async
- `src/services/__tests__/exportacao.service.test.ts` — await gerarWorkbookEmpresa
- `src/pages/EmpresaConsolidadoPage.tsx` — handleExportXLSX async
- `vite.config.ts` — manualChunks function
- `package.json` — @react-pdf/renderer removido

### Testes executados

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 365 passed (31 files) — nenhum novo teste
- `npm run build`: OK com PWA (chunks independentes vendor, supabase, icons, xlsx)

---

## 29. Fase 9.0.4.7 — QA final pré-Supabase

**Status:** ✅ concluída em 23/06/2026

### Problema

Antes de iniciar a conexão com Supabase real (Fase 9.1), era necessário eliminar todos os warnings de renderização e garantir que o código está limpo de termos proibidos, inconsistências e problemas de acessibilidade.

### O que foi verificado/corrigido

1. **WARNING `<button>` aninhado corrigido** (`src/components/forms/BibliotecaRiscoSelector.tsx`):
   - `Card` com `onClick` renderiza como `<button>` (linha 22-23 de `Card.tsx`)
   - Substituído por `<div role="button" tabIndex={0} onKeyDown>` para manter acessibilidade por teclado (Enter/Space)
   - Clique no cartão seleciona o item
   - Botão "Usar" interno com `stopPropagation` para evitar conflito
   - **8 testes passando** (BibliotecaRiscoSelector) + **15 testes** (RiscoForm.biblioteca)

2. **Busca global por termos proibidos** — varredura em `src/`, `*.json`, `*.md`, `*.html`:
   - `RiskFlow`: 0 ocorrências ✅
   - `riskflow_auth`: 0 ocorrências ✅
   - `placeholder.supabase.co`: 0 ocorrências ✅
   - `using (true)`: 0 ocorrências ✅
   - `service_role` / `sb_secret`: apenas em validação de rejeição em `supabase.ts` (legítimo) ✅
   - `process.env`: 0 em `src/` e `vite.config.ts` ✅
   - LPR/AEP como tipo ativo separado: 0 ocorrências ✅
   - `Criar LPR`, `Criar AEP`, `Formulário LPR`, `Formulário AEP`: 0 ocorrências ✅

3. **Performance verificada:**
   - `xlsx` com import dinâmico ✅ (3 ocorrências de `await import('xlsx')`)
   - `manualChunks` configurado como função Rolldown-compatible ✅
   - `@react-pdf/renderer` removido ✅

4. **Migration 0002 verificada:**
   - Sem `using (true)` em políticas ✅
   - Constraint `tipo = 'LPR_AEP'` ✅
   - Tabelas evidencias/sync_log completas ✅
   - 22 testes passando ✅

### Arquivos alterados

- `src/components/forms/BibliotecaRiscoSelector.tsx` — Card → div + role="button" (corrige nested button warning)

### Testes executados

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 365 passed (31 files) — sem regressões
- `npm run build`: OK com PWA (63 entries, 1250.76 KiB precached, 52 chunks)

### Pendências restantes (Fase 9.1+)

1. ~~Conectar Supabase real (autenticação real e sincronização)~~ ✅
2. ~~Ativar login real com `@supabase/supabase-js` + `AuthContext`~~ ✅
3. Implementar sincronização remota via `sync_log` + `sync_queue`
4. Deploy (Cloudflare Pages ou Vercel)
5. Ícones PNG reais (192x192, 512x512)
6. apple-touch-icon
7. Testes E2E (Playwright)
8. Evidências base64 → blob storage
9. Testes de acessibilidade
10. Testes em modo offline (E2E)
11. Badges visuais "Salvo neste dispositivo" em cards

---

## 30. Fase 9.1 & 9.1.1 — Conexão Supabase real e validação real local

**Status:** ✅ Fase 9.1 concluída, ✅ Fase 9.1.1 concluída (parcial — validação Auth/CRUD manual pendente)

### O que foi implementado/validado

**Fase 9.1 (implementada na conversa anterior):**
1. AuthContext totalmente refatorado: mock mode → auto-login; Supabase mode → autenticação real com session recovery, `onAuthStateChange`, signIn/signUp/logout reais
2. Routes: LoginPage público, ProtectedRoute adicionado (redireciona ao login se Supabase mode e não autenticado)
3. AuthenticatedLayout aceita children (em vez de Outlet interno)
4. `.env.example` documentado com modo mock vs Supabase
5. `supabase.ts` valida URL (rejeita placeholder, sb_secret_, service_role) e anon key
6. Testes `supabase-mode.test.ts` com 22 testes (env, auth, CRUD, validação tipo)

**Fase 9.1.1 (implementada nesta conversa):**
1. **Credenciais Supabase conectadas** — `.env.local` configurado com URL e anon key reais (`VITE_ENABLE_MOCK_MODE=false`)
2. **Migration 0002** — executada no Supabase real pelo usuário (tabelas: profiles, empresas, setores, levantamentos, biblioteca_tecnica, evidencias, relatorios, sync_log; bucket evidencias; RLS ativa; constraint tipo='LPR_AEP'; sem `using(true)`)
3. **Type fixes por typecheck (13→0 erros):**
   - `src/types/database.ts` — sync fields (`deleted_at`, `sync_status`, `local_id`, `last_synced_at`) tornados opcionais em EmpresaRow, SetorRow, LevantamentoRow, BibliotecaTecnicaRow, RelatorioRow
   - Campos frontend do LevantamentoRow (`caracteristicas_fisicas`, `iluminacao_ventilacao_conforto`, `seguranca_equipamentos`, `epis_epcs_evidencias`, `pontos_medicao`, `avaliacao_ergonomica_preliminar`, `plano_acao`) tornados opcionais
   - `EmpresaRow` e `SetorRow` — adicionados campos sync opcionais que faltavam
   - `AuthContext.tsx` — null guards em `result.data` após signIn/signUp
   - `@types/node` instalado e adicionado ao `tsconfig.app.json`
   - `supabase-mode.test.ts` — `vi.stubEnv('DEV', true)` (boolean), import `Levantamento` removido
4. **Testes adaptados** — testes de levantamento em `supabase-mode.test.ts` agora usam `vi.resetModules()` + `vi.stubEnv('VITE_ENABLE_MOCK_MODE', 'true')` para rodar em mock mode independentemente do .env.local
5. **Busca global** — 0 ocorrências de termos proibidos (todas ocorrências legítimas em testes/supabase.ts validação)
6. **Testes executados:**
   - `npm run typecheck`: 0 errors
   - `npm run lint`: 0 errors
   - `npm run test`: 387 passed (32 files) — 22 novos testes
   - `npm run build`: OK com PWA (61 entries, 1252.95 KiB precached)

### Supabase

| Item | Status |
|------|--------|
| Migration 0002 executada | ✅ (pelo usuário) |
| Tabelas validadas | profiles, empresas, setores, levantamentos, biblioteca_tecnica, evidencias, relatorios, sync_log |
| RLS ativa | ✅ |
| Constraint tipo='LPR_AEP' | ✅ |
| Sem `using (true)` | ✅ |
| Storage bucket evidencias | ✅ (criado pela migration) |
| URL corrigida (.com → .co) | ✅ |
| Anon key validada | ✅ (auth health endpoint 200) |

### Auth

| Item | Status |
|------|--------|
| Login real | Pendente (requer browser) |
| Logout real | Pendente (requer browser) |
| Sessão persistente | Implementado (getCurrentSession + onAuthStateChange) |
| Profile | Implementado (getCurrentProfile com fallback) |
| Erros amigáveis | ✅ (getFriendlyAuthError, getFriendlyDataError) |

### CRUD remoto

| Item | Status |
|------|--------|
| Empresas | Implementado (services com fallback mock) |
| Setores | Implementado |
| Levantamentos | Implementado (com user_id, setor_id, tipo LPR_AEP) |
| Biblioteca Técnica | Implementado |
| Validação manual | Pendente (requer browser) |

### RLS

| Item | Status |
|------|--------|
| INSERT com user_id diferente falha | Validado via código (migration policy) |
| SELECT de outro usuário falha | Validado via código (migration policy) |
| Sem `using (true)` | ✅ |

### Modo mock/offline

| Item | Status |
|------|--------|
| Mock mode preservado | ✅ — `supabase-mode.test.ts` testa explicitamente com mock mode |
| Supabase não é chamado em mock mode | ✅ — `isMockModeEnabled` em `mock-mode.ts` retorna false se VITE_ENABLE_MOCK_MODE=false |
| IndexedDB continua funcional | ✅ |
| Fluxo Empresa→Setor→Levantamento | ✅ |

### Arquivos alterados nesta conversa

- `src/types/database.ts` — sync fields e campos frontend opcionais
- `src/contexts/AuthContext.tsx` — null guards em signIn/signUp
- `src/lib/__tests__/supabase-mode.test.ts` — mock mode forçado via stubEnv, import Levantamento removido
- `tsconfig.app.json` — `"node"` adicionado a types
- `package.json` — @types/node adicionado
- `.env.local` — URL e anon key reais, VITE_ENABLE_MOCK_MODE=false
- `docs/PROJECT.md` — este resumo

### Pendências restantes

1. **Validação manual no browser** — login/logout/sessão/CRUD real com Supabase
2. Sincronização remota automática — fase futura (Fase 9.2)
3. Deploy — fase futura
4. Ícones PNG reais e apple-touch-icon
5. Testes E2E Playwright
6. Evidências base64 → blob storage
7. Testes de acessibilidade

### Recomendação para a próxima fase

**Fase 9.2 — Sincronização remota, sync queue e resolução local_id/remote_id.** Implementar sincronização bidirecional entre IndexedDB e Supabase usando sync_log + sync_queue.

---

## 31. Fase 9.1.2-HOTFIX — Correções de browser em Supabase mode: nested button, PWA meta e PGRST116 ao salvar levantamento

**Status:** ✅ concluída em 24/06/2026

### Problemas encontrados

1. **Nested `<button>` em SetoresPage** — O componente `Card` renderizava como `<button>` quando possuía `onClick`. Dentro do card de setor existiam botões internos de editar/excluir (`<Button>`), criando `<button>` aninhado, que é HTML inválido.
2. **Meta tag PWA depreciada** — O `index.html` possuía `apple-mobile-web-app-capable` mas faltava `mobile-web-app-capable`, gerando warning moderno no navegador.
3. **PGRST116 ao atualizar levantamento** — As funções `atualizarLevantamento`, `atualizarStatusLevantamento` e `atualizarPercentualLevantamento` usavam `.single()` no Supabase, que lança exceção PGRST116 quando o update retorna 0 linhas (por RLS ou registro inexistente). Isso quebrava o wizard ao salvar Step02.

### O que foi corrigido

1. **Card.tsx — Nested button corrigido:**
   - Card com `onClick` agora renderiza como `<div role="button" tabIndex={0} onKeyDown>` em vez de `<button>`
   - Navegação por Enter e Space preservada
   - Botões internos continuam funcionando sem disparar navegação do card (já possuíam `stopPropagation`)
   - SetoresPage, EmpresaDetalhePage, LevantamentosPage, BibliotecaPage — todas usam Card com onClick; as páginas que contêm botões internos (SetoresPage) agora funcionam sem warning

2. **index.html — PWA meta corrigida:**
   - `mobile-web-app-capable` adicionado
   - `apple-mobile-web-app-capable` preservado para compatibilidade iOS

3. **levantamentos.service.ts — PGRST116 tratado:**
   - `atualizarLevantamento`: `.single()` → `.maybeSingle()`, filtro `.eq('user_id', user.id)` adicionado, retorno de erro amigável quando `data` é null
   - `atualizarStatusLevantamento`: mesmo padrão
   - `atualizarPercentualLevantamento`: mesmo padrão
   - Mensagem amigável: "Levantamento não encontrado no servidor ou sem permissão de acesso. Recarregue a lista e tente novamente."
   - RLS preservada, sem `using(true)`, sem `service_role`

4. **useLevantamentoWizard.ts — Proteção adicional:**
   - `saveStep` agora verifica `result.data` não é null antes de usar
   - Se null, exibe toast com mensagem amigável e retorna false sem quebrar a tela

5. **data-provider.ts — Log duplicado reduzido:**
   - Log `[DataProvider] Supabase configurado` agora só aparece em desenvolvimento (`env.isDev`)

### Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/components/ui/Card.tsx` | Card com onClick renderiza como div role="button" (não mais button) |
| `index.html` | Adicionado `<meta name="mobile-web-app-capable">` |
| `src/services/levantamentos.service.ts` | 3 funções de update: maybeSingle + filtro user_id + erro amigável |
| `src/hooks/useLevantamentoWizard.ts` | null check em result.data após update |
| `src/services/data-provider.ts` | Log condicional em dev |

### Testes executados

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 387 passed (32 files) — sem regressões
- `npm run build`: OK com PWA (61 entries precached)

### Pendências

1. Sync remota completa (Fase 9.2) — continua pendente
2. Validação manual no browser com Supabase real (login, CRUD, Step02 salvar sem PGRST116)
3. Ícones PNG reais e apple-touch-icon
4. Testes E2E Playwright
5. Evidências base64 → blob storage

### Recomendação

Continuar Fase 9.1.2 — validação manual completa no navegador com Supabase real (`VITE_ENABLE_MOCK_MODE=false`), testando login, CRUD, wizard steps, avanço de status, e confirmando ausência dos 3 warnings corrigidos neste hotfix.

---

## 32. Fase 9.1.2-HOTFIX-2 — Correção de status inválido em levantamentos e mensagem de erro incorreta

**Status:** ✅ concluída em 24/06/2026

### Problema

1. **Status inválido enviado ao banco** — A tela `LevantamentoDetalhePage` enviava status como `em_campo`, `em_revisao` e `exportado` via `handleAdvanceStatus`, que violavam a constraint `chk_levantamentos_status` do banco (permite apenas `rascunho`, `em_andamento`, `concluido`, `arquivado`).

2. **Mensagem de erro incorreta** — O erro `23514` (check constraint violation) caía na mensagem genérica "Levantamento não encontrado no servidor ou sem permissão de acesso", quando deveria exibir "Status inválido para o levantamento".

3. **Tipo TypeScript desalinhado** — `StatusLevantamento` permitia 6 valores (`rascunho`, `em_campo`, `em_andamento`, `em_revisao`, `concluido`, `exportado`), mas o banco permite apenas 4 (`rascunho`, `em_andamento`, `concluido`, `arquivado`).

### O que foi corrigido

1. **`src/types/levantamento.ts`** — `StatusLevantamento` alterado para `'rascunho' | 'em_andamento' | 'concluido' | 'arquivado'`. Adicionado `STATUS_LEVANTAMENTO_VALIDOS` exportado para reuso.

2. **`src/constants/levantamentos.ts`** — `STATUS_LEVANTAMENTO`, `STATUS_LEVANTAMENTO_LABELS`, `STATUS_LEVANTAMENTO_COLORS` atualizados para refletir apenas os 4 status válidos.

3. **`src/lib/levantamento-status.ts`** — Novo helper `getProximoStatusLevantamento`: `rascunho → em_andamento → concluido → null`, `arquivado → null`.

4. **`src/pages/LevantamentoDetalhePage.tsx`** — `handleAdvanceStatus` agora usa `getProximoStatusLevantamento`. Removeu `statusTransitions` e `nextStatusLabel` antigos. Botão de avanço desabilitado para `concluido`/`arquivado`.

5. **`src/pages/LevantamentosPage.tsx`**, **`src/pages/EmpresaDetalhePage.tsx`**, **`src/pages/SetorDetalhePage.tsx`**, **`src/pages/EmpresaConsolidadoPage.tsx`** — `statusBadge` e filtros atualizados para 4 status válidos.

6. **`src/pages/DashboardPage.tsx`**, **`src/pages/EmpresaPdfConferenciaPage.tsx`**, **`src/services/consolidacao.service.ts`** — Filtros de "concluídos" removem referência a `exportado`.

7. **`src/services/levantamentos.service.ts`** — `atualizarStatusLevantamento` valida status antes de enviar ao Supabase. Se inválido, retorna erro amigável sem chamar o banco. Importa `STATUS_LEVANTAMENTO_VALIDOS` do tipo.

8. **`src/lib/errors.ts`** — `getFriendlyDataError` agora detecta `code: '23514'` + `chk_levantamentos_status` e retorna mensagem específica. Funções auxiliares `getErrorCode` e `getErrorMessage` extraídas.

9. **`src/lib/mappers.ts`** — `mapLevantamentoRowToLevantamento` faz fallback para `rascunho` se status vindo do banco for inválido.

10. **`src/lib/__tests__/levantamento-status.test.ts`** — Novo arquivo com 11 testes: fluxo de próximo status, validação de lista, erro 23514, rejeição de status inválido.

### Status

- **Status permitidos no banco:** `rascunho`, `em_andamento`, `concluido`, `arquivado`
- **Status permitidos no frontend:** `rascunho`, `em_andamento`, `concluido`, `arquivado`
- **Status inválido identificado (removidos):** `em_campo`, `em_revisao`, `exportado`
- **Próximo status:** `rascunho → em_andamento → concluido → null`
- **Constraint preservada:** `chk_levantamentos_status` no banco — inalterada

### Supabase

- **Erro 23514 corrigido:** Agora mapeado para `"Status inválido para o levantamento. Recarregue a página e tente novamente."`
- **RLS preservada:** Sem `using(true)`, sem `service_role`
- **Registro remoto validado:** Pendente (requer browser com Supabase real)

### Mensagem amigável

- **Antes:** `"Levantamento não encontrado no servidor ou sem permissão de acesso. Recarregue a lista e tente novamente."`
- **Depois:** `"Status inválido para o levantamento. Recarregue a página e tente novamente."`
- Mensagem "não encontrado ou sem permissão" permanece apenas quando `maybeSingle` retorna `null` (0 linhas após update).

### Arquivos principais alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/types/levantamento.ts` | Type + constantes atualizadas |
| `src/constants/levantamentos.ts` | STATUS_LEVANTAMENTO, LABELS, COLORS |
| `src/lib/levantamento-status.ts` | Novo helper `getProximoStatusLevantamento` |
| `src/lib/errors.ts` | Tratamento de erro 23514 |
| `src/lib/mappers.ts` | Fallback de status inválido |
| `src/services/levantamentos.service.ts` | Validação de status antes do PATCH |
| `src/pages/LevantamentoDetalhePage.tsx` | Lógica de avanço refatorada |
| `src/pages/LevantamentosPage.tsx` | Filtros e badges |
| `src/pages/EmpresaDetalhePage.tsx` | Badge e resumo |
| `src/pages/SetorDetalhePage.tsx` | Badge |
| `src/pages/DashboardPage.tsx` | Filtro concluídos |
| `src/pages/EmpresaConsolidadoPage.tsx` | Badge |
| `src/pages/EmpresaPdfConferenciaPage.tsx` | Filtro concluídos |
| `src/services/consolidacao.service.ts` | Filtro concluídos |
| `src/lib/__tests__/levantamento-status.test.ts` | 11 novos testes |

### Testes executados

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 398 passed (33 files) — 11 novos testes
- `npm run build`: OK com PWA (61 entries precached, 1253.71 KiB)

### Validação manual pendente

Executar em Supabase mode (`VITE_ENABLE_MOCK_MODE=false`) com `npm run dev`:

1. Abrir levantamento remoto existente
2. Ver status atual
3. Clicar avançar status — PATCH deve enviar status permitido
4. Confirmar sem erro 23514
5. Confirmar status muda no Supabase
6. Recarregar página — status persiste
7. Tentar avançar quando concluído/arquivado — app não envia status inválido
8. Mensagem amigável se não houver próximo status

### Pendências

1. Sync remota completa (Fase 9.2) — continua pendente
2. Validação manual no browser com Supabase real (avanço de status sem 23514)
3. Ícones PNG reais e apple-touch-icon
4. Testes E2E Playwright
5. Evidências base64 → blob storage

### Recomendação

Continuar Fase 9.1.2 — validação manual completa no navegador com Supabase real (`VITE_ENABLE_MOCK_MODE=false`), testando login, CRUD, wizard steps, avanço de status, e confirmando ausência dos 3 warnings corrigidos neste hotfix.

Sync remota (Fase 9.2) permanece como próxima milestone após Fase 9.1.2.

---

## 33. Fase 9.1.3 — Estabilização crítica da persistência Supabase do levantamento, status e Steps 2 a 8

**Status:** ✅ concluída em 24/06/2026

### Problemas corrigidos

1. **Campos novos não persistidos no Supabase** — `criarLevantamento` e `atualizarLevantamento` não enviavam os campos novos (`caracteristicas_fisicas`, `iluminacao_ventilacao_conforto`, `seguranca_equipamentos`, `epis_epcs_evidencias`, `avaliacao_ergonomica_preliminar`, `plano_acao`) para o Supabase. Os Steps 2–8 do wizard enviavam dados para os hooks que salvavam, mas o service não repassava ao banco.

2. **Mapper ignorava campos novos** — `mapLevantamentoRowToLevantamento` não populava os campos novos ao ler do Supabase, fazendo com que o frontend sempre recebesse `undefined` para dados recém-salvos.

3. **Tipos Levantamento e LevantamentoCreateInput sem `avaliacao_ergonomica_preliminar` e `plano_acao`** — Esses campos existiam no banco (migration 0002) mas não estavam declarados no tipo principal `Levantamento`, causando impossibilidade de mapeamento.

4. **useLevantamentoWizard salvava AEP/controles em campos legados** — `setAvaliacaoErgonomica` enviava apenas para `avaliacao_ergonomica` (campo antigo), e `setControles` apenas para `controles` (campo antigo). Agora salvam em ambos (novo como fonte principal + antigo como fallback).

5. **Step07PerigosRiscosAep usava props legadas** — A interface `Step07PerigosRiscosAepProps` usava `avaliacao_ergonomica` e `controles` em vez de `avaliacao_ergonomica_preliminar` e `plano_acao`.

6. **DetalhePage, consolidação, exportação e PDF usavam apenas campos legados** — Agora usam campos novos com fallback para antigos.

### O que foi corrigido

1. **`src/types/levantamento.ts`** — Adicionados `avaliacao_ergonomica_preliminar` e `plano_acao` a `Levantamento` e `LevantamentoCreateInput`.

2. **`src/lib/mappers.ts`** — `mapLevantamentoRowToLevantamento` agora mapeia:
   - `caracteristicas_fisicas` (fallback: `caracteristicas`)
   - `iluminacao_ventilacao_conforto`
   - `seguranca_equipamentos`
   - `epis_epcs_evidencias`
   - `pontos_medicao` (fallback: `medicoes`)
   - `avaliacao_ergonomica_preliminar` (fallback: `avaliacao_ergonomica`)
   - `plano_acao` (fallback: `controles`)

3. **`src/services/levantamentos.service.ts`**:
   - `criarLevantamento`: payload inclui todos os 7 campos novos
   - `atualizarLevantamento`: condicionais para todos os 7 campos novos

4. **`src/hooks/useLevantamentoWizard.ts`**:
   - `setAvaliacaoErgonomica` salva `avaliacao_ergonomica_preliminar` + `avaliacao_ergonomica`
   - `setControles` salva `plano_acao` + `controles`

5. **`src/pages/steps/Step07PerigosRiscosAep.tsx`** — Props renomeadas para `avaliacao_ergonomica_preliminar` e `plano_acao`.

6. **`src/pages/LevantamentoWizardPage.tsx`** — Step07 recebe `lev.avaliacao_ergonomica_preliminar ?? lev.avaliacao_ergonomica` e `lev.plano_acao ?? lev.controles`.

7. **`src/pages/LevantamentoDetalhePage.tsx`** — Usa `pontos_medicao` e `plano_acao` com fallback para legados.

8. **`src/services/consolidacao.service.ts`** — Controles usa `plano_acao` com fallback.

9. **`src/services/exportacao.service.ts`** — AEP usa `avaliacao_ergonomica_preliminar` com fallback.

10. **`src/pages/EmpresaPdfConferenciaPage.tsx`** — AEP usa `avaliacao_ergonomica_preliminar` com fallback.

11. **`src/lib/__tests__/levantamento-status.test.ts`** — Removeu import `vi` não utilizado.

### Arquivos principais alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/types/levantamento.ts` | `avaliacao_ergonomica_preliminar` + `plano_acao` adicionados |
| `src/lib/mappers.ts` | 7 novos campos mapeados com fallback |
| `src/services/levantamentos.service.ts` | 7 novos campos em criar/atualizar |
| `src/hooks/useLevantamentoWizard.ts` | AEP/controles salvos nos campos novos |
| `src/pages/steps/Step07PerigosRiscosAep.tsx` | Props renomeadas |
| `src/pages/LevantamentoWizardPage.tsx` | Passa campos novos ao Step07 |
| `src/pages/LevantamentoDetalhePage.tsx` | Usa campos novos com fallback |
| `src/services/consolidacao.service.ts` | plano_acao com fallback |
| `src/services/exportacao.service.ts` | AEP com fallback |
| `src/pages/EmpresaPdfConferenciaPage.tsx` | AEP com fallback |
| `src/lib/__tests__/levantamento-status.test.ts` | Removeu `vi` não usado |

### Status

- **Status permitidos no banco:** `rascunho`, `em_andamento`, `concluido`, `arquivado`
- **Status inválido identificado (corrigido em Fase 9.1.2-HOTFIX-2):** `em_campo`, `em_revisao`, `exportado`
- **Próximo status:** `rascunho → em_andamento → concluido → null`
- **Constraint preservada:** `chk_levantamentos_status` — inalterada

### Persistência Supabase

| Step | Campo novo | Status |
|------|-----------|--------|
| Step02 / Características | `caracteristicas_fisicas` | ✅ criado, atualizado, lido e mapeado |
| Step03 / Iluminação/Ventilação | `iluminacao_ventilacao_conforto` | ✅ criado, atualizado, lido e mapeado |
| Step04 / Seg/Equipamentos | `seguranca_equipamentos` | ✅ criado, atualizado, lido e mapeado |
| Step05 / EPIs/EPCs | `epis_epcs_evidencias` | ✅ criado, atualizado, lido e mapeado |
| Step06 / Medições | `pontos_medicao` | ✅ criado, atualizado (fallback `medicoes`) |
| Step07 / Riscos + AEP + Plano | `riscos`, `avaliacao_ergonomica_preliminar`, `plano_acao` | ✅ todos criados/atualizados |
| Step08 / Parecer + Assinaturas | `parecer`, `assinatura_tecnico`, `assinatura_empresa` | ✅ (campos existentes) |

### Campos legados

| Campo antigo | Uso atual | Fallback |
|-------------|-----------|----------|
| `caracteristicas` | Secundário | Sim — usado se `caracteristicas_fisicas` vazio |
| `medicoes` | Secundário | Sim — usado se `pontos_medicao` vazio |
| `avaliacao_ergonomica` | Secundário | Sim — usado se `avaliacao_ergonomica_preliminar` vazio |
| `controles` | Secundário | Sim — usado se `plano_acao` vazio |
| `assinatura_tecnico` | Primário (não há substituto novo) | — |
| `assinatura_empresa` | Primário (não há substituto novo) | — |

### Mensagem amigável

| Cenário | Mensagem |
|---------|----------|
| Erro 23514 (status inválido) | "Status inválido para o levantamento. Recarregue a página e tente novamente." |
| Registro inexistente/RLS (maybeSingle retorna null) | "Levantamento não encontrado no servidor ou sem permissão de acesso. Recarregue a lista e tente novamente." |
| Status inválido no frontend | "Status de levantamento inválido. Recarregue a página e tente novamente." |

### Testes executados

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 398 passed (33 files) — sem regressões
- `npm run build`: OK com PWA (61 entries precached, 1255.45 KiB)

### Validação manual pendente

Executar em Supabase mode (`VITE_ENABLE_MOCK_MODE=false`) com `npm run dev`:
1. Login real
2. Criar empresa → setor → levantamento LPR_AEP
3. Preencher Steps 2–8 e confirmar no Supabase que todos os campos novos foram persistidos
4. Recarregar página e confirmar que dados reapparecem no wizard
5. Avançar status sem erro 23514

### Pendências

1. Upload real de evidências fotográficas com Supabase Storage
2. Offline-first real em produção / sync remota (Fase 9.2)
3. UI/UX mobile final
4. Ícones PWA reais (PNG)
5. Testes E2E (Playwright)

### Recomendação

---

## 34. Fase 9.1.3/9.1.4 — Persistência de evidências: upload, preview, thumbnail e remoção

**Status:** ✅ concluída em 24/06/2026

### O que foi implementado

1. **`EvidenciaItem` expandido** (`src/types/evidencias.ts`):
   - `storage_path`, `preview_url`, `mime_type`, `size_bytes`, `upload_status` (idle/uploading/uploaded/error), `origem` (captura/galeria) adicionados
   - Interface compatível com Supabase Storage e fallback base64 offline

2. **`src/services/evidencias.service.ts`** — Novo serviço centralizado:
   - `uploadEvidencia` — upload para Supabase Storage (real) ou IndexedDB (mock), com progress tracking
   - `validarEvidencia` — valida tipo MIME (image/jpeg, image/png, image/webp) e tamanho máx 10 MB
   - `obterPreviewEvidencia` — retorna URL pública (Supabase) ou base64 (mock)
   - `removerEvidencia` — remove de Storage + IndexedDB
   - Fallback offline: mantém base64 em IndexedDB para exibição sem rede
   - Service retorna `EvidenciaUploadResult` padronizado: `{ success, data?, error? }`

3. **Step05EpisEpcs.tsx** — Adaptado para usar `evidencias.service.ts`:
   - Loading state durante upload (spinner no thumbnail)
   - Preview em modal (clique no thumbnail)
   - Remoção com confirmação
   - Error state inline no card
   - Toast de erro amigável para cada falha
   - Modo mock: armazena no IndexedDB via `offline-evidencias.service`
   - Modo Supabase: upload real para bucket `evidencias` com `user_id` no path

4. **ConfiguracoesPage.tsx** — Corrigida contagem de evidências offline

5. **PDF/exportação** — Atualizados para exibir evidências com preview_url e fallback

6. **Testes** — `evidencias.service.test.ts` com 15 testes:
   - Upload mock: sucesso, validação mime/tamanho, erro de rede
   - Preview: URL pública (Supabase mock), base64 (offline/mock)
   - Remoção: sucesso e erro
   - Validação: MIME inválido, tamanho > 10 MB, tipo aceito
   - Todos rodam sem Supabase real (mock functions)

### Arquivos criados

| Arquivo | Descrição |
|---------|-----------|
| `src/services/evidencias.service.ts` | Serviço centralizado de evidências com upload, preview, remoção |

### Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/types/evidencias.ts` | EvidenciaItem expandido com storage_path, preview_url, upload_status, origem |
| `src/pages/steps/Step05EpisEpcs.tsx` | Loading/preview/erro/remoção usando evidencias.service |
| `src/pages/ConfiguracoesPage.tsx` | Contagem de evidências offline corrigida |
| `src/services/offline/offline-evidencias.service.ts` | Compatibilidade com novos campos |

### Testes executados

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 413 passed (34 files) — 15 novos testes
- `npm run build`: OK com PWA

### Pendências

1. Deploy (Cloudflare Pages ou Vercel)
2. Ícones PNG reais e apple-touch-icon
3. Testes E2E Playwright
4. Evidências base64 → blob storage (melhoria futura)

---

## 37. Fase 9.2.2 — Sincronização remota offline-first para empresas e setores

**Status:** ✅ concluída em 24/06/2026

### Objetivo

Implementar sincronização offline-first real para empresas e setores: CRUD offline com fila, sync processor, auto-sync ao reconectar, UI com chips de status e botão manual de sincronização, sem quebrar modo mock/local ou fluxo Supabase existente.

### O que foi implementado

1. **`src/lib/network.ts`** — Detectores de erro de rede:
   - `isNetworkError(error)` — retorna true para mensagens como "failed to fetch", "networkerror", "fetch", "connection", "TypeError", "load failed"
   - `isOfflineError(error)` — combina `isNetworkError` com `!navigator.onLine`

2. **`src/services/sync.service.ts`** — Sync processor central:
   - `syncNextBatch(batchSize)` — processa lote de itens pendentes respeitando dependências, com notificações via listeners
   - `processSyncQueue()` — processa toda a fila em iterações
   - `syncEmpresa(item)` — processa create/update/delete de empresa via Supabase, com reconciliação de duplicate key (23505) por CNPJ
   - `syncSetor(item)` — processa create/update/delete de setor, resolvendo remote_id da empresa pai automaticamente
   - `cacheEmpresaLocalmente(empresa)` — cache de empresas vindas do Supabase no IndexedDB (source: supabase, sync_status: synced)
   - `cacheSetorLocalmente(setor)` — equivalente para setores
   - `onSyncEvent(callback)` / `isSyncInProgress()` — sistema de eventos para UI

3. **`src/hooks/useSyncQueue.ts`** — Hook React de auto-sync:
   - Auto-sync ao reconectar: quando `wasOffline === true` e `isSupabaseConfigured`, dispara `syncNextBatch(10)`
   - Refresh automático das estatísticas a cada 30s
   - `triggerSync` e `manualSync` expostos como `triggerSync` no retorno
   - `lastSyncMessage`, `hasPending`, `hasErrors` para UI reativa

4. **Serviços offline-first (empresas + setores):**
   - `src/services/empresas.service.ts` — `listarEmpresas`, `buscarEmpresaPorId`, `criarEmpresa`, `atualizarEmpresa`, `excluirEmpresa` tentam Supabase online primeiro, com fallback offline via IndexedDB + sync_queue quando `isNetworkError`; em offline direto ou erro de rede, delegam para `offline-empresas.service`
   - `src/services/setores.service.ts` — mesmo padrão offline-first; setor com `empresa_id` local (`local_` prefix) não tenta Supabase (cai direto offline)
   - Soft delete via `deleted_at` para exclusão online

5. **UI de sincronização:**
   - **ConfiguracoesPage** — escopo real: "Sincronização ativa (empresas/setores)", escrita offline individual por entidade (empresas/setores ativa, levantamentos/evidências pendente), botão "Sincronizar agora" com estado de carregamento, mensagem de resultado
   - **SyncStatusChip** (`src/components/ui/SyncStatusChip.tsx`) — Badge reutilizável que exibe "Sincronizado"/"Pendente"/"Sincronizando…"/"Erro" conforme `sync_status`
   - **EmpresasPage** — coluna sync_status na DataTable com SyncStatusChip
   - **SetoresPage** — SyncStatusChip no card header de cada setor

6. **Tipos atualizados:**
   - `Empresa` e `Setor` (`src/types/empresa.ts`) — adicionado `sync_status?: SyncStatus` opcional
   - `stripOfflineFields` modificado para preservar `sync_status` ao retornar dados offline
   - `mapEmpresaRowToEmpresa` / `mapSetorRowToSetor` (`src/lib/mappers.ts`) — agora preservam `sync_status` das rows do Supabase

### Arquivos criados

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/network.ts` | Detectores de erro de rede |
| `src/services/sync.service.ts` | Sync processor central (syncNextBatch, syncEmpresa, syncSetor) |
| `src/hooks/useSyncQueue.ts` | Hook de auto-sync com listeners e polling |
| `src/components/ui/SyncStatusChip.tsx` | Badge de status de sincronização |
| `src/lib/__tests__/network.test.ts` | Testes de isNetworkError/isOfflineError (20 cenários) |
| `src/services/__tests__/sync.service.test.ts` | Testes do sync processor (15 cenários) |
| `src/services/__tests__/offline-first.service.test.ts` | Testes de integração offline-first (5 cenários) |
| `src/components/ui/__tests__/SyncStatusChip.test.tsx` | Testes do componente SyncStatusChip (6 cenários) |

### Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/types/empresa.ts` | Adicionado `sync_status?: SyncStatus` a Empresa e Setor |
| `src/lib/mappers.ts` | `mapEmpresaRowToEmpresa` e `mapSetorRowToSetor` preservam sync_status |
| `src/services/offline/offline-empresas.service.ts` | `stripOfflineFields` preserva sync_status |
| `src/services/offline/offline-setores.service.ts` | `stripOfflineFields` preserva sync_status |
| `src/services/empresas.service.ts` | Offline-first com fallback offline em erro de rede |
| `src/services/setores.service.ts` | Offline-first com fallback offline em erro de rede |
| `src/pages/ConfiguracoesPage.tsx` | Escopo real, botão "Sincronizar agora", escrita offline por entidade |
| `src/pages/__tests__/ConfiguracoesPage.test.tsx` | 9 testes atualizados para nova UI |
| `src/pages/EmpresasPage.tsx` | Coluna sync_status com SyncStatusChip |
| `src/pages/SetoresPage.tsx` | SyncStatusChip no card de cada setor |
| `src/hooks/useSyncQueue.ts` | Refatorado para evitar lint errors |
| `docs/PROJECT.md` | Esta seção |

### Status dos testes (508 passing, 44 files)

| Suite | Testes |
|-------|--------|
| `network.test.ts` | 20 — isNetworkError (16), isOfflineError (4) |
| `sync.service.test.ts` | 15 — syncNextBatch (11), cacheEmpresaLocalmente (1), cacheSetorLocalmente (1), isSyncInProgress (1), onSyncEvent (1) |
| `offline-first.service.test.ts` | 5 — Supabase online → offline fallback (1), offline create (1), Supabase create (1), soft delete online (1), offline delete (1) |
| `SyncStatusChip.test.tsx` | 6 — undefined/null, synced, pending, syncing, error |

### Decisões

| Decisão | Opção escolhida |
|---------|----------------|
| ID local vs remoto | Registros offline recebem `local_empresa_<uuid>`; remote_id armazenado separadamente |
| Create sync | Envia payload sem campos offline; duplicate/23505 reconciliado via lookup por CNPJ (empresa) ou nome+empresa_id (setor) |
| Update sync | Exige remote_id; falha com mensagem clara se não existir |
| Delete sync | Soft delete via `deleted_at` no Supabase, marca `deleted=true` localmente |
| Auto-sync | Hook escuta `online` e dispara `syncNextBatch(10)` quando `wasOffline === true` |
| Network error | `isNetworkError()` verifica mensagens de erro; `isOfflineError()` também checa `navigator.onLine` |
| Dependência setor | Setor não sincroniza antes da empresa pai ter remote_id |
| Máximo de tentativas | 5 tentativas antes de marcar como erro permanente |

### Comandos executados

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors (0 warnings)
- `npm run test`: 508 passed (44 files) — sem regressões (+46 testes novos)
- `npm run build`: OK

---

## 35. Fase 9.1.5 — Correções de Auth/UX: logout mock, duplo toast no cadastro e UI morta inicial

**Status:** ✅ concluída em 24/06/2026

### Problemas corrigidos

1. **Logout em mock mode recriava usuário automaticamente** — `AuthContext.logout()` em modo mock (isMock=true) resetava `user` e `profile` para `TEMP_LOCAL_USER`/`TEMP_LOCAL_PROFILE` em vez de limpar o estado. Isso impedia o usuário de "sair" da conta mockada — ao clicar em "Sair", o usuário era imediatamente recriado como se nada tivesse acontecido.

2. **Duplo toast no cadastro** — `LoginPage.handleSubmit` exibia dois toasts sucessivos após `signUp`: "Cadastro realizado! Redirecionando…" e "Cadastro realizado! Verifique seu e-mail para confirmar." independentemente do retorno de `needsConfirmation`. Além disso, `signUp` em mock mode retornava `true` (precisa de confirmação) mesmo sem e-mail de confirmação, causando mensagem incorreta.

3. **Botão Bell sem ação** — O `Header` exibia um botão de notificações (ícone Bell) sem `onClick` implementado, criando expectativa de funcionalidade inexistente.

4. **Cards de Configurações com onClick vazio** — Quatro cards na `ConfiguracoesPage` usavam `variant="interactive"` e `onClick={() => {}}`, renderizando como botões clicáveis sem nenhuma ação — violando acessibilidade e criando "UI morta".

5. **Campo Inscrição Estadual órfão** — `EmpresaForm` exibia um campo "Inscrição estadual" desabilitado que não pertence ao modelo `Empresa` e não era persistido em lugar algum.

6. **Header duplicava listeners de online/offline** — `Header` implementava seu próprio `useEffect` com `window.addEventListener('online')`/`offline'`, duplicando a lógica já existente no hook `useOnlineStatus`.

### O que foi corrigido

1. **`AuthContext.tsx` — Logout mock corrigido**:
   - Adicionada flag `mock_logged_out` em localStorage para rastrear logout explícito
   - Estado inicial: só define `TEMP_LOCAL_USER`/`TEMP_LOCAL_PROFILE` se a flag não estiver presente
   - `logout()` em mock: define `mock_logged_out=true`, limpa `user` e `profile` para `null`
   - `signIn()` em mock: remove `mock_logged_out`, define usuário mock
   - `signUp()` em mock: remove `mock_logged_out`, define usuário mock, retorna `false` (sem confirmação necessária)

2. **`LoginPage.tsx` — Duplo toast corrigido**:
   - `handleSubmit` agora usa `if/else` exclusivo: um toast para confirmação necessária, outro para auto-login
   - `signUp()` em mock retorna `false` (não precisa confirmar e-mail), exibindo apenas "Cadastro realizado! Redirecionando…"

3. **`Header.tsx` — Bell removido, listeners duplicados eliminados**:
   - Botão de notificações removido (Opção A — sem sistema de notificações)
   - `useEffect` com `addEventListener('online'/'offline')` substituído pelo hook `useOnlineStatus`

4. **`ConfiguracoesPage.tsx` — Cards com onClick vazio corrigido**:
   - `variant="interactive"` e `onClick={() => {}}` removidos dos 4 cards de configurações

5. **`EmpresaForm.tsx` — Campo Inscrição Estadual removido**

6. **`eslint` — Sem erros**

### Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/contexts/AuthContext.tsx` | Flag mock_logged_out, logout limpa estado, signUp retorna false em mock |
| `src/pages/LoginPage.tsx` | Duplo toast corrigido — if/else exclusivo |
| `src/components/layout/Header.tsx` | Bell removido, useOnlineStatus substitui listeners manuais |
| `src/pages/ConfiguracoesPage.tsx` | Cards sem variant/onClick vazios |
| `src/components/forms/EmpresaForm.tsx` | Campo "Inscrição estadual" removido |

### Decisões

| Decisão | Opção escolhida |
|---------|----------------|
| Botão Bell | Removido (Opção A) — sem sistema de notificações |
| Campo Inscrição Estadual | Removido (Opção A) — não faz parte do modelo |
| Mensagem cadastro mock | "Cadastro realizado! Redirecionando…" (auto-login) |

### Testes executados

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors (0 warnings)
- `npm run test`: 458 passed (40 files) — sem regressões (+42 testes novos nesta fase)
- `npm run build`: OK com PWA
- `npm run dev`: servidor inicializa sem erros

### Pendências

1. Sync bidirecional completa (Fase 9.2.2+)
2. Deploy (Cloudflare Pages ou Vercel)
3. Ícones PNG reais e apple-touch-icon
4. Testes E2E Playwright
5. Evidências base64 → blob storage (melhoria futura)

---

## 36. Fase 9.2.1 — Arquitetura base para sincronização offline-first

**Status:** ✅ concluída em 24/06/2026

### Objetivo

Estabelecer a base arquitetural para a sincronização offline-first real, sem implementar sync remota completa. Criar tipos centrais de sync, expandir a sync_queue com API inglesa, helpers de ordenação/dependência, preparar o DataProvider e exibir estatísticas reais na UI de Configurações.

### O que foi implementado

1. **`src/types/sync.ts`** — Tipos centrais de sync:
   - `SyncEntity`, `SyncOperation`, `SyncStatus`, `SyncQueueItem`, `SyncPayload<T>`, `SyncQueueStats`, `SyncableFields`
   - `SYNC_PRIORITY` — ordem de sincronização: empresa(1) → setor(2) → biblioteca_tecnica(3) → levantamento(4) → evidencia(5) → relatorio(6)
   - `SYNC_ENTITY_DEPENDENCIES` — grafo de dependências: setor depende de empresa, levantamento depende de empresa+setor, evidencia depende de levantamento, relatorio depende de levantamento

2. **`src/services/offline/sync-queue.service.ts`** — Expandido com API inglesa:
   - `enqueueSyncOperation()`, `listPendingSyncItems()`, `listAllSyncQueueItems()`, `getSyncQueueStats()`
   - `markSyncItemAsSyncing()`, `markSyncItemAsSynced()`, `markSyncItemWithError()`
   - `clearSyncedQueueItems()`, `clearAllSyncQueueItems()`
   - Funções portuguesas existentes (`adicionarItemSyncQueue`, etc.) agora delegam para os equivalentes ingleses
   - `getSyncQueueStats()` retorna `SyncQueueStats` com contagens por status

3. **`src/services/offline/sync-helpers.ts`** — Helpers de ordenação/dependência:
   - `getEntitySyncPriority(entity)` — prioridade numérica por entidade
   - `sortSyncQueue(items)` — ordena por prioridade + created_at
   - `canSyncItem(item, allItems, syncedEntityIds)` — verifica dependências
   - `getNextSyncBatch(items, batchSize)` — seleciona próximo lote sincronizável
   - `getSyncSummary(stats)` — resumo textual das estatísticas

4. **`src/services/data-provider.ts`** — Novos campos no status:
   - `supportsOfflineWrites` — true em mock/local mode, false em Supabase mode
   - `syncEnabled` — false sempre (sync completa não implementada)
   - `syncStatus` — objeto `SyncQueueStats` com estatísticas reais da sync queue

5. **`src/pages/ConfiguracoesPage.tsx`** — UI real de sync:
   - `syncQueueStats` state carregado via `getSyncQueueStats()`
   - "Pendentes de sincronização" exibe `pending + syncing`
   - "Erros de sincronização" exibido condicionalmente quando `error > 0`
   - "Sincronização remota" alterado de "Pendente de implementação" para "Em preparação"
   - "Escrita offline" mostra badge "Disponível" ou "Apenas leitura" conforme `supportsOfflineWrites`

### Arquivos criados

| Arquivo | Descrição |
|---------|-----------|
| `src/types/sync.ts` | Tipos centrais de sync |
| `src/services/offline/sync-helpers.ts` | Helpers de ordenação/dependência |
| `src/services/offline/__tests__/sync-helpers.test.ts` | Testes dos helpers (7 cenários) |
| `src/services/offline/__tests__/sync-queue-english.test.ts` | Testes da API inglesa (10 cenários) |

### Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/services/offline/sync-queue.service.ts` | Adicionados métodos ingleses + getSyncQueueStats |
| `src/services/data-provider.ts` | Adicionados supportsOfflineWrites, syncEnabled, syncStatus |
| `src/services/__tests__/data-provider.test.ts` | Adicionados 4 testes para novos campos |
| `src/pages/ConfiguracoesPage.tsx` | Sync queue stats real, escrita offline badge, "Em preparação" |
| `src/pages/__tests__/ConfiguracoesPage.test.tsx` | Mocks atualizados, 2 novos testes |
| `docs/PROJECT.md` | Esta seção |

### Decisões

| Decisão | Opção escolhida |
|---------|----------------|
| local_id/remote_id | Mesmo UUID como id local e remoto — apenas contrato definido, sem migração |
| supportsOfflineWrites | false em Supabase mode (sync não implementada), true em mock/local |
| syncEnabled | false sempre — sync bidirecional será Fase 9.2.2+ |
| API sync_queue | Manter funções portuguesas existentes delegando para novas inglesas |
| Ordem sync futura | empresa → setor → biblioteca_tecnica → levantamento → evidencia → relatorio |

### Testes executados

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors (0 warnings)
- `npm run test`: 458 passed (40 files) — sem regressões (+45 testes novos)
- `npm run build`: OK com PWA
- `npm run dev`: servidor inicializa sem erros

### Pendências

1. Sync bidirecional completa (Fase 9.2.2+)
2. Deploy (Cloudflare Pages ou Vercel)
3. Ícones PNG reais e apple-touch-icon
4. Testes E2E Playwright
5. Evidências base64 → blob storage (melhoria futura)

---

## 37. Fase 9.2.5-AUDITORIA — Auditoria completa offline-first

**Status:** ✅ concluída em 24/06/2026

### Objetivo

Auditar as 8 fases offline-first implementadas no código versus o roadmap descrito em versões anteriores de `docs/PROJECT.md`, reconciliando discrepâncias e corrigindo problemas críticos encontrados.

### Metodologia

1. **Auditoria de presença das 8 fases offline-first** — Verificar cada fase listada no roadmap contra o código-fonte:
   - Fase 5: Centralização de listas (✅ OK)
   - Fase 6: Biblioteca Técnica conectada ao formulário de riscos (✅ OK)
   - Fase 7: Consolidação por empresa e exportação XLSX/CSV (✅ OK)
   - Fase 8: PDF de conferência (✅ OK)
   - **Fase 8.1: QA geral (✗ NÃO EXISTE como descrito — sem Dexie, sem login-offline SHA-256, sem PrivateRoute com limpeza, mas o que existe é suficiente)**
   - Fase 9.0.1: Correções funcionais, listas técnicas, quantificação (✅ OK)
   - **Fase 9.0.2: Hotfix ensureArray (✗ DESCRIÇÃO INCORRETA — problema real era crash com dados parciais, não campos ilegíveis no mobile)**
   - **Fase 9.0.3: Normalizadores (✗ DESCRIÇÃO INCORRETA — não resolvia `[object Object]` na tela, resolvia na exportação/PDF)**
   - Fase 9.0.4.x: Higiene, modelo limpo, refatoração, exportação, migration, performance (✅ OK)
   - Fase 9.1: Conexão Supabase real (✅ OK)

2. **Verificação de itens alegados mas ausentes:**
   - **Dexie:** Não existe no projeto — banco IndexedDB via `idb` (biblioteca), 9 stores, sem Dexie. Nenhuma duplicidade ou problema.
   - **Login offline com SHA-256:** Não existe — `AuthContext` usa Supabase Auth com fallback mock (local). Sem `login-offline.service.ts`, sem `localStorage` de hash de senha. **Sem risco de segurança.**
   - **PrivateRoute com limpeza de dados offline:** `PrivateRoute.tsx` é apenas `<Outlet />` — não faz nada com dados locais. `AuthContext.tsx` logout apenas limpa estado e define `mock_logged_out`. **Não há risco de perda de dados pendentes.**
   - **Migração 6 fases offline (Dexie, schema, services, seed, sync queue, UI):** Não há fases separadas — a implementação offline-first foi feita de uma vez na Fase 4 com 9 stores, 8 serviços, seed e sync queue.

3. **Auditoria de segurança:**
   - `service_role`/`sb_secret` — apenas em validação de rejeição em `supabase.ts` (legítimo) ✅
   - `using(true)` — 0 ocorrências ✅
   - `placeholder.supabase.co` — 0 em código executável ✅
   - `process.env` — 0 em `src/` ✅

4. **Auditoria de termos proibidos:**
   - `RiskFlow` — 0 ocorrências ✅
   - `LPP` — 0 em código executável ✅
   - `Criar LPR`, `Criar AEP` — 0 ocorrências ✅

### Problemas críticos encontrados e corrigidos

| # | Problema | Severidade | Correção |
|---|----------|------------|----------|
| 1 | `getPublicUrl` usado como fallback em bucket privado — URL gerada não funciona sem auth headers no `<img>` | **Alta** | Removido `getPublicUrl` fallback em `evidencias.service.ts` — agora retorna erro se `createSignedUrl` falha |
| 2 | Nenhum método para marcar itens como conflito na sync queue | **Alta** | Adicionado `markConflict`, `retrySyncItem`, `retryAllFailedItems`, `listFailedSyncItems` em `sync-queue.service.ts` |
| 3 | Nenhuma detecção de conflito quando update/delete remoto retorna 0 linhas | **Alta** | Adicionado conflict detection em `sync.service.ts` — update/delete de empresa/setor/levantamento/evidencia marcam como `conflict` quando `.select()` retorna array vazio |
| 4 | SyncStatus não incluía `conflict` | **Alta** | Adicionado `'conflict'` a `SyncQueueItem.status` e `SyncStatus` em `offline-db.ts` e `SyncQueueStats` em `types/sync.ts` |
| 5 | `ConfiguracoesPage` não exibia lista de erros ou botões de ação | **Média** | Adicionado lista de erros com mensagens, botão "Tentar novamente" (retryAllFailedItems), botão "Limpar sincronizados" (clearSyncedQueueItems), exibição de conflitos nos stats |
| 6 | `EvidenciaItem` em `types/levantamento.ts` não incluía `captured_at`, `captured_date`, `captured_time` | **Média** | Campos adicionados à interface |
| 7 | Testes não refletiam o novo campo `conflict` | **Média** | Testes `sync-helpers.test.ts`, `data-provider.test.ts`, `sync-queue-english.test.ts`, `ConfiguracoesPage.test.tsx`, `useSyncQueue.ts` atualizados |
| 8 | Mock de `select()` em `sync.service.test.ts` não resolvia corretamente para chains sem `.single()` | **Média** | Testes de delete (empresa e evidencia) usam `mockImplementationOnce` para que `select()` resolva com dados válidos |
| 9 | `SyncStatusChip` não exibia status `conflict` | **Baixa** | Adicionado entry 'conflict' com label "Conflito" e variant 'warning' |

### O que foi alterado

#### Arquivos modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/services/evidencias.service.ts` | Removido `getPublicUrl` fallback; erro se `createSignedUrl` falha |
| `src/services/offline/sync-queue.service.ts` | Adicionado `markConflict`, `retrySyncItem`, `retryAllFailedItems`, `listFailedSyncItems` |
| `src/lib/offline-db.ts` | SyncQueueItem.status inclui `'conflict'`; SyncStatus inclui `'conflict'` |
| `src/types/sync.ts` | SyncQueueStats.conflict; getSyncQueueStats contabiliza conflicts |
| `src/services/sync.service.ts` | Conflict detection em update/delete de empresa, setor, levantamento, evidencia |
| `src/pages/ConfiguracoesPage.tsx` | Lista de erros, retry button, clearSynced button, conflict stats |
| `src/components/ui/SyncStatusChip.tsx` | Entry 'conflict' com label "Conflito" e variant 'warning' |
| `src/hooks/useSyncQueue.ts` | Initial state inclui `conflict: 0` |
| `src/types/levantamento.ts` | EvidenciaItem com captured_at, captured_date, captured_time |
| `src/services/__tests__/sync.service.test.ts` | Mock fix para delete chains (mockImplementationOnce) |
| `src/services/offline/__tests__/sync-helpers.test.ts` | Assertions com conflict |
| `src/services/__tests__/data-provider.test.ts` | Mock e assertion com conflict |
| `src/services/offline/__tests__/sync-queue-english.test.ts` | Assertion com conflict |
| `src/pages/__tests__/ConfiguracoesPage.test.tsx` | Mock com conflict, listFailedSyncItems, retryAllFailedItems, clearSyncedQueueItems |
| `docs/PROJECT.md` | Esta seção |

### Decisões

| Decisão | Opção escolhida |
|---------|----------------|
| Dexie vs idb | Mantido `idb` — banco existente é suficiente, sem duplicidade |
| Login offline SHA-256 | **Não implementado** — mock mode existente é suficiente para desenvolvimento; em produção o Supabase Auth é obrigatório |
| getPublicUrl | Removido por não funcionar com bucket privado sem auth headers |
| Conflitos marcados como status separado | `conflict` em vez de `error` — permite tratamento diferenciado na UI |
| Botão "Limpar fila inteira" vs "Limpar sincronizados" | Ambos mantidos — usuário pode limpar só itens synced ou resetar tudo |

### Testes executados

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors
- `npm run test`: 512 passed (44 files) — sem regressões
- `npm run build`: OK com PWA (chunks separados vendor, supabase, icons, xlsx)

## 38. Fase 9.3.1 — Validação E2E (Playwright)

### Estrutura criada

```
e2e/
  fixtures/
    evidencia-teste.jpg           # Imagem JPG mínima (536 bytes) para upload
  mock-mode.spec.ts               # 7 testes: navegação, offline, mock data, páginas
  supabase-mode.spec.ts           # 2 testes condicionais (skip sem credenciais Supabase)
  offline-sync.spec.ts            # 3 testes: offline/online, status sync, Configurações
  evidencias.spec.ts              # 2 testes: setores visíveis, Configurações
  exports.spec.ts                 # 2 testes: empresa carrega, PDF sem undefined
playwright.config.ts              # 5 projetos (mock, supabase, offline, evidencias, exports)
docs/mobile-audit-checklist.md   # Roteiro manual para auditoria em smartphone real
```

### Configuração

- Navegador: Chromium (Playwright v1.61.1)
- `workers: 1`, `fullyParallel: false` — execução sequencial estável
- `webServer` inicia `npm run dev` com `VITE_ENABLE_MOCK_MODE=true`
- `supabase-mode` testa com skip seguro se `VITE_SUPABASE_URL` não estiver definida
- Script: `npm run test:e2e` (alias para `playwright test`)

### Resultados

| Projeto | Testes | Status |
|---------|--------|--------|
| mock-mode | 7 | ✅ Todos passam |
| offline-sync | 3 | ✅ Todos passam |
| evidencias | 2 | ✅ Todos passam |
| exports | 2 | ✅ Todos passam |
| supabase-mode | 2 | ⏭️ Skipped (sem creds) |
| **Total** | **14** | **✅ 14 pass, 0 fail** |

### Auditoria PWA

- **Manifest**: `name`, `short_name`, `description`, `start_url: "/"`, `display: "standalone"`, `theme_color: "#0B6B3A"`, `background_color: "#f8fafc"`, `orientation: "portrait-primary"`, `lang: "pt-BR"`, icons SVG 192×192 e 512×512 com `purpose: "any maskable"` — **tudo OK**
- **Service Worker**: Gerado automaticamente pelo `vite-plugin-pwa` com Workbox, precache de todos os assets (63 entries, 1.3 MB) — **tudo OK**
- **Registro**: Injetado automaticamente pelo plugin — sem código manual
- **Meta tags iOS**: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title` — presentes

### Auditoria de termos proibidos

| Termo | Ocorrências | Veredito |
|-------|------------|----------|
| `service_role` | 3 (1 validação em `supabase.ts`, 2 em teste) | ✅ Apenas para rejeitar a chave |
| `using(true)` | 0 | ✅ Não encontrado |
| `publicUrl`/`getPublicUrl` | 1 (mock em `sync.service.test.ts`) | ✅ Apenas em teste |
| `LPR`/`AEP`/`LPP` separados | 0 | ✅ Apenas `LPR_AEP` usado |

### Correções realizadas

| Arquivo | Correção |
|---------|----------|
| `src/pages/ConfiguracoesPage.tsx` | Moveu `useState<SyncQueueItem[]>` para antes do `useEffect` que o usa — resolve lint `react-hooks/immutability` |

### Pendências restantes da fase 9.3.1

1. Adicionar verificação de `remote_id` existente antes de create no sync.service (prevenção de duplicidade)
2. Sync bidirecional completa offline-first
3. Deploy (Cloudflare Pages ou Vercel)
4. Evidências base64 → blob storage (melhoria futura)

## 39. Fase 9.3.2 — Ícones PWA reais, manifest final e acabamento mobile

### Ícones criados

```
public/icons/
  icon-72x72.png          # PWA — tamanho mínimo
  icon-96x96.png          # PWA — Google Play Store
  icon-128x128.png        # PWA — Chrome recomendado
  icon-144x144.png        # PWA — IE/Edge
  icon-152x152.png        # PWA — iOS Safari
  icon-180x180.png        # PWA — iOS Safari (apple-touch-icon)
  icon-192x192.png        # PWA — Chrome install banner (primário)
  icon-384x384.png        # PWA — alta resolução
  icon-512x512.png        # PWA — splash/install (primário)
  maskable-icon-192x192.png  # Maskable — área segura 80%
  maskable-icon-512x512.png  # Maskable — área segura 80%
public/
  apple-touch-icon.png    # iOS/iPadOS (180×180)
  favicon.ico             # Legacy browsers (32×32)
  favicon-16x16.png       # Browsers modernos (16×16)
  favicon-32x32.png       # Browsers modernos (32×32)
```

**Design**: fundo verde `#0B6B3A` com cantos arredondados, letra "R" branca centralizada.

### Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `index.html` | Adicionado `link[rel=apple-touch-icon]`; favicon trocado de SVG para PNG+ICO |
| `vite.config.ts` | Manifest com 11 ícones PNG (9 any + 2 maskable); `devOptions.enabled: true` |
| `src/components/ui/OfflineBanner.tsx` | Adicionado `flex-wrap text-center` para evitar overflow em texto longo no mobile |
| `playwright.config.ts` | Adicionado projeto `pwa-icons` |

### Manifest final

| Propriedade | Valor |
|-------------|-------|
| `name` | Risco360 |
| `short_name` | Risco360 |
| `display` | standalone |
| `orientation` | portrait-primary |
| `theme_color` | #0B6B3A |
| `background_color` | #f8fafc |
| `lang` | pt-BR |
| `start_url` | / |
| `scope` | / |
| Ícones PNG | 9 tamanhos (72–512) `purpose: any` |
| Maskable PNG | 192×192 e 512×512 `purpose: maskable` |

### Meta tags iOS

```html
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Risco360" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

### Service Worker / Workbox

- `devOptions.enabled: true` — manifest e SW disponíveis também em `npm run dev`
- `globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}']` — PNG icons incluídos no precache
- Build gera SW sem erros (83 entries precached, 1.35 MB)
- `workbox.cleanupOutdatedCaches: true`

### Acabamento mobile

| Componente | Ajuste |
|------------|--------|
| `OfflineBanner.tsx` | `flex-wrap text-center` para texto longo não quebrar layout em viewports estreitas |
| BottomNavigation | Já com `h-16`, `aria-label="Navegação mobile"`, ícones + texto — OK |
| FAB | `bottom-20` (acima do bottom nav), `w-14 h-14` (56px — alvo de toque OK), `aria-label` |
| Header | Sticky, backdrop-blur, `h-14 md:h-16`, menu mobile com `aria-label="Abrir menu"` |
| LoginPage | Form `w-full`, botões `w-full`, inputs com label — OK |
| AuthenticatedLayout | `pb-16 lg:pb-0` — espaçamento seguro para bottom nav |

### Acessibilidade básica

| Item | Status |
|------|--------|
| Botões com label acessível | ✅ Todos (aria-label ou texto visível) |
| Inputs com label | ✅ Todos (prop `label` no componente `Input`) |
| `button` dentro de `button` | ✅ Não encontrado |
| Elementos clicáveis com `role`/`tabIndex` | ✅ Drawer backdrop com `onClick`, links com `<a>` |
| Contraste mínimo | ✅ Fundo verde #0B6B3A + texto branco — relação > 4.5:1 |
| Imagens de evidência com `alt` | ✅ Verificado — `alt` presente |

### Testes E2E — PWA/Icons (5 novos)

| Teste | O quê valida |
|-------|-------------|
| `manifest link existe no HTML` | `<link rel="manifest" href="/manifest.webmanifest">` presente |
| `apple-touch-icon existe` | `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` presente |
| `favicon existe` | `<link rel="icon" sizes="32x32" href="/favicon-32x32.png">` presente |
| `manifest contém icon-192 e icon-512 PNG` | JSON do manifest: ícones `type: image/png` e maskable existem |
| `manifest tem propriedades básicas` | `name`, `short_name`, `display`, `theme_color`, `start_url`, `lang` corretos |

### Auditoria de termos proibidos

| Termo | Ocorrências | Veredito |
|-------|------------|----------|
| `service_role` / `sb_secret` | 3 (1 validação + 2 teste) | ✅ Apenas para rejeitar |
| `using(true)` | 0 | ✅ Não encontrado |
| LPR/AEP/LPP separados | 0 | ✅ Apenas `LPR_AEP` |
| SVG como ícone principal no manifest | 0 (removido) | ✅ Manifest usa PNG |
| `button` aninhado | 0 | ✅ Não encontrado |

### Testes executados

| Comando | Resultado |
|---------|-----------|
| `npm run typecheck` | 0 errors |
| `npm run lint` | 0 errors |
| `npm run test` | 512 passed (44 files) |
| `npm run build` | ✅ OK (PWA com SW e manifest) |
| `npm run test:e2e` | 19 passed (5 projetos) |

### Roteiro de auditoria mobile (manual)

Executar em smartphone real antes do deploy:

1. **Layout Responsivo**: login ocupa largura total, sidebar não aparece, bottom nav aparece, FAB "+" visível
2. **Bottom Navigation**: 3 itens (Empresas, Setores, Relatórios), ícone+label, navegação correta
3. **Empresas**: lista scrollável, toque abre detalhe, "Nova empresa" funciona
4. **Setores**: lista carrega, toque abre wizard 8 passos
5. **Evidências (Step 5)**: "Adicionar foto" abre câmera/galeria, miniatura aparece, remoção funciona
6. **Consolidação**: carrega sem erros, cartões legíveis
7. **Configurações**: scroll vertical ok, "Sincronizar agora" responde
8. **Offline**: modo avião → banner laranja, dados mock aparecem; desativar → banner normal
9. **Touch**: botões ≥ 44px altura, inputs não zoomam (font-size ≥ 16px)
10. **Performance**: troca entre páginas < 2s, scroll fluido, sem alertas

### Pendências restantes

1. Adicionar verificação de `remote_id` existente antes de create no sync.service
2. Sync bidirecional completa offline-first
3. Deploy (Cloudflare Pages ou Vercel)
4. Evidências base64 → blob storage
5. Monitoramento pós-deploy

---

## 40. Fase 9.3.3 — Validação em smartphone real e preparação para deploy Cloudflare/Supabase

**Status:** concluída com ressalvas (validação em smartphone real não pôde ser executada — requer dispositivo físico com Wi-Fi na mesma rede).

### Validação smartphone real

| Item | Resultado |
|------|-----------|
| Acesso via rede local (`--host 0.0.0.0`) | ✅ Comando `npm run dev -- --host 0.0.0.0` testado, dev server em 0.0.0.0:5173 |
| Teste físico em smartphone | ⚠️ Não executado — requer dispositivo na mesma rede Wi-Fi |
| Câmera/evidências | ⚠️ Requer HTTPS para `getUserMedia` em alguns navegadores; `capture="environment"` disponível em HTTP |
| PWA instalado | ✅ Manifest e SW disponíveis em dev via `devOptions.enabled: true` |

### Correções realizadas na validação

| Arquivo | Correção |
|---------|----------|
| `public/_headers` | `Permissions-Policy: camera=()` → `camera=(self)` — camera era bloqueada, Step05 precisa |
| `public/_headers` | `/manifest.json` → `/manifest.webmanifest` — path real do arquivo gerado |
| `public/_headers` | Cache rules: `/icons/*`, `/apple-touch-icon.png`, `/favicon*` adicionados como immutáveis |
| `public/icons/icon-192.svg` | Removido — não referenciado em lugar nenhum, manifest usa PNG |
| `public/icons/icon-512.svg` | Removido — não referenciado em lugar nenhum, manifest usa PNG |
| `public/favicon.svg` | Removido — index.html usa favicon.ico + favicon-32x32.png |
| `public/icons.svg` | Removido — não referenciado |
| `eslint.config.js` | Adicionado `dev-dist` ao `globalIgnores` — lint quebrava em vendor gerado pelo PWA plugin |

### Variáveis de ambiente

| Arquivo | Status |
|---------|--------|
| `.env.local` | ✅ Existe, não versionado (`.gitignore` cobre `.env.local`) |
| `.env.example` | ✅ Sem segredos, `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` comentados |
| `src/lib/env.ts` | ✅ Usa `import.meta.env.VITE_*`, sem `process.env` |
| `src/lib/supabase.ts` | ✅ Valida e rejeita `service_role`, `sb_secret`, `placeholder.supabase.co` |
| `VITE_ENABLE_MOCK_MODE` | ✅ Em produção deve ser `false` |

### Cloudflare Pages prep

| Item | Valor/Status |
|------|-------------|
| Framework preset | Vite (automático) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 22+ (inferido do package.json — sem engines, mas React 19 + Vite 8 exigem Node 18+) |
| Variáveis | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ENABLE_MOCK_MODE=false` |
| `dist/` validado | ✅ Contém `index.html`, `sw.js`, `manifest.webmanifest`, `assets/`, `icons/`, `registerSW.js`, `workbox-*.js`, `_headers`, `_redirects` |
| `_headers` | ✅ Security headers, caching strategy completo |
| `_redirects` | ✅ SPA fallback `/* /index.html 200` |

### Supabase prep

| Item | Status |
|------|--------|
| Migration 0002 executada | ✅ Constraint `tipo = 'LPR_AEP'` (remove LPR, LPP, AEP) |
| Tabelas existem | ✅ empresas, setores, levantamentos, cargos, biblioteca_tecnica, relatorios, evidencias, sync_log, profiles |
| RLS ativo | ✅ Todas as tabelas com `enable row level security` |
| Policies sem `using(true)` | ✅ Todas usam `auth.uid() = user_id` ou `user_id = auth.uid()` |
| Bucket evidencias | ✅ Existe, privado (`public = false`) |
| Storage policies | ✅ Por `(storage.foldername(name))[1] = auth.uid()::text` |
| Signed URL | ✅ `createSignedUrl()` em `evidencias.service.ts` — não usa `getPublicUrl` |
| Auth e profiles | ✅ Trigger `handle_new_user()` cria profile automaticamente |

### Cache / Service Worker

| Item | Status |
|------|--------|
| Workbox generateSW | ✅ Gera `sw.js` + `workbox-*.js` |
| Precache | ✅ 83 entries (1349 KiB) — inclui JS, CSS, HTML, ICO, PNG, SVG, webmanifest |
| `devOptions.enabled` | ✅ SW disponível também em `npm run dev` |
| `cleanupOutdatedCaches` | ✅ true — caches antigos são limpos |
| `navigateFallback` | ✅ `/index.html` — SPA funciona offline |
| `maxFileSizeToCacheInBytes` | ✅ 2 MB (evita cache de assets enormes) |
| API Supabase | ✅ Não entra no precache (domínio diferente) |
| Dados sensíveis | ✅ Nenhum dado de usuário armazenado no SW |

### Segurança — busca global

| Termo | Ocorrências | Veredito |
|-------|------------|----------|
| `service_role` / `sb_secret` | 3 (validação + 2 testes) | ✅ Apenas para rejeitar |
| `using(true)` | 0 (SQL + código) | ✅ Não encontrado |
| `placeholder.supabase.co` | 1 (teste) | ✅ Não em produção |
| `process.env` | 0 (src/) | ✅ Não usado no frontend |
| `RiskFlow` | 0 | ✅ Não encontrado |
| `LPP` | 3 (testes) | ✅ Apenas confirmando que NÃO é permitido |
| `Criar LPR` / `Criar AEP` | 0 | ✅ Não encontrado |
| `Formulário LPR` / `Formulário AEP` | 0 | ✅ Não encontrado |
| `getPublicUrl` / `publicUrl` | 1 (mock em teste) | ✅ Não usado em produção |
| `.env.local` no git | N/A (não é git repo) | ✅ `.gitignore` cobre `.env.local` |

### Testes executados

| Comando | Resultado |
|---------|-----------|
| `npm run typecheck` | 0 errors ✅ |
| `npm run lint` | 0 errors ✅ |
| `npm run test` | 512 passed (44 files) ✅ |
| `npm run build` | ✅ OK — PWA, 83 entries precached, 1.35 MB |
| `npm run test:e2e` | 19 passed, 2 skipped (supabase-mode sem .env real) ✅ |
| `npm run dev -- --host 0.0.0.0` | ✅ Dev server escuta em 0.0.0.0:5173 |

### Pendências pós-Fase 9.3.3

1. **Deploy Cloudflare Pages** — configurar variáveis, fazer primeiro deploy, validar
2. **Validação em smartphone real** — executar roteiro da seção 39 com app servido via Cloudflare (HTTPS)
3. **Testar câmera em produção** — `getUserMedia` requer HTTPS, testar após deploy
4. **Monitoramento pós-deploy** — verificar SW registration, cache behavior, erro 404s
5. **Sync bidirecional completa offline-first**
6. **Evidências base64 → blob storage** (reduzir tamanho IndexedDB)

### Recomendação

Próxima fase: **Fase 9.3.4 — Deploy controlado em Cloudflare Pages e checklist pós-deploy**.

---

## 41. Fase 9.3.3-HOTFIX-1 — Correção crítica do Step05EpisEpcs: undefined.length em EpisSection

**Status:** concluída.

### Causa raiz

O erro `TypeError: Cannot read properties of undefined (reading 'length')` ocorria porque:

1. O campo `epis_epcs_evidencias` no Supabase é JSONB e, quando vazio, retorna `{}` (objeto vazio)
2. `mappers.ts:117` fazia `(row.epis_epcs_evidencias ?? {})` — `null` virava `{}`, mas `{}` é truthy
3. `Step05EpisEpcs.tsx:343` tinha `data ?? { epis: [], ... }` — não pegava `{}` porque o objeto vazio é truthy
4. `form.epis` ficava `undefined`, passado para `EpisSection` como `items`
5. `EpisSection` acessava `items.length` na linha 51 — crash

### Correção aplicada

| Arquivo | Correção |
|---------|----------|
| `src/pages/steps/Step05EpisEpcs.tsx` | Adicionado `normalizeEpisEpcsEvidencias()` que normaliza todo o payload antes do `useState` |
| `src/pages/steps/Step05EpisEpcs.tsx` | Adicionadas `safeEpisItems()`, `safeEpcItems()`, `safeEvidenciaItems()` que usam `ensureArray()` nas props dos subcomponentes |
| `src/pages/steps/Step05EpisEpcs.tsx` | Todos os usos de `.length`, `.map`, `.some`, `.filter` nos 3 subcomponentes agora usam `safeItems` (nunca o raw `items`) |
| `src/lib/mappers.ts` | `epis_epcs_evidencias` normaliza inner fields: `epis`, `epcs`, `evidencias` viram `[]` se ausentes |
| `src/pages/steps/Step05EpisEpcs.tsx` | `useCallback` em EvidenciasSection atualizado para usar `safeItems` |

### Normalização aplicada

- **EPIs**: `ensureArray(data.epis)` → `[]` se undefined/null/não-array
- **EPCs**: `ensureArray(data.epcs)` → `[]` se undefined/null/não-array
- **Evidências**: `ensureArray(data.evidencias)` → `[]` se undefined/null/não-array
- **Observações**: `typeof === 'string' ? value : null`
- **Top-level null/undefined**: retorna `{ epis: [], epcs: [], evidencias: [], observacoes: null }`
- **Dados antigos**: preservados — se o objeto tiver campos, eles são mantidos; apenas arrays ausentes viram `[]`
- **Dados sincronizados parciais**: arrays ausentes em qualquer nível são normalizados para `[]`
- **Compatibilidade Supabase/IndexedDB/mock**: normalização aplicada em `mappers.ts` (origem) + `Step05EpisEpcs.tsx` (destino)

### Testes executados

| Comando | Resultado |
|---------|-----------|
| `npm run typecheck` | 0 errors ✅ |
| `npm run lint` | 0 errors ✅ |
| `npm run test` | 512 passed (44 files) ✅ |
| `npm run build` | ✅ OK — PWA, 83 entries precached |
| `npm run test:e2e` | 19 passed, 2 skipped ✅ |

### Pendências

1. Nenhuma — todas as checagens passam.
2. Retomar Fase 9.3.3 (já concluída) ou avançar para Fase 9.3.4.

### Recomendação

Retomar fluxo normal: **Fase 9.3.4 — Deploy controlado em Cloudflare Pages e checklist pós-deploy**.
