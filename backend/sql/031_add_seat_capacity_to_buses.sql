-- Add seat_capacity column to buses table
ALTER TABLE buses ADD COLUMN seat_capacity INTEGER DEFAULT 0;

-- Note: seat_capacity will be updated automatically when seats are regenerated from layouts
-- in the regenerateSeatsFromLayout function in busModelRepository.js

-- Add check constraint to ensure seat_capacity is not negative
ALTER TABLE buses ADD CONSTRAINT check_seat_capacity_not_negative CHECK (seat_capacity >= 0);