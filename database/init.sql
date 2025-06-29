-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create churches table
CREATE TABLE IF NOT EXISTS churches (
    id SERIAL PRIMARY KEY,
    osm_id BIGINT UNIQUE,
    name VARCHAR(255),
    denomination VARCHAR(100),
    religion VARCHAR(50),
    amenity VARCHAR(50),
    building VARCHAR(50),
    location GEOMETRY(POINT, 4326) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index for efficient proximity searches
CREATE INDEX IF NOT EXISTS idx_churches_location ON churches USING GIST (location);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_churches_updated_at BEFORE UPDATE
    ON churches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
