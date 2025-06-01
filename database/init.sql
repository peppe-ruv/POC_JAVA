-- This script initializes the database schema for the application.
--
-- To use this script, run it via psql:
-- psql -U your_username -d your_database_name -f /path/to/this/file/init.sql
--
-- Make sure to replace 'your_username' and 'your_database_name' with your actual
-- PostgreSQL username and database name.

-- Drop tables if they exist to ensure a clean setup (optional, use with caution)
-- DROP TABLE IF EXISTS c_number_data CASCADE;
-- DROP TABLE IF EXISTS assistance_requests CASCADE;

-- Table to store HMAC values and associated data payloads
CREATE TABLE IF NOT EXISTS c_number_data (
    id SERIAL PRIMARY KEY,
    hmac_value TEXT NOT NULL UNIQUE,
    data_payload JSONB NOT NULL
);

-- Index on hmac_value for faster lookups
CREATE INDEX IF NOT EXISTS idx_hmac_value ON c_number_data (hmac_value);

-- Table to store assistance requests from users
CREATE TABLE IF NOT EXISTS assistance_requests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    issue_description TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- You can add any other initial data or setup commands below if needed.
-- For example, inserting some default c_number_data:
/*
INSERT INTO c_number_data (hmac_value, data_payload) VALUES
('some_precalculated_hmac_hex_string_1', '{"field1": "value1", "field2": "value2"}'),
('some_precalculated_hmac_hex_string_2', '{"name": "Test User", "preference": "dark_mode"}');
*/

-- Grant permissions if necessary (example)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;

-- End of script
SELECT 'Database initialization script completed.' AS status;
