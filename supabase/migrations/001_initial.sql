-- ============================================================
-- WRITERLY — Schema inicial
-- ============================================================

-- Profiles (extiende auth.users de Supabase)
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger: crea un perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Books
CREATE TABLE books (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'Sin título',
  description TEXT DEFAULT '',
  cover_color TEXT DEFAULT '#4f46e5',
  word_goal   INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own books" ON books
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Chapters
CREATE TABLE chapters (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id    UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title      TEXT NOT NULL DEFAULT 'Capítulo sin título',
  content    JSONB DEFAULT '{}',      -- TipTap JSON output
  position   INTEGER NOT NULL DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX chapters_book_position ON chapters(book_id, position);

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
-- Solo el dueño del libro puede tocar sus capítulos
CREATE POLICY "Users CRUD own chapters" ON chapters
  USING (
    EXISTS (
      SELECT 1 FROM books WHERE books.id = chapters.book_id AND books.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM books WHERE books.id = chapters.book_id AND books.user_id = auth.uid()
    )
  );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_updated_at    BEFORE UPDATE ON books    FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();
CREATE TRIGGER chapters_updated_at BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();

-- Vista útil: word count total por libro
CREATE VIEW book_stats AS
  SELECT
    b.id,
    b.title,
    b.user_id,
    COUNT(c.id)      AS chapter_count,
    COALESCE(SUM(c.word_count), 0) AS total_words
  FROM books b
  LEFT JOIN chapters c ON c.book_id = b.id
  GROUP BY b.id;
