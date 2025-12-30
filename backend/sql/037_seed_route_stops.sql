-- SQL to seed route_stops for existing routes that have trips
-- This ensures all trips have meaningful route stops with proper offset times

-- First, insert route_stops for Ho Chi Minh City to Hanoi route (1700km, 1800 minutes)
-- Stops: Ho Chi Minh City (0 min), Da Nang (600 min), Hue (720 min), Hanoi (1800 min)

INSERT INTO route_stops (route_id, sequence, stop_name, address, arrival_offset_minutes)
SELECT
  r.route_id,
  unnest(ARRAY[1, 2, 3, 4]) as sequence,
  unnest(ARRAY['Ho Chi Minh City', 'Da Nang', 'Hue', 'Hanoi']) as stop_name,
  unnest(ARRAY[
    'Ben Xe Mien Dong, Ho Chi Minh City',
    'Ben Xe Da Nang, Da Nang',
    'Ben Xe Hue, Hue',
    'Ben Xe Giap Bat, Hanoi'
  ]) as address,
  unnest(ARRAY[0, 600, 720, 1800]) as arrival_offset_minutes
FROM routes r
WHERE r.origin = 'Ho Chi Minh City'
  AND r.destination = 'Hanoi'
  AND r.distance_km = 1700
  AND NOT EXISTS (
    SELECT 1 FROM route_stops rs WHERE rs.route_id = r.route_id
  );

-- Insert route_stops for Ho Chi Minh City to Da Nang route (900km, 900 minutes)
-- Stops: Ho Chi Minh City (0 min), Nha Trang (300 min), Da Nang (900 min)

INSERT INTO route_stops (route_id, sequence, stop_name, address, arrival_offset_minutes)
SELECT
  r.route_id,
  unnest(ARRAY[1, 2, 3]) as sequence,
  unnest(ARRAY['Ho Chi Minh City', 'Nha Trang', 'Da Nang']) as stop_name,
  unnest(ARRAY[
    'Ben Xe Mien Dong, Ho Chi Minh City',
    'Ben Xe Nha Trang, Nha Trang',
    'Ben Xe Da Nang, Da Nang'
  ]) as address,
  unnest(ARRAY[0, 300, 900]) as arrival_offset_minutes
FROM routes r
WHERE r.origin = 'Ho Chi Minh City'
  AND r.destination = 'Da Nang'
  AND r.distance_km = 900
  AND NOT EXISTS (
    SELECT 1 FROM route_stops rs WHERE rs.route_id = r.route_id
  );

-- Insert route_stops for other common routes if they exist
-- Ho Chi Minh City to Can Tho (200km, 240 minutes)

INSERT INTO route_stops (route_id, sequence, stop_name, address, arrival_offset_minutes)
SELECT
  r.route_id,
  unnest(ARRAY[1, 2]) as sequence,
  unnest(ARRAY['Ho Chi Minh City', 'Can Tho']) as stop_name,
  unnest(ARRAY[
    'Ben Xe Mien Tay, Ho Chi Minh City',
    'Ben Xe Can Tho, Can Tho'
  ]) as address,
  unnest(ARRAY[0, 240]) as arrival_offset_minutes
FROM routes r
WHERE r.origin = 'Ho Chi Minh City'
  AND r.destination = 'Can Tho'
  AND NOT EXISTS (
    SELECT 1 FROM route_stops rs WHERE rs.route_id = r.route_id
  );

-- Hanoi to Hai Phong (100km, 120 minutes)

INSERT INTO route_stops (route_id, sequence, stop_name, address, arrival_offset_minutes)
SELECT
  r.route_id,
  unnest(ARRAY[1, 2]) as sequence,
  unnest(ARRAY['Hanoi', 'Hai Phong']) as stop_name,
  unnest(ARRAY[
    'Ben Xe Giap Bat, Hanoi',
    'Ben Xe Hai Phong, Hai Phong'
  ]) as address,
  unnest(ARRAY[0, 120]) as arrival_offset_minutes
FROM routes r
WHERE r.origin = 'Hanoi'
  AND r.destination = 'Hai Phong'
  AND NOT EXISTS (
    SELECT 1 FROM route_stops rs WHERE rs.route_id = r.route_id
  );

-- Da Nang to Hue (80km, 90 minutes)

INSERT INTO route_stops (route_id, sequence, stop_name, address, arrival_offset_minutes)
SELECT
  r.route_id,
  unnest(ARRAY[1, 2]) as sequence,
  unnest(ARRAY['Da Nang', 'Hue']) as stop_name,
  unnest(ARRAY[
    'Ben Xe Da Nang, Da Nang',
    'Ben Xe Hue, Hue'
  ]) as address,
  unnest(ARRAY[0, 90]) as arrival_offset_minutes
FROM routes r
WHERE r.origin = 'Da Nang'
  AND r.destination = 'Hue'
  AND NOT EXISTS (
    SELECT 1 FROM route_stops rs WHERE rs.route_id = r.route_id
  );

-- Insert route_stops for Da Nang to Ho Chi Minh City route (964km, 900 minutes)
-- Stops: Da Nang (0 min), Nha Trang (600 min), Ho Chi Minh City (900 min)

INSERT INTO route_stops (route_id, sequence, stop_name, address, arrival_offset_minutes)
SELECT
  r.route_id,
  unnest(ARRAY[1, 2, 3]) as sequence,
  unnest(ARRAY['Da Nang', 'Nha Trang', 'Ho Chi Minh City']) as stop_name,
  unnest(ARRAY[
    'Ben Xe Da Nang, Da Nang',
    'Ben Xe Nha Trang, Nha Trang',
    'Ben Xe Mien Dong, Ho Chi Minh City'
  ]) as address,
  unnest(ARRAY[0, 600, 900]) as arrival_offset_minutes
FROM routes r
WHERE r.origin = 'Da Nang'
  AND r.destination = 'Ho Chi Minh City'
  AND r.distance_km = 964
  AND NOT EXISTS (
    SELECT 1 FROM route_stops rs WHERE rs.route_id = r.route_id
  );

-- Verify the inserted data
SELECT
  r.origin,
  r.destination,
  r.distance_km,
  r.estimated_minutes,
  COUNT(rs.stop_id) as stops_count,
  STRING_AGG(rs.stop_name || ' (' || rs.arrival_offset_minutes || ' min)', ', ' ORDER BY rs.sequence) as stops
FROM routes r
LEFT JOIN route_stops rs ON r.route_id = rs.route_id
WHERE EXISTS (SELECT 1 FROM trips t WHERE t.route_id = r.route_id)
GROUP BY r.route_id, r.origin, r.destination, r.distance_km, r.estimated_minutes
ORDER BY r.origin, r.destination;