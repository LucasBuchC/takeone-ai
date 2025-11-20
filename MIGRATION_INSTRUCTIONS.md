# Instruções de Migração - TakeOne.ai

## 📋 Visão Geral

Esta migração move as tabelas do schema `takeone` para o schema `public` com prefixo `takeone_`.

**Antes:** `takeone.profiles`, `takeone.projects`, `takeone.scripts`, `takeone.stripe_events`
**Depois:** `takeone_profiles`, `takeone_projects`, `takeone_scripts`, `takeone_stripe_events`

## ⚠️ IMPORTANTE - BACKUP DOS DADOS

Antes de executar a migração, **FAÇA BACKUP DOS SEUS DADOS**:

```sql
-- 1. Exportar dados existentes (execute no SQL Editor do Supabase)
COPY (SELECT * FROM takeone.profiles) TO '/tmp/profiles_backup.csv' WITH CSV HEADER;
COPY (SELECT * FROM takeone.projects) TO '/tmp/projects_backup.csv' WITH CSV HEADER;
COPY (SELECT * FROM takeone.scripts) TO '/tmp/scripts_backup.csv' WITH CSV HEADER;
COPY (SELECT * FROM takeone.stripe_events) TO '/tmp/stripe_events_backup.csv' WITH CSV HEADER;
```

Ou use o painel do Supabase para exportar os dados das tabelas.

## 🔄 Passos da Migração

### Passo 1: Remover Schema Antigo

Execute o script de remoção no **SQL Editor** do Supabase:

```bash
supabase/migrations/20241120000000_drop_takeone_schema.sql
```

Ou copie e execute o conteúdo diretamente no SQL Editor.

**O que este script faz:**
- Remove todos os triggers
- Remove todas as funções
- Remove todas as policies (RLS)
- Remove todas as tabelas
- Remove o schema `takeone`

### Passo 2: Criar Novas Tabelas

Execute o script de criação no **SQL Editor** do Supabase:

```bash
supabase/migrations/20241120000001_create_takeone_tables.sql
```

**O que este script faz:**
- Cria tabelas: `takeone_profiles`, `takeone_projects`, `takeone_scripts`, `takeone_stripe_events`
- Cria índices para performance
- Cria funções auxiliares
- Cria triggers automáticos:
  - Auto-incremento de versão de scripts
  - Decremento de créditos ao gerar script
  - Criação automática de perfil ao registrar usuário
  - Atualização automática de `updated_at`
- Configura RLS (Row Level Security)
- Configura policies de segurança
- Concede permissões apropriadas

### Passo 3: Verificar Migração

Execute as queries de verificação no final do script de criação:

```sql
-- Verificar tabelas criadas
SELECT table_name, COUNT(*) as total_colunas
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name LIKE 'takeone_%'
GROUP BY table_name
ORDER BY table_name;

-- Verificar triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%takeone%'
ORDER BY trigger_name;

-- Verificar funções
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name LIKE '%takeone%'
ORDER BY routine_name;
```

### Passo 4: Restaurar Dados (se necessário)

Se você tinha dados no schema antigo e quer mantê-los:

```sql
-- Exemplo de restauração de dados
-- AJUSTE conforme seus backups
INSERT INTO public.takeone_profiles (id, email, full_name, credits_remaining, ...)
SELECT id, email, full_name, credits_remaining, ... FROM [SEU_BACKUP];
```

## 🚀 Aplicação Atualizada

A aplicação já foi atualizada para usar as novas tabelas. Todas as queries foram modificadas:

### Arquivos Atualizados:
- ✅ `app/api/generate-script/route.ts`
- ✅ `app/dashboard/page.tsx`
- ✅ `app/dashboard/projects/page.tsx`
- ✅ `app/dashboard/projects/new/page.tsx`
- ✅ `app/dashboard/projects/[id]/page.tsx`
- ✅ `app/dashboard/layout.tsx`
- ✅ `app/pricing/page.tsx`
- ✅ `lib/subscription-helpers.ts`
- ✅ `app/api/create-portal-session/route.ts`
- ✅ `app/api/create-checkout-session/route.ts`
- ✅ `app/api/webhooks/stripe/route.ts`

## 📊 Estrutura das Tabelas

### takeone_profiles
```sql
- id (UUID, PK, FK → auth.users)
- email (TEXT, UNIQUE)
- full_name (TEXT)
- credits_remaining (INTEGER, DEFAULT 10)
- subscription_status (TEXT)
- subscription_id (TEXT)
- subscription_plan (TEXT)
- subscription_started_at (TIMESTAMPTZ)
- subscription_ends_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### takeone_projects
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- title (TEXT)
- video_type (TEXT)
- duration (INTEGER)
- tone (TEXT)
- target_audience (TEXT)
- last_prompt (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### takeone_scripts
```sql
- id (UUID, PK)
- project_id (UUID, FK → takeone_projects)
- user_id (UUID, FK → auth.users)
- version (INTEGER, auto-incrementado)
- content (TEXT)
- prompt_used (TEXT)
- generation_params (JSONB)
- created_at (TIMESTAMPTZ)
```

### takeone_stripe_events
```sql
- id (UUID, PK)
- event_id (TEXT, UNIQUE)
- event_type (TEXT)
- customer_id (TEXT)
- subscription_id (TEXT)
- payload (JSONB)
- processed (BOOLEAN)
- error_message (TEXT)
- created_at (TIMESTAMPTZ)
```

## 🔒 Segurança (RLS)

Todas as tabelas têm Row Level Security (RLS) habilitado com as seguintes policies:

### takeone_profiles
- Usuários podem ver/editar apenas seu próprio perfil
- Service role tem acesso total (para webhooks Stripe)

### takeone_projects
- Usuários podem ver/criar/editar/deletar apenas seus próprios projetos

### takeone_scripts
- Usuários podem ver/criar/editar/deletar apenas seus próprios scripts

### takeone_stripe_events
- Apenas service role pode acessar (segurança)

## 🎯 Triggers Automáticos

### 1. Criação Automática de Perfil
Quando um usuário se registra via Supabase Auth, um perfil é criado automaticamente em `takeone_profiles`.

### 2. Versionamento de Scripts
Ao criar um novo script, a versão é incrementada automaticamente.

### 3. Decremento de Créditos
Ao gerar um script, os créditos do usuário são decrementados automaticamente.

### 4. Atualização de `updated_at`
Os campos `updated_at` em profiles e projects são atualizados automaticamente.

## ✅ Checklist Pós-Migração

- [ ] Scripts executados sem erros
- [ ] Tabelas criadas com sucesso
- [ ] Triggers funcionando
- [ ] Funções criadas
- [ ] RLS habilitado
- [ ] Policies configuradas
- [ ] Build da aplicação passou (`npm run build`)
- [ ] Aplicação testada em desenvolvimento
- [ ] Dados restaurados (se necessário)

## 🆘 Troubleshooting

### Erro: "relation already exists"
Se alguma tabela já existe, você pode:
1. Deletar a tabela manualmente
2. Ou modificar o script para usar `CREATE TABLE IF NOT EXISTS`

### Erro: "trigger already exists"
Execute `DROP TRIGGER IF EXISTS [nome_do_trigger]` antes de criar.

### Erro: "function already exists"
Execute `DROP FUNCTION IF EXISTS [nome_da_funcao]` antes de criar.

## 📞 Suporte

Em caso de problemas durante a migração:
1. Verifique os logs do SQL Editor
2. Confirme que você tem as permissões necessárias
3. Verifique se o backup foi feito corretamente
4. Em caso de erro crítico, restaure os dados do backup

## 🎉 Conclusão

Após completar todos os passos:
- ✅ Schema `takeone` removido
- ✅ Novas tabelas `takeone_*` criadas no schema `public`
- ✅ Aplicação atualizada e funcionando
- ✅ Build passando sem erros
- ✅ Segurança (RLS) configurada
- ✅ Triggers automáticos funcionando

**A aplicação está pronta para uso!** 🚀
