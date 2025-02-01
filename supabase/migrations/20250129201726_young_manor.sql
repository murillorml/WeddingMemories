/*
  # Add email column to weddings table

  1. Changes
    - Add email column to weddings table if it doesn't exist
    - Add unique constraint
    - Add email format validation

  2. Security
    - No changes to RLS policies needed
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'weddings' AND column_name = 'email'
  ) THEN
    ALTER TABLE weddings 
    ADD COLUMN email text NOT NULL DEFAULT '',
    ADD CONSTRAINT weddings_email_unique UNIQUE (email),
    ADD CONSTRAINT weddings_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

    -- Remove the default after adding the column
    ALTER TABLE weddings ALTER COLUMN email DROP DEFAULT;
  END IF;
END $$;