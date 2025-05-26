-- Smart Redirect System Database Initialization for GCP
-- This script creates the database schema for the redirect system

-- Create the database (if not exists)
-- Note: This might need to be run separately depending on your GCP setup
-- CREATE DATABASE temp_redirect;

-- Connect to the database
\c temp_redirect;

-- Create the redirects table
CREATE TABLE IF NOT EXISTS redirects (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    first_url TEXT NOT NULL,
    next_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the redirect_visits table
CREATE TABLE IF NOT EXISTS redirect_visits (
    id TEXT PRIMARY KEY,
    slug_id TEXT NOT NULL,
    visitor_ip TEXT NOT NULL,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (slug_id) REFERENCES redirects(id) ON DELETE CASCADE
);

-- Create unique constraint for slug_id and visitor_ip combination
CREATE UNIQUE INDEX IF NOT EXISTS redirect_visits_slug_visitor_unique 
ON redirect_visits(slug_id, visitor_ip);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_redirects_slug ON redirects(slug);
CREATE INDEX IF NOT EXISTS idx_redirects_created_at ON redirects(created_at);
CREATE INDEX IF NOT EXISTS idx_redirect_visits_slug_id ON redirect_visits(slug_id);
CREATE INDEX IF NOT EXISTS idx_redirect_visits_visited_at ON redirect_visits(visited_at);

-- Create a user for the application (optional - adjust as needed)
-- CREATE USER redirect_app WITH PASSWORD 'your_secure_password_here';
-- GRANT CONNECT ON DATABASE temp_redirect TO redirect_app;
-- GRANT USAGE ON SCHEMA public TO redirect_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO redirect_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO redirect_app;

-- Display table information
\dt

-- Show the created tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('redirects', 'redirect_visits')
ORDER BY table_name, ordinal_position; 