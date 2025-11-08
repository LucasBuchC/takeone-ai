# 💳 Tabela stripe_events - Guia Completo

## 📋 Visão Geral

A tabela `takeone.stripe_events` armazena todos os eventos recebidos dos webhooks do Stripe para:
- **Auditoria**: Rastrear todas as interações com o Stripe
- **Debug**: Investigar problemas com pagamentos/assinaturas
- **Prevenção de duplicação**: Garantir que eventos não sejam processados múltiplas vezes
- **Compliance**: Manter histórico de transações

## 🏗️ Estrutura

```sql
CREATE TABLE takeone.stripe_events (
    id UUID PRIMARY KEY,
    event_id TEXT UNIQUE NOT NULL,           -- ID único do Stripe (ex: evt_xxxxx)
    event_type TEXT NOT NULL,                -- Tipo de evento
    customer_id TEXT,                        -- ID do customer no Stripe
    subscription_id TEXT,                    -- ID da subscription no Stripe
    payload JSONB NOT NULL,                  -- Dados completos do webhook
    processed BOOLEAN DEFAULT false,         -- Status de processamento
    error_message TEXT,                      -- Erro se houver
    created_at TIMESTAMPTZ DEFAULT NOW()     -- Quando foi recebido
);
```

## 📊 Tipos de Eventos Comuns

### Eventos de Assinatura
```
- checkout.session.completed        → Assinatura iniciada
- customer.subscription.created     → Subscription criada
- customer.subscription.updated     → Subscription atualizada (renovação)
- customer.subscription.deleted     → Subscription cancelada
```

### Eventos de Pagamento
```
- invoice.payment_succeeded         → Pagamento bem-sucedido
- invoice.payment_failed            → Pagamento falhou
- invoice.created                   → Fatura criada
- invoice.finalized                 → Fatura finalizada
```

### Eventos de Customer
```
- customer.created                  → Customer criado
- customer.updated                  → Customer atualizado
- customer.deleted                  → Customer deletado
```

## 🔍 Queries Úteis

### 1. Ver últimos eventos recebidos
```sql
SELECT 
  event_type,
  customer_id,
  processed,
  created_at
FROM takeone.stripe_events
ORDER BY created_at DESC
LIMIT 20;
```

### 2. Verificar eventos não processados
```sql
SELECT 
  event_id,
  event_type,
  error_message,
  created_at
FROM takeone.stripe_events
WHERE processed = false
ORDER BY created_at DESC;
```

### 3. Timeline de um customer
```sql
SELECT 
  event_type,
  TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as quando,
  processed,
  payload->>'status' as status
FROM takeone.stripe_events
WHERE customer_id = 'cus_xxxxx'
ORDER BY created_at;
```

### 4. Análise de webhooks por dia
```sql
SELECT 
  DATE(created_at) as dia,
  event_type,
  COUNT(*) as total,
  SUM(CASE WHEN processed THEN 1 ELSE 0 END) as processados,
  SUM(CASE WHEN NOT processed THEN 1 ELSE 0 END) as falhados
FROM takeone.stripe_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), event_type
ORDER BY dia DESC, total DESC;
```

### 5. Detectar eventos duplicados
```sql
SELECT 
  event_id,
  event_type,
  COUNT(*) as vezes_recebido,
  ARRAY_AGG(id) as internal_ids,
  ARRAY_AGG(created_at) as timestamps
FROM takeone.stripe_events
GROUP BY event_id, event_type
HAVING COUNT(*) > 1
ORDER BY vezes_recebido DESC;
```

### 6. Payload completo de um evento
```sql
SELECT 
  event_id,
  event_type,
  jsonb_pretty(payload) as payload_formatado
FROM takeone.stripe_events
WHERE event_id = 'evt_xxxxx';
```

## 🛠️ Debugging

### Problema: Subscription não está atualizando

```sql
-- 1. Verificar se webhook chegou
SELECT * FROM takeone.stripe_events 
WHERE subscription_id = 'sub_xxxxx'
ORDER BY created_at DESC;

-- 2. Ver se foi processado
SELECT event_type, processed, error_message
FROM takeone.stripe_events
WHERE subscription_id = 'sub_xxxxx'
  AND event_type IN (
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted'
  );

-- 3. Ver profile associado
SELECT p.*
FROM takeone.profiles p
WHERE p.subscription_id = 'sub_xxxxx';
```

### Problema: Pagamento não refletiu

```sql
-- Ver eventos de invoice do customer
SELECT 
  event_type,
  created_at,
  processed,
  payload->'amount_paid' as valor_pago,
  payload->'status' as status
FROM takeone.stripe_events
WHERE customer_id = 'cus_xxxxx'
  AND event_type LIKE 'invoice.%'
ORDER BY created_at DESC;
```

### Problema: Webhook não está chegando

```sql
-- Verificar último webhook recebido
SELECT 
  event_type,
  created_at,
  NOW() - created_at as tempo_desde_ultimo
FROM takeone.stripe_events
ORDER BY created_at DESC
LIMIT 1;

-- Se > 1 hora sem webhooks, verificar:
-- 1. Configuração de webhook no Dashboard Stripe
-- 2. URL do webhook está correta
-- 3. Stripe webhook secret está correto (.env)
```

## 📈 Monitoramento

### Dashboard de Saúde dos Webhooks
```sql
WITH estatisticas AS (
  SELECT 
    COUNT(*) as total_eventos,
    COUNT(*) FILTER (WHERE processed = true) as processados,
    COUNT(*) FILTER (WHERE processed = false) as falhados,
    COUNT(*) FILTER (WHERE error_message IS NOT NULL) as com_erro,
    MAX(created_at) as ultimo_evento,
    NOW() - MAX(created_at) as tempo_desde_ultimo
  FROM takeone.stripe_events
  WHERE created_at >= NOW() - INTERVAL '24 hours'
)
SELECT 
  total_eventos,
  processados,
  falhados,
  com_erro,
  ROUND(100.0 * processados / NULLIF(total_eventos, 0), 2) as taxa_sucesso,
  ultimo_evento,
  tempo_desde_ultimo
FROM estatisticas;
```

### Alertas Recomendados
```sql
-- ALERTA: Mais de 5% de webhooks falhando
SELECT 
  COUNT(*) FILTER (WHERE processed = false) * 100.0 / COUNT(*) as percentual_falha
FROM takeone.stripe_events
WHERE created_at >= NOW() - INTERVAL '1 hour'
HAVING COUNT(*) FILTER (WHERE processed = false) * 100.0 / COUNT(*) > 5;

-- ALERTA: Nenhum webhook nas últimas 2 horas (em horário comercial)
SELECT NOW() - MAX(created_at) as tempo_sem_webhook
FROM takeone.stripe_events
HAVING NOW() - MAX(created_at) > INTERVAL '2 hours';
```

## 🧹 Manutenção

### Limpar eventos antigos (> 90 dias)
```sql
-- Ver quantos eventos seriam deletados
SELECT COUNT(*) 
FROM takeone.stripe_events 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Deletar eventos antigos (cuidado!)
DELETE FROM takeone.stripe_events
WHERE created_at < NOW() - INTERVAL '90 days'
  AND processed = true
  AND error_message IS NULL;
```

### Reprocessar evento manualmente
```sql
-- 1. Ver payload do evento
SELECT payload FROM takeone.stripe_events WHERE event_id = 'evt_xxxxx';

-- 2. Marcar como não processado para forçar reprocessamento
UPDATE takeone.stripe_events
SET processed = false, error_message = NULL
WHERE event_id = 'evt_xxxxx';

-- 3. Reenviar webhook pelo Dashboard do Stripe
-- Ou processar manualmente via SQL baseado no payload
```

## 🔒 Segurança

### RLS (Row Level Security)
```sql
-- Apenas service_role pode acessar (webhooks)
CREATE POLICY "Service role has full access to stripe_events"
    ON takeone.stripe_events FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
```

**Importante:**
- Usuários comuns NÃO têm acesso a esta tabela
- Apenas o backend (service_role) pode ler/escrever
- Contém dados sensíveis de pagamento

## 📊 Relatórios

### Receita por mês (baseado em webhooks)
```sql
SELECT 
  DATE_TRUNC('month', created_at) as mes,
  COUNT(DISTINCT customer_id) as customers_ativos,
  COUNT(*) FILTER (WHERE event_type = 'invoice.payment_succeeded') as pagamentos,
  SUM((payload->>'amount_paid')::numeric / 100) as receita_total
FROM takeone.stripe_events
WHERE event_type = 'invoice.payment_succeeded'
  AND created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;
```

### Taxa de conversão (checkout → subscription ativa)
```sql
WITH checkouts AS (
  SELECT 
    customer_id,
    COUNT(*) as total_checkouts
  FROM takeone.stripe_events
  WHERE event_type = 'checkout.session.completed'
  GROUP BY customer_id
),
subscriptions AS (
  SELECT 
    customer_id,
    COUNT(*) as total_subs
  FROM takeone.stripe_events
  WHERE event_type = 'customer.subscription.created'
  GROUP BY customer_id
)
SELECT 
  COUNT(DISTINCT c.customer_id) as total_checkouts,
  COUNT(DISTINCT s.customer_id) as converteram,
  ROUND(100.0 * COUNT(DISTINCT s.customer_id) / COUNT(DISTINCT c.customer_id), 2) as taxa_conversao
FROM checkouts c
LEFT JOIN subscriptions s ON s.customer_id = c.customer_id;
```

## 🚨 Troubleshooting

### Webhook não está sendo salvo
```sql
-- Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'takeone' 
  AND table_name = 'stripe_events'
);

-- Verificar permissões
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'takeone'
  AND table_name = 'stripe_events';
```

### Event ID duplicado
```sql
-- Verificar se já existe
SELECT * FROM takeone.stripe_events WHERE event_id = 'evt_xxxxx';

-- Se já existe, o Stripe está reenviando o webhook
-- Isso é normal - o UNIQUE constraint previne duplicação
```

---

**Documentação do Stripe:**
- [Webhooks](https://stripe.com/docs/webhooks)
- [Eventos](https://stripe.com/docs/api/events)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
