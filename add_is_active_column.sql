-- Add is_active column to specialties table
-- This allows admins to enable/disable categories from the dashboard.

ALTER TABLE specialties 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing rows to be active by default if they were somehow null
UPDATE specialties SET is_active = true WHERE is_active IS NULL;
