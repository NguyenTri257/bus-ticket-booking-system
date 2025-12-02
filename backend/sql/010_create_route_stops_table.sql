DROP TABLE IF EXISTS route_stops CASCADE;

CREATE TABLE route_stops (
  stop_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES routes(route_id) ON DELETE CASCADE,
  
  stop_name VARCHAR(255) NOT NULL,
  sequence INTEGER NOT NULL,
  arrival_offset_minutes INTEGER DEFAULT 0,     -- phút đến điểm dừng so với giờ khởi hành
  departure_offset_minutes INTEGER DEFAULT 0,   -- phút rời điểm dừng so với giờ khởi hành
  address VARCHAR(255) DEFAULT '',              -- địa chỉ chi tiết điểm dừng (có thể để trống)
  
  is_pickup BOOLEAN DEFAULT TRUE,
  is_dropoff BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(route_id, sequence)
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_route_stops_updated_at
  BEFORE UPDATE ON route_stops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index tối ưu hiệu suất
CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX idx_route_stops_sequence ON route_stops(route_id, sequence);