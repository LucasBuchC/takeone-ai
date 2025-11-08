-- =====================================================
-- MIGRAÇÃO ADICIONAL: Tabela stripe_events
-- =====================================================
-- Execute este script se você já aplicou a migração principal anteriormente
-- e só precisa adicionar a tabela stripe_events

-- =====================================================
-- TABELA: takeone.stripe_events
-- =====================================================
-- Armazena eventos dos webhooks do Stripe para auditoria e debug
CREATE TABLE IF NOT EXISTS takeone.stripe_events (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    customer_id TEXT,
    subscription_id TEXT,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para consultas e debug
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON takeone.stripe_events(event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_type ON takeone.stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_customer_id ON takeone.stripe_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_subscription_id ON takeone.stripe_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created_at ON takeone.stripe_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON takeone.stripe_events(processed);

-- Habilitar RLS
ALTER TABLE takeone.stripe_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICY PARA takeone.stripe_events
-- =====================================================
-- Apenas service role pode acessar eventos do Stripe (segurança)
DROP POLICY IF EXISTS "Service role has full access to stripe_events" ON takeone.stripe_events;
CREATE POLICY "Service role has full access to stripe_events"
    ON takeone.stripe_events FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- GRANTS
-- =====================================================
GRANT ALL ON takeone.stripe_events TO postgres, service_role;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================
COMMENT ON TABLE takeone.stripe_events IS 'Log de eventos dos webhooks do Stripe para auditoria e debug';
COMMENT ON COLUMN takeone.stripe_events.event_id IS 'ID único do evento no Stripe (para evitar duplicação)';
COMMENT ON COLUMN takeone.stripe_events.payload IS 'Payload completo do webhook em formato JSON';

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
-- Verificar se a tabela foi criada com sucesso
SELECT 
    table_name,
    COUNT(*) as total_colunas
FROM information_schema.columns
WHERE table_schema = 'takeone' 
    AND table_name = 'stripe_events'
GROUP BY table_name;

-- Verificar índices criados
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'takeone' 
    AND tablename = 'stripe_events'
ORDER BY indexname;
