-- 0005_smart_resume.sql
-- Risco360 — Smart Resume (continuidade inteligente do levantamento).
-- Adiciona colunas para salvar o último step, progresso e timestamps de edição.
-- Todas as operações são idempotentes (IF NOT EXISTS / do $$).
-- Não quebra dados existentes. Levantamentos antigos terão ultimo_step = 1 como fallback.

-- ============================================================
-- 1. LEVANTAMENTOS — SMART RESUME FIELDS
-- ============================================================
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'ultimo_step'
  ) then
    alter table public.levantamentos add column ultimo_step integer not null default 1;
  end if;
  -- progresso_percentual: percentual calculado no frontend, pode divergir do `percentual` do backend
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'progresso_percentual'
  ) then
    alter table public.levantamentos add column progresso_percentual integer default 0;
  end if;
  -- ultima_edicao: timestamp da última edição realizada pelo usuário
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'ultima_edicao'
  ) then
    alter table public.levantamentos add column ultima_edicao timestamptz;
  end if;
  -- ultima_sincronizacao: timestamp da última sincronização bem-sucedida
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'ultima_sincronizacao'
  ) then
    alter table public.levantamentos add column ultima_sincronizacao timestamptz;
  end if;
end $$;

create index if not exists idx_levantamentos_ultimo_step on public.levantamentos(ultimo_step);
create index if not exists idx_levantamentos_ultima_edicao on public.levantamentos(ultima_edicao);

-- ============================================================
-- 2. VALIDAÇÃO
-- ============================================================
-- Esta migration deve ser executada APÓS a 0004_optimization_indexes.sql.
-- Todas as operações são idempotentes (IF NOT EXISTS / do $$).
-- Não quebra dados existentes.
