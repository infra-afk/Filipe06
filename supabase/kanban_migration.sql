-- Tabela de cards do Kanban
-- Executar na VM:
--   psql -U dashboard_user -d dashboard_db -f kanban_migration.sql

CREATE TABLE IF NOT EXISTS kanban_cards (
  id         text        PRIMARY KEY,
  arquivado  boolean     NOT NULL DEFAULT false,
  card_data  jsonb       NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kanban_arquivado
  ON kanban_cards(arquivado);

CREATE INDEX IF NOT EXISTS idx_kanban_coluna
  ON kanban_cards((card_data->>'coluna'))
  WHERE NOT arquivado;

CREATE TRIGGER kanban_cards_updated_at
  BEFORE UPDATE ON kanban_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
