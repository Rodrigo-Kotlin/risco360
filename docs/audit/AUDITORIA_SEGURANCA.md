# AUDITORIA DE SEGURANÇA — RISCO360

## OWASP TOP 10 CHECKLIST

| Item | Risco | Status | Evidência |
|---|---|---|---|
| A01 - Broken Access Control | **Alto** | ⚠️ Parcial | RLS correta, mas PrivateRoute/PublicRoute vazios |
| A02 - Cryptographic Failures | **Alto** | ⚠️ Parcial | Senha mock hardcoded no source |
| A03 - Injection | **Crítico** | ❌ Falha | SQL injection via .or() string interpolation |
| A04 - Insecure Design | **Médio** | ⚠️ Parcial | Mock auto-authenticate sem credentials |
| A05 - Security Misconfiguration | **Alto** | ❌ Falha | Sem CSP, sem HSTS headers |
| A06 - Vulnerable Components | **Baixo** | ✅ OK | Dependências atualizadas (React 19, etc) |
| A07 - Auth Failures | **Alto** | ⚠️ Parcial | Mock auth bypass via localStorage |
| A08 - Data Integrity Failures | **Médio** | ⚠️ Parcial | Sem assinatura digital real |
| A09 - Logging Failures | **Médio** | ⚠️ Parcial | console.log em produção |
| A10 - SSRF | **Baixo** | ✅ OK | Sem fetch a URLs arbitrárias |

---

## RESUMO DE ACHADOS

| Severidade | Quantidade |
|---|---|
| Crítico | 4 |
| Alto | 5 |
| Médio | 8 |
| Baixo | 6 |

---

## ACHADOS CRÍTICOS

### C1. SQL Injection via `.or()` Interpolation

**Arquivos:**
- `src/services/real-empresas.service.ts:244-246`
- `src/services/real-biblioteca-tecnica.service.ts:112-113`

```typescript
.or(`razao_social.ilike.%${termo}%,nome_fantasia.ilike.%${termo}%,cnpj.ilike.%${termo}%`)
```

**Problema:** Input do usuário interpolado em string de filtro. PostgREST tem proteção limitada contra isso.

**Solução:** Sanitizar `termo` com regex `/[^a-zA-Z0-9 áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\-\.\/@_]/g` ou usar parâmetros nomeados do Supabase.

### C2. Mock Credentials Hardcoded

**Arquivo:** `src/lib/mock-mode.ts:4-5`

```typescript
export const MOCK_USER_EMAIL = 'demo@risco360.local'
export const MOCK_USER_PASSWORD = 'Risco360@123'
```

**Problema:** Senha em texto claro no código fonte, acessível a qualquer pessoa com acesso ao repositório.

**Solução:** Mover para variável de ambiente `VITE_MOCK_PASSWORD` ou exigir credenciais manuais.

### C3. PrivateRoute/PublicRoute Vazios

**Arquivos:**
- `src/components/auth/PrivateRoute.tsx:3-4`
- `src/components/auth/PublicRoute.tsx:3-4`

```typescript
export function PrivateRoute() { return <Outlet /> }
```

**Problema:** Não verificam autenticação. Embora `routes/index.tsx` tenha sua própria proteção, esses componentes são dead code que podem ser mal utilizados.

### C4. CSP Headers Ausentes

**Arquivo:** `public/_headers`

**Headers existentes:** X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

**Headers faltantes:** Content-Security-Policy, Strict-Transport-Security

**Solução:**
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## MATRIZ DE RISCO

| Vulnerabilidade | Impacto | Probabilidade | Prioridade |
|---|---|---|---|
| SQL injection via .or() | Alto | Média | **Crítica** |
| Mock password hardcoded | Alto | Alta | **Crítica** |
| PrivateRoute sem auth | Alto | Baixa | **Crítica** |
| Sem CSP headers | Alto | Média | **Crítica** |
| Mock auto-authenticate | Alto | Alta | **Alta** |
| blob: URL sem revoke | Baixo | Alta | **Média** |
| Mock session em localStorage | Médio | Média | **Média** |
| console.log em produção | Baixo | Alta | **Média** |
| File type validation client-side | Baixo | Média | **Baixa** |
| Sem rate limiting client-side | Baixo | Baixa | **Baixa** |

---

## RLS AUDIT

### Todas as Tabelas com RLS Ativado

| Tabela | Policies | Scopo | Status |
|---|---|---|---|
| `profiles` | 2 (select, update) | `auth.uid() = id` | ✅ |
| `empresas` | 4 (crud) | `auth.uid() = user_id` | ✅ |
| `setores` | 4 (crud) | `auth.uid() = user_id` | ✅ |
| `cargos` | 4 (crud) | `auth.uid() = user_id` | ✅ |
| `levantamentos` | 4 (crud) | `auth.uid() = user_id` | ✅ |
| `biblioteca_tecnica` | 4 (crud) | `publico = true OR auth.uid() = user_id` | ✅ |
| `relatorios` | 4 (crud) | `auth.uid() = user_id` | ✅ |
| `evidencias` | 4 (crud) | `auth.uid() = user_id` | ✅ |
| `sync_log` | 4 (crud) | `auth.uid() = user_id` | ✅ |
| `storage.objects` (evidencias) | 4 (crud) | `foldername(name)[1] = auth.uid()` | ✅ |

**Nenhuma policy usa `USING (true)`** ✅

---

## STORAGE POLICIES

Bucket `evidencias` (privado):
- SELECT: `bucket_id = 'evidencias' AND (storage.foldername(name))[1] = auth.uid()::text`
- INSERT/UPDATE/DELETE: mesmo scopo

**Correto.** Cada usuário só acessa sua própria pasta.

---

## JWT & SESSION

| Aspecto | Status |
|---|---|
| `persistSession` | ✅ true |
| `autoRefreshToken` | ✅ true |
| `detectSessionInUrl` | ✅ true (magic links) |
| Chave anon validada | ✅ (rejeita service_role, sb_secret) |
| Session storage | ⚠️ Apenas in-memory no AuthContext |

---

## HEADERS HTTP

| Header | Presente | Valor |
|---|---|---|
| `X-Frame-Options` | ✅ | `DENY` |
| `X-Content-Type-Options` | ✅ | `nosniff` |
| `Referrer-Policy` | ✅ | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | ✅ | `camera=(), microphone=()...` |
| `Content-Security-Policy` | ❌ | **AUSENTE** |
| `Strict-Transport-Security` | ❌ | **AUSENTE** |

---

## RECOMENDAÇÕES PRIORIZADAS

### Imediato (horas)
1. Adicionar CSP + HSTS em `public/_headers`
2. Sanitizar input de `termo` nas funções `.or()`

### Curto Prazo (dias)
3. Corrigir `preserveExif: false` (evitar metadados em fotos)
4. Adicionar `URL.revokeObjectURL` nas rotas de erro
5. Remover `console.log` de `image-compression.ts` e `data-provider.ts`

### Médio Prazo (semanas)
6. Implementar PrivateRoute/PublicRoute reais
7. Adicionar validação server-side de tipo de arquivo (magic bytes)
8. Mover mock credentials para env vars
9. Adicionar rate limiting client-side em login
