-- Migration: 0004_optimization_indexes
-- Descrição: Índices compostos para eliminar full table scans em consultas frequentes
--
-- Estratégia:
-- Cada índice composto cobre o padrão WHERE filtro + ORDER BY coluna,
-- permitindo que o PostgreSQL resolva filtro e ordenação em uma única
-- varredura de índice (Index Scan / Index Only Scan).
--
-- Tabelas afetadas: empresas, setores, levantamentos, relatorios
-- Impacto esperado: redução de full table scans nas 9 consultas mais frequentes

-- ============================================================
-- empresas
-- ============================================================
-- Cobre: listarEmpresas()
-- WHERE deleted_at IS NULL ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_empresas_deleted_at_created_at
  ON public.empresas(deleted_at, created_at DESC);

-- ============================================================
-- setores
-- ============================================================
-- Cobre: listarSetores()
-- WHERE deleted_at IS NULL ORDER BY nome ASC
CREATE INDEX IF NOT EXISTS idx_setores_deleted_at_nome
  ON public.setores(deleted_at, nome ASC);

-- Cobre: listarSetoresPorEmpresa(empresaId)
-- WHERE empresa_id = $1 AND deleted_at IS NULL ORDER BY nome ASC
CREATE INDEX IF NOT EXISTS idx_setores_empresa_deleted_at_nome
  ON public.setores(empresa_id, deleted_at, nome ASC);

-- ============================================================
-- levantamentos
-- ============================================================
-- Cobre: listarLevantamentos()
-- WHERE deleted_at IS NULL ORDER BY updated_at DESC
CREATE INDEX IF NOT EXISTS idx_levantamentos_deleted_at_updated_at
  ON public.levantamentos(deleted_at, updated_at DESC);

-- Cobre: buscarLevantamentosPorEmpresa(empresaId)
-- WHERE empresa_id = $1 AND deleted_at IS NULL ORDER BY updated_at DESC
CREATE INDEX IF NOT EXISTS idx_levantamentos_empresa_deleted_at_updated_at
  ON public.levantamentos(empresa_id, deleted_at, updated_at DESC);

-- Cobre: buscarLevantamentosPorStatus(status)
-- WHERE status = $1 AND deleted_at IS NULL ORDER BY updated_at DESC
CREATE INDEX IF NOT EXISTS idx_levantamentos_status_deleted_at_updated_at
  ON public.levantamentos(status, deleted_at, updated_at DESC);

-- Cobre: listarLevantamentosPorSetor(setorId)
--        buscarFormularioSetorialPorSetor(setorId)
-- WHERE setor_id = $1 AND deleted_at IS NULL ORDER BY updated_at DESC
CREATE INDEX IF NOT EXISTS idx_levantamentos_setor_deleted_at_updated_at
  ON public.levantamentos(setor_id, deleted_at, updated_at DESC);

-- ============================================================
-- relatorios
-- ============================================================
-- Cobre: listarRelatorios()
-- WHERE deleted_at IS NULL ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_relatorios_deleted_at_created_at
  ON public.relatorios(deleted_at, created_at DESC);

-- Cobre: listarRelatoriosPorLevantamento(levantamentoId)
-- WHERE levantamento_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_relatorios_levantamento_deleted_at_created_at
  ON public.relatorios(levantamento_id, deleted_at, created_at DESC);
