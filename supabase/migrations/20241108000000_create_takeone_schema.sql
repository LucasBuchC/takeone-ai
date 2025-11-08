-- Criação do schema específico para a aplicação TakeOne
CREATE SCHEMA IF NOT EXISTS takeone;

-- Garantir que o schema seja acessível
GRANT USAGE ON SCHEMA takeone TO postgres, anon, authenticated, service_role;

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- =====================================================
-- TABELA: takeone.profiles
-- =====================================================
-- Armazena informações estendidas dos usuários
CREATE TABLE takeone.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    credits_remaining INTEGER DEFAULT 10 NOT NULL,
    subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'cancelled', 'expired')),
    subscription_id TEXT,
    subscription_plan TEXT,
    subscription_started_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para melhor performance
CREATE INDEX idx_profiles_email ON takeone.profiles(email);
CREATE INDEX idx_profiles_subscription_status ON takeone.profiles(subscription_status);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION takeone.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON takeone.profiles
    FOR EACH ROW
    EXECUTE FUNCTION takeone.update_updated_at_column();

-- =====================================================
-- TABELA: takeone.projects
-- =====================================================
-- Armazena os projetos criados pelos usuários
CREATE TABLE takeone.projects (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    video_type TEXT NOT NULL CHECK (video_type IN ('reel', 'tiktok', 'youtube_short', 'story', 'outros')),
    duration INTEGER NOT NULL CHECK (duration > 0 AND duration <= 300),
    tone TEXT DEFAULT 'casual' CHECK (tone IN ('casual', 'profissional', 'divertido', 'motivacional', 'educativo')),
    target_audience TEXT,
    last_prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para melhor performance
CREATE INDEX idx_projects_user_id ON takeone.projects(user_id);
CREATE INDEX idx_projects_created_at ON takeone.projects(created_at DESC);
CREATE INDEX idx_projects_video_type ON takeone.projects(video_type);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON takeone.projects
    FOR EACH ROW
    EXECUTE FUNCTION takeone.update_updated_at_column();

-- =====================================================
-- TABELA: takeone.scripts
-- =====================================================
-- Armazena as versões de roteiros geradas pela IA
CREATE TABLE takeone.scripts (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES takeone.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL,
    prompt_used TEXT,
    generation_params JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_project_version UNIQUE(project_id, version)
);

-- Índices para melhor performance
CREATE INDEX idx_scripts_project_id ON takeone.scripts(project_id);
CREATE INDEX idx_scripts_user_id ON takeone.scripts(user_id);
CREATE INDEX idx_scripts_created_at ON takeone.scripts(created_at DESC);
CREATE INDEX idx_scripts_version ON takeone.scripts(project_id, version DESC);

-- =====================================================
-- TABELA: takeone.stripe_events
-- =====================================================
-- Armazena eventos dos webhooks do Stripe para auditoria e debug
CREATE TABLE takeone.stripe_events (
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
CREATE INDEX idx_stripe_events_event_id ON takeone.stripe_events(event_id);
CREATE INDEX idx_stripe_events_event_type ON takeone.stripe_events(event_type);
CREATE INDEX idx_stripe_events_customer_id ON takeone.stripe_events(customer_id);
CREATE INDEX idx_stripe_events_subscription_id ON takeone.stripe_events(subscription_id);
CREATE INDEX idx_stripe_events_created_at ON takeone.stripe_events(created_at DESC);
CREATE INDEX idx_stripe_events_processed ON takeone.stripe_events(processed);

-- =====================================================
-- CONFIGURAÇÃO DE RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE takeone.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE takeone.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE takeone.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE takeone.stripe_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES PARA takeone.profiles
-- =====================================================

-- Usuários podem visualizar apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
    ON takeone.profiles FOR SELECT
    USING (auth.uid() = id);

-- Usuários podem inserir seu próprio perfil (para registro)
CREATE POLICY "Users can insert own profile"
    ON takeone.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
    ON takeone.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Service role tem acesso total (para webhooks do Stripe)
CREATE POLICY "Service role has full access to profiles"
    ON takeone.profiles FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- POLICIES PARA takeone.projects
-- =====================================================

-- Usuários podem visualizar apenas seus próprios projetos
CREATE POLICY "Users can view own projects"
    ON takeone.projects FOR SELECT
    USING (auth.uid() = user_id);

-- Usuários podem inserir seus próprios projetos
CREATE POLICY "Users can insert own projects"
    ON takeone.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios projetos
CREATE POLICY "Users can update own projects"
    ON takeone.projects FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar seus próprios projetos
CREATE POLICY "Users can delete own projects"
    ON takeone.projects FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES PARA takeone.scripts
-- =====================================================

-- Usuários podem visualizar apenas seus próprios scripts
CREATE POLICY "Users can view own scripts"
    ON takeone.scripts FOR SELECT
    USING (auth.uid() = user_id);

-- Usuários podem inserir seus próprios scripts
CREATE POLICY "Users can insert own scripts"
    ON takeone.scripts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios scripts
CREATE POLICY "Users can update own scripts"
    ON takeone.scripts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar seus próprios scripts
CREATE POLICY "Users can delete own scripts"
    ON takeone.scripts FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES PARA takeone.stripe_events
-- =====================================================

-- Apenas service role pode acessar eventos do Stripe (segurança)
CREATE POLICY "Service role has full access to stripe_events"
    ON takeone.stripe_events FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- FUNÇÃO: Criar perfil automaticamente após signup
-- =====================================================
CREATE OR REPLACE FUNCTION takeone.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO takeone.profiles (id, email, full_name, credits_remaining)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        10 -- Créditos iniciais
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION takeone.handle_new_user();

-- =====================================================
-- FUNÇÃO: Incrementar versão do script automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION takeone.set_script_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a versão não foi especificada, calcular a próxima
    IF NEW.version IS NULL OR NEW.version = 1 THEN
        SELECT COALESCE(MAX(version), 0) + 1 
        INTO NEW.version
        FROM takeone.scripts
        WHERE project_id = NEW.project_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_script_version_trigger
    BEFORE INSERT ON takeone.scripts
    FOR EACH ROW
    EXECUTE FUNCTION takeone.set_script_version();

-- =====================================================
-- FUNÇÃO: Decrementar créditos após geração de script
-- =====================================================
CREATE OR REPLACE FUNCTION takeone.decrement_credits()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE takeone.profiles
    SET credits_remaining = GREATEST(credits_remaining - 1, 0)
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER decrement_credits_on_script_creation
    AFTER INSERT ON takeone.scripts
    FOR EACH ROW
    EXECUTE FUNCTION takeone.decrement_credits();

-- =====================================================
-- GRANTS FINAIS
-- =====================================================

-- Conceder permissões apropriadas em todas as tabelas
GRANT ALL ON takeone.profiles TO postgres, service_role;
GRANT ALL ON takeone.projects TO postgres, service_role;
GRANT ALL ON takeone.scripts TO postgres, service_role;
GRANT ALL ON takeone.stripe_events TO postgres, service_role;

GRANT SELECT, INSERT, UPDATE ON takeone.profiles TO authenticated;
GRANT ALL ON takeone.projects TO authenticated;
GRANT ALL ON takeone.scripts TO authenticated;
-- stripe_events: apenas service_role (webhooks)

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON SCHEMA takeone IS 'Schema específico para a aplicação TakeOne.ai - Gerador de roteiros com IA';

COMMENT ON TABLE takeone.profiles IS 'Perfis estendidos dos usuários com informações de assinatura e créditos';
COMMENT ON TABLE takeone.projects IS 'Projetos de vídeo criados pelos usuários';
COMMENT ON TABLE takeone.scripts IS 'Versões de roteiros geradas pela IA para cada projeto';
COMMENT ON TABLE takeone.stripe_events IS 'Log de eventos dos webhooks do Stripe para auditoria e debug';

COMMENT ON COLUMN takeone.profiles.credits_remaining IS 'Quantidade de créditos disponíveis para gerar roteiros';
COMMENT ON COLUMN takeone.profiles.subscription_status IS 'Status atual da assinatura: free, active, cancelled, expired';
COMMENT ON COLUMN takeone.projects.video_type IS 'Tipo de vídeo: reel, tiktok, youtube_short, story, outros';
COMMENT ON COLUMN takeone.projects.duration IS 'Duração desejada do vídeo em segundos';
COMMENT ON COLUMN takeone.scripts.version IS 'Número da versão do roteiro (incrementado automaticamente)';
COMMENT ON COLUMN takeone.scripts.generation_params IS 'Parâmetros JSON usados na geração (modelo, temperatura, etc)';
COMMENT ON COLUMN takeone.stripe_events.event_id IS 'ID único do evento no Stripe (para evitar duplicação)';
COMMENT ON COLUMN takeone.stripe_events.payload IS 'Payload completo do webhook em formato JSON';
