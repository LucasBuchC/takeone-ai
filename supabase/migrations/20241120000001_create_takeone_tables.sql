-- =====================================================
-- CRIAÇÃO DAS TABELAS TAKEONE COM PREFIXO
-- =====================================================
-- Este script cria todas as tabelas da aplicação TakeOne.ai no schema 'public'
-- com prefixo 'takeone_' para organização e evitar conflitos
-- Execute este script APÓS remover o schema takeone antigo

-- =====================================================
-- TABELA: takeone_profiles
-- =====================================================
-- Armazena informações estendidas dos usuários
CREATE TABLE public.takeone_profiles (
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
CREATE INDEX idx_takeone_profiles_email ON public.takeone_profiles(email);
CREATE INDEX idx_takeone_profiles_subscription_status ON public.takeone_profiles(subscription_status);
CREATE INDEX idx_takeone_profiles_subscription_id ON public.takeone_profiles(subscription_id);

-- =====================================================
-- TABELA: takeone_projects
-- =====================================================
-- Armazena os projetos criados pelos usuários
CREATE TABLE public.takeone_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE INDEX idx_takeone_projects_user_id ON public.takeone_projects(user_id);
CREATE INDEX idx_takeone_projects_created_at ON public.takeone_projects(created_at DESC);
CREATE INDEX idx_takeone_projects_video_type ON public.takeone_projects(video_type);

-- =====================================================
-- TABELA: takeone_scripts
-- =====================================================
-- Armazena as versões de roteiros geradas pela IA
CREATE TABLE public.takeone_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.takeone_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL,
    prompt_used TEXT,
    generation_params JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_takeone_project_version UNIQUE(project_id, version)
);

-- Índices para melhor performance
CREATE INDEX idx_takeone_scripts_project_id ON public.takeone_scripts(project_id);
CREATE INDEX idx_takeone_scripts_user_id ON public.takeone_scripts(user_id);
CREATE INDEX idx_takeone_scripts_created_at ON public.takeone_scripts(created_at DESC);
CREATE INDEX idx_takeone_scripts_version ON public.takeone_scripts(project_id, version DESC);

-- =====================================================
-- TABELA: takeone_stripe_events
-- =====================================================
-- Armazena eventos dos webhooks do Stripe para auditoria e debug
CREATE TABLE public.takeone_stripe_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE INDEX idx_takeone_stripe_events_event_id ON public.takeone_stripe_events(event_id);
CREATE INDEX idx_takeone_stripe_events_event_type ON public.takeone_stripe_events(event_type);
CREATE INDEX idx_takeone_stripe_events_customer_id ON public.takeone_stripe_events(customer_id);
CREATE INDEX idx_takeone_stripe_events_subscription_id ON public.takeone_stripe_events(subscription_id);
CREATE INDEX idx_takeone_stripe_events_created_at ON public.takeone_stripe_events(created_at DESC);
CREATE INDEX idx_takeone_stripe_events_processed ON public.takeone_stripe_events(processed);

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_takeone_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_takeone_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.takeone_profiles (id, email, full_name, credits_remaining)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        10 -- Créditos iniciais gratuitos
    )
    ON CONFLICT (id) DO NOTHING; -- Evita erro se perfil já existe
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar versão do script automaticamente
CREATE OR REPLACE FUNCTION public.set_takeone_script_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a versão não foi especificada, calcular a próxima
    IF NEW.version IS NULL OR NEW.version = 1 THEN
        SELECT COALESCE(MAX(version), 0) + 1
        INTO NEW.version
        FROM public.takeone_scripts
        WHERE project_id = NEW.project_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para decrementar créditos após geração de script
CREATE OR REPLACE FUNCTION public.decrement_takeone_credits()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.takeone_profiles
    SET credits_remaining = GREATEST(credits_remaining - 1, 0)
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at em profiles
CREATE TRIGGER update_takeone_profiles_updated_at
    BEFORE UPDATE ON public.takeone_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_takeone_updated_at_column();

-- Trigger para atualizar updated_at em projects
CREATE TRIGGER update_takeone_projects_updated_at
    BEFORE UPDATE ON public.takeone_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_takeone_updated_at_column();

-- Trigger para criar perfil automaticamente após signup
DROP TRIGGER IF EXISTS on_takeone_auth_user_created ON auth.users;
CREATE TRIGGER on_takeone_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_takeone_new_user();

-- Trigger para incrementar versão do script automaticamente
CREATE TRIGGER set_takeone_script_version_trigger
    BEFORE INSERT ON public.takeone_scripts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_takeone_script_version();

-- Trigger para decrementar créditos após criação de script
CREATE TRIGGER decrement_takeone_credits_on_script_creation
    AFTER INSERT ON public.takeone_scripts
    FOR EACH ROW
    EXECUTE FUNCTION public.decrement_takeone_credits();

-- =====================================================
-- CONFIGURAÇÃO DE RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.takeone_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeone_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeone_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.takeone_stripe_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES PARA takeone_profiles
-- =====================================================

-- Usuários podem visualizar apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
    ON public.takeone_profiles FOR SELECT
    USING (auth.uid() = id);

-- Usuários podem inserir seu próprio perfil (para registro)
CREATE POLICY "Users can insert own profile"
    ON public.takeone_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
    ON public.takeone_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Service role tem acesso total (para webhooks do Stripe)
CREATE POLICY "Service role has full access to profiles"
    ON public.takeone_profiles FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- POLICIES PARA takeone_projects
-- =====================================================

-- Usuários podem visualizar apenas seus próprios projetos
CREATE POLICY "Users can view own projects"
    ON public.takeone_projects FOR SELECT
    USING (auth.uid() = user_id);

-- Usuários podem inserir seus próprios projetos
CREATE POLICY "Users can insert own projects"
    ON public.takeone_projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios projetos
CREATE POLICY "Users can update own projects"
    ON public.takeone_projects FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar seus próprios projetos
CREATE POLICY "Users can delete own projects"
    ON public.takeone_projects FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES PARA takeone_scripts
-- =====================================================

-- Usuários podem visualizar apenas seus próprios scripts
CREATE POLICY "Users can view own scripts"
    ON public.takeone_scripts FOR SELECT
    USING (auth.uid() = user_id);

-- Usuários podem inserir seus próprios scripts
CREATE POLICY "Users can insert own scripts"
    ON public.takeone_scripts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios scripts
CREATE POLICY "Users can update own scripts"
    ON public.takeone_scripts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar seus próprios scripts
CREATE POLICY "Users can delete own scripts"
    ON public.takeone_scripts FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES PARA takeone_stripe_events
-- =====================================================

-- Apenas service role pode acessar eventos do Stripe (segurança)
CREATE POLICY "Service role has full access to stripe_events"
    ON public.takeone_stripe_events FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- GRANTS
-- =====================================================

-- Conceder permissões apropriadas em todas as tabelas
GRANT ALL ON public.takeone_profiles TO postgres, service_role;
GRANT ALL ON public.takeone_projects TO postgres, service_role;
GRANT ALL ON public.takeone_scripts TO postgres, service_role;
GRANT ALL ON public.takeone_stripe_events TO postgres, service_role;

GRANT SELECT, INSERT, UPDATE ON public.takeone_profiles TO authenticated;
GRANT ALL ON public.takeone_projects TO authenticated;
GRANT ALL ON public.takeone_scripts TO authenticated;
-- stripe_events: apenas service_role (webhooks)

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.takeone_profiles IS 'Perfis estendidos dos usuários com informações de assinatura e créditos - TakeOne.ai';
COMMENT ON TABLE public.takeone_projects IS 'Projetos de vídeo criados pelos usuários - TakeOne.ai';
COMMENT ON TABLE public.takeone_scripts IS 'Versões de roteiros geradas pela IA para cada projeto - TakeOne.ai';
COMMENT ON TABLE public.takeone_stripe_events IS 'Log de eventos dos webhooks do Stripe para auditoria e debug - TakeOne.ai';

COMMENT ON COLUMN public.takeone_profiles.credits_remaining IS 'Quantidade de créditos disponíveis para gerar roteiros';
COMMENT ON COLUMN public.takeone_profiles.subscription_status IS 'Status atual da assinatura: free, active, cancelled, expired';
COMMENT ON COLUMN public.takeone_projects.video_type IS 'Tipo de vídeo: reel, tiktok, youtube_short, story, outros';
COMMENT ON COLUMN public.takeone_projects.duration IS 'Duração desejada do vídeo em segundos';
COMMENT ON COLUMN public.takeone_scripts.version IS 'Número da versão do roteiro (incrementado automaticamente)';
COMMENT ON COLUMN public.takeone_scripts.generation_params IS 'Parâmetros JSON usados na geração (modelo, temperatura, etc)';
COMMENT ON COLUMN public.takeone_stripe_events.event_id IS 'ID único do evento no Stripe (para evitar duplicação)';
COMMENT ON COLUMN public.takeone_stripe_events.payload IS 'Payload completo do webhook em formato JSON';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT
    table_name,
    COUNT(*) as total_colunas
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name LIKE 'takeone_%'
GROUP BY table_name
ORDER BY table_name;

-- Verificar triggers criados
SELECT
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%takeone%'
ORDER BY trigger_name;

-- Listar funções criadas
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name LIKE '%takeone%'
ORDER BY routine_name;
