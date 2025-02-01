/*
  # Add videos table

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `url` (text)
      - `guest_id` (uuid, foreign key to guests)
      - `wedding_id` (uuid, foreign key to weddings)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `videos` table
    - Add policies for public access (same as photos table)
*/

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  guest_id uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_videos_wedding_id') THEN
    CREATE INDEX idx_videos_wedding_id ON videos(wedding_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_videos_guest_id') THEN
    CREATE INDEX idx_videos_guest_id ON videos(guest_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Videos are viewable by everyone"
  ON videos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Videos can be created by guests"
  ON videos FOR INSERT
  TO public
  WITH CHECK (true);