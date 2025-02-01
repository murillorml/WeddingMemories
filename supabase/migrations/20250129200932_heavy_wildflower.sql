-- Function to check if a table exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = table_name
  );
END;
$$;

-- Function to create migrations table
CREATE OR REPLACE FUNCTION create_migrations_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS _migrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    applied_at timestamptz DEFAULT now()
  );
  
  -- Enable RLS
  ALTER TABLE _migrations ENABLE ROW LEVEL SECURITY;
  
  -- Create policies
  CREATE POLICY "Migrations are viewable by everyone" 
    ON _migrations FOR SELECT 
    TO public 
    USING (true);
    
  CREATE POLICY "Migrations can be created by authenticated users" 
    ON _migrations FOR INSERT 
    TO authenticated 
    WITH CHECK (true);
END;
$$;

-- Function to apply a migration
CREATE OR REPLACE FUNCTION apply_migration(migration_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Execute the migration file
  -- Note: The actual SQL from the migration files needs to be executed manually
  -- This function is just a placeholder for tracking purposes
  NULL;
END;
$$;