-- Update existing seat layouts and create default for buses that don't have one
-- Create appropriate layouts based on bus model total_seats

-- First, delete existing layouts to recreate them properly
DELETE FROM seat_layouts;

-- Hyundai Universe 45 seated (45 seats)
INSERT INTO seat_layouts (bus_id, layout_json)
SELECT b.bus_id,
'{
  "type": "standard",
  "floors": 1,
  "rows": [
    {"row": 1, "seats": ["VIP1A","VIP1B",null,"VIP1C","VIP1D"]},
    {"row": 2, "seats": ["VIP2A","VIP2B",null,"VIP2C","VIP2D"]},
    {"row": 3, "seats": ["1A","1B",null,"1C","1D"]},
    {"row": 4, "seats": ["2A","2B",null,"2C","2D"]},
    {"row": 5, "seats": ["3A","3B",null,"3C","3D"]},
    {"row": 6, "seats": ["4A","4B",null,"4C","4D"]},
    {"row": 7, "seats": ["5A","5B",null,"5C","5D"]},
    {"row": 8, "seats": ["6A","6B",null,"6C","6D"]},
    {"row": 9, "seats": ["7A","7B",null,"7C","7D"]},
    {"row": 10, "seats": ["8A","8B",null,"8C","8D"]},
    {"row": 11, "seats": ["9A","9B",null,"9C","9D"]},
    {"row": 12, "seats": ["10A"]}
  ]
}'::jsonb
FROM buses b
JOIN bus_models bm ON b.bus_model_id = bm.bus_model_id
WHERE bm.name = 'Hyundai Universe 45 seated';

-- Tracomeco Highlander 38 sleepers (38 seats)
INSERT INTO seat_layouts (bus_id, layout_json)
SELECT b.bus_id,
'{
  "type": "sleeper",
  "floors": 1,
  "rows": [
    {"row": 1, "seats": ["1A","1B"]},
    {"row": 2, "seats": ["2A","2B"]},
    {"row": 3, "seats": ["3A","3B"]},
    {"row": 4, "seats": ["4A","4B"]},
    {"row": 5, "seats": ["5A","5B"]},
    {"row": 6, "seats": ["6A","6B"]},
    {"row": 7, "seats": ["7A","7B"]},
    {"row": 8, "seats": ["8A","8B"]},
    {"row": 9, "seats": ["9A","9B"]},
    {"row": 10, "seats": ["10A","10B"]},
    {"row": 11, "seats": ["11A","11B"]},
    {"row": 12, "seats": ["12A","12B"]},
    {"row": 13, "seats": ["13A","13B"]},
    {"row": 14, "seats": ["14A","14B"]},
    {"row": 15, "seats": ["15A","15B"]},
    {"row": 16, "seats": ["16A","16B"]},
    {"row": 17, "seats": ["17A","17B"]},
    {"row": 18, "seats": ["18A","18B"]},
    {"row": 19, "seats": ["19A","19B"]}
  ]
}'::jsonb
FROM buses b
JOIN bus_models bm ON b.bus_model_id = bm.bus_model_id
WHERE bm.name = 'Tracomeco Highlander 38 sleepers';

-- Fuso Rosa 22 seated (22 seats)
INSERT INTO seat_layouts (bus_id, layout_json)
SELECT b.bus_id,
'{
  "type": "standard",
  "floors": 1,
  "rows": [
    {"row": 1, "seats": ["VIP1A","VIP1B",null,"VIP1C","VIP1D"]},
    {"row": 2, "seats": ["1A","1B",null,"1C","1D"]},
    {"row": 3, "seats": ["2A","2B",null,"2C","2D"]},
    {"row": 4, "seats": ["3A","3B",null,"3C","3D"]},
    {"row": 5, "seats": ["4A","4B",null,"4C","4D"]},
    {"row": 6, "seats": ["5A","5B"]}
  ]
}'::jsonb
FROM buses b
JOIN bus_models bm ON b.bus_model_id = bm.bus_model_id
WHERE bm.name = 'Fuso Rosa 22 seated';

-- Volvo 50 seated (50 seats)
INSERT INTO seat_layouts (bus_id, layout_json)
SELECT b.bus_id,
'{
  "type": "standard",
  "floors": 1,
  "rows": [
    {"row": 1, "seats": ["VIP1A","VIP1B",null,"VIP1C","VIP1D"]},
    {"row": 2, "seats": ["VIP2A","VIP2B",null,"VIP2C","VIP2D"]},
    {"row": 3, "seats": ["VIP3A","VIP3B",null,"VIP3C","VIP3D"]},
    {"row": 4, "seats": ["1A","1B",null,"1C","1D"]},
    {"row": 5, "seats": ["2A","2B",null,"2C","2D"]},
    {"row": 6, "seats": ["3A","3B",null,"3C","3D"]},
    {"row": 7, "seats": ["4A","4B",null,"4C","4D"]},
    {"row": 8, "seats": ["5A","5B",null,"5C","5D"]},
    {"row": 9, "seats": ["6A","6B",null,"6C","6D"]},
    {"row": 10, "seats": ["7A","7B",null,"7C","7D"]},
    {"row": 11, "seats": ["8A","8B",null,"8C","8D"]},
    {"row": 12, "seats": ["9A","9B",null,"9C","9D"]},
    {"row": 13, "seats": ["10A","10B"]}
  ]
}'::jsonb
FROM buses b
JOIN bus_models bm ON b.bus_model_id = bm.bus_model_id
WHERE bm.name = 'Volvo 50 seated';

-- Samco Isuzu Limousine 29 seats (29 seats)
INSERT INTO seat_layouts (bus_id, layout_json)
SELECT b.bus_id,
'{
  "type": "limousine",
  "floors": 1,
  "rows": [
    {"row": 1, "seats": ["VIP1A","VIP1B",null,"VIP1C","VIP1D"]},
    {"row": 2, "seats": ["VIP2A","VIP2B",null,"VIP2C","VIP2D"]},
    {"row": 3, "seats": ["1A","1B",null,"1C","1D"]},
    {"row": 4, "seats": ["2A","2B",null,"2C","2D"]},
    {"row": 5, "seats": ["3A","3B",null,"3C","3D"]},
    {"row": 6, "seats": ["4A","4B",null,"4C","4D"]},
    {"row": 7, "seats": ["5A","5B",null,"5C","5D"]},
    {"row": 8, "seats": ["6A"]}
  ]
}'::jsonb
FROM buses b
JOIN bus_models bm ON b.bus_model_id = bm.bus_model_id
WHERE bm.name = 'Samco Isuzu Limousine 29 seats';

-- Mercedes Sprinter 16 seats (16 seats)
INSERT INTO seat_layouts (bus_id, layout_json)
SELECT b.bus_id,
'{
  "type": "standard",
  "floors": 1,
  "rows": [
    {"row": 1, "seats": ["VIP1A","VIP1B",null,"VIP1C","VIP1D"]},
    {"row": 2, "seats": ["1A","1B",null,"1C","1D"]},
    {"row": 3, "seats": ["2A","2B",null,"2C","2D"]},
    {"row": 4, "seats": ["3A","3B",null,"3C","3D"]}
  ]
}'::jsonb
FROM buses b
JOIN bus_models bm ON b.bus_model_id = bm.bus_model_id
WHERE bm.name = 'Mercedes Sprinter 16 seats';