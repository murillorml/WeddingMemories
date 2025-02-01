/*
  # Wedding Memory Collection Schema

  1. Tables
    - weddings: Stores wedding event details
    - guests: Tracks wedding guests
    - photos: Stores photo submissions
    - audios: Stores audio messages
    - messages: Stores text messages
  
  2. Security
    - RLS enabled on all tables
    - Public read access
    - Controlled write access
    
  3. Indexes
    - Optimized queries with appropriate indexes
*/

DO $$ 
BEGIN

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS weddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  groom_name text NOT NULL,
  bride_name text NOT NULL,
  date date NOT NULL,
  location text NOT NULL,
  banner_image text NOT NULL,
  description text,
  password text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT weddings_groom_name_check CHECK (char_length(groom_name) > 0),
  CONSTRAINT weddings_bride_name_check CHECK (char_length(bride_name) > 0)
);

CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT guests_name_check CHECK (char_length(name) > 0)
);

CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  guest_id uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  duration interval,
  guest_id uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  guest_id uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT messages_content_check CHECK (char_length(content) > 0)
);

END $$;

-- Create indexes (IF NOT EXISTS is not supported for indexes, so we'll use DO blocks)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_guests_wedding_id') THEN
    CREATE INDEX idx_guests_wedding_id ON guests(wedding_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_photos_wedding_id') THEN
    CREATE INDEX idx_photos_wedding_id ON photos(wedding_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_photos_guest_id') THEN
    CREATE INDEX idx_photos_guest_id ON photos(guest_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audios_wedding_id') THEN
    CREATE INDEX idx_audios_wedding_id ON audios(wedding_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audios_guest_id') THEN
    CREATE INDEX idx_audios_guest_id ON audios(guest_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_wedding_id') THEN
    CREATE INDEX idx_messages_wedding_id ON messages(wedding_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_guest_id') THEN
    CREATE INDEX idx_messages_guest_id ON messages(guest_id);
  END IF;
END $$;

-- Enable RLS on all tables
DO $$ 
BEGIN
  EXECUTE 'ALTER TABLE weddings ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE guests ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE photos ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE audios ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE messages ENABLE ROW LEVEL SECURITY';
EXCEPTION 
  WHEN others THEN null;
END $$;

-- Drop existing policies if they exist and create new ones
DO $$ 
BEGIN
  -- Weddings policies
  DROP POLICY IF EXISTS "Weddings are viewable by everyone" ON weddings;
  DROP POLICY IF EXISTS "Weddings are insertable by authenticated users" ON weddings;
  
  CREATE POLICY "Weddings are viewable by everyone"
    ON weddings FOR SELECT
    TO public
    USING (true);

  CREATE POLICY "Weddings are insertable by authenticated users"
    ON weddings FOR INSERT
    TO authenticated
    WITH CHECK (true);

  -- Guests policies
  DROP POLICY IF EXISTS "Guests are viewable by everyone" ON guests;
  DROP POLICY IF EXISTS "Guests can be created by anyone" ON guests;
  
  CREATE POLICY "Guests are viewable by everyone"
    ON guests FOR SELECT
    TO public
    USING (true);

  CREATE POLICY "Guests can be created by anyone"
    ON guests FOR INSERT
    TO public
    WITH CHECK (true);

  -- Photos policies
  DROP POLICY IF EXISTS "Photos are viewable by everyone" ON photos;
  DROP POLICY IF EXISTS "Photos can be created by guests" ON photos;
  
  CREATE POLICY "Photos are viewable by everyone"
    ON photos FOR SELECT
    TO public
    USING (true);

  CREATE POLICY "Photos can be created by guests"
    ON photos FOR INSERT
    TO public
    WITH CHECK (true);

  -- Audios policies
  DROP POLICY IF EXISTS "Audios are viewable by everyone" ON audios;
  DROP POLICY IF EXISTS "Audios can be created by guests" ON audios;
  
  CREATE POLICY "Audios are viewable by everyone"
    ON audios FOR SELECT
    TO public
    USING (true);

  CREATE POLICY "Audios can be created by guests"
    ON audios FOR INSERT
    TO public
    WITH CHECK (true);

  -- Messages policies
  DROP POLICY IF EXISTS "Messages are viewable by everyone" ON messages;
  DROP POLICY IF EXISTS "Messages can be created by guests" ON messages;
  
  CREATE POLICY "Messages are viewable by everyone"
    ON messages FOR SELECT
    TO public
    USING (true);

  CREATE POLICY "Messages can be created by guests"
    ON messages FOR INSERT
    TO public
    WITH CHECK (true);
END $$;