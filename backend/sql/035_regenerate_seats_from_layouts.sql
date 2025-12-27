-- Delete all existing seats first
DELETE FROM seats;

-- Generate seats based on layout_json from seat_layouts table
INSERT INTO seats (bus_id, seat_code, seat_type, position, price, row_num, col_num, is_active)
SELECT
  b.bus_id,
  CASE
    WHEN jsonb_typeof(seat_element.value) = 'string' THEN seat_element.value #>> '{}'
    WHEN jsonb_typeof(seat_element.value) = 'object' THEN seat_element.value ->> 'code'
    ELSE seat_element.value #>> '{}'
  END as seat_code,
  CASE
    WHEN jsonb_typeof(seat_element.value) = 'string' AND seat_element.value #>> '{}' LIKE 'VIP%' THEN 'vip'
    WHEN jsonb_typeof(seat_element.value) = 'string' AND seat_element.value #>> '{}' LIKE 'H%A' THEN 'vip'
    WHEN jsonb_typeof(seat_element.value) = 'string' AND seat_element.value #>> '{}' LIKE 'H%B' THEN 'vip'
    WHEN jsonb_typeof(seat_element.value) = 'object' AND seat_element.value ->> 'code' LIKE 'VIP%' THEN 'vip'
    WHEN jsonb_typeof(seat_element.value) = 'object' AND seat_element.value ->> 'code' LIKE 'H%A' THEN 'vip'
    WHEN jsonb_typeof(seat_element.value) = 'object' AND seat_element.value ->> 'code' LIKE 'H%B' THEN 'vip'
    ELSE 'standard'
  END as seat_type,
  CASE
    WHEN jsonb_typeof(seat_element.value) = 'string' AND seat_element.value #>> '{}' ~ 'A$' THEN 'window'
    WHEN jsonb_typeof(seat_element.value) = 'object' AND seat_element.value ->> 'code' ~ 'A$' THEN 'window'
    ELSE 'aisle'
  END as position,
  CASE
    WHEN jsonb_typeof(seat_element.value) = 'string' THEN
      CASE
        WHEN seat_element.value #>> '{}' LIKE 'VIP%' THEN 50000
        WHEN seat_element.value #>> '{}' LIKE 'H%A' THEN 100000
        WHEN seat_element.value #>> '{}' LIKE 'H%B' THEN 100000
        ELSE 0
      END
    WHEN jsonb_typeof(seat_element.value) = 'object' THEN
      (seat_element.value ->> 'price')::numeric
    ELSE 0
  END as price,
  (row_data->>'row')::integer as row_num,
  seat_element.column_index as col_num,
  true as is_active
FROM buses b
JOIN seat_layouts sl ON b.bus_id = sl.bus_id
CROSS JOIN LATERAL jsonb_array_elements(sl.layout_json->'rows') as row_data
CROSS JOIN LATERAL jsonb_array_elements(row_data->'seats') WITH ORDINALITY as seat_element(value, column_index)
WHERE seat_element.value IS NOT NULL
  AND (
    (jsonb_typeof(seat_element.value) = 'string' AND seat_element.value #>> '{}' != 'null') OR
    (jsonb_typeof(seat_element.value) = 'object' AND seat_element.value ->> 'code' IS NOT NULL)
  )
ON CONFLICT (bus_id, seat_code) DO UPDATE SET
  seat_type = EXCLUDED.seat_type,
  position = EXCLUDED.position,
  price = EXCLUDED.price,
  row_num = EXCLUDED.row_num,
  col_num = EXCLUDED.col_num,
  is_active = EXCLUDED.is_active;

-- Update seat_capacity for all buses based on actual seats generated
UPDATE buses
SET seat_capacity = (
  SELECT COUNT(*) FROM seats
  WHERE bus_id = buses.bus_id AND is_active = true
);