-- 001_initial_schema.sql
-- Risco360 — Schema inicial consolidado.
-- Extensões, funções, tabelas, RLS, policies, índices e triggers.

-- ============================================================
-- 1. EXTENSÕES
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- 2. FUNÇÕES COMUNS
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'nome',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ============================================================
-- 3. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  nome        text        not null default '',
  email       text,
  telefone    text,
  cargo       text,
  empresa     text,
  avatar_url  text,
  role        text        not null default 'user',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can view own profile') then
    create policy "Users can view own profile"
      on public.profiles for select
      to authenticated
      using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can update own profile') then
    create policy "Users can update own profile"
      on public.profiles for update
      to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create index if not exists idx_profiles_email on public.profiles(email);

-- ============================================================
-- 4. EMPRESAS
-- ============================================================
create table if not exists public.empresas (
  id              uuid        primary key default gen_random_uuid(),
  razao_social    text        not null,
  nome_fantasia   text,
  cnpj            text,
  cnae            text,
  grau_risco      text,
  endereco        text,
  numero          text,
  bairro          text,
  cidade          text,
  uf              text,
  cep             text,
  responsavel     text,
  telefone        text,
  email           text,
  observacoes     text,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.empresas enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'empresas' and policyname = 'Users can view own empresas') then
    create policy "Users can view own empresas"
      on public.empresas for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'empresas' and policyname = 'Users can insert own empresas') then
    create policy "Users can insert own empresas"
      on public.empresas for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'empresas' and policyname = 'Users can update own empresas') then
    create policy "Users can update own empresas"
      on public.empresas for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'empresas' and policyname = 'Users can delete own empresas') then
    create policy "Users can delete own empresas"
      on public.empresas for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

drop trigger if exists trg_empresas_updated_at on public.empresas;
create trigger trg_empresas_updated_at
  before update on public.empresas
  for each row execute function public.set_updated_at();

create index if not exists idx_empresas_user_id     on public.empresas(user_id);
create index if not exists idx_empresas_cnpj         on public.empresas(cnpj);
create index if not exists idx_empresas_razao_social on public.empresas(razao_social);

-- ============================================================
-- 5. SETORES
-- ============================================================
create table if not exists public.setores (
  id          uuid        primary key default gen_random_uuid(),
  empresa_id  uuid        not null references public.empresas(id) on delete cascade,
  nome        text        not null,
  descricao   text,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.setores enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'setores' and policyname = 'Users can view own setores') then
    create policy "Users can view own setores"
      on public.setores for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'setores' and policyname = 'Users can insert own setores') then
    create policy "Users can insert own setores"
      on public.setores for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'setores' and policyname = 'Users can update own setores') then
    create policy "Users can update own setores"
      on public.setores for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'setores' and policyname = 'Users can delete own setores') then
    create policy "Users can delete own setores"
      on public.setores for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

drop trigger if exists trg_setores_updated_at on public.setores;
create trigger trg_setores_updated_at
  before update on public.setores
  for each row execute function public.set_updated_at();

create index if not exists idx_setores_user_id    on public.setores(user_id);
create index if not exists idx_setores_empresa_id on public.setores(empresa_id);

-- ============================================================
-- 6. CARGOS (funções organizacionais)
-- ============================================================
create table if not exists public.cargos (
  id                   uuid        primary key default gen_random_uuid(),
  empresa_id           uuid        not null references public.empresas(id) on delete cascade,
  setor_id             uuid        references public.setores(id) on delete set null,
  nome                 text        not null,
  cbo                  text,
  descricao_atividade  text,
  user_id              uuid        not null references auth.users(id) on delete cascade,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.cargos enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'cargos' and policyname = 'Users can view own cargos') then
    create policy "Users can view own cargos"
      on public.cargos for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'cargos' and policyname = 'Users can insert own cargos') then
    create policy "Users can insert own cargos"
      on public.cargos for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'cargos' and policyname = 'Users can update own cargos') then
    create policy "Users can update own cargos"
      on public.cargos for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'cargos' and policyname = 'Users can delete own cargos') then
    create policy "Users can delete own cargos"
      on public.cargos for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

drop trigger if exists trg_cargos_updated_at on public.cargos;
create trigger trg_cargos_updated_at
  before update on public.cargos
  for each row execute function public.set_updated_at();

create index if not exists idx_cargos_user_id    on public.cargos(user_id);
create index if not exists idx_cargos_empresa_id on public.cargos(empresa_id);
create index if not exists idx_cargos_setor_id   on public.cargos(setor_id);

-- ============================================================
-- 7. LEVANTAMENTOS (Formulário Setorial Integrado LPR + AEP)
-- ============================================================
-- Armazena o formulário técnico completo de cada setor.
-- Campos JSONB armazenam dados flexíveis de cada etapa:
--   caracteristicas       -> características do local
--   medicoes              -> medições ambientais
--   colaboradores         -> colaboradores expostos
--   riscos                -> perigos/riscos identificados
--   avaliacao_ergonomica  -> avaliação ergonômica preliminar
--   controles             -> controles e plano de ação
--   parecer               -> parecer técnico
--   assinatura_tecnico    -> assinatura do responsável técnico
--   assinatura_empresa    -> assinatura do representante da empresa

create table if not exists public.levantamentos (
  id                      uuid        primary key default gen_random_uuid(),
  codigo                  text,
  tipo                    text        not null default 'LPR_AEP',
  status                  text        not null default 'rascunho',
  percentual              integer     not null default 0,
  empresa_id              uuid        references public.empresas(id) on delete set null,
  empresa_nome            text,
  cnpj                    text,
  unidade                 text,
  setor                   text,
  setor_id                uuid        references public.setores(id) on delete set null,
  setor_nome              text,
  responsavel_empresa     text,
  auditor_tecnico         text,
  registro_mte            text,
  data_levantamento       date,
  data_lancamento_sgg     date,
  responsavel_lancamento  text,
  caracteristicas         jsonb       not null default '{}'::jsonb,
  medicoes                jsonb       not null default '[]'::jsonb,
  colaboradores           jsonb       not null default '[]'::jsonb,
  riscos                  jsonb       not null default '[]'::jsonb,
  avaliacao_ergonomica    jsonb       not null default '{}'::jsonb,
  controles               jsonb       not null default '[]'::jsonb,
  parecer                 jsonb       not null default '{}'::jsonb,
  assinatura_tecnico      jsonb       not null default '{}'::jsonb,
  assinatura_empresa      jsonb       not null default '{}'::jsonb,
  observacoes             text,
  user_id                 uuid        not null references auth.users(id) on delete cascade,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  constraint chk_levantamentos_tipo
    check (tipo in ('LPR', 'LPP', 'AEP', 'LPR_AEP')),
  constraint chk_levantamentos_status
    check (status in ('rascunho', 'em_campo', 'em_andamento', 'em_revisao', 'concluido', 'exportado')),
  constraint chk_levantamentos_percentual
    check (percentual >= 0 and percentual <= 100)
);

alter table public.levantamentos enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'levantamentos' and policyname = 'Users can view own levantamentos') then
    create policy "Users can view own levantamentos"
      on public.levantamentos for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'levantamentos' and policyname = 'Users can insert own levantamentos') then
    create policy "Users can insert own levantamentos"
      on public.levantamentos for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'levantamentos' and policyname = 'Users can update own levantamentos') then
    create policy "Users can update own levantamentos"
      on public.levantamentos for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'levantamentos' and policyname = 'Users can delete own levantamentos') then
    create policy "Users can delete own levantamentos"
      on public.levantamentos for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

drop trigger if exists trg_levantamentos_updated_at on public.levantamentos;
create trigger trg_levantamentos_updated_at
  before update on public.levantamentos
  for each row execute function public.set_updated_at();

create index if not exists idx_levantamentos_user_id    on public.levantamentos(user_id);
create index if not exists idx_levantamentos_empresa_id on public.levantamentos(empresa_id);
create index if not exists idx_levantamentos_setor_id   on public.levantamentos(setor_id);
create index if not exists idx_levantamentos_tipo       on public.levantamentos(tipo);
create index if not exists idx_levantamentos_status     on public.levantamentos(status);
create index if not exists idx_levantamentos_codigo     on public.levantamentos(codigo);

-- ============================================================
-- 8. BIBLIOTECA TÉCNICA
-- ============================================================
create table if not exists public.biblioteca_tecnica (
  id                uuid        primary key default gen_random_uuid(),
  categoria         text,
  titulo            text        not null,
  descricao         text,
  tipo_risco        text,
  perigo            text,
  risco             text,
  fonte             text,
  medidas_controle  jsonb       not null default '[]'::jsonb,
  epis              jsonb       not null default '[]'::jsonb,
  epcs              jsonb       not null default '[]'::jsonb,
  treinamentos      jsonb       not null default '[]'::jsonb,
  ativo             boolean     not null default true,
  publico           boolean     not null default false,
  user_id           uuid        references auth.users(id) on delete cascade,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.biblioteca_tecnica enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'biblioteca_tecnica' and policyname = 'Users can view public or own items') then
    create policy "Users can view public or own items"
      on public.biblioteca_tecnica for select
      to authenticated
      using (publico = true or user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'biblioteca_tecnica' and policyname = 'Users can insert own items') then
    create policy "Users can insert own items"
      on public.biblioteca_tecnica for insert
      to authenticated
      with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'biblioteca_tecnica' and policyname = 'Users can update own items') then
    create policy "Users can update own items"
      on public.biblioteca_tecnica for update
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'biblioteca_tecnica' and policyname = 'Users can delete own items') then
    create policy "Users can delete own items"
      on public.biblioteca_tecnica for delete
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

drop trigger if exists trg_biblioteca_tecnica_updated_at on public.biblioteca_tecnica;
create trigger trg_biblioteca_tecnica_updated_at
  before update on public.biblioteca_tecnica
  for each row execute function public.set_updated_at();

create index if not exists idx_biblioteca_user_id     on public.biblioteca_tecnica(user_id);
create index if not exists idx_biblioteca_categoria   on public.biblioteca_tecnica(categoria);
create index if not exists idx_biblioteca_tipo_risco  on public.biblioteca_tecnica(tipo_risco);

-- ============================================================
-- 9. RELATÓRIOS
-- ============================================================
create table if not exists public.relatorios (
  id               uuid        primary key default gen_random_uuid(),
  levantamento_id  uuid        references public.levantamentos(id) on delete cascade,
  empresa_nome     text,
  tipo             text        not null,
  modelo           text,
  status           text        not null default 'gerado',
  arquivo_url      text,
  metadados        jsonb       not null default '{}'::jsonb,
  user_id          uuid        not null references auth.users(id) on delete cascade,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint chk_relatorios_tipo
    check (tipo in ('completo', 'executivo', 'inventario_riscos', 'plano_acao', 'relatorio_setorial_lpr_aep', 'relatorio_consolidado_empresa')),
  constraint chk_relatorios_status
    check (status in ('gerado', 'baixado', 'arquivado', 'erro'))
);

alter table public.relatorios enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'relatorios' and policyname = 'Users can view own relatorios') then
    create policy "Users can view own relatorios"
      on public.relatorios for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'relatorios' and policyname = 'Users can insert own relatorios') then
    create policy "Users can insert own relatorios"
      on public.relatorios for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'relatorios' and policyname = 'Users can update own relatorios') then
    create policy "Users can update own relatorios"
      on public.relatorios for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'relatorios' and policyname = 'Users can delete own relatorios') then
    create policy "Users can delete own relatorios"
      on public.relatorios for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

drop trigger if exists trg_relatorios_updated_at on public.relatorios;
create trigger trg_relatorios_updated_at
  before update on public.relatorios
  for each row execute function public.set_updated_at();

create index if not exists idx_relatorios_user_id         on public.relatorios(user_id);
create index if not exists idx_relatorios_levantamento_id on public.relatorios(levantamento_id);
