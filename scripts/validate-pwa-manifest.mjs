import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const publicDir = resolve(root, 'public')

const errors = []
const warnings = []
let manifestName = ''
let manifestShortName = ''
let manifestStartUrl = ''
let manifestDisplay = ''
let iconCount = 0
let screenshotCount = 0
let hasIarcRatingId = false

function e(msg) { errors.push(msg) }
function w(msg) { warnings.push(msg) }

const configPath = resolve(root, 'vite.config.ts')
const content = readFileSync(configPath, 'utf-8')

const manifestStart = content.indexOf('manifest: {')
if (manifestStart === -1) { e('manifest: { não encontrado em vite.config.ts'); printExit() }

// Extract manifest object balancing braces
let depth = 0
let manifestEnd = manifestStart
for (let i = manifestStart; i < content.length; i++) {
  if (content[i] === '{') depth++
  else if (content[i] === '}') { depth--; if (depth === 0) { manifestEnd = i + 1; break } }
}
const manifestBlock = content.slice(manifestStart, manifestEnd)

// iarc_rating_id
const iarcMatch = manifestBlock.match(/iarc_rating_id:\s*['"]([^'"]*)['"]/)
if (iarcMatch) {
  hasIarcRatingId = true
  const val = iarcMatch[1]
  if (!val || val === 'e.g.' || val.includes('e.g.')) {
    e(`iarc_rating_id contém placeholder: "${val}". Remova ou use ID real.`)
  } else {
    w(`iarc_rating_id presente: "${val}" — verificar se é ID real.`)
  }
}

// Essential fields
const strRe = (key) => { const m = manifestBlock.match(new RegExp(`${key}:\\s*['"]([^'"]*)['"]`)); return m ? m[1] : '' }
manifestName = strRe('name'); manifestShortName = strRe('short_name'); manifestStartUrl = strRe('start_url'); manifestDisplay = strRe('display')
if (!manifestName) e('name é obrigatório')
if (!manifestShortName) e('short_name é obrigatório')
if (!manifestStartUrl) e('start_url é obrigatório')
if (!manifestDisplay) e('display é obrigatório')

// Extract array content by key (finds LAST occurrence to avoid nested matches)
function extractArray(key) {
  const re = new RegExp(`${key}:\\s*\\[`, 'g')
  let m, lastMatch
  while ((m = re.exec(manifestBlock)) !== null) lastMatch = m
  if (!lastMatch) return ''
  let d = 1
  let pos = lastMatch.index + lastMatch[0].length
  for (let i = pos; i < manifestBlock.length; i++) {
    if (manifestBlock[i] === '[') d++
    else if (manifestBlock[i] === ']') { d--; if (d === 0) return manifestBlock.slice(pos, i) }
  }
  return ''
}

// Icons
const iconsStr = extractArray('icons')
const iconObjs = []
const objRe = /\{([\s\S]*?)\}/g
let om
while ((om = objRe.exec(iconsStr)) !== null) {
  const entry = {}
  const propRe = /(\w+):\s*['"]([^'"]*)['"]/g
  let pm
  while ((pm = propRe.exec(om[1])) !== null) entry[pm[1]] = pm[2]
  if (entry.src) iconObjs.push(entry)
}
iconCount = iconObjs.length
if (iconCount === 0) {
  e('Nenhum ícone declarado')
} else {
  const sizes = new Set()
  for (const icon of iconObjs) {
    const fp = resolve(publicDir, icon.src.replace(/^\//, ''))
    if (!existsSync(fp)) e(`Ícone não encontrado: ${icon.src}`)
    if (icon.sizes) sizes.add(icon.sizes)
  }
  if (![...sizes].some(s => s === '192x192')) w('Nenhum ícone 192×192 (obrigatório)')
  if (![...sizes].some(s => s === '512x512')) w('Nenhum ícone 512×512 (recomendado)')
}

// Screenshots
const ssStr = extractArray('screenshots')
const ssObjs = []
while ((om = objRe.exec(ssStr)) !== null) {
  const entry = {}
  const propRe = /(\w+):\s*['"]([^'"]*)['"]/g
  let pm
  while ((pm = propRe.exec(om[1])) !== null) entry[pm[1]] = pm[2]
  if (entry.src) ssObjs.push(entry)
}
screenshotCount = ssObjs.length
for (const ss of ssObjs) {
  const fp = resolve(publicDir, ss.src.replace(/^\//, ''))
  if (!existsSync(fp)) e(`Screenshot não encontrada: ${ss.src}`)
}

printExit()

function printExit() {
  console.log('\n=== VALIDAÇÃO PWA MANIFEST ===\n')
  console.log(`  name:           ${manifestName || 'AUSENTE'}`)
  console.log(`  short_name:     ${manifestShortName || 'AUSENTE'}`)
  console.log(`  start_url:      ${manifestStartUrl || 'AUSENTE'}`)
  console.log(`  display:        ${manifestDisplay || 'AUSENTE'}`)
  console.log(`  ícones:         ${iconCount} declarados`)
  console.log(`  screenshots:    ${screenshotCount} declaradas`)
  console.log(`  iarc_rating_id: ${hasIarcRatingId ? 'presente' : 'ausente (ok)'}`)
  console.log('')
  if (errors.length) { console.log('ERROS:'); errors.forEach(x => console.log(`  ❌ ${x}`)) }
  if (warnings.length) { console.log('AVISOS:'); warnings.forEach(x => console.log(`  ⚠️  ${x}`)) }
  if (!errors.length && !warnings.length) console.log('  ✅ Manifest PWA válido!')
  console.log('')
  process.exit(errors.length ? 1 : 0)
}
