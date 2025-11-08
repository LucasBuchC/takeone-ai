# 🗄️ Scripts Úteis do Banco de Dados

Scripts SQL úteis para gerenciar o banco de dados do TakeOne.ai

## 📊 Consultas de Monitoramento

### Ver todos os usuários e seus créditos
```sql
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.credits_remaining,
  p.subscription_status,
  p.subscription_plan,
  COUNT(DISTINCT pr.id) as total_projects,
  COUNT(s.id) as total_scripts
FROM takeone.profiles p
LEFT JOIN takeone.projects pr ON pr.user_id = p.id
LEFT JOIN takeone.scripts s ON s.user_id = p.id
GROUP BY p.id, p.email, p.full_name, p.credits_remaining, p.subscription_status, p.subscription_plan
ORDER BY p.created_at DESC;
```

### Ver projetos mais ativos
```sql
SELECT 
  pr.id,
  pr.title,
  pr.video_type,
  pr.duration,
  p.email as user_email,
  COUNT(s.id) as total_versions,
  MAX(s.created_at) as last_script_generated,
  pr.created_at as project_created
FROM takeone.projects pr
JOIN takeone.profiles p ON p.id = pr.user_id
LEFT JOIN takeone.scripts s ON s.project_id = pr.id
GROUP BY pr.id, pr.title, pr.video_type, pr.duration, p.email, pr.created_at
ORDER BY total_versions DESC, last_script_generated DESC
LIMIT 20;
```

### Estatísticas gerais da plataforma
```sql
SELECT 
  COUNT(DISTINCT p.id) as total_users,
  COUNT(DISTINCT pr.id) as total_projects,
  COUNT(s.id) as total_scripts,
  SUM(CASE WHEN p.subscription_status = 'active' THEN 1 ELSE 0 END) as active_subscriptions,
  SUM(p.credits_remaining) as total_credits_available,
  AVG(p.credits_remaining) as avg_credits_per_user
FROM takeone.profiles p
LEFT JOIN takeone.projects pr ON pr.user_id = p.id
LEFT JOIN takeone.scripts s ON s.user_id = p.id;
```

### Ver usuários sem créditos
```sql
SELECT 
  p.id,
  p.email,
  p.credits_remaining,
  p.subscription_status,
  p.subscription_plan,
  p.subscription_ends_at
FROM takeone.profiles p
WHERE p.credits_remaining = 0
ORDER BY p.subscription_ends_at DESC NULLS LAST;
```

### Ver eventos do Stripe (últimos webhooks recebidos)
```sql
SELECT 
  event_id,
  event_type,
  customer_id,
  subscription_id,
  processed,
  error_message,
  created_at
FROM takeone.stripe_events
ORDER BY created_at DESC
LIMIT 50;
```

### Ver eventos de um customer específico
```sql
SELECT 
  event_id,
  event_type,
  processed,
  error_message,
  created_at,
  payload
FROM takeone.stripe_events
WHERE customer_id = 'cus_xxxxx' -- Substitua pelo customer ID
ORDER BY created_at DESC;
```

### Ver eventos que falharam
```sql
SELECT 
  event_id,
  event_type,
  customer_id,
  error_message,
  created_at,
  payload
FROM takeone.stripe_events
WHERE processed = false OR error_message IS NOT NULL
ORDER BY created_at DESC;
```

### Histórico de gerações por usuário
```sql
SELECT 
  p.email,
  pr.title as project_title,
  s.version,
  s.created_at,
  LENGTH(s.content) as script_length,
  s.generation_params->>'tokens_used' as tokens_used
FROM takeone.scripts s
JOIN takeone.projects pr ON pr.id = s.project_id
JOIN takeone.profiles p ON p.id = s.user_id
WHERE s.user_id = 'USER_ID_AQUI' -- Substitua pelo ID do usuário
ORDER BY s.created_at DESC;
```

## 🔧 Scripts de Manutenção

### Resetar créditos de todos os usuários (início do mês)
```sql
-- ⚠️ Use com cuidado! Resetar créditos manualmente
UPDATE takeone.profiles
SET credits_remaining = CASE 
  WHEN subscription_plan = 'free' THEN 10
  WHEN subscription_plan = 'creator' THEN 50
  WHEN subscription_plan = 'pro' THEN 200
  WHEN subscription_plan = 'business' THEN 999999
  ELSE 10
END
WHERE subscription_status = 'active' 
   OR subscription_plan = 'free';
```

### Adicionar créditos bonus para um usuário específico
```sql
UPDATE takeone.profiles
SET credits_remaining = credits_remaining + 10 -- Adicionar 10 créditos bonus
WHERE email = 'usuario@example.com';
```

### Deletar projetos antigos sem scripts
```sql
-- Listar projetos sem scripts criados há mais de 30 dias
SELECT 
  pr.id,
  pr.title,
  pr.created_at,
  p.email
FROM takeone.projects pr
JOIN takeone.profiles p ON p.id = pr.user_id
LEFT JOIN takeone.scripts s ON s.project_id = pr.id
WHERE s.id IS NULL
  AND pr.created_at < NOW() - INTERVAL '30 days'
ORDER BY pr.created_at;

-- ⚠️ Deletar projetos sem scripts (cuidado!)
-- DELETE FROM takeone.projects
-- WHERE id IN (
--   SELECT pr.id
--   FROM takeone.projects pr
--   LEFT JOIN takeone.scripts s ON s.project_id = pr.id
--   WHERE s.id IS NULL
--     AND pr.created_at < NOW() - INTERVAL '30 days'
-- );
```

### Verificar integridade dos dados
```sql
-- Verificar profiles sem user_id correspondente em auth.users
SELECT p.id, p.email
FROM takeone.profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE u.id IS NULL;

-- Verificar projects órfãos (user_id não existe)
SELECT pr.id, pr.title, pr.user_id
FROM takeone.projects pr
LEFT JOIN auth.users u ON u.id = pr.user_id
WHERE u.id IS NULL;

-- Verificar scripts órfãos (project_id não existe)
SELECT s.id, s.project_id
FROM takeone.scripts s
LEFT JOIN takeone.projects pr ON pr.id = s.project_id
WHERE pr.id IS NULL;
```

## 📈 Análises e Relatórios

### Top tipos de vídeo mais populares
```sql
SELECT 
  video_type,
  COUNT(*) as total_projects,
  AVG(duration) as avg_duration,
  COUNT(DISTINCT user_id) as unique_users
FROM takeone.projects
GROUP BY video_type
ORDER BY total_projects DESC;
```

### Distribuição de duração de vídeos
```sql
SELECT 
  CASE 
    WHEN duration <= 15 THEN '0-15s (Shorts)'
    WHEN duration <= 60 THEN '16-60s (Reels)'
    WHEN duration <= 180 THEN '61-180s (Médios)'
    ELSE '181s+ (Longos)'
  END as duration_range,
  COUNT(*) as total_projects,
  AVG(duration) as avg_duration
FROM takeone.projects
GROUP BY 
  CASE 
    WHEN duration <= 15 THEN '0-15s (Shorts)'
    WHEN duration <= 60 THEN '16-60s (Reels)'
    WHEN duration <= 180 THEN '61-180s (Médios)'
    ELSE '181s+ (Longos)'
  END
ORDER BY avg_duration;
```

### Taxa de regeneração (usuários que geram múltiplas versões)
```sql
SELECT 
  pr.id,
  pr.title,
  p.email,
  COUNT(s.id) as total_versions,
  CASE 
    WHEN COUNT(s.id) = 1 THEN 'Sem regeneração'
    WHEN COUNT(s.id) <= 3 THEN 'Baixa regeneração'
    WHEN COUNT(s.id) <= 5 THEN 'Média regeneração'
    ELSE 'Alta regeneração'
  END as regeneration_level
FROM takeone.projects pr
JOIN takeone.profiles p ON p.id = pr.user_id
LEFT JOIN takeone.scripts s ON s.project_id = pr.id
GROUP BY pr.id, pr.title, p.email
HAVING COUNT(s.id) > 1
ORDER BY total_versions DESC;
```

### Crescimento mensal de usuários
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_users,
  SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as cumulative_users
FROM takeone.profiles
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### Retenção de usuários (usuários ativos nos últimos 7, 30 dias)
```sql
SELECT 
  COUNT(DISTINCT CASE 
    WHEN s.created_at >= NOW() - INTERVAL '7 days' 
    THEN s.user_id 
  END) as active_last_7_days,
  COUNT(DISTINCT CASE 
    WHEN s.created_at >= NOW() - INTERVAL '30 days' 
    THEN s.user_id 
  END) as active_last_30_days,
  COUNT(DISTINCT p.id) as total_users,
  ROUND(100.0 * COUNT(DISTINCT CASE 
    WHEN s.created_at >= NOW() - INTERVAL '7 days' 
    THEN s.user_id 
  END) / NULLIF(COUNT(DISTINCT p.id), 0), 2) as retention_7d_percent,
  ROUND(100.0 * COUNT(DISTINCT CASE 
    WHEN s.created_at >= NOW() - INTERVAL '30 days' 
    THEN s.user_id 
  END) / NULLIF(COUNT(DISTINCT p.id), 0), 2) as retention_30d_percent
FROM takeone.profiles p
LEFT JOIN takeone.scripts s ON s.user_id = p.id;
```

## 🔍 Análise de Webhooks Stripe

### Estatísticas de webhooks por tipo
```sql
SELECT 
  event_type,
  COUNT(*) as total_eventos,
  SUM(CASE WHEN processed = true THEN 1 ELSE 0 END) as processados,
  SUM(CASE WHEN processed = false OR error_message IS NOT NULL THEN 1 ELSE 0 END) as falhados,
  MAX(created_at) as ultimo_evento
FROM takeone.stripe_events
GROUP BY event_type
ORDER BY total_eventos DESC;
```

### Verificar duplicação de eventos
```sql
SELECT 
  event_id,
  COUNT(*) as vezes_recebido
FROM takeone.stripe_events
GROUP BY event_id
HAVING COUNT(*) > 1
ORDER BY vezes_recebido DESC;
```

### Timeline de eventos de uma subscription
```sql
SELECT 
  event_type,
  created_at,
  processed,
  payload->>'status' as subscription_status
FROM takeone.stripe_events
WHERE subscription_id = 'sub_xxxxx' -- Substitua pelo subscription ID
ORDER BY created_at;
```

## 🧪 Scripts de Teste

### Criar usuário de teste com dados completos
```sql
-- Primeiro, criar o usuário no auth.users via Dashboard ou Supabase Auth
-- Depois, inserir perfil de teste:

INSERT INTO takeone.profiles (
  id, 
  email, 
  full_name, 
  credits_remaining, 
  subscription_status,
  subscription_plan
) VALUES (
  'uuid-do-usuario-criado', 
  'teste@takeone.ai', 
  'Usuário Teste',
  100,
  'active',
  'pro'
);

-- Criar projeto de teste
INSERT INTO takeone.projects (
  user_id,
  title,
  video_type,
  duration,
  tone,
  last_prompt
) VALUES (
  'uuid-do-usuario-criado',
  'Projeto de Teste',
  'reel',
  60,
  'casual',
  'Criar um roteiro de teste para validação'
);

-- Criar script de teste
INSERT INTO takeone.scripts (
  project_id,
  user_id,
  content,
  prompt_used
) VALUES (
  'uuid-do-projeto-criado',
  'uuid-do-usuario-criado',
  '🎬 GANCHO\nOlá! Este é um roteiro de teste...\n\n📝 INTRODUÇÃO\n...',
  'Prompt de teste'
);
```

## 🔍 Debug e Troubleshooting

### Ver últimos erros de triggers
```sql
-- Verificar se os triggers estão funcionando
SELECT 
  trigger_name, 
  event_object_table, 
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'takeone'
ORDER BY event_object_table;
```

### Testar trigger de decremento de créditos manualmente
```sql
-- Ver créditos antes
SELECT credits_remaining FROM takeone.profiles WHERE id = 'user-id';

-- Inserir script (deve decrementar automaticamente)
INSERT INTO takeone.scripts (project_id, user_id, content)
VALUES ('project-id', 'user-id', 'Teste de decremento');

-- Ver créditos depois (deve ter diminuído 1)
SELECT credits_remaining FROM takeone.profiles WHERE id = 'user-id';
```

### Ver configurações de RLS
```sql
-- Listar todas as policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'takeone'
ORDER BY tablename, policyname;
```

## 🎯 Performance

### Verificar índices
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'takeone'
ORDER BY tablename, indexname;
```

### Queries mais lentas (requerer pg_stat_statements)
```sql
-- Habilitar pg_stat_statements primeiro no Dashboard
SELECT 
  calls,
  mean_exec_time,
  query
FROM pg_stat_statements
WHERE query LIKE '%takeone%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## 🚨 Backup e Restore

### Backup de dados de um usuário específico
```sql
-- Profile
COPY (
  SELECT * FROM takeone.profiles WHERE id = 'user-id'
) TO '/tmp/profile_backup.csv' CSV HEADER;

-- Projects
COPY (
  SELECT * FROM takeone.projects WHERE user_id = 'user-id'
) TO '/tmp/projects_backup.csv' CSV HEADER;

-- Scripts
COPY (
  SELECT * FROM takeone.scripts WHERE user_id = 'user-id'
) TO '/tmp/scripts_backup.csv' CSV HEADER;
```

---

**Nota:** Execute sempre scripts de DELETE/UPDATE com cuidado em produção. Faça backups antes de operações destrutivas!
