# Risco360

PWA offline-first para levantamento setorial integrado LPR + AEP, desenvolvido para apoio técnico em Segurança e Saúde do Trabalho.

## Stack

- React 19
- Vite 8
- TypeScript 6
- Supabase (auth + storage)
- IndexedDB (offline-first via `idb`)
- PWA / Workbox (vite-plugin-pwa)
- Tailwind CSS 4
- Playwright (E2E)
- Vitest (unit)

## Pré-requisitos

- Node.js 18+
- npm

## Ambiente

Copie `.env.example` para `.env.local` e configure:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ENABLE_MOCK_MODE=true
```

- `VITE_ENABLE_MOCK_MODE=true` → app roda 100% offline com dados mock (sem Supabase)
- `VITE_ENABLE_MOCK_MODE=false` → exige Supabase real configurado

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm install` | Instala dependências |
| `npm run dev` | Inicia servidor de desenvolvimento (`--host 0.0.0.0`) |
| `npm run build` | Typecheck + build de produção |
| `npm run preview` | Preview do build local |
| `npm run test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes E2E (Playwright) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type-check |
| `npm run validate:pwa` | Valida assets e campos do PWA Manifest |

## Qualidade automatizada

A suite de qualidade roda em CI via GitHub Actions (`.github/workflows/ci.yml`) a cada push/PR na `master`:

1. **typecheck** — `tsc` sem emitir
2. **lint** — ESLint com regras do projeto
3. **test** — Vitest (unitário + integração)
4. **build** — Vite (typecheck embutido)

Testes E2E (Playwright) podem ser disparados manualmente via `workflow_dispatch`.

### Baseline atual

- Typecheck: 0 erros
- Lint: 0 erros, 3 warnings (react-hook-form `watch()` — dívida técnica controlada)
- Testes: 827/827 passando
- Build: OK
- npm audit: 0 high, 2 moderate (uuid via exceljs — documentado)

## Deploy

O projeto está preparado para Cloudflare Pages:

- Build command: `npm run build`
- Output directory: `dist`
- Variáveis de ambiente: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ENABLE_MOCK_MODE=false`

## Segurança

- Nunca commitar `.env.local`, `service_role` ou qualquer chave secreta.
- Apenas a **anon key pública** do Supabase é usada no frontend.
- `service_role` e `sb_secret` são rejeitados em runtime.
- RLS ativo em todas as tabelas do Supabase.
- Runtime rejeita `service_role` e `sb_secret_` na configuração (`supabase.ts`).

## Estrutura

```
src/
  components/   # UI components
  hooks/        # React hooks
  lib/          # Utilitários, normalizadores, env
  pages/        # Páginas e steps do wizard
  services/     # Serviços (offline, sync, storage, etc.)
  types/        # TypeScript types
  constants/    # Constantes e listas técnicas
e2e/            # Playwright E2E tests
supabase/
  migrations/   # SQL migrations
public/
  icons/        # PWA icons (PNG)
  _headers      # Cloudflare headers
  _redirects    # Cloudflare SPA redirect
```

## Performance e Bundle

### Políticas

- **LoginPage** é carregada eager (sem lazy loading) por ser a primeira tela do usuário.
- **Páginas protegidas** (Dashboard, Empresas, Wizard, etc.) são lazy-loaded via `React.lazy()`.
- **exceljs** é importado dinamicamente (`await import('exceljs')`) — não entra no bundle inicial.
- **browser-image-compression** está em chunk separado — carrega sob demanda (Step06).
- **Ícones lucide-react** são tree-shakeable e agrupados em chunk próprio.
- **Não adicionar** bibliotecas grandes sem lazy loading ou justificativa de performance.

### Análise

```bash
npm run build
```

Após o build, inspecionar `dist/assets/` para verificar tamanho dos chunks.

### Baseline

- Chunk inicial: ~720 kB (~210 kB gzipped)
- exceljs: ~930 kB (lazy, fora do bundle inicial)
- 0 warnings de chunk > 1 MB

## PWA Manifest

O Manifest PWA é gerado automaticamente pelo `vite-plugin-pwa` a partir da configuração em `vite.config.ts`.

### Políticas

- **Ícones obrigatórios:** No mínimo 192×192 e 512×512 PNG, com variante maskable opcional.
- **Screenshots:** Apenas screenshots reais do app (sem dados sensíveis ou clientes reais). Atualmente removidas do manifest até que capturas oficiais de release sejam geradas.
- **`iarc_rating_id`:** Não deve ser declarado sem um ID real emitido por autoridade de classificação.

### Validação

```bash
npm run validate:pwa
```

Valida assets declarados, campos essenciais e ausência de placeholders. Executada localmente (não obrigatória no CI).

## Fluxo principal

```
Empresa
  └── Setor
        └── Novo Levantamento
              └── Formulário Setorial LPR + AEP (wizard 8 etapas)
```

Licença: MIT

## Empacotamento seguro para auditoria

Ao compartilhar o projeto para auditoria ou suporte, use o script de pacote limpo:

```bash
npm run package:audit
```

Isso gera `risco360-audit-clean.zip` na raiz do projeto, contendo apenas arquivos relevantes e excluindo automaticamente:

- `.env.local` (credenciais reais — **nunca** compartilhar)
- `.git` (histórico completo do repositório)
- `node_modules` (centenas de dependências)
- `dist` / `dev-dist` (artefatos de build)
- `e2e-report` / `test-results` / `coverage` (relatórios locais)

### Regras de ouro

1. **Nunca** enviar `.env.local` — use apenas `.env.example` como referência.
2. **Nunca** enviar o diretório `.git`.
3. **Nunca** enviar `node_modules`.
4. **Nunca** enviar `dist` ou `dev-dist`.
5. Sempre rodar `npm run package:audit` antes de empacotar.

### Se uma credencial real foi compartilhada por engano

1. Considerar rotação imediata da chave comprometida.
2. Revisar logs de acesso ao repositório/Supabase.
3. Verificar se houve exposição externa (público, terceiros).
4. Remover o pacote de qualquer local público.
