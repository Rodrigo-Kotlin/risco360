# SERVICE PROVIDER AUDIT

## `isMockModeEnabled` Occurrences — Business Services

| # | File | Function | Line | Delegates To |
|---|------|----------|------|-------------|
| 1 | `src/services/empresas.service.ts` | `listarEmpresas` | 24 | `mock-empresas.service.listarEmpresas` |
| 2 | `src/services/empresas.service.ts` | `buscarEmpresaPorId` | 73 | `mock-empresas.service.buscarEmpresaPorId` |
| 3 | `src/services/empresas.service.ts` | `criarEmpresa` | 104 | `mock-empresas.service.criarEmpresa` |
| 4 | `src/services/empresas.service.ts` | `atualizarEmpresa` | 162 | `mock-empresas.service.atualizarEmpresa` |
| 5 | `src/services/empresas.service.ts` | `excluirEmpresa` | 210 | `mock-empresas.service.excluirEmpresa` |
| 6 | `src/services/empresas.service.ts` | `buscarEmpresasPorTermo` | 249 | `mock-empresas.service.listarEmpresas` |
| 7 | `src/services/setores.service.ts` | `listarSetores` | 25 | `mock-setores.service.listarSetores` |
| 8 | `src/services/setores.service.ts` | `listarSetoresPorEmpresa` | 76 | `mock-setores.service.listarSetoresPorEmpresa` |
| 9 | `src/services/setores.service.ts` | `buscarSetorPorId` | 107 | `mock-setores.service.buscarSetorPorId` |
| 10 | `src/services/setores.service.ts` | `criarSetor` | 138 | `mock-setores.service.criarSetor` |
| 11 | `src/services/setores.service.ts` | `atualizarSetor` | 187 | `mock-setores.service.atualizarSetor` |
| 12 | `src/services/setores.service.ts` | `excluirSetor` | 226 | `mock-setores.service.excluirSetor` |
| 13 | `src/services/levantamentos.service.ts` | `listarLevantamentos` | 35 | `mock-levantamentos.service.listarLevantamentos` |
| 14 | `src/services/levantamentos.service.ts` | `buscarLevantamentoPorId` | 86 | `mock-levantamentos.service.buscarLevantamentoPorId` |
| 15 | `src/services/levantamentos.service.ts` | `criarLevantamento` | 117 | `mock-levantamentos.service.criarLevantamento` |
| 16 | `src/services/levantamentos.service.ts` | `atualizarLevantamento` | 207 | `mock-levantamentos.service.atualizarLevantamento` |
| 17 | `src/services/levantamentos.service.ts` | `excluirLevantamento` | 336 | `mock-levantamentos.service.excluirLevantamento` |
| 18 | `src/services/levantamentos.service.ts` | `duplicarLevantamento` | 375 | `mock-levantamentos.service.duplicarLevantamento` |
| 19 | `src/services/levantamentos.service.ts` | `atualizarStatusLevantamento` | 433 | `mock-levantamentos.service.atualizarStatusLevantamento` |
| 20 | `src/services/levantamentos.service.ts` | `atualizarPercentualLevantamento` | 480 | `mock-levantamentos.service.atualizarPercentualLevantamento` |
| 21 | `src/services/levantamentos.service.ts` | `buscarLevantamentosPorEmpresa` | 528 | `mock-levantamentos.service.buscarLevantamentosPorEmpresa` |
| 22 | `src/services/levantamentos.service.ts` | `buscarLevantamentosPorStatus` | 561 | `mock-levantamentos.service.buscarLevantamentosPorStatus` |
| 23 | `src/services/levantamentos.service.ts` | `buscarLevantamentosPorTipo` | 594 | `mock-levantamentos.service.buscarLevantamentosPorTipo` |
| 24 | `src/services/levantamentos.service.ts` | `listarLevantamentosPorSetor` | 627 | `mock-levantamentos.service.listarLevantamentosPorSetor` |
| 25 | `src/services/levantamentos.service.ts` | `buscarFormularioSetorialPorSetor` | 660 | `mock-levantamentos.service.buscarFormularioSetorialPorSetor` |
| 26 | `src/services/levantamentos.service.ts` | `criarFormularioSetorial` | 707 | `mock-levantamentos.service.criarFormularioSetorial` |
| 27 | `src/services/levantamentos.service.ts` | `abrirOuCriarFormularioSetorial` | 724 | `mock-levantamentos.service.abrirOuCriarFormularioSetorial` |
| 28 | `src/services/relatorios.service.ts` | `listarRelatorios` | 22 | `mock-relatorios.service.listarRelatorios` |
| 29 | `src/services/relatorios.service.ts` | `buscarRelatorioPorId` | 61 | `mock-relatorios.service.listarRelatorios` (inline) |
| 30 | `src/services/relatorios.service.ts` | `listarRelatoriosPorLevantamento` | 86 | `mock-relatorios.service.listarRelatoriosPorLevantamento` |
| 31 | `src/services/relatorios.service.ts` | `criarRelatorio` | 111 | `mock-relatorios.service.criarRelatorio` |
| 32 | `src/services/relatorios.service.ts` | `atualizarRelatorio` | 151 | `mock-relatorios.service.listarRelatorios` (inline) |
| 33 | `src/services/relatorios.service.ts` | `excluirRelatorio` | 181 | `mock-relatorios.service.excluirRelatorio` |
| 34 | `src/services/relatorios.service.ts` | `atualizarStatusRelatorio` | 222 | `atualizarRelatorio (mock)` (inline) |
| 35 | `src/services/biblioteca-tecnica.service.ts` | `listarItensBiblioteca` | 14 | `mock-biblioteca.service.listarBiblioteca` |
| 36 | `src/services/biblioteca-tecnica.service.ts` | `buscarItemBibliotecaPorId` | 39 | `mock-biblioteca.service.buscarBibliotecaItemPorId` |
| 37 | `src/services/biblioteca-tecnica.service.ts` | `buscarItensBibliotecaPorCategoria` | 61 | `mock-biblioteca.service.listarBiblioteca` |
| 38 | `src/services/biblioteca-tecnica.service.ts` | `buscarItensBibliotecaPorTipoRisco` | 86 | `mock-biblioteca.service.listarBiblioteca` |
| 39 | `src/services/biblioteca-tecnica.service.ts` | `pesquisarBibliotecaTecnica` | 111 | `mock-biblioteca.service.listarBiblioteca` |
| 40 | `src/services/biblioteca-tecnica.service.ts` | `criarItemBiblioteca` | 138 | `mock-biblioteca.service.criarBibliotecaItem` |
| 41 | `src/services/biblioteca-tecnica.service.ts` | `atualizarItemBiblioteca` | 193 | `mock-biblioteca.service.atualizarBibliotecaItem` |
| 42 | `src/services/biblioteca-tecnica.service.ts` | `excluirItemBiblioteca` | 254 | `mock-biblioteca.service.excluirBibliotecaItem` |
| 43 | `src/services/biblioteca-tecnica.service.ts` | `ativarItemBiblioteca` | 274 | `mock-biblioteca.service.buscarBibliotecaItemPorId` |
| 44 | `src/services/biblioteca-tecnica.service.ts` | `desativarItemBiblioteca` | 296 | `mock-biblioteca.service.buscarBibliotecaItemPorId` |
| 45 | `src/services/profile.service.ts` | `getCurrentProfile` | 8 | Inline mock data (`mockProfile`) |
| 46 | `src/services/profile.service.ts` | `updateCurrentProfile` | 43 | Inline mock data |
| 47 | `src/services/evidencias.service.ts` | `uploadEvidenciaFotografica` | 144 | Inline offline save (`salvarEvidenciaOffline`) |
| 48 | `src/services/evidencias.service.ts` | `removerEvidencia` | 348 | Inline (`excluirEvidenciaOffline`) |

**Total business-service occurrences: 48**

## Remaining `isMockModeEnabled` (not in scope of removal)

Uses in infrastructure/mock files that MUST be preserved:
- `src/lib/mock-mode.ts` — Definition (1)
- `src/services/mock-auth.service.ts` — Self-guard (3)
- `src/services/mock-storage.service.ts` — Self-guard (8)
- `src/services/data-provider.ts` — Infrastructure initialization (2)
- `src/lib/migration.ts` — Migration guard (1)
- UI components (Header, OfflineBanner, ConfiguracoesPage) — UI rendering (3)
- Test files — Mock setup (15 files)
- Docs — Documentation (2 files)
