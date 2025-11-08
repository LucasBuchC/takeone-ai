# 📋 Guia de Migração - Schema TakeOne

Este guia explica como aplicar a migração do banco de dados para usar um schema específico `takeone` no Supabase.

## 🎯 O que foi alterado?

### Antes (Schema Public)
- Tabelas: `public.profiles`, `public.projects`, `public.scripts`
- Estrutura básica sem organização específica

### Depois (Schema TakeOne)
- Tabelas: `takeone.profiles`, `takeone.projects`, `takeone.scripts`
- Schema dedicado para isolar a aplicação
- Triggers automáticos para incrementar versões e decrementar créditos
- RLS (Row Level Security) configurado para todas as tabelas
- Função automática para criar perfil após signup

## 📦 Estrutura das Tabelas

### `takeone.profiles`
```
- id (UUID) → auth.users
- email (TEXT)
- full_name (TEXT)
- credits_remaining (INT) = 10
- subscription_status = 'free' | 'active' | 'cancelled' | 'expired'
- subscription_id (TEXT)
- subscription_plan (TEXT)
- subscription_started_at (TIMESTAMP)
- subscription_ends_at (TIMESTAMP)
- created_at, updated_at
```

### `takeone.projects`
```
- id (UUID)
- user_id (UUID) → auth.users
- title (TEXT)
- video_type = 'reel' | 'tiktok' | 'youtube_short' | 'story' | 'outros'
- duration (INT) 1-300
- tone = 'casual' | 'profissional' | 'divertido' | 'motivacional' | 'educativo'
- target_audience (TEXT)
- last_prompt (TEXT)
- created_at, updated_at
```

### `takeone.scripts`
```
- id (UUID)
- project_id (UUID) → takeone.projects
- user_id (UUID) → auth.users
- version (INT) - auto-incrementado
- content (TEXT)
- prompt_used (TEXT)
- generation_params (JSONB)
- created_at
```

### `takeone.stripe_events`
```
- id (UUID)
- event_id (TEXT, UNIQUE) - ID do evento no Stripe
- event_type (TEXT) - Tipo de evento (checkout.session.completed, etc)
- customer_id (TEXT) - ID do customer no Stripe
- subscription_id (TEXT) - ID da subscription no Stripe
- payload (JSONB) - Payload completo do webhook
- processed (BOOLEAN) - Se o evento foi processado com sucesso
- error_message (TEXT) - Mensagem de erro se falhou
- created_at (TIMESTAMP)
```

## 🚀 Como Aplicar a Migração

### Opção 1: Via Dashboard do Supabase (Recomendado)

1. **Acesse o Dashboard do Supabase**
   - Vá para [supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "+ New query"

3. **Cole o SQL de Migração**
   - Copie todo o conteúdo do arquivo:
     ```
     supabase/migrations/20241108000000_create_takeone_schema.sql
     ```
   - Cole no editor

4. **Execute a Migração**
   - Clique em "Run" (ou Cmd/Ctrl + Enter)
   - Aguarde a confirmação de sucesso
   - Verifique se não há erros

5. **Verificar Schema Criado**
   - No menu "Database" → "Schema"
   - Você deve ver o schema `takeone` listado
   - Verifique se as 3 tabelas foram criadas

### Opção 2: Via Supabase CLI (Desenvolvimento Local)

1. **Conectar ao Projeto**
   ```bash
   npx supabase link --project-ref SEU_PROJECT_REF
   ```

2. **Aplicar Migração**
   ```bash
   npx supabase db push
   ```

3. **Verificar Status**
   ```bash
   npx supabase db diff
   ```

### Opção 3: Via Migrations no Supabase

1. **Acessar Migrations**
   - Dashboard → Database → Migrations
   - Clique em "Upload migration"

2. **Upload do Arquivo**
   - Selecione o arquivo `20241108000000_create_takeone_schema.sql`
   - Aplique a migração

## ✅ Verificação Pós-Migração

Execute os seguintes comandos no SQL Editor para verificar:

```sql
-- 1. Verificar se o schema existe
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'takeone';

-- 2. Listar todas as tabelas do schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'takeone';

-- 3. Verificar policies RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'takeone';

-- 4. Verificar triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'takeone';
```

**Resultados esperados:**
- 1 schema: `takeone`
- 4 tabelas: `profiles`, `projects`, `scripts`, `stripe_events`
- 11+ policies RLS
- 4 triggers

## 📝 Notas Importantes

### ⚠️ Dados Existentes

**Se você já tem dados no schema `public`**, você precisará migrá-los:

```sql
-- Migrar profiles (ajuste conforme sua estrutura atual)
INSERT INTO takeone.profiles (id, email, credits_remaining, subscription_status)
SELECT 
  id, 
  email, 
  COALESCE(credits_remaining, 10), 
  COALESCE(subscription_status, 'free')
FROM public.profiles
ON CONFLICT (id) DO NOTHING;

-- Migrar projects
INSERT INTO takeone.projects (id, user_id, title, video_type, duration, tone, last_prompt, created_at, updated_at)
SELECT 
  id, 
  user_id, 
  title, 
  video_type, 
  duration, 
  COALESCE(tone, 'casual'),
  last_prompt,
  created_at,
  updated_at
FROM public.projects
ON CONFLICT (id) DO NOTHING;

-- Migrar scripts
INSERT INTO takeone.scripts (id, project_id, user_id, version, content, prompt_used, created_at)
SELECT 
  id, 
  project_id,
  user_id,
  COALESCE(version, 1),
  content,
  prompt_used,
  created_at
FROM public.scripts
ON CONFLICT (id) DO NOTHING;
```

### 🔐 Permissões e RLS

A migração já configura:
- ✅ RLS habilitado em todas as tabelas
- ✅ Policies para usuários visualizarem apenas seus dados
- ✅ Service role com acesso total (para webhooks)
- ✅ Authenticated users podem inserir/atualizar seus dados

### 🔄 Triggers Automáticos

1. **update_updated_at**: Atualiza `updated_at` automaticamente em profiles e projects
2. **on_auth_user_created**: Cria perfil automaticamente após signup
3. **set_script_version**: Incrementa versão do script automaticamente
4. **decrement_credits_on_script_creation**: Decrementa créditos após gerar script

## 🧪 Testando a Migração

### 1. Teste de Signup
```javascript
// Criar novo usuário e verificar se o perfil é criado automaticamente
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'senha123'
})

// Verificar perfil criado
const { data: profile } = await supabase
  .from('takeone.profiles')
  .select('*')
  .eq('id', data.user.id)
  .single()

console.log(profile) // Deve ter credits_remaining = 10
```

### 2. Teste de Criação de Projeto
```javascript
const { data: project } = await supabase
  .from('takeone.projects')
  .insert({
    title: 'Teste',
    video_type: 'reel',
    duration: 60
  })
  .select()
  .single()

console.log(project) // Deve ter user_id preenchido automaticamente
```

### 3. Teste de Geração de Script
```javascript
// Criar primeiro script
const { data: script1 } = await supabase
  .from('takeone.scripts')
  .insert({
    project_id: 'uuid-do-projeto',
    content: 'Conteúdo do roteiro...'
  })
  .select()
  .single()

console.log(script1.version) // Deve ser 1

// Criar segundo script do mesmo projeto
const { data: script2 } = await supabase
  .from('takeone.scripts')
  .insert({
    project_id: 'uuid-do-projeto',
    content: 'Versão 2 do roteiro...'
  })
  .select()
  .single()

console.log(script2.version) // Deve ser 2

// Verificar créditos decrementados
const { data: profile } = await supabase
  .from('takeone.profiles')
  .select('credits_remaining')
  .eq('id', userId)
  .single()

console.log(profile.credits_remaining) // Deve ter diminuído 2 créditos
```

## 🔧 Rollback (Se necessário)

Se precisar reverter a migração:

```sql
-- ⚠️ CUIDADO: Isso apagará TODOS os dados do schema takeone
DROP SCHEMA IF EXISTS takeone CASCADE;

-- Remover trigger do auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS takeone.handle_new_user();
```

## 📚 Referências

- [Supabase Schemas](https://supabase.com/docs/guides/database/schemas)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

## ❓ Problemas Comuns

### "relation takeone.profiles does not exist"
- Certifique-se de que a migração foi executada com sucesso
- Verifique se o schema foi criado: `SELECT * FROM information_schema.schemata WHERE schema_name = 'takeone'`

### "permission denied for schema takeone"
- Verifique os GRANTs no final do arquivo de migração
- Execute: `GRANT USAGE ON SCHEMA takeone TO authenticated, anon;`

### "function takeone.handle_new_user() does not exist"
- O trigger de signup não foi criado
- Execute a seção de criação de função/trigger novamente

## 📞 Suporte

Se encontrar problemas durante a migração:
1. Verifique os logs no Dashboard → Database → Logs
2. Teste as queries manualmente no SQL Editor
3. Revise as permissões de RLS
4. Certifique-se de estar usando o service_role_key nas APIs que precisam bypass RLS
