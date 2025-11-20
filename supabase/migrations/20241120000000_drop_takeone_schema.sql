-- =====================================================
-- SCRIPT DE REMOÇÃO DO SCHEMA TAKEONE
-- =====================================================
-- Este script remove completamente o schema 'takeone' e todas as suas dependências
-- Execute este script ANTES de criar as novas tabelas com prefixo takeone_

-- ⚠️ ATENÇÃO: Este script irá apagar TODOS OS DADOS do schema takeone
-- Faça backup dos dados importantes antes de executar!

-- =====================================================
-- MÉTODO SIMPLES E SEGURO: Usar CASCADE
-- =====================================================
-- O CASCADE automaticamente remove todas as dependências (triggers, policies, funções)
-- sem precisar especificar cada uma individualmente

-- 1. REMOVER O SCHEMA COMPLETO COM CASCADE
-- Isso remove tudo: tabelas, triggers, funções, policies, etc.
DROP SCHEMA IF EXISTS takeone CASCADE;

-- 2. LIMPAR TRIGGER DE CRIAÇÃO DE PERFIL (pode estar no auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. REMOVER FUNÇÕES QUE PODEM TER FICADO NO SCHEMA PUBLIC
DROP FUNCTION IF EXISTS public.handle_takeone_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_takeone_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.set_takeone_script_version() CASCADE;
DROP FUNCTION IF EXISTS public.decrement_takeone_credits() CASCADE;

-- =====================================================
-- 4. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se o schema foi removido
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'takeone') THEN
        RAISE NOTICE '⚠️ ATENÇÃO: Schema takeone ainda existe!';
    ELSE
        RAISE NOTICE '✅ Schema takeone removido com sucesso!';
    END IF;
END $$;
