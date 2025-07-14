-- Migration: Create auth_users table for Gmail OAuth
-- This table stores information about authenticated users
-- Only gurukrpasharma@gmail.com is allowed to access the system

CREATE TABLE IF NOT EXISTS auth_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    is_active BOOLEAN DEFAULT true,
    login_count INTEGER DEFAULT 1
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);
CREATE INDEX IF NOT EXISTS idx_auth_users_last_login ON auth_users(last_login);

-- Add Row Level Security (RLS)
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow gurukrpasharma@gmail.com to access their own data
CREATE POLICY "Users can only access their own data" ON auth_users
    FOR ALL USING (
        email = 'gurukrpasharma@gmail.com' AND 
        auth.jwt() ->> 'email' = 'gurukrpasharma@gmail.com'
    );

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_auth_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at field
CREATE TRIGGER update_auth_users_updated_at
    BEFORE UPDATE ON auth_users
    FOR EACH ROW
    EXECUTE FUNCTION update_auth_users_updated_at();

-- Function to increment login count
CREATE OR REPLACE FUNCTION increment_login_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.last_login != NEW.last_login THEN
        NEW.login_count = COALESCE(OLD.login_count, 0) + 1;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to increment login count when last_login is updated
CREATE TRIGGER increment_login_count_trigger
    BEFORE UPDATE ON auth_users
    FOR EACH ROW
    EXECUTE FUNCTION increment_login_count();

-- Insert comment for documentation
COMMENT ON TABLE auth_users IS 'Stores authenticated user information for Gmail OAuth. Only gurukrpasharma@gmail.com is authorized.';
COMMENT ON COLUMN auth_users.email IS 'User email address from Gmail OAuth';
COMMENT ON COLUMN auth_users.name IS 'User full name from Gmail profile';
COMMENT ON COLUMN auth_users.avatar_url IS 'Profile picture URL from Gmail';
COMMENT ON COLUMN auth_users.login_count IS 'Number of times user has logged in';
COMMENT ON COLUMN auth_users.is_active IS 'Whether the user account is active';
