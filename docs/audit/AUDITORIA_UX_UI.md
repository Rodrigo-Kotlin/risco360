# AUDITORIA UX/UI — RISCO360

## SCORE: 72 / 100

---

## 1. DESIGN SYSTEM

### Theming (`src/styles/`)

| Aspecto | Status | Notas |
|---|---|---|
| Design tokens CSS | ✅ | Cores, spacing, radii, shadows como custom properties |
| MD3 type scale | ✅ | 5 categorias × 3 tamanhos cada |
| Mobile-first breakpoints | ✅ | sm/md/lg/xl com min-width |
| Touch targets (48px) | ✅ | `@media (hover: none) and (pointer: coarse)` |
| Reduced motion | ✅ | `prefers-reduced-motion: reduce` |
| Focus-visible ring | ✅ | Global + por componente |
| Responsive font size | ✅ | `html { font-size: 17px }` em `max-width: 640px` |
| **Dark mode** | ❌ | **Nenhum suporte** — app light-mode apenas |

---

## 2. COMPONENTES UI

### Button (`Button.tsx`)

| Critério | Status |
|---|---|
| Touch target | ✅ `min-h-[48px]` |
| Loading state | ✅ `Loader2` + `aria-busy` |
| Disabled state | ✅ Todas as variantes |
| Focus-visible | ✅ |
| 6 variantes | ✅ primary, secondary, outline, ghost, danger, success |
| `aria-hidden` em ícones | ✅ |
| `forwardRef` | ✅ |

### Card (`Card.tsx`)

| Critério | Status |
|---|---|
| Clickable keyboard | ✅ Enter/Space, role="button", tabIndex |
| 6 variantes | ✅ default, interactive, selected, danger, success, info |
| Responsive | ✅ `p-4 md:p-5` |

### Input (`Input.tsx`)

| Critério | Status |
|---|---|
| Label association | ✅ `htmlFor`/`id` |
| Error state | ✅ `role="alert"`, `aria-invalid`, `aria-describedby` |
| Hint text | ✅ |
| Required indicator | ✅ `*` com `aria-hidden` |
| Icon slot | ✅ |
| Touch target | ✅ `min-h-[48px]` |
| Focus-visible | ✅ |

### Modal (`Modal.tsx`)

| Critério | Status |
|---|---|
| Escape to close | ✅ |
| Click outside | ✅ |
| Body scroll lock | ✅ |
| `aria-modal` | ✅ |
| Focus trap | ❌ Usuário pode tab para fora do modal |
| Focus restoration | ❌ Foco não volta ao elemento trigger |
| Responsive sizes | ✅ sm, md, lg |

### Toast (`Toast.tsx`)

| Critério | Status |
|---|---|
| Provider pattern | ✅ |
| Auto-dismiss (4500ms) | ✅ (hardcoded) |
| 4 variantes | ✅ success, error, warning, info |
| `aria-live="polite"` | ✅ |
| `role="alert"` | ✅ |
| Close button | ✅ `aria-label` |
| Stacked positioning | ✅ top-right |

### DataTable (`DataTable.tsx`)

| Critério | Status |
|---|---|
| Loading state (skeleton) | ✅ |
| Error state | ✅ |
| Empty state | ✅ (EmptyState component) |
| Sortable columns | ✅ `aria-sort` |
| Row click keyboard | ✅ Enter/Space |
| Responsive | ✅ `overflow-x-auto` |

---

## 3. LAYOUT

### Sidebar

| Aspecto | Status |
|---|---|
| Desktop-only | ✅ `hidden lg:flex` |
| Active link | ✅ Left border + primary bg |
| Sync badge | ✅ Pending count |
| Sticky | ✅ |
| `aria-label` | ✅ |

### Header

| Aspecto | Status |
|---|---|
| Sticky glassmorphism | ✅ `bg-white/80 backdrop-blur-sm` |
| Mobile menu | ✅ `lg:hidden` hamburger |
| Online/Offline | ✅ Badge Wifi/WifiOff |
| User dropdown | ✅ Avatar + menu |
| Mock dev badge | ✅ Beaker icon |

### MobileBottomNavigation

| Aspecto | Status |
|---|---|
| Fixed bottom | ✅ |
| Safe area | ✅ `env(safe-area-inset-bottom)` |
| Active indicator | ✅ Top bar dot |
| `aria-label` | ✅ |

---

## 4. ESTADOS

### Empty States

Todas as páginas de lista têm EmptyState:
- EmpresasPage ✅
- SetoresPage ✅
- LevantamentosPage ✅
- BibliotecaPage ✅
- RelatoriosPage ✅
- DashboardPage ✅
- SincronizacaoPage ✅

### Loading States

Todas usam Skeleton ou spinner:
- DataTable: skeleton rows ✅
- Cards: SkeletonCard ✅
- Buttons: Loader2 ✅
- Perfil: pulse animation ✅
- Dashboard: SkeletonCard grid ✅

### Error States

- DataTable: error message + retry ✅
- Forms: inline field errors ✅
- Toast: error notification ✅
- Login: role="alert" ✅
- Pages: error card + "Tentar novamente" ✅

---

## 5. RESPONSIVIDADE

| Dispositivo | Suporte |
|---|---|
| Mobile (<640px) | ✅ Single column, bottom nav |
| Tablet (640-1024px) | ✅ 2-column grids |
| Desktop (>1024px) | ✅ Sidebar + 3-4 column grids |
| Breakpoints | sm:640, md:768, lg:1024, xl:1280 |

---

## 6. ACESSIBILIDADE

| Atributo | Uso |
|---|---|
| `aria-*` | ✅ Excelente — generalizado |
| `aria-label` em botões ícone | ✅ |
| `aria-hidden` em ícones decorativos | ✅ |
| `aria-invalid` + `aria-describedby` | ✅ |
| `role="alert"` | ✅ |
| `role="button"` em elementos clicáveis | ✅ Cards, rows |
| `aria-modal` | ✅ |
| `aria-live="polite"` | ✅ Toast |
| `aria-busy` | ✅ Button, DataTable |
| `aria-sort` | ✅ DataTable headers |
| `aria-current` | ✅ Stepper |
| `aria-expanded` / `aria-haspopup` | ✅ Dropdown |
| `role="progressbar"` | ✅ ProgressBar |
| Focus trap (modal) | ❌ |
| Focus restoration (modal) | ❌ |
| Keyboard nav (dropdown) | ❌ Arrow keys |

---

## 7. GAPS IDENTIFICADOS

| # | Gap | Impacto | Esforço |
|---|---|---|---|
| 1 | **Dark mode ausente** | Alto — 30%+ dos usuários preferem | 1 semana |
| 2 | **Focus trap no Modal** | Médio — usuários de teclado | 2 horas |
| 3 | **Focus restoration no Modal** | Médio — perda de foco ao fechar | 1 hora |
| 4 | **DropdownMenu sem teclado** | Baixo — navegação limitada | 2 horas |
| 5 | **Toast dismiss hardcoded 4500ms** | Baixo — não configurável | 30 min |
| 6 | **OfflineBanner polling 30s** | Baixo — poderia ser event-driven | 2 horas |
| 7 | **Sem `role="search"`** | Baixo — landmark faltante | 10 min |

---

## 8. RECOMENDAÇÕES

### Curto Prazo (1-2 dias)
1. Implementar dark mode com CSS custom properties + `prefers-color-scheme` + toggle
2. Adicionar focus trap no Modal (usar `inert` polyfill ou `focus-trap-react`)
3. Adicionar focus restoration no Modal

### Médio Prazo (1 semana)
4. Adicionar `role="search"` nos inputs de busca
5. Adicionar suporte a teclado no DropdownMenu (arrow keys)
6. Tornar Toast dismiss configurável

### Longo Prazo (2-4 semanas)
7. Substituir polling do OfflineBanner por eventos
8. Adicionar splash screen customizada para PWA
9. Auditoria de contraste de cores
