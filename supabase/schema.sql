-- =====================================================
-- Canvas Operacional - Schema Supabase
-- Rodar no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- TABELA: profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- TABELA: canvases
-- =====================================================
CREATE TABLE IF NOT EXISTS canvases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_canvases_owner_id ON canvases(owner_id);

ALTER TABLE canvases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "canvases_all_own" ON canvases;

CREATE POLICY "canvases_all_own" ON canvases
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- =====================================================
-- TABELA: canvas_sections
-- =====================================================
CREATE TABLE IF NOT EXISTS canvas_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id uuid NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  key text NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_canvas_sections_canvas_id ON canvas_sections(canvas_id);

ALTER TABLE canvas_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "canvas_sections_all_own" ON canvas_sections;

CREATE POLICY "canvas_sections_all_own" ON canvas_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM canvases
      WHERE canvases.id = canvas_sections.canvas_id
        AND canvases.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvases
      WHERE canvases.id = canvas_sections.canvas_id
        AND canvases.owner_id = auth.uid()
    )
  );

-- =====================================================
-- TABELA: canvas_items
-- =====================================================
CREATE TABLE IF NOT EXISTS canvas_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id uuid NOT NULL REFERENCES canvases(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES canvas_sections(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(title) <= 120),
  description text CHECK (description IS NULL OR length(description) <= 1000),
  position integer NOT NULL DEFAULT 0,
  color text DEFAULT 'yellow',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_canvas_items_canvas_id ON canvas_items(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_items_section_id ON canvas_items(section_id);
CREATE INDEX IF NOT EXISTS idx_canvas_items_section_position ON canvas_items(section_id, position);

ALTER TABLE canvas_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "canvas_items_all_own" ON canvas_items;

CREATE POLICY "canvas_items_all_own" ON canvas_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM canvases
      WHERE canvases.id = canvas_items.canvas_id
        AND canvases.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvases
      WHERE canvases.id = canvas_items.canvas_id
        AND canvases.owner_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGER: updated_at automático
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS canvases_updated_at ON canvases;
CREATE TRIGGER canvases_updated_at BEFORE UPDATE ON canvases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS canvas_sections_updated_at ON canvas_sections;
CREATE TRIGGER canvas_sections_updated_at BEFORE UPDATE ON canvas_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS canvas_items_updated_at ON canvas_items;
CREATE TRIGGER canvas_items_updated_at BEFORE UPDATE ON canvas_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- TRIGGER: criar profile automaticamente ao cadastrar
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
