-- =====================================================
-- Dashboard CHUA - Schema v2
-- Arquitetura: multi-tenant (organizações), RLS direto,
-- soft deletes, enums, constraints, índices otimizados
-- Rodar no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- LIMPEZA (ordem inversa de dependências)
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created    ON auth.users;
DROP TRIGGER IF EXISTS canvas_items_updated_at   ON canvas_items;
DROP TRIGGER IF EXISTS canvas_sections_updated_at ON canvas_sections;
DROP TRIGGER IF EXISTS canvases_updated_at       ON canvases;
DROP TRIGGER IF EXISTS org_members_updated_at    ON organization_members;
DROP TRIGGER IF EXISTS organizations_updated_at  ON organizations;
DROP TRIGGER IF EXISTS profiles_updated_at       ON profiles;

DROP FUNCTION IF EXISTS handle_new_user()   CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

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
-- TIPOS ENUM
-- =====================================================
CREATE TYPE canvas_status AS ENUM ('active', 'draft', 'archived');
CREATE TYPE member_role   AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE item_color    AS ENUM ('yellow', 'blue', 'green', 'red', 'purple', 'orange', 'gray');

-- =====================================================
-- TABELA: profiles
-- =====================================================
CREATE TABLE profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text,
  full_name    text,
  avatar_url   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- TABELA: organizations
-- =====================================================
CREATE TABLE organizations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL CHECK (length(trim(name)) >= 1 AND length(name) <= 100),
  slug       text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9\-]+$'),
  plan       text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Qualquer membro da org pode ver a organização
CREATE POLICY "organizations_select_member" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
    )
  );

-- Só owner pode alterar
CREATE POLICY "organizations_update_owner" ON organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role = 'owner'
    )
  );

-- =====================================================
-- TABELA: organization_members
-- =====================================================
CREATE TABLE organization_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            member_role NOT NULL DEFAULT 'member',
  invited_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX idx_org_members_organization_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id         ON organization_members(user_id);

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Membros veem outros membros da mesma org
CREATE POLICY "org_members_select_same_org" ON organization_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om2
      WHERE om2.organization_id = organization_members.organization_id
        AND om2.user_id = auth.uid()
    )
  );

-- Owner/admin gerenciam membros
CREATE POLICY "org_members_manage_admin" ON organization_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organization_members om2
      WHERE om2.organization_id = organization_members.organization_id
        AND om2.user_id = auth.uid()
        AND om2.role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- TABELA: canvases
-- =====================================================
CREATE TABLE canvases (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  name            text NOT NULL CHECK (length(trim(name)) >= 1 AND length(name) <= 120),
  description     text CHECK (description IS NULL OR length(description) <= 500),
  status          canvas_status NOT NULL DEFAULT 'active',
  deleted_at      timestamptz,   -- soft delete
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_canvases_owner_id        ON canvases(owner_id)        WHERE deleted_at IS NULL;
CREATE INDEX idx_canvases_organization_id ON canvases(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_canvases_status          ON canvases(owner_id, status) WHERE deleted_at IS NULL;

ALTER TABLE canvases ENABLE ROW LEVEL SECURITY;

-- Usuário vê seus canvases pessoais (não deletados) + canvases da org
CREATE POLICY "canvases_select" ON canvases
  FOR SELECT USING (
    deleted_at IS NULL AND (
      owner_id = auth.uid()
      OR (
        organization_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM organization_members
          WHERE organization_members.organization_id = canvases.organization_id
            AND organization_members.user_id = auth.uid()
        )
      )
    )
  );

-- Qualquer membro da org (ou dono) pode criar canvas
CREATE POLICY "canvases_insert" ON canvases
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()
  );

-- Owner ou admin da org pode editar
CREATE POLICY "canvases_update" ON canvases
  FOR UPDATE USING (
    owner_id = auth.uid()
    OR (
      organization_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.organization_id = canvases.organization_id
          AND organization_members.user_id = auth.uid()
          AND organization_members.role IN ('owner', 'admin')
      )
    )
  );

-- Só owner deleta
CREATE POLICY "canvases_delete" ON canvases
  FOR DELETE USING (owner_id = auth.uid());

-- =====================================================
-- TABELA: canvas_sections
-- =====================================================
CREATE TABLE canvas_sections (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id  uuid NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  owner_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key        text NOT NULL,
  title      text NOT NULL CHECK (length(trim(title)) >= 1 AND length(title) <= 80),
  description text,
  icon       text,
  position   integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (canvas_id, key)   -- não pode ter seção duplicada no mesmo canvas
);

CREATE INDEX idx_canvas_sections_canvas_id ON canvas_sections(canvas_id);

ALTER TABLE canvas_sections ENABLE ROW LEVEL SECURITY;

-- RLS direto pelo owner_id (sem subquery)
CREATE POLICY "canvas_sections_all_own" ON canvas_sections
  FOR ALL USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- =====================================================
-- TABELA: canvas_items
-- =====================================================
CREATE TABLE canvas_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id   uuid NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  section_id  uuid NOT NULL REFERENCES canvas_sections(id) ON DELETE CASCADE,
  owner_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL CHECK (length(trim(title)) >= 1 AND length(title) <= 120),
  description text CHECK (description IS NULL OR length(description) <= 1000),
  position    integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  color       item_color NOT NULL DEFAULT 'yellow',
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  deleted_at  timestamptz,  -- soft delete para histórico
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_canvas_items_section_id       ON canvas_items(section_id)            WHERE deleted_at IS NULL;
CREATE INDEX idx_canvas_items_canvas_id        ON canvas_items(canvas_id)             WHERE deleted_at IS NULL;
CREATE INDEX idx_canvas_items_section_position ON canvas_items(section_id, position)  WHERE deleted_at IS NULL;

ALTER TABLE canvas_items ENABLE ROW LEVEL SECURITY;

-- RLS direto pelo owner_id (sem subquery)
CREATE POLICY "canvas_items_all_own" ON canvas_items
  FOR ALL USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

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

CREATE TRIGGER canvas_items_updated_at
  BEFORE UPDATE ON canvas_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- FUNÇÃO: criar profile ao registrar usuário
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email     = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- FUNÇÃO: listar canvases ativos (view helper)
-- =====================================================
CREATE OR REPLACE FUNCTION get_my_canvases()
RETURNS SETOF canvases LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM canvases
  WHERE owner_id = auth.uid()
    AND deleted_at IS NULL
  ORDER BY created_at DESC;
$$;
