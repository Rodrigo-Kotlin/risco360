# 🗄️ Supabase — Configuração e Migrations

Este documento orienta a criação do projeto Supabase para o **Risco360**, execução das migrations SQL e configuração segura do ambiente.

---

## 1. Criar novo projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login.
2. Clique em **New project**.
3. Preencha:
   - **Name**: `risco360`
   - **Database Password**: anote em local seguro
   - **Region**: escolha a mais próxima (recomendado: `South America (São Paulo)`)
   - **Pricing Plan**: Free tier é suficiente para desenvolvimento
4. Aguarde a criação do projeto (~2 minutos).

---

## 2. Acessar o SQL Editor

1. No painel do Supabase, vá em **SQL Editor**.
2. Clique em **New Query**.
3. Execute cada migration na ordem listada abaixo.

---

## 3. Ordem de execução das migrations

Execute os arquivos na sequência:

| Ordem | Arquivo | Descrição |
|-------|---------|-----------|
| 1 | `001_enable_extensions.sql` | Habilita pgcrypto |
| 2 | `002_create_common_functions.sql` | Funções `set_updated_at` e `handle_new_user` |
| 3 | `003_create_profiles.sql` | Tabela profiles + trigger de criação automática |
| 4 | `004_create_empresas.sql` | Tabela empresas |
| 5 | `005_create_setores_cargos.sql` | Tabelas setores e cargos |
| 6 | `006_create_levantamentos.sql` | Tabela principal de levantamentos |
| 7 | `007_create_biblioteca_tecnica.sql` | Tabela biblioteca técnica |
| 8 | `008_create_relatorios.sql` | Tabela relatórios |
| 9 | `009_create_rls_policies_summary.sql` | Apenas referência (políticas já nas migrations anteriores) |

**Importante**: execute **um arquivo por vez** e verifique se não houve erro antes de prosseguir.

---

## 4. Copiar credenciais do projeto

1. No painel do Supabase, vá em **Project Settings → API**.
2. Anote os seguintes valores:

   ```
   Project URL: https://SEU-PROJETO.supabase.co
   anon public key: eyJhbGciOi... (string longa)
   service_role key: NÃO USE NO FRONTEND
   ```

3. **Nunca** use a `service_role` key no frontend ou em código do lado do cliente.

---

## 5. Configurar ambiente local

Crie o arquivo `.env` na raiz do projeto a partir do exemplo:

```bash
cp .env.example .env
```

Edite com as credenciais do seu projeto:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA_ANON_OU_PUBLISHABLE
VITE_ENABLE_DEMO_DATA=false
```

**⚠️ Atenção:** substitua `SEU-PROJETO` e `SUA_CHAVE_PUBLICA_ANON_OU_PUBLISHABLE` pelos valores reais.

**Nunca** versionar `.env` com credenciais reais. Use `.env.example` como template.

### Variáveis oficiais do Risco360

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | Sim | URL do projeto Supabase (https, terminando em `.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Sim | Chave pública `anon` ou `publishable` |
| `VITE_ENABLE_DEMO_DATA` | Não | `true` ativa modo demo (apenas dev local) |

Regras:
- Toda variável frontend deve começar com `VITE_`
- `VITE_SUPABASE_URL` deve ser uma URL HTTPS válida do Supabase
- `VITE_SUPABASE_ANON_KEY` deve ser a chave pública (nunca `service_role`)
- A chave `service_role` **nunca** deve ser usada no frontend
- Variáveis com prefixo `sb_secret_` são bloqueadas pelo frontend
- `VITE_ENABLE_DEMO_DATA` deve ser `false` em produção

---

## 6. Testar cadastro de usuário (signup)

Para testar se o trigger de criação automática de profile está funcionando:

1. No painel Supabase, vá em **Authentication → Users**.
2. Clique em **Add User** → **Create new user**.
3. Preencha e-mail e senha.
4. Após criar, vá em **Table Editor → profiles**.
5. Confirme que o novo usuário possui um registro com o mesmo `id`.

---

## 7. Como validar RLS

Para testar as políticas de segurança:

1. No SQL Editor, execute como **usuário autenticado** (selecione o usuário no topo do editor):

   ```sql
   select * from public.empresas;
   ```

2. Deve retornar **apenas** as empresas do usuário autenticado (ou vazio se não houver).

3. Tente inserir um registro com `user_id` de outro usuário:

   ```sql
   insert into public.empresas (razao_social, user_id)
   values ('Teste', 'OUTRO-UUID-AQUI');
   ```

   Deve falhar com erro de **violação de política RLS**.

---

## 8. Consultar políticas existentes

```sql
select * from pg_policies where schemaname = 'public' order by tablename, policyname;
```

---

## 9. Erros comuns e soluções

| Erro | Causa | Solução |
|------|-------|---------|
| `permission denied for schema public` | Usuário anônimo tentando acessar | Verifique se o usuário está autenticado |
| `new row violates row-level security policy` | INSERT com `user_id` diferente do autenticado | Use `auth.uid()` no lugar de UUID fixo |
| `relation "public.profiles" does not exist` | Migration não executada | Execute `003_create_profiles.sql` |
| `trigger "on_auth_user_created" already exists` | Trigger já criado anteriormente | Use `drop trigger if exists` (já incluso) |
| `function "handle_new_user" already exists` | Função já existe | Já tratado com `create or replace` |

---

## 10. Validação do frontend

Após configurar as credenciais:

1. Execute os comandos de validação:

```bash
npm run typecheck
npm run lint
npm run build
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

3. Acesse `http://localhost:5173` — a tela de login deve mostrar "Servidor configurado".

4. Remova as variáveis do `.env` e reinicie — a tela deve mostrar "Servidor não configurado".

---

## 11. Cloudflare Pages

### Configuração do build

- **Build command:** `npm run build`
- **Output directory:** `dist`

### Variáveis de ambiente

Configurar no dashboard do Cloudflare Pages (Settings → Environment Variables):

| Variável | Production | Preview | Development |
|----------|------------|---------|-------------|
| `VITE_SUPABASE_URL` | `https://SEU-PROJETO.supabase.co` | (mesmo ou staging) | `http://localhost:54321` |
| `VITE_SUPABASE_ANON_KEY` | chave anon real | chave anon real | chave anon local |
| `VITE_ENABLE_DEMO_DATA` | `false` | `false` | `false` |

**Observações:**
- As variáveis Vite são substituídas em tempo de build
- Após alterar variáveis no Cloudflare, um **novo build** é necessário
- Se houver bundle PWA antigo em cache, limpe o cache do navegador
- Nunca use `service_role` ou `sb_secret_` como variável de ambiente no Cloudflare

---

## 12. Checklist de segurança

- [ ] `VITE_SUPABASE_URL` não contém "placeholder"
- [ ] `VITE_SUPABASE_ANON_KEY` não contém "placeholder"
- [ ] `VITE_SUPABASE_ANON_KEY` não começa com "sb_secret_"
- [ ] `VITE_SUPABASE_ANON_KEY` não contém "service_role"
- [ ] Nenhum `.env` com credenciais reais foi versionado
- [ ] `process.env` não é usado no frontend
- [ ] App funciona sem `.env` (mostra "Servidor não configurado")
- [ ] App não tenta chamar Supabase sem variáveis
- [ ] Build funciona sem variáveis reais
- [ ] Console dev mostra aviso técnico claro quando não configurado
- [ ] Nenhuma URL placeholder ou chave secreta no bundle gerado
