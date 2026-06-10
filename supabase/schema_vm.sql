-- =====================================================
-- Dashboard CHUA - Schema VM
-- PostgreSQL puro (sem Supabase)
-- auth.users substituído por app_auth.users
-- RLS removida — controle de acesso via middleware JWT
-- =====================================================

-- =====================================================
-- LIMPEZA
-- =====================================================
DROP SCHEMA IF EXISTS app_auth CASCADE;

DROP TRIGGER IF EXISTS canvas_items_updated_at    ON canvas_items;
DROP TRIGGER IF EXISTS canvas_sections_updated_at ON canvas_sections;
DROP TRIGGER IF EXISTS canvases_updated_at        ON canvases;
DROP TRIGGER IF EXISTS org_members_updated_at     ON organization_members;
DROP TRIGGER IF EXISTS organizations_updated_at   ON organizations;
DROP TRIGGER IF EXISTS profiles_updated_at        ON profiles;

DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS get_my_canvases()   CASCADE;

DROP TABLE IF EXISTS canvas_items         CASCADE;
DROP TABLE IF EXISTS canvas_sections      CASCADE;
DROP TABLE IF EXISTS canvases             CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations        CASCADE;
DROP TABLE IF EXISTS profiles             CASCADE;

DROP TYPE IF EXISTS canvas_status CASCADE;
DROP TYPE IF EXISTS member_role   CASCADE;
DROP TYPE IF EXISTS item_color    CASCADE;

-- =====================================================
-- SCHEMA DE AUTENTICAÇÃO PRÓPRIA
-- Substitui auth.users do Supabase
-- =====================================================
CREATE SCHEMA app_auth;

CREATE TABLE app_auth.users (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text        NOT NULL UNIQUE,
  password_hash text        NOT NULL,
  full_name     text,
  avatar_url    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_auth_users_email ON app_auth.users(email);

-- =====================================================
-- TIPOS ENUM
-- =====================================================
CREATE TYPE canvas_status AS ENUM ('active', 'draft', 'archived');
CREATE TYPE member_role   AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE item_color    AS ENUM ('yellow', 'blue', 'green', 'red', 'purple', 'orange', 'gray');

-- =====================================================
-- TABELA: profiles
-- =====================================================
CREATE TABLE profiles (
  id         uuid        PRIMARY KEY REFERENCES app_auth.users(id) ON DELETE CASCADE,
  email      text,
  full_name  text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- TABELA: organizations
-- =====================================================
CREATE TABLE organizations (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL CHECK (length(trim(name)) >= 1 AND length(name) <= 100),
  slug       text        NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9\-]+$'),
  plan       text        NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

-- =====================================================
-- TABELA: organization_members
-- =====================================================
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

-- =====================================================
-- TABELA: canvases
-- =====================================================
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

-- =====================================================
-- TABELA: canvas_sections
-- =====================================================
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

-- =====================================================
-- TABELA: canvas_items
-- =====================================================
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

-- =====================================================
-- FUNÇÃO: updated_at automático
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER canvases_updated_at
  BEFORE UPDATE ON canvases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER canvas_sections_updated_at
  BEFORE UPDATE ON canvas_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER canvas_items_updated_at
  BEFORE UPDATE ON canvas_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER auth_users_updated_at
  BEFORE UPDATE ON app_auth.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
