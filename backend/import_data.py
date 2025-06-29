import json
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from geoalchemy2.elements import WKTElement
from database import Church, Base

def load_data_from_json(json_file_path: str, database_url: str):
    """Load church data from JSON file into the database"""
    
    # Create database connection
    engine = create_engine(database_url)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Load JSON data
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'elements' not in data:
            print("No 'elements' key found in JSON data")
            return
        
        churches_added = 0
        churches_skipped = 0
        
        for element in data['elements']:
            if element.get('type') != 'node':
                continue
                
            tags = element.get('tags', {})
            
            # Skip if not a place of worship or not Christian
            if (tags.get('amenity') != 'place_of_worship' or 
                tags.get('religion') != 'christian'):
                continue
            
            lat = element.get('lat')
            lon = element.get('lon')
            osm_id = element.get('id')
            
            if lat is None or lon is None:
                churches_skipped += 1
                continue
            
            # Check if church already exists
            existing = db.query(Church).filter(Church.osm_id == osm_id).first()
            if existing:
                churches_skipped += 1
                continue
            
            # Create point geometry
            point = WKTElement(f'POINT({lon} {lat})', srid=4326)
            
            # Create church record
            church = Church(
                osm_id=osm_id,
                name=tags.get('name'),
                denomination=tags.get('denomination'),
                religion=tags.get('religion'),
                amenity=tags.get('amenity'),
                building=tags.get('building'),
                location=point,
                address=tags.get('addr:full') or tags.get('addr:street'),
                phone=tags.get('phone'),
                website=tags.get('website'),
                description=tags.get('description')
            )
            
            db.add(church)
            churches_added += 1
            
            # Commit in batches
            if churches_added % 100 == 0:
                db.commit()
                print(f"Added {churches_added} churches...")
        
        # Final commit
        db.commit()
        print(f"\nData import completed!")
        print(f"Churches added: {churches_added}")
        print(f"Churches skipped: {churches_skipped}")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/church_locator")
    json_file = "data.json"  # Look for data.json in current directory
    
    if len(sys.argv) > 1:
        json_file = sys.argv[1]
    
    if not os.path.exists(json_file):
        print(f"JSON file not found: {json_file}")
        sys.exit(1)
    
    print(f"Loading data from {json_file} into database...")
    load_data_from_json(json_file, database_url)
