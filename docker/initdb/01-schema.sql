-- ════════════════════════════════════════════════════════════════════════════
--  CHUÁ — inicialização do banco (roda UMA vez, no primeiro boot do container)
--  Schema PostgreSQL puro + tabela Kanban + perfis (role) + admin inicial
-- ════════════════════════════════════════════════════════════════════════════

-- ── Autenticação própria ────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS app_auth;

CREATE TYPE app_auth.user_role AS ENUM ('admin', 'analista', 'visualizador', 'solicitante');

CREATE TABLE app_auth.users (
  id            uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text               NOT NULL UNIQUE,
  password_hash text               NOT NULL,
  full_name     text,
  avatar_url    text,
  ativo         boolean            NOT NULL DEFAULT true,
  role          app_auth.user_role NOT NULL DEFAULT 'visualizador',
  created_at    timestamptz        NOT NULL DEFAULT now(),
  updated_at    timestamptz        NOT NULL DEFAULT now()
);

CREATE INDEX idx_auth_users_email  ON app_auth.users(email);
CREATE INDEX idx_auth_users_role   ON app_auth.users(role);
CREATE INDEX idx_auth_users_ativos ON app_auth.users(email) WHERE ativo = true;

-- ── Tipos ENUM de domínio ────────────────────────────────────────────────────
CREATE TYPE canvas_status AS ENUM ('active', 'draft', 'archived');
CREATE TYPE member_role   AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE item_color    AS ENUM ('yellow', 'blue', 'green', 'red', 'purple', 'orange', 'gray');

-- ── profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id         uuid        PRIMARY KEY REFERENCES app_auth.users(id) ON DELETE CASCADE,
  email      text,
  full_name  text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── organizations ─────────────────────────────────────────────────────────────
CREATE TABLE organizations (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL CHECK (length(trim(name)) >= 1 AND length(name) <= 100),
  slug       text        NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9\-]+$'),
  plan       text        NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- ── organization_members ───────────────────────────────────────────────────────
CREATE TABLE organization_members (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
  role            member_role NOT NULL DEFAULT 'member',
  invited_by      uuid        REFERENCES app_auth.users(id) ON DELETE SET NULL,
  joined_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
CREATE INDEX idx_org_members_organization_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id         ON organization_members(user_id);

-- ── canvases ───────────────────────────────────────────────────────────────────
CREATE TABLE canvases (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid          NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
  organization_id uuid          REFERENCES organizations(id) ON DELETE SET NULL,
  name            text          NOT NULL CHECK (length(trim(name)) >= 1 AND length(name) <= 120),
  description     text          CHECK (description IS NULL OR length(description) <= 500),
  status          canvas_status NOT NULL DEFAULT 'active',
  deleted_at      timestamptz,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);
CREATE INDEX idx_canvases_owner_id        ON canvases(owner_id)         WHERE deleted_at IS NULL;
CREATE INDEX idx_canvases_organization_id ON canvases(organization_id)  WHERE deleted_at IS NULL;
CREATE INDEX idx_canvases_status          ON canvases(owner_id, status) WHERE deleted_at IS NULL;

-- ── canvas_sections ─────────────────────────────────────────────────────────────
CREATE TABLE canvas_sections (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id   uuid        NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  owner_id    uuid        NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
  key         text        NOT NULL,
  title       text        NOT NULL CHECK (length(trim(title)) >= 1 AND length(title) <= 80),
  description text,
  icon        text,
  position    integer     NOT NULL DEFAULT 0 CHECK (position >= 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (canvas_id, key)
);
CREATE INDEX idx_canvas_sections_canvas_id ON canvas_sections(canvas_id);

-- ── canvas_items ──────────────────────────────────────────────────────────────
CREATE TABLE canvas_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id   uuid        NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  section_id  uuid        NOT NULL REFERENCES canvas_sections(id) ON DELETE CASCADE,
  owner_id    uuid        NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
  title       text        NOT NULL CHECK (length(trim(title)) >= 1 AND length(title) <= 120),
  description text        CHECK (description IS NULL OR length(description) <= 1000),
  position    integer     NOT NULL DEFAULT 0 CHECK (position >= 0),
  color       item_color  NOT NULL DEFAULT 'yellow',
  metadata    jsonb       NOT NULL DEFAULT '{}'::jsonb,
  deleted_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_canvas_items_section_id       ON canvas_items(section_id)           WHERE deleted_at IS NULL;
CREATE INDEX idx_canvas_items_canvas_id        ON canvas_items(canvas_id)            WHERE deleted_at IS NULL;
CREATE INDEX idx_canvas_items_section_position ON canvas_items(section_id, position) WHERE deleted_at IS NULL;

-- ── updated_at automático ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at        BEFORE UPDATE ON profiles        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER organizations_updated_at   BEFORE UPDATE ON organizations   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER canvases_updated_at        BEFORE UPDATE ON canvases        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER canvas_sections_updated_at BEFORE UPDATE ON canvas_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER canvas_items_updated_at    BEFORE UPDATE ON canvas_items    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER auth_users_updated_at      BEFORE UPDATE ON app_auth.users  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Kanban (cards persistidos como JSONB) ────────────────────────────────────
CREATE TABLE kanban_cards (
  id         text        PRIMARY KEY,
  arquivado  boolean     NOT NULL DEFAULT false,
  card_data  jsonb       NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_kanban_arquivado ON kanban_cards(arquivado);
CREATE INDEX idx_kanban_coluna    ON kanban_cards((card_data->>'coluna')) WHERE NOT arquivado;
CREATE TRIGGER kanban_cards_updated_at BEFORE UPDATE ON kanban_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Admin inicial ────────────────────────────────────────────────────────────
--  Login: adm@chua.local   Senha: admin123   (TROQUE depois de entrar)
WITH novo_admin AS (
  INSERT INTO app_auth.users (email, password_hash, full_name, ativo, role)
  VALUES (
    'adm@chua.local',
    '$2b$12$xBC0lRyZU/3rkvyMgdxWBe.blb/LJKvGB7uuPGku7JjyMvFJ0ODSu',
    'Administrador',
    true,
    'admin'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id, email, full_name
)
INSERT INTO profiles (id, email, full_name)
SELECT id, email, full_name FROM novo_admin
ON CONFLICT (id) DO NOTHING;
