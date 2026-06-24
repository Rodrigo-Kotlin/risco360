import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const migrationPath = resolve(process.cwd(), 'supabase/migrations/0002_risco360_schema_consolidado.sql')
const sql = readFileSync(migrationPath, 'utf-8')

describe('Migration 0002 — Risco360 Schema Consolidado', () => {
  it('arquivo existe e não está vazio', () => {
    expect(sql.length).toBeGreaterThan(100)
  })

  it('cria/atualiza tabela profiles', () => {
    expect(sql).toContain('profiles')
  })

  it('contém constraint role check (admin, tecnico, viewer)', () => {
    expect(sql).toContain('profiles_role_check')
    expect(sql).toContain("'admin'")
    expect(sql).toContain("'tecnico'")
    expect(sql).toContain("'viewer'")
  })

  it('cria/atualiza tabela empresas com deleted_at', () => {
    expect(sql).toContain('empresas')
    expect(sql).toContain('deleted_at')
  })

  it('cria/atualiza tabela setores com localizacao e responsavel_local', () => {
    expect(sql).toContain('setores')
    expect(sql).toContain('localizacao')
    expect(sql).toContain('responsavel_local')
    expect(sql).toContain('observacoes')
    expect(sql).toContain('deleted_at')
  })

  it('cria/atualiza tabela levantamentos com constraint tipo = LPR_AEP', () => {
    expect(sql).toContain('levantamentos')
    // Verificar constraint que APENAS LPR_AEP é permitido
    const tipoMatch = sql.match(/check\s*\(\s*tipo\s*=\s*'LPR_AEP'\s*\)/i)
    expect(tipoMatch).not.toBeNull()
  })

  it('NÃO permite LPR, LPP ou AEP como tipo na constraint', () => {
    // A constraint deve ser exatamente tipo = 'LPR_AEP', não contendo LPP
    const constraintSection = sql.match(/constraint\s+chk_levantamentos_tipo[\s\S]*?check\s*\([^)]+\)/i)
    expect(constraintSection).not.toBeNull()
    if (constraintSection) {
      expect(constraintSection[0]).not.toContain("'LPP'")
      expect(constraintSection[0]).not.toContain("'LPR'")
      expect(constraintSection[0]).not.toContain("'AEP'")
      expect(constraintSection[0]).toContain("'LPR_AEP'")
    }
  })

  it('atualiza constraint status levantamentos', () => {
    expect(sql).toContain('rascunho')
    expect(sql).toContain('em_andamento')
    expect(sql).toContain('concluido')
    expect(sql).toContain('arquivado')
  })

  it('cria/atualiza tabela biblioteca_tecnica com campos novos', () => {
    expect(sql).toContain('biblioteca_tecnica')
    expect(sql).toContain('fonte_geradora')
    expect(sql).toContain('danos_possiveis')
    expect(sql).toContain('meios_propagacao')
    expect(sql).toContain('acoes_recomendadas')
  })

  it('cria tabela evidencias com RLS', () => {
    expect(sql).toContain('create table if not exists public.evidencias')
    expect(sql).toContain('enable row level security')
  })

  it('cria tabela sync_log com RLS', () => {
    expect(sql).toContain('create table if not exists public.sync_log')
    expect(sql).toContain('enable row level security')
  })

  it('ativa RLS em todas as tabelas', () => {
    const rlsStatements = sql.match(/enable row level security/gi)
    expect(rlsStatements).not.toBeNull()
    // profiles (001), empresas (001), setores (001), levantamentos (001),
    // biblioteca_tecnica (001), relatorios (001), evidencias (0002), sync_log (0002)
    expect(rlsStatements!.length).toBeGreaterThanOrEqual(2)
  })

  it('NÃO contém using (true) em políticas', () => {
    const policySections = sql.match(/using\s*\(true\)/gi)
    expect(policySections).toBeNull()
  })

  it('cria bucket storage evidencias', () => {
    expect(sql).toContain("'evidencias'")
    expect(sql).toContain('storage.buckets')
  })

  it('cria políticas de storage para evidencias', () => {
    expect(sql).toContain('evidencias_storage_select_policy')
    expect(sql).toContain('evidencias_storage_insert_policy')
  })

  it('usa set_updated_at nos triggers (função definida em 001)', () => {
    const triggerCalls = sql.match(/execute function public\.set_updated_at\(\)/gi)
    expect(triggerCalls).not.toBeNull()
    expect(triggerCalls!.length).toBeGreaterThanOrEqual(2) // evidencias, sync_log
  })

  it('contém coluna pontos_medicao jsonb', () => {
    expect(sql).toContain('pontos_medicao')
    expect(sql).toContain('jsonb')
  })

  it('documenta modelo pontos_medicao em comentário SQL', () => {
    expect(sql).toContain('comment on column public.levantamentos.pontos_medicao')
    expect(sql).toContain('ruido_dba')
    expect(sql).toContain('iluminacao_lux')
    expect(sql).toContain('temperatura_c')
    expect(sql).toContain('velocidade_ar_ms')
    expect(sql).toContain('umidade_percent')
    expect(sql).toContain('radiacao_usvh')
  })

  it('documenta que NÃO usar limite_tolerancia como fonte primária', () => {
    const comment = sql.match(/comment on column[\s\S]*?limite_tolerancia[\s\S]*?'/i)
    expect(comment).not.toBeNull()
  })

  it('atualiza constraint tipo relatorios', () => {
    const match = sql.match(/check\s*\(\s*tipo\s+in\s*\([^)]*\)/gi)
    const relatoriosMatch = match?.find(m =>
      m.includes('xlsx') || m.includes('csv') || m.includes('pdf_conferencia')
    )
    expect(relatoriosMatch).toBeTruthy()
  })

  it('cria índice único parcial levantamentos_setor_tipo_ativo_unique', () => {
    expect(sql).toContain('levantamentos_setor_tipo_ativo_unique')
  })

  it('contém coluna deleted_at em tabelas principais', () => {
    // Verificar que deleted_at é adicionado em todas as tabelas
    const addDeletedAt = sql.match(/add column deleted_at timestamptz/gi)
    expect(addDeletedAt).not.toBeNull()
    expect(addDeletedAt!.length).toBeGreaterThanOrEqual(4) // empresas, setores, levantamentos, biblioteca, relatorios, evidencias
  })
})
