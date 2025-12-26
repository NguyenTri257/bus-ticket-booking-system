-- Migration: Remove departure_offset_minutes from route_stops table
-- Since route stops only need arrival offset, not departure offset

-- First, check if the column exists and drop it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'route_stops'
    AND column_name = 'departure_offset_minutes'
  ) THEN
    ALTER TABLE route_stops DROP COLUMN departure_offset_minutes;
  END IF;
END $$;