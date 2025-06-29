-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create metabase database for Metabase's internal data
CREATE DATABASE metabase;

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

-- Create useful views for Metabase analytics

-- View 1: Churches with coordinates as separate columns
CREATE OR REPLACE VIEW churches_analytics AS
SELECT 
    id,
    osm_id,
    name,
    denomination,
    religion,
    amenity,
    building,
    address,
    phone,
    website,
    description,
    ST_X(location) as longitude,
    ST_Y(location) as latitude,
    created_at,
    updated_at
FROM churches;

-- View 2: Denomination statistics
CREATE OR REPLACE VIEW denomination_stats AS
SELECT 
    COALESCE(denomination, 'Unknown') as denomination,
    COUNT(*) as church_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM churches 
GROUP BY denomination
ORDER BY church_count DESC;

-- View 3: Churches by region (based on coordinates)
CREATE OR REPLACE VIEW churches_by_region AS
SELECT 
    CASE 
        WHEN ST_Y(location) >= 22 THEN 'North Vietnam'
        WHEN ST_Y(location) >= 16 THEN 'Central Vietnam'
        ELSE 'South Vietnam'
    END as region,
    COUNT(*) as church_count,
    ROUND(AVG(ST_X(location)), 4) as avg_longitude,
    ROUND(AVG(ST_Y(location)), 4) as avg_latitude
FROM churches
GROUP BY 
    CASE 
        WHEN ST_Y(location) >= 22 THEN 'North Vietnam'
        WHEN ST_Y(location) >= 16 THEN 'Central Vietnam'
        ELSE 'South Vietnam'
    END
ORDER BY church_count DESC;

-- View 4: Churches with location names (for better mapping)
CREATE OR REPLACE VIEW churches_with_location AS
SELECT 
    c.*,
    ST_X(c.location) as longitude,
    ST_Y(c.location) as latitude,
    CASE 
        WHEN ST_Y(c.location) >= 22 THEN 'North Vietnam'
        WHEN ST_Y(c.location) >= 16 THEN 'Central Vietnam'
        ELSE 'South Vietnam'
    END as region,
    CASE 
        WHEN c.name IS NOT NULL AND c.name != '' THEN c.name
        ELSE 'Unnamed Church #' || c.id
    END as display_name
FROM churches c;

-- View 5: Monthly church additions (for growth tracking)
CREATE OR REPLACE VIEW church_additions_by_month AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as churches_added,
    STRING_AGG(DISTINCT denomination, ', ' ORDER BY denomination) as denominations_added
FROM churches 
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- View 6: Distance analysis (churches density by area)
CREATE OR REPLACE VIEW church_density_analysis AS
WITH church_pairs AS (
    SELECT 
        c1.id as church1_id,
        c1.name as church1_name,
        c2.id as church2_id,
        c2.name as church2_name,
        ST_Distance(
            ST_Transform(c1.location, 3857),
            ST_Transform(c2.location, 3857)
        ) / 1000.0 as distance_km
    FROM churches c1
    CROSS JOIN churches c2
    WHERE c1.id < c2.id
    AND ST_DWithin(
        ST_Transform(c1.location, 3857),
        ST_Transform(c2.location, 3857),
        50000  -- 50km
    )
)
SELECT 
    ROUND(distance_km, 1) as distance_range_km,
    COUNT(*) as church_pairs_count
FROM church_pairs
GROUP BY ROUND(distance_km, 1)
ORDER BY distance_range_km;
