-- 0002_risco360_schema_consolidado.sql
-- Risco360 — Migração consolidada futura.
-- Atualiza e complementa o schema 0001_initial_schema.sql:
--   - Fix: constraint levantamentos.tipo = 'LPR_AEP' (remove LPR, LPP, AEP)
--   - Add: deleted_at, local_id, sync_status, last_synced_at nas tabelas principais
--   - Add: pontos_medicao (modelo novo), campos faltantes do frontend
--   - Add: tabela evidencias (independente)
--   - Add: tabela sync_log
--   - Add: storage bucket evidencias
--   - Update: profiles role constraint (admin, tecnico, viewer)
--   - Update: biblioteca_tecnica com campos do frontend atual
--   - Update: relatorios tipo constraint (xlsx, csv, pdf_conferencia)
--   - Update: setores com localizacao, responsavel_local, observacoes

-- ============================================================
-- 1. FUNÇÕES
-- ============================================================
-- set_updated_at já criada em 001. Mantida como está.

-- ============================================================
-- 2. PROFILES — ROLE CONSTRAINT
-- ============================================================
-- Add constraint se ainda não existe
do $$ begin
  if not exists (
    select 1 from information_schema.check_constraints
    where constraint_name = 'profiles_role_check'
  ) then
    alter table public.profiles
    add constraint profiles_role_check
    check (role in ('admin', 'tecnico', 'viewer'));
  end if;
end $$;

-- Atualiza default de 'user' para 'tecnico' (apenas se default antigo existir)
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
    and column_name = 'role' and column_default = '''user''::text'
  ) then
    alter table public.profiles alter column role set default 'tecnico';
  end if;
end $$;

-- ============================================================
-- 3. EMPRESAS — SOFT DELETE
-- ============================================================
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'empresas'
    and column_name = 'deleted_at'
  ) then
    alter table public.empresas add column deleted_at timestamptz;
  end if;
end $$;

create index if not exists idx_empresas_deleted_at on public.empresas(deleted_at);

-- ============================================================
-- 4. SETORES — CAMPOS FALTANTES + SOFT DELETE
-- ============================================================
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'setores'
    and column_name = 'localizacao'
  ) then
    alter table public.setores add column localizacao text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'setores'
    and column_name = 'responsavel_local'
  ) then
    alter table public.setores add column responsavel_local text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'setores'
    and column_name = 'observacoes'
  ) then
    alter table public.setores add column observacoes text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'setores'
    and column_name = 'deleted_at'
  ) then
    alter table public.setores add column deleted_at timestamptz;
  end if;
end $$;

create index if not exists idx_setores_deleted_at on public.setores(deleted_at);

-- ============================================================
-- 5. LEVANTAMENTOS — FIX TIPO CONSTRAINT + NOVOS CAMPOS
-- ============================================================
-- 5a. Remove constraint antiga que permite LPR, LPP, AEP e cria nova apenas LPR_AEP
do $$ begin
  if exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'chk_levantamentos_tipo'
    and table_name = 'levantamentos'
  ) then
    alter table public.levantamentos drop constraint chk_levantamentos_tipo;
  end if;
end $$;

alter table public.levantamentos
add constraint chk_levantamentos_tipo
check (tipo = 'LPR_AEP');

-- 5b. Atualiza constraint de status
do $$ begin
  if exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'chk_levantamentos_status'
    and table_name = 'levantamentos'
  ) then
    alter table public.levantamentos drop constraint chk_levantamentos_status;
  end if;
end $$;

alter table public.levantamentos
add constraint chk_levantamentos_status
check (status in ('rascunho', 'em_andamento', 'concluido', 'arquivado'));

-- 5c. Add colunas novas do frontend
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'observacoes_iniciais'
  ) then
    alter table public.levantamentos add column observacoes_iniciais text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'caracteristicas_fisicas'
  ) then
    alter table public.levantamentos add column caracteristicas_fisicas jsonb not null default '{}'::jsonb;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'iluminacao_ventilacao_conforto'
  ) then
    alter table public.levantamentos add column iluminacao_ventilacao_conforto jsonb not null default '{}'::jsonb;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'seguranca_equipamentos'
  ) then
    alter table public.levantamentos add column seguranca_equipamentos jsonb not null default '{}'::jsonb;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'epis_epcs_evidencias'
  ) then
    alter table public.levantamentos add column epis_epcs_evidencias jsonb not null default '{}'::jsonb;
  end if;
  -- pontos_medicao: modelo novo (substitui medicoes como fonte primária)
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'pontos_medicao'
  ) then
    alter table public.levantamentos add column pontos_medicao jsonb not null default '[]'::jsonb;
  end if;
  -- avaliacao_ergonomica_preliminar: espelho de avaliacao_ergonomica para clareza
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'avaliacao_ergonomica_preliminar'
  ) then
    alter table public.levantamentos add column avaliacao_ergonomica_preliminar jsonb not null default '{}'::jsonb;
  end if;
  -- plano_acao: espelho de controles para clareza
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'plano_acao'
  ) then
    alter table public.levantamentos add column plano_acao jsonb not null default '[]'::jsonb;
  end if;
  -- Sincronização
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'local_id'
  ) then
    alter table public.levantamentos add column local_id text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'sync_status'
  ) then
    alter table public.levantamentos add column sync_status text not null default 'synced';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'last_synced_at'
  ) then
    alter table public.levantamentos add column last_synced_at timestamptz;
  end if;
  -- Soft delete
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levantamentos'
    and column_name = 'deleted_at'
  ) then
    alter table public.levantamentos add column deleted_at timestamptz;
  end if;
end $$;

create index if not exists idx_levantamentos_local_id on public.levantamentos(local_id);
create index if not exists idx_levantamentos_sync_status on public.levantamentos(sync_status);
create index if not exists idx_levantamentos_deleted_at on public.levantamentos(deleted_at);

-- Índice único parcial: apenas um levantamento ativo por setor/tipo
do $$ begin
  if not exists (
    select 1 from pg_indexes
    where indexname = 'levantamentos_setor_tipo_ativo_unique'
  ) then
    create unique index levantamentos_setor_tipo_ativo_unique
    on public.levantamentos (setor_id, tipo)
    where deleted_at is null and status in ('rascunho', 'em_andamento');
  end if;
end $$;

-- ============================================================
-- 6. BIBLIOTECA TÉCNICA — CAMPOS FALTANTES
-- ============================================================
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'biblioteca_tecnica'
    and column_name = 'fonte_geradora'
  ) then
    alter table public.biblioteca_tecnica add column fonte_geradora text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'biblioteca_tecnica'
    and column_name = 'danos_possiveis'
  ) then
    alter table public.biblioteca_tecnica add column danos_possiveis jsonb not null default '[]'::jsonb;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'biblioteca_tecnica'
    and column_name = 'meios_propagacao'
  ) then
    alter table public.biblioteca_tecnica add column meios_propagacao jsonb not null default '[]'::jsonb;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'biblioteca_tecnica'
    and column_name = 'descricao_exposicao'
  ) then
    alter table public.biblioteca_tecnica add column descricao_exposicao text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'biblioteca_tecnica'
    and column_name = 'sugestao_exposicao'
  ) then
    alter table public.biblioteca_tecnica add column sugestao_exposicao text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'biblioteca_tecnica'
    and column_name = 'acoes_recomendadas'
  ) then
    alter table public.biblioteca_tecnica add column acoes_recomendadas jsonb not null default '[]'::jsonb;
  end if;
  -- Sincronização
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'biblioteca_tecnica'
    and column_name = 'local_id'
  ) then
    alter table public.biblioteca_tecnica add column local_id text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'biblioteca_tecnica'
    and column_name = 'sync_status'
  ) then
    alter table public.biblioteca_tecnica add column sync_status text not null default 'synced';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'biblioteca_tecnica'
    and column_name = 'last_synced_at'
  ) then
    alter table public.biblioteca_tecnica add column last_synced_at timestamptz;
  end if;
  -- Soft delete
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'biblioteca_tecnica'
    and column_name = 'deleted_at'
  ) then
    alter table public.biblioteca_tecnica add column deleted_at timestamptz;
  end if;
end $$;

create index if not exists idx_biblioteca_tecnica_deleted_at on public.biblioteca_tecnica(deleted_at);

-- ============================================================
-- 7. RELATÓRIOS — TIPO CONSTRAINT + CAMPOS
-- ============================================================
do $$ begin
  if exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'chk_relatorios_tipo'
    and table_name = 'relatorios'
  ) then
    alter table public.relatorios drop constraint chk_relatorios_tipo;
  end if;
end $$;

alter table public.relatorios
add constraint chk_relatorios_tipo
check (tipo in ('xlsx', 'csv', 'pdf_conferencia'));

do $$ begin
  if exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'chk_relatorios_status'
    and table_name = 'relatorios'
  ) then
    alter table public.relatorios drop constraint chk_relatorios_status;
  end if;
end $$;

alter table public.relatorios
add constraint chk_relatorios_status
check (status in ('gerado', 'pendente', 'erro'));

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'relatorios'
    and column_name = 'empresa_id'
  ) then
    alter table public.relatorios add column empresa_id uuid references public.empresas(id) on delete cascade;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'relatorios'
    and column_name = 'titulo'
  ) then
    alter table public.relatorios add column titulo text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'relatorios'
    and column_name = 'metadata'
  ) then
    alter table public.relatorios add column metadata jsonb not null default '{}'::jsonb;
  end if;
  -- Sincronização
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'relatorios'
    and column_name = 'local_id'
  ) then
    alter table public.relatorios add column local_id text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'relatorios'
    and column_name = 'sync_status'
  ) then
    alter table public.relatorios add column sync_status text not null default 'synced';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'relatorios'
    and column_name = 'last_synced_at'
  ) then
    alter table public.relatorios add column last_synced_at timestamptz;
  end if;
  -- Soft delete
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'relatorios'
    and column_name = 'deleted_at'
  ) then
    alter table public.relatorios add column deleted_at timestamptz;
  end if;
end $$;

create index if not exists idx_relatorios_empresa_id on public.relatorios(empresa_id);
create index if not exists idx_relatorios_deleted_at on public.relatorios(deleted_at);

-- ============================================================
-- 8. EVIDÊNCIAS — NOVA TABELA
-- ============================================================
create table if not exists public.evidencias (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  empresa_id      uuid        references public.empresas(id) on delete cascade,
  setor_id        uuid        references public.setores(id) on delete cascade,
  levantamento_id uuid        references public.levantamentos(id) on delete cascade,

  legenda         text,
  observacao      text,
  storage_path    text,
  mime_type       text,
  size_bytes      bigint,
  captured_at     timestamptz,

  local_id        text,
  sync_status     text        not null default 'pending',
  last_synced_at  timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

alter table public.evidencias enable row level security;

create index if not exists idx_evidencias_user_id on public.evidencias(user_id);
create index if not exists idx_evidencias_empresa_id on public.evidencias(empresa_id);
create index if not exists idx_evidencias_setor_id on public.evidencias(setor_id);
create index if not exists idx_evidencias_levantamento_id on public.evidencias(levantamento_id);
create index if not exists idx_evidencias_storage_path on public.evidencias(storage_path);
create index if not exists idx_evidencias_sync_status on public.evidencias(sync_status);
create index if not exists idx_evidencias_deleted_at on public.evidencias(deleted_at);

-- RLS: políticas para evidencias
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'evidencias' and policyname = 'evidencias_select_policy') then
    create policy evidencias_select_policy
      on public.evidencias for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'evidencias' and policyname = 'evidencias_insert_policy') then
    create policy evidencias_insert_policy
      on public.evidencias for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'evidencias' and policyname = 'evidencias_update_policy') then
    create policy evidencias_update_policy
      on public.evidencias for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'evidencias' and policyname = 'evidencias_delete_policy') then
    create policy evidencias_delete_policy
      on public.evidencias for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

drop trigger if exists trg_evidencias_updated_at on public.evidencias;
create trigger trg_evidencias_updated_at
  before update on public.evidencias
  for each row execute function public.set_updated_at();

-- ============================================================
-- 9. SYNC_LOG — NOVA TABELA
-- ============================================================
create table if not exists public.sync_log (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,

  entidade        text        not null,
  entidade_id     uuid,
  local_id        text,
  operacao        text        not null,
  status          text        not null default 'pending',
  erro            text,
  payload         jsonb,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint sync_log_operacao_check check (operacao in ('create', 'update', 'delete', 'upload')),
  constraint sync_log_status_check check (status in ('pending', 'synced', 'error', 'ignored'))
);

alter table public.sync_log enable row level security;

create index if not exists idx_sync_log_user_id on public.sync_log(user_id);
create index if not exists idx_sync_log_entidade on public.sync_log(entidade);
create index if not exists idx_sync_log_local_id on public.sync_log(local_id);
create index if not exists idx_sync_log_status on public.sync_log(status);
create index if not exists idx_sync_log_created_at on public.sync_log(created_at);

-- RLS: políticas para sync_log
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'sync_log' and policyname = 'sync_log_select_policy') then
    create policy sync_log_select_policy
      on public.sync_log for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'sync_log' and policyname = 'sync_log_insert_policy') then
    create policy sync_log_insert_policy
      on public.sync_log for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'sync_log' and policyname = 'sync_log_update_policy') then
    create policy sync_log_update_policy
      on public.sync_log for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'sync_log' and policyname = 'sync_log_delete_policy') then
    create policy sync_log_delete_policy
      on public.sync_log for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

drop trigger if exists trg_sync_log_updated_at on public.sync_log;
create trigger trg_sync_log_updated_at
  before update on public.sync_log
  for each row execute function public.set_updated_at();

-- ============================================================
-- 10. STORAGE BUCKET — EVIDÊNCIAS
-- ============================================================
insert into storage.buckets (id, name, public)
values ('evidencias', 'evidencias', false)
on conflict (id) do nothing;

-- Políticas de storage para o bucket evidencias
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'evidencias_storage_select_policy' and tablename = 'objects' and schemaname = 'storage') then
    create policy evidencias_storage_select_policy
      on storage.objects for select
      to authenticated
      using (
        bucket_id = 'evidencias'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'evidencias_storage_insert_policy' and tablename = 'objects' and schemaname = 'storage') then
    create policy evidencias_storage_insert_policy
      on storage.objects for insert
      to authenticated
      with check (
        bucket_id = 'evidencias'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'evidencias_storage_update_policy' and tablename = 'objects' and schemaname = 'storage') then
    create policy evidencias_storage_update_policy
      on storage.objects for update
      to authenticated
      using (
        bucket_id = 'evidencias'
        and (storage.foldername(name))[1] = auth.uid()::text
      )
      with check (
        bucket_id = 'evidencias'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'evidencias_storage_delete_policy' and tablename = 'objects' and schemaname = 'storage') then
    create policy evidencias_storage_delete_policy
      on storage.objects for delete
      to authenticated
      using (
        bucket_id = 'evidencias'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

-- ============================================================
-- 11. DOCUMENTAÇÃO DO MODELO pontos_medicao (comentário)
-- ============================================================
comment on column public.levantamentos.pontos_medicao is '
Modelo de medições quantitativas por ponto avaliado.
Cada elemento do array segue o formato:
{
  "id": "uuid-ou-local-id",
  "ponto_local": "Setor administrativo - mesa 01",
  "ruido_dba": 62.5,
  "iluminacao_lux": 450,
  "temperatura_c": 28.4,
  "velocidade_ar_ms": 0.2,
  "umidade_percent": 58,
  "radiacao_usvh": 0.13,
  "observacoes": "Medição realizada em condição normal de trabalho"
}
NÃO usar como fonte primária: limite_tolerancia, fonte, numero_serie, responsavel.
';

-- ============================================================
-- 12. VALIDAÇÃO FINAL
-- ============================================================
-- Esta migration deve ser executada APÓS a 0001_initial_schema.sql.
-- Todas as operações são idempotentes (IF NOT EXISTS / do $$).
-- Não quebra dados existentes.
