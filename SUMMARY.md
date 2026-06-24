## Goal
- Implement mock development mode (auth, data, services) for Risco360 to enable local testing without Supabase
- Implement Fase 11: Wizard técnico setorial LPR/AEP por setor

## Constraints & Preferences
- Mock mode must only work when `import.meta.env.DEV === true && VITE_ENABLE_MOCK_MODE === 'true'`
- No mock mode in production even if env var is set
- Mock credentials: `demo@risco360.local` / `Risco360@123`
- All mock storage keys prefixed with `risco360_mock_` (never `riskflow_*`)
- No `RiskFlow`, `process.env`, `placeholder.supabase.co`, `service_role`, `sb_secret` in executable code
- No real JWT tokens, no real Supabase calls when mock mode is active and Supabase absent
- Each setor has its own LPR and AEP form (wizard técnico setorial)
- All typecheck, lint, build must pass

## Progress
### Done
- **(Fase 10):** SearchInput, DataTable, FilterBar, ProgressBar; EmpresaForm, BibliotecaItemForm, LevantamentoBasicoForm; EmpresasPage, EmpresaFormPage, EmpresaDetalhePage; LevantamentosPage, LevantamentoDetalhePage, NovoLevantamentoPage; BibliotecaPage, RelatoriosPage, ConfiguracoesPage — all refactored with CRUD via service layer
- **(Fase 11):**
  - Wizard setorial de 8 etapas implementado
  - Fluxo Empresa → Setor → LPR/AEP implementado
  - SetorDetalhePage com cards LPR/AEP, status, percentual, botões Criar/Continuar
  - Criação de LPR por setor implementada (com verificação de duplicidade)
  - Criação de AEP por setor implementada (com verificação de duplicidade)
  - Etapas do wizard: Identificação, Características, Medições, Colaboradores, Riscos, Controles, Parecer, Revisão/Assinaturas
  - Cálculo de nível de risco (probabilidade x severidade → irrelevante a crítico)
  - Percentual de preenchimento com pesos (15/15/10/10/20/15/10/5)
  - Hook `useLevantamentoWizard` com save, navigate, conclude, progress
  - Form components: RiscoForm, RiscoCard, NivelRiscoBadge, PlanoAcaoForm, MedicaoForm, ColaboradorForm, AssinaturaForm
  - `wizard-progress.ts` extraído para `src/lib/wizard-progress.ts`
  - Navegação "Anterior" habilitada nas etapas 2-8
  - Pré-preenchimento de contexto setorial no NovoLevantamentoPage
  - Step weights atualizados conforme especificação
  - Integração com modo mock validada
  - Dashboard com contagem de LPR/AEP por setor
  - EmpresaDetalhePage com status de LPR/AEP por setor
- **(Mock Mode):** Full mock mode with auth, data, services; 6 real services delegate to mock when `isMockModeEnabled`
- **All builds pass:** `npm run typecheck` = 0 errors, `npm run lint` = 0 errors, `npm run build` = 0 errors

### In Progress
- (none)

### Blocked
- (none)

## Key Design Decisions
- Mock delegation at top of each function in real service files
- AuthContext handles both mock and Supabase auth paths
- Mock data types match exact type definitions (lowercase `CategoriaRisco`, etc.)
- Wizard-progress logic extracted to standalone module for reuse
- Step weights match spec: Step1=15%, Step2=15%, Step3=10%, Step4=10%, Step5=20%, Step6=15%, Step7=10%, Step8=5%
- Previous navigation enabled on all steps (except first)

## Build Results
- `npm run typecheck` — 0 errors
- `npm run lint` — 0 errors
- `npm run build` — 0 errors (clean production build)

## Relevant Files
- `src/pages/LevantamentoWizardPage.tsx` — 8-step wizard with stepper, progress, sector context
- `src/pages/SetorDetalhePage.tsx` — Sector detail with LPR/AEP cards
- `src/pages/NovoLevantamentoPage.tsx` — Creation with setor context pre-fill
- `src/hooks/useLevantamentoWizard.ts` — Wizard state management
- `src/lib/wizard-progress.ts` — Standalone progress calculation
- `src/lib/risk-calculator.ts` — Risk level calculation
- `src/pages/steps/Step01-08*.tsx` — All 8 step components with onPrevious support
- `src/components/forms/*.tsx` — RiscoForm, RiscoCard, NivelRiscoBadge, PlanoAcaoForm, MedicaoForm, ColaboradorForm, AssinaturaForm
- `src/constants/app.ts` — STEP_WEIGHTS updated to spec values
- `src/routes/index.tsx` — All setor wizard routes

## Next Steps
- Fase 12: Relatórios (PDF/export) for sector LPR/AEP
- Fase 12: Integração com Supabase real
- Fase 12: Validação mobile e UX final
