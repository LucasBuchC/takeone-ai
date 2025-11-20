# 🚀 Guia Rápido de Migração - TakeOne.ai

## ⚡ Migração em 3 Passos Simples

### Passo 1: Execute o Script de Remoção

No **SQL Editor do Supabase**, execute:

```sql
-- Remove o schema 'takeone' e TUDO que está dentro dele
DROP SCHEMA IF EXISTS takeone CASCADE;

-- Limpa trigger que pode ter ficado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Limpa funções que podem ter ficado no public
DROP FUNCTION IF EXISTS public.handle_takeone_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_takeone_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.set_takeone_script_version() CASCADE;
DROP FUNCTION IF EXISTS public.decrement_takeone_credits() CASCADE;
```

✅ **O CASCADE remove automaticamente:**
- Todas as tabelas
- Todos os triggers
- Todas as funções
- Todas as policies (RLS)
- Todos os índices
- Todas as constraints

---

### Passo 2: Execute o Script de Criação

No **SQL Editor do Supabase**, cole e execute todo o conteúdo do arquivo:

```
supabase/migrations/20241120000001_create_takeone_tables.sql
```

✅ **Este script cria:**
- `takeone_profiles`
- `takeone_projects`
- `takeone_scripts`
- `takeone_stripe_events`

Com todos os triggers, índices, RLS e funções necessários.

---

### Passo 3: Deploy da Aplicação

```bash
npm run build
# Faça deploy normalmente
```

---

## ✅ Verificação Rápida

Execute esta query para confirmar que tudo foi criado:

```sql
-- Deve retornar 4 tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'takeone_%'
ORDER BY table_name;

-- Resultado esperado:
-- takeone_profiles
-- takeone_projects
-- takeone_scripts
-- takeone_stripe_events
```

---

## 🎯 Pronto!

A migração está completa. A aplicação já está atualizada e pronta para usar as novas tabelas.

---

## 📝 Notas Importantes

- ⚠️ **O schema antigo será DELETADO**: Faça backup se tiver dados importantes
- ✅ **Sem downtime**: Execute durante janela de manutenção
- 🔒 **RLS já configurado**: Segurança já está ativa
- 🤖 **Triggers automáticos**: Tudo funcionando (versionamento, créditos, etc.)

---

## 🆘 Problemas?

### Erro: "schema does not exist"
Normal! Significa que o schema já foi removido ou nunca existiu. Continue com o passo 2.

### Erro: "function does not exist"
Normal! Significa que a função já foi removida. Continue normalmente.

### Erro: "table already exists"
Se a tabela `takeone_*` já existe, delete-a primeiro:
```sql
DROP TABLE IF EXISTS takeone_profiles CASCADE;
DROP TABLE IF EXISTS takeone_projects CASCADE;
DROP TABLE IF EXISTS takeone_scripts CASCADE;
DROP TABLE IF EXISTS takeone_stripe_events CASCADE;
```

Depois execute o script de criação novamente.

---

## 🎉 Conclusão

Após completar os 3 passos:
- ✅ Schema antigo removido
- ✅ Novas tabelas criadas
- ✅ Aplicação funcionando
- ✅ Build passando

**Tudo pronto para produção!** 🚀
