import { execSync } from 'child_process'
import { existsSync, mkdirSync, rmSync, cpSync, readdirSync, statSync } from 'fs'
import { join, resolve } from 'path'

const ROOT = resolve(import.meta.dirname, '..')
const DIST_DIR = resolve(ROOT, 'dist')
const ZIP_NAME = 'risco360-audit-clean.zip'
const ZIP_PATH = resolve(ROOT, ZIP_NAME)

const EXCLUDE_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'dev-dist',
  'e2e-report', 'test-results', 'coverage',
  'playwright-report', '.cache', '.vscode', '.idea',
  'supabase/.temp',
])

const EXCLUDE_FILES = new Set([
  '.env', '.env.local', '.env.production', '.env.development',
  '.env.preview', '*.tsbuildinfo', '*.log', '.DS_Store',
  'Thumbs.db',
])

function shouldExclude(name, fullPath) {
  if (EXCLUDE_DIRS.has(name)) return true
  if (EXCLUDE_FILES.has(name)) return true
  if (name.startsWith('.env') && name !== '.env.example' && name !== '.env.local.example' && name !== '.env.production.example') return true
  if (name.endsWith('.log')) return true
  if (name === 'desktop.ini') return true
  return false
}

function collectFiles(dir, relativePath = '') {
  const entries = []
  const items = readdirSync(dir, { withFileTypes: true })
  for (const item of items) {
    const fullPath = join(dir, item.name)
    const relPath = relativePath ? `${relativePath}/${item.name}` : item.name
    if (item.isDirectory()) {
      if (EXCLUDE_DIRS.has(item.name)) continue
      if (item.name === '.git') continue
      entries.push(...collectFiles(fullPath, relPath))
    } else {
      if (shouldExclude(item.name, fullPath)) continue
      entries.push({ src: fullPath, dest: relPath })
    }
  }
  return entries
}

function validateNoForbidden(zipPath) {
  const output = execSync(
    `powershell -Command "& { Add-Type -AssemblyName System.IO.Compression.FileSystem; $zip = [System.IO.Compression.ZipFile]::OpenRead('${zipPath.replace(/'/g, "''")}'); $zip.Entries.FullName; $zip.Dispose() }"`,
    { encoding: 'utf8', cwd: ROOT }
  )
  const entries = output.split('\n').map(s => s.trim().toLowerCase()).filter(Boolean)
  const forbiddenExact = ['.env.local', '.git']
  const forbiddenPrefix = ['node_modules', 'dist/', 'dev-dist/', 'e2e-report/', 'test-results/', 'coverage/', 'playwright-report/']
  const foundExact = forbiddenExact.filter(f => entries.includes(f))
  const foundPrefix = forbiddenPrefix.filter(f => entries.some(e => e.startsWith(f)))
  const found = [...foundExact, ...foundPrefix]
  if (found.length > 0) {
    console.error(`ERRO: Pacote contém itens proibidos: ${found.join(', ')}`)
    process.exit(1)
  }
  console.log('Validação: Nenhum item proibido encontrado no pacote.')
}

function main() {
  const tempDir = resolve(ROOT, '.tmp-audit-pkg')
  const tempTarget = resolve(tempDir, 'risco360')

  if (existsSync(tempDir)) rmSync(tempDir, { recursive: true })
  mkdirSync(tempTarget, { recursive: true })

  const allowedDirs = ['src', 'public', 'supabase', 'docs', 'e2e', 'scripts']
  const allowedFiles = [
    'package.json', 'package-lock.json',
    'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
    'vite.config.ts', 'vitest.config.ts',
    'eslint.config.js',
    'playwright.config.ts',
    'README.md', 'SUMMARY.md', 'SUPABASE_SETUP.md',
    '.env.example', '.env.local.example', '.env.production.example',
    '.gitignore',
    'index.html',
  ]

  for (const dir of allowedDirs) {
    const srcPath = join(ROOT, dir)
    if (existsSync(srcPath)) {
      const entries = collectFiles(srcPath, dir)
      for (const { src, dest } of entries) {
        const targetPath = join(tempTarget, dest)
        mkdirSync(targetPath.substring(0, targetPath.lastIndexOf('\\')), { recursive: true })
        cpSync(src, targetPath)
      }
    }
  }

  for (const file of allowedFiles) {
    const srcPath = join(ROOT, file)
    if (existsSync(srcPath)) {
      cpSync(srcPath, join(tempTarget, file))
    }
  }

  if (existsSync(ZIP_PATH)) rmSync(ZIP_PATH)

  execSync(
    `powershell -Command "& { Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${tempTarget.replace(/'/g, "''")}', '${ZIP_PATH.replace(/'/g, "''")}', [System.IO.Compression.CompressionLevel]::Optimal, $false) }"`,
    { cwd: ROOT, stdio: 'inherit' }
  )

  rmSync(tempDir, { recursive: true })

  console.log(`\nPacote gerado: ${ZIP_PATH}`)
  validateNoForbidden(ZIP_PATH)
}

main()
