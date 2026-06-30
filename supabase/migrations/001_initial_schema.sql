-- ============================================================
-- DevMind — Supabase Initial Schema Migration
-- 001_initial_schema.sql
-- ============================================================

-- Collections table (referenced by topics)
CREATE TABLE IF NOT EXISTS collections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users NOT NULL,
  name         text NOT NULL,
  topic_ids    uuid[] DEFAULT '{}',
  created_at   timestamptz DEFAULT now()
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  name            text NOT NULL,
  colour          text NOT NULL DEFAULT '#7C6AF7',
  collection_id   uuid REFERENCES collections(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  mastery_percent integer DEFAULT 0
);

-- Blocks table
CREATE TABLE IF NOT EXISTS blocks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users NOT NULL,
  topic_id      uuid REFERENCES topics(id) ON DELETE CASCADE,
  type          text NOT NULL,
  content       text NOT NULL DEFAULT '',
  source_url    text,
  source_title  text,
  image_url     text,
  ocr_text      text,
  "order"       integer NOT NULL DEFAULT 0,
  is_pinned     boolean DEFAULT false,
  tags          text[] DEFAULT '{}',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  sync_status   text DEFAULT 'synced'
);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics      ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks      ENABLE ROW LEVEL SECURITY;

-- Collections policies
CREATE POLICY "Users manage own collections"
  ON collections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Topics policies
CREATE POLICY "Users manage own topics"
  ON topics FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Blocks policies
CREATE POLICY "Users manage own blocks"
  ON blocks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_topics_user_id     ON topics(user_id);
CREATE INDEX IF NOT EXISTS idx_blocks_user_id     ON blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_blocks_topic_id    ON blocks(topic_id);
CREATE INDEX IF NOT EXISTS idx_blocks_updated_at  ON blocks(updated_at);

-- ── Updated_at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER blocks_updated_at
  BEFORE UPDATE ON blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Supabase Storage bucket ───────────────────────────────────
-- Run this in the Supabase dashboard SQL editor (storage API not available in migrations)
-- 1. Create the bucket
-- INSERT INTO storage.buckets (id, name, public) VALUES ('handwritten-scans', 'handwritten-scans', true);
--
-- 2. Create policies for the bucket (run in SQL editor as well)
-- CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'handwritten-scans');
-- CREATE POLICY "Allow authenticated updates" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'handwritten-scans');
-- CREATE POLICY "Allow public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'handwritten-scans');
