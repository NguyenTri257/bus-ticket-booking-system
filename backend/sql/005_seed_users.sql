-- Seed script: create test users
-- This script runs after the database schema is created
--
-- Test Users:
-- Admin: admin@bus-ticket.com / SecurePass123!
-- Passenger: passenger@bus-ticket.com / SecurePass123!
-- Google User: google.user@bus-ticket.com (OAuth login)

-- Insert admin user
INSERT INTO users (email, phone, password_hash, full_name, role, email_verified, created_at)
VALUES (
  'admin@bus-ticket.com',
  '+84123456789',
  '$2b$12$a6EZCCHIp2zmfSL0nwzxGOgZipwCKmoy/.KqTvrsMd3JTKMHJvqBG', -- password: SecurePass123!
  'System Administrator',
  'admin',
  true,
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert passenger user
INSERT INTO users (email, phone, password_hash, full_name, role, email_verified, created_at)
VALUES (
  'passenger@bus-ticket.com',
  '+84987654321',
  '$2b$12$a6EZCCHIp2zmfSL0nwzxGOgZipwCKmoy/.KqTvrsMd3JTKMHJvqBG', -- password: SecurePass123!
  'Test Passenger',
  'passenger',
  true,
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert passenger with Google OAuth
INSERT INTO users (email, phone, password_hash, full_name, role, google_id, email_verified, created_at)
VALUES (
  'google.user@bus-ticket.com',
  NULL,
  NULL, -- OAuth users don't need passwords
  'Google User',
  'passenger',
  'google_123456789',
  true,
  NOW()
) ON CONFLICT (email) DO NOTHING;