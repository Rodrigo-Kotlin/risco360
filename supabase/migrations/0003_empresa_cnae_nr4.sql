-- 0003_empresa_cnae_nr4.sql
-- Risco360 — Adiciona campos de CNAE e Grau de Risco NR-4 à tabela empresas
-- Requer: 0002_risco360_schema_consolidado.sql
-- Idempotente: usa IF NOT EXISTS / do $$ begin ... end $$;

-- ============================================================
-- 1. EMPRESAS — CNAE + GRAU DE RISCO NR-4
-- ============================================================

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'empresas'
    and column_name = 'cnae_principal'
  ) then
    alter table public.empresas add column cnae_principal text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'empresas'
    and column_name = 'cnae_principal_descricao'
  ) then
    alter table public.empresas add column cnae_principal_descricao text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'empresas'
    and column_name = 'cnaes_secundarios'
  ) then
    alter table public.empresas add column cnaes_secundarios jsonb;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'empresas'
    and column_name = 'grau_risco_nr4'
  ) then
    alter table public.empresas add column grau_risco_nr4 integer;
  end if;
end $$;

-- ============================================================
-- 2. ÍNDICES
-- ============================================================

create index if not exists idx_empresas_cnae_principal on public.empresas(cnae_principal);
create index if not exists idx_empresas_grau_risco_nr4 on public.empresas(grau_risco_nr4);

-- ============================================================
-- 3. VALIDAÇÃO
-- ============================================================
-- Migration idempotente e segura.
-- Todos os novos campos são opcionais (null por padrão).
-- Nenhum dado existente é alterado ou removido.
