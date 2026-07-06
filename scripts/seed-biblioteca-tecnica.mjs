/**
 * Script: seed-biblioteca-tecnica.mjs
 * Popula a tabela biblioteca_tecnica com dados técnicos de SST.
 * Uso: node scripts/seed-biblioteca-tecnica.mjs
 * 
 * Pré-requisitos:
 *   - .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
 *   - Service role key em SUPABASE_SERVICE_ROLE_KEY (opcional, para bypass RLS)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Carrega variáveis do .env.local
function loadEnv() {
  const envPaths = [
    resolve(__dirname, '..', '.env.local'),
    resolve(__dirname, '..', '.env'),
  ]
  
  for (const envPath of envPaths) {
    if (!existsSync(envPath)) continue
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      let value = trimmed.slice(eqIdx + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  }
}

loadEnv()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_ANON_KEY) devem estar definidos.')
  console.error('Crie um arquivo .env.local baseado no .env.example')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

// Importa os dados do seed
// NOTA: O script assume que o seed está compilado ou usa ts-node
// Alternativa: usar o arquivo JSON gerado ou importar diretamente
// Para este script, usaremos require dinâmico para o seed TypeScript
// Na prática, use: npx tsx scripts/seed-biblioteca-tecnica.mjs

async function loadSeedData() {
  // Tenta carregar o seed compilado (se existir)
  const compiledPath = resolve(__dirname, '..', 'dist', 'data', 'biblioteca-tecnica.seed.js')
  const sourcePath = resolve(__dirname, '..', 'src', 'data', 'biblioteca-tecnica.seed.ts')
  
  if (existsSync(compiledPath)) {
    const mod = await import(compiledPath)
    return mod.bibliotecaTecnicaSeed
  }
  
  // Se não compilado, tenta com tsx (se disponível)
  // Se falhar, instrui o usuário
  console.error('Seed compilado não encontrado em:', compiledPath)
  console.error('Execute "npm run build" primeiro ou use "npx tsx scripts/seed-biblioteca-tecnica.mjs"')
  process.exit(1)
}

function validateItem(item, index) {
  const required = ['categoria', 'titulo', 'tipo_risco', 'perigo', 'risco']
  const missing = required.filter(f => !item[f])
  if (missing.length > 0) {
    console.warn(`  ⚠ Item ${index + 1} (${item.titulo || 'sem título'}): campos obrigatórios ausentes: ${missing.join(', ')}`)
    return false
  }
  return true
}

function makeKey(item) {
  return `${item.categoria}|${item.tipo_risco}|${item.perigo}|${item.titulo}`
}

async function main() {
  console.log('=== Seed Biblioteca Técnica ===')
  console.log()
  
  const itens = await loadSeedData()
  console.log(`Itens lidos: ${itens.length}`)
  console.log()
  
  // Valida itens
  const validos = itens.filter((item, i) => validateItem(item, i))
  console.log(`Itens válidos: ${validos.length}`)
  console.log()
  
  if (validos.length === 0) {
    console.error('Nenhum item válido para inserir. Abortando.')
    process.exit(1)
  }
  
  // Busca itens existentes para evitar duplicidade
  const { data: existentes, error: listError } = await supabase
    .from('biblioteca_tecnica')
    .select('categoria, tipo_risco, perigo, titulo')
  
  if (listError) {
    console.error('Erro ao listar itens existentes:', listError.message)
    process.exit(1)
  }
  
  const existingKeys = new Set((existentes || []).map(makeKey))
  console.log(`Itens existentes no banco: ${existingKeys.size}`)
  console.log()
  
  let inserted = 0
  let ignored = 0
  let updated = 0
  let errors = 0
  
  for (const item of validos) {
    const key = makeKey(item)
    
    if (existingKeys.has(key)) {
      // Tenta atualizar (opcional)
      // Por segurança, apenas registra como ignorado
      ignored++
      continue
    }
    
    const { error: insertError } = await supabase
      .from('biblioteca_tecnica')
      .insert({
        categoria: item.categoria,
        titulo: item.titulo,
        descricao: item.descricao || null,
        tipo_risco: item.tipo_risco,
        perigo: item.perigo,
        risco: item.risco,
        fonte: item.fonte || null,
        fonte_geradora: item.fonte_geradora || null,
        danos_possiveis: (item.danos_possiveis || []),
        meios_propagacao: (item.meios_propagacao || []),
        descricao_exposicao: item.descricao_exposicao || null,
        sugestao_exposicao: item.sugestao_exposicao || null,
        medidas_controle: (item.medidas_controle || []),
        epis: (item.epis || []),
        epcs: (item.epcs || []),
        treinamentos: (item.treinamentos || []),
        acoes_recomendadas: (item.acoes_recomendadas || []),
        ativo: item.ativo ?? true,
        publico: item.publico ?? true,
      })
    
    if (insertError) {
      console.error(`  ✗ Erro ao inserir "${item.titulo}": ${insertError.message}`)
      errors++
    } else {
      inserted++
    }
  }
  
  console.log('=== Resumo ===')
  console.log(`  Itens lidos:      ${itens.length}`)
  console.log(`  Itens válidos:    ${validos.length}`)
  console.log(`  Inseridos:        ${inserted}`)
  console.log(`  Ignorados (dup):  ${ignored}`)
  console.log(`  Atualizados:      ${updated}`)
  console.log(`  Erros:            ${errors}`)
  console.log()
  
  if (errors > 0) {
    console.warn('⚠ Alguns itens não foram inseridos. Verifique os erros acima.')
    process.exit(1)
  }
  
  console.log('✓ Seed concluído com sucesso!')
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
