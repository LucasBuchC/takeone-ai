# 🚀 Guia Rápido - Migração Schema Takeone

## 📦 Comandos NPM Adicionados

```bash
# Linkar projeto Supabase local com remoto
npm run db:link

# Aplicar migrações pendentes
npm run db:push

# Ver diferenças entre local e remoto
npm run db:diff

# Resetar banco de dados local
npm run db:reset
```

## ⚡ Aplicar Migração (Método Mais Rápido)

### 1. Via Dashboard Supabase (RECOMENDADO)

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **+ New query**
5. Copie e cole TODO o conteúdo de:
   ```
   supabase/migrations/20241108000000_create_takeone_schema.sql
   ```
6. Clique em **Run** (ou Cmd/Ctrl + Enter)
7. ✅ Pronto! Schema criado

### 2. Verificar se Funcionou

Cole e execute no SQL Editor:

```sql
-- Deve mostrar o schema 'takeone'
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'takeone';

-- Deve mostrar: profiles, projects, scripts, stripe_events
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'takeone';
```

## 🔄 Migrar Dados Antigos (Se necessário)

Se você já tem dados no schema `public`, execute:

```sql
-- PERFIS
INSERT INTO takeone.profiles (id, email, credits_remaining, subscription_status)
SELECT 
  id, 
  email, 
  COALESCE(credits_remaining, 10), 
  COALESCE(subscription_status, 'free')
FROM public.profiles
ON CONFLICT (id) DO NOTHING;

-- PROJETOS
INSERT INTO takeone.projects (id, user_id, title, video_type, duration, tone, last_prompt, created_at, updated_at)
SELECT 
  id, user_id, title, video_type, duration, 
  COALESCE(tone, 'casual'), last_prompt, created_at, updated_at
FROM public.projects
ON CONFLICT (id) DO NOTHING;

-- SCRIPTS
INSERT INTO takeone.scripts (id, project_id, user_id, version, content, prompt_used, created_at)
SELECT 
  id, project_id, user_id,
  COALESCE(version, 1), content, prompt_used, created_at
FROM public.scripts
ON CONFLICT (id) DO NOTHING;
```

## 🧪 Testar Após Migração

### 1. Criar Usuário de Teste
```sql
-- Verificar se perfil é criado automaticamente após signup
SELECT * FROM takeone.profiles WHERE email = 'seu-email@teste.com';
-- Deve ter credits_remaining = 10
```

### 2. Criar Projeto de Teste
Via dashboard da aplicação ou:
```sql
INSERT INTO takeone.projects (user_id, title, video_type, duration)
VALUES ('seu-user-id', 'Teste', 'reel', 60);
```

### 3. Testar Geração de Script
Gerar um roteiro pela aplicação e verificar:
```sql
-- Ver script criado
SELECT * FROM takeone.scripts WHERE user_id = 'seu-user-id';

-- Verificar créditos decrementados
SELECT credits_remaining FROM takeone.profiles WHERE id = 'seu-user-id';
-- Deve ter diminuído 1 crédito
```

## 📊 Consultas Úteis Rápidas

```sql
-- Ver todos os usuários
SELECT id, email, credits_remaining, subscription_status 
FROM takeone.profiles 
ORDER BY created_at DESC;

-- Ver projetos de um usuário
SELECT * FROM takeone.projects 
WHERE user_id = 'user-id' 
ORDER BY created_at DESC;

-- Ver scripts de um projeto
SELECT version, created_at, LENGTH(content) as tamanho
FROM takeone.scripts 
WHERE project_id = 'project-id' 
ORDER BY version;

-- Estatísticas gerais
SELECT 
  COUNT(DISTINCT p.id) as usuarios,
  COUNT(DISTINCT pr.id) as projetos,
  COUNT(s.id) as scripts,
  SUM(p.credits_remaining) as total_creditos
FROM takeone.profiles p
LEFT JOIN takeone.projects pr ON pr.user_id = p.id
LEFT JOIN takeone.scripts s ON s.user_id = p.id;
```

## 🎯 Estrutura das Tabelas

### takeone.profiles
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

### takeone.projects
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

### takeone.scripts
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

### takeone.stripe_events
```
- id (UUID)
- event_id (TEXT, UNIQUE) - ID único no Stripe
- event_type (TEXT) - Tipo de webhook
- customer_id (TEXT)
- subscription_id (TEXT)
- payload (JSONB) - Dados completos do evento
- processed (BOOLEAN)
- error_message (TEXT)
- created_at (TIMESTAMP)
```

## ✨ Features Automáticas

### ✅ Triggers Configurados

1. **Auto-criar perfil**: Quando usuário faz signup, perfil é criado automaticamente
2. **Auto-incrementar versão**: Scripts do mesmo projeto têm versão incrementada automaticamente
3. **Auto-decrementar créditos**: Ao criar script, créditos são decrementados automaticamente
4. **Auto-atualizar timestamps**: `updated_at` atualizado automaticamente em profiles e projects

### ✅ RLS (Row Level Security)

- Usuários veem apenas seus próprios dados
- Service role (webhooks) tem acesso total
- Authenticated users podem criar/editar seus dados

## ⚠️ Importante

### Campos Alterados (vs Schema Public)

**Profiles:**
- ❌ `stripe_customer_id` → ✅ Agora é obtido via Stripe API
- ❌ `stripe_subscription_id` → ✅ `subscription_id`
- ❌ `stripe_price_id` → ✅ `subscription_plan`

**Scripts:**
- ✅ Novo campo: `user_id` (obrigatório)
- ✅ Novo campo: `prompt_used`
- ✅ Novo campo: `generation_params` (JSONB)

## 🆘 Problemas Comuns

### "relation takeone.profiles does not exist"
→ A migração não foi aplicada. Execute o SQL no Dashboard.

### "permission denied for schema takeone"
→ Execute os comandos GRANT do final do arquivo de migração.

### "RLS policy violation"
→ Verifique se está usando o usuário correto ou service_role_key para webhooks.

### Scripts não estão decrementando créditos
→ Verifique se o trigger foi criado:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'decrement_credits_on_script_creation';
```

## 📞 Mais Informações

- **Guia Completo:** `MIGRATION_GUIDE.md`
- **Scripts Úteis:** `DATABASE_SCRIPTS.md`
- **Resumo:** `README_MIGRATION.md`

---

✅ **Migração preparada e pronta para uso!**
