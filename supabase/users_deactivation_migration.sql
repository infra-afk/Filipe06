-- Soft delete de usuários — preserva dados, bloqueia acesso
-- Executar na VM:
--   psql -U dashboard_user -d dashboard_db -f users_deactivation_migration.sql

ALTER TABLE app_auth.users
  ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_auth_users_ativos
  ON app_auth.users(email)
  WHERE ativo = true;
