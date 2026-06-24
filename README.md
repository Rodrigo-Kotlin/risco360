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

## Fluxo principal

```
Empresa
  └── Setor
        └── Novo Levantamento
              └── Formulário Setorial LPR + AEP (wizard 8 etapas)
```

Licença: MIT
