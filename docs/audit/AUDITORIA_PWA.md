# AUDITORIA PWA — RISCO360

## SCORE: 62 / 100

| Critério | Nota | Justificativa |
|---|---|---|
| Manifest | 8/10 | Completo, 11 ícones, maskable, display_override. Faltam screenshots |
| Service Worker | 8/10 | Workbox, precache, navigateFallback. Sem update notification |
| Offline suporte | 9/10 | IndexedDB robusto, sync queue, cache-on-read |
| Install prompt | 0/10 | **Nenhum `beforeinstallprompt` listener** |
| Update handling | 3/10 | autoUpdate sem feedback ao usuário |
| Ícones | 9/10 | 72x72 a 512x512 + maskable + apple-touch |
| Startup experience | 5/10 | Sem splash screen customizada |
| Performance | 7/10 | Code splitting, chunks, caching headers |

---

## 1. CONFIGURAÇÃO

**Arquivo:** `vite.config.ts`

| Configuração | Valor | Status |
|---|---|---|
| `registerType` | `'autoUpdate'` | ✅ |
| `injectRegister` | `'auto'` | ✅ |
| `devOptions.enabled` | `true` | ✅ |
| `workbox.cleanupOutdatedCaches` | `true` | ✅ |
| `workbox.navigateFallback` | `'/index.html'` | ✅ |
| `workbox.globPatterns` | `**/*.{js,css,html,ico,png,svg,webmanifest}` | ✅ |
| `workbox.maximumFileSizeToCacheInBytes` | `2MB` | ✅ |
| `manifest.display` | `'standalone'` | ✅ |
| `manifest.display_override` | `['window-controls-overlay', 'standalone']` | ✅ |
| `manifest.theme_color` | `#0B6B3A` | ✅ |
| `manifest.background_color` | `#f8fafc` | ✅ |
| `manifest.orientation` | `'portrait-primary'` | ✅ |
| `manifest.lang` | `'pt-BR'` | ✅ |

---

## 2. MANIFEST

**Ícones:**
- 72x72, 96x96, 128x128, 144x144, 152x152, 180x180, 192x192, 384x384, 512x512
- maskable-192x192, maskable-512x512
- apple-touch-icon.png

**Faltando:**
- `screenshots` — enriquece o diálogo de instalação
- `categories` — ajuda na descoberta

---

## 3. GAPS CRÍTICOS

### G1. Sem `beforeinstallprompt`

**Nenhum listener para o evento `beforeinstallprompt`** em toda a codebase.

**Impacto:** Usuários não podem instalar o app via fluxo nativo do navegador. O PWA é funcional mas não instalável sem passar por configurações manuais.

**Solução:**
```typescript
// Hook ou componente dedicado
const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

useEffect(() => {
  const handler = (e: BeforeInstallPromptEvent) => {
    e.preventDefault()
    setDeferredPrompt(e)
  }
  window.addEventListener('beforeinstallprompt', handler)
  return () => window.removeEventListener('beforeinstallprompt', handler)
}, [])
```

**Esforço:** 2 horas.

### G2. Sem Update Notification

Com `registerType: 'autoUpdate'`, o service worker atualiza silenciosamente. O usuário pode:
1. Receber conteúdo de versões diferentes na mesma sessão
2. Perder estado do React em um refresh inesperado
3. Nunca saber que uma atualização ocorreu

**Solução:** Adicionar listener para `controllerchange` e exibir toast "Nova versão disponível — clique para atualizar".

**Esforço:** 4 horas.

---

## 4. ESTRATÉGIA DE CACHE

| Recurso | Estratégia | Notas |
|---|---|---|
| JS/CSS assets | Precache (Workbox) | Cache imutável 1 ano |
| HTML (index.html) | Network First | navigateFallback |
| Imagens (ícones) | Precache | Cache imutável 1 ano |
| API (Supabase) | Network Only | Cache feito pela app (IndexedDB) |
| Evidências (Storage) | Network Only | Upload/download direto |

---

## 5. TESTES PWA

**`e2e/pwa-icons.spec.ts`** — Verifica existência de ícones. Apenas teste E2E relacionado a PWA.

**Faltando:** Testes para install prompt, service worker update, offline fallback.

---

## 6. RECOMENDAÇÕES

### Imediato (2 dias)
1. Adicionar `beforeinstallprompt` listener + botão de instalação
2. Adicionar update notification (service worker `controllerchange`)

### Curto Prazo (1 semana)
3. Adicionar `screenshots` ao manifest
4. Adicionar splash screen customizada (theme-color + background-color + logo)
5. Adicionar testes E2E para instalação e atualização

### Médio Prazo (2-4 semanas)
6. Implementar estratégia de cache para consultas offline da biblioteca técnica
7. Adicionar sincronização em background (Periodic Sync API)
8. Badge de notificações para pendências de sync
