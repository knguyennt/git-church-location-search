from sqlalchemy.orm import Session
from sqlalchemy import func, text
from geoalchemy2 import functions as geo_func
from geoalchemy2.elements import WKTElement
from database import Church
from schemas import ChurchCreate, ChurchUpdate
from typing import List, Optional

def get_church(db: Session, church_id: int):
    return db.query(Church).filter(Church.id == church_id).first()

def get_churches(db: Session, skip: int = 0, limit: int = 100):
    churches = db.query(
        Church.id,
        Church.osm_id,
        Church.name,
        Church.denomination,
        Church.religion,
        Church.amenity,
        Church.building,
        Church.address,
        Church.phone,
        Church.website,
        Church.description,
        Church.created_at,
        Church.updated_at,
        func.ST_X(Church.location).label('longitude'),
        func.ST_Y(Church.location).label('latitude')
    ).offset(skip).limit(limit).all()
    
    return [
        {
            'id': church.id,
            'osm_id': church.osm_id,
            'name': church.name,
            'denomination': church.denomination,
            'religion': church.religion,
            'amenity': church.amenity,
            'building': church.building,
            'address': church.address,
            'phone': church.phone,
            'website': church.website,
            'description': church.description,
            'latitude': float(church.latitude) if church.latitude else None,
            'longitude': float(church.longitude) if church.longitude else None,
            'created_at': church.created_at,
            'updated_at': church.updated_at
        }
        for church in churches
    ]

def create_church(db: Session, church: ChurchCreate):
    point = WKTElement(f'POINT({church.longitude} {church.latitude})', srid=4326)
    
    db_church = Church(
        osm_id=church.osm_id,
        name=church.name,
        denomination=church.denomination,
        religion=church.religion,
        amenity=church.amenity,
        building=church.building,
        location=point,
        address=church.address,
        phone=church.phone,
        website=church.website,
        description=church.description
    )
    db.add(db_church)
    db.commit()
    db.refresh(db_church)
    
    # Return with coordinates
    result = db.query(
        Church.id,
        Church.osm_id,
        Church.name,
        Church.denomination,
        Church.religion,
        Church.amenity,
        Church.building,
        Church.address,
        Church.phone,
        Church.website,
        Church.description,
        Church.created_at,
        Church.updated_at,
        func.ST_X(Church.location).label('longitude'),
        func.ST_Y(Church.location).label('latitude')
    ).filter(Church.id == db_church.id).first()
    
    return {
        'id': result.id,
        'osm_id': result.osm_id,
        'name': result.name,
        'denomination': result.denomination,
        'religion': result.religion,
        'amenity': result.amenity,
        'building': result.building,
        'address': result.address,
        'phone': result.phone,
        'website': result.website,
        'description': result.description,
        'latitude': float(result.latitude) if result.latitude else None,
        'longitude': float(result.longitude) if result.longitude else None,
        'created_at': result.created_at,
        'updated_at': result.updated_at
    }

def update_church(db: Session, church_id: int, church_update: ChurchUpdate):
    db_church = db.query(Church).filter(Church.id == church_id).first()
    if not db_church:
        return None
    
    update_data = church_update.dict(exclude_unset=True)
    
    # Handle location update
    if 'latitude' in update_data and 'longitude' in update_data:
        point = WKTElement(f'POINT({update_data["longitude"]} {update_data["latitude"]})', srid=4326)
        db_church.location = point
        del update_data['latitude']
        del update_data['longitude']
    elif 'latitude' in update_data or 'longitude' in update_data:
        # If only one coordinate is provided, we need both
        current = db.query(
            func.ST_X(Church.location).label('longitude'),
            func.ST_Y(Church.location).label('latitude')
        ).filter(Church.id == church_id).first()
        
        lat = update_data.get('latitude', float(current.latitude))
        lng = update_data.get('longitude', float(current.longitude))
        point = WKTElement(f'POINT({lng} {lat})', srid=4326)
        db_church.location = point
        
        if 'latitude' in update_data:
            del update_data['latitude']
        if 'longitude' in update_data:
            del update_data['longitude']
    
    # Update other fields
    for field, value in update_data.items():
        setattr(db_church, field, value)
    
    db.commit()
    db.refresh(db_church)
    
    # Return with coordinates
    result = db.query(
        Church.id,
        Church.osm_id,
        Church.name,
        Church.denomination,
        Church.religion,
        Church.amenity,
        Church.building,
        Church.address,
        Church.phone,
        Church.website,
        Church.description,
        Church.created_at,
        Church.updated_at,
        func.ST_X(Church.location).label('longitude'),
        func.ST_Y(Church.location).label('latitude')
    ).filter(Church.id == church_id).first()
    
    return {
        'id': result.id,
        'osm_id': result.osm_id,
        'name': result.name,
        'denomination': result.denomination,
        'religion': result.religion,
        'amenity': result.amenity,
        'building': result.building,
        'address': result.address,
        'phone': result.phone,
        'website': result.website,
        'description': result.description,
        'latitude': float(result.latitude) if result.latitude else None,
        'longitude': float(result.longitude) if result.longitude else None,
        'created_at': result.created_at,
        'updated_at': result.updated_at
    }

def delete_church(db: Session, church_id: int):
    db_church = db.query(Church).filter(Church.id == church_id).first()
    if db_church:
        db.delete(db_church)
        db.commit()
        return True
    return False

def search_churches(db: Session, query: str, limit: int = 50):
    churches = db.query(
        Church.id,
        Church.osm_id,
        Church.name,
        Church.denomination,
        Church.religion,
        Church.amenity,
        Church.building,
        Church.address,
        Church.phone,
        Church.website,
        Church.description,
        Church.created_at,
        Church.updated_at,
        func.ST_X(Church.location).label('longitude'),
        func.ST_Y(Church.location).label('latitude')
    ).filter(
        Church.name.ilike(f'%{query}%') |
        Church.denomination.ilike(f'%{query}%') |
        Church.address.ilike(f'%{query}%')
    ).limit(limit).all()
    
    return [
        {
            'id': church.id,
            'osm_id': church.osm_id,
            'name': church.name,
            'denomination': church.denomination,
            'religion': church.religion,
            'amenity': church.amenity,
            'building': church.building,
            'address': church.address,
            'phone': church.phone,
            'website': church.website,
            'description': church.description,
            'latitude': float(church.latitude) if church.latitude else None,
            'longitude': float(church.longitude) if church.longitude else None,
            'created_at': church.created_at,
            'updated_at': church.updated_at
        }
        for church in churches
    ]

def find_nearby_churches(db: Session, latitude: float, longitude: float, radius_km: float = 10, limit: int = 50):
    point = WKTElement(f'POINT({longitude} {latitude})', srid=4326)
    
    churches = db.query(
        Church.id,
        Church.osm_id,
        Church.name,
        Church.denomination,
        Church.religion,
        Church.amenity,
        Church.building,
        Church.address,
        Church.phone,
        Church.website,
        Church.description,
        Church.created_at,
        Church.updated_at,
        func.ST_X(Church.location).label('longitude'),
        func.ST_Y(Church.location).label('latitude'),
        func.ST_Distance(
            func.ST_Transform(Church.location, 3857),
            func.ST_Transform(point, 3857)
        ).label('distance')
    ).filter(
        func.ST_DWithin(
            func.ST_Transform(Church.location, 3857),
            func.ST_Transform(point, 3857),
            radius_km * 1000  # Convert km to meters
        )
    ).order_by(
        func.ST_Distance(
            func.ST_Transform(Church.location, 3857),
            func.ST_Transform(point, 3857)
        )
    ).limit(limit).all()
    
    return [
        {
            'id': church.id,
            'osm_id': church.osm_id,
            'name': church.name,
            'denomination': church.denomination,
            'religion': church.religion,
            'amenity': church.amenity,
            'building': church.building,
            'address': church.address,
            'phone': church.phone,
            'website': church.website,
            'description': church.description,
            'latitude': float(church.latitude) if church.latitude else None,
            'longitude': float(church.longitude) if church.longitude else None,
            'distance_meters': float(church.distance) if church.distance else None,
            'created_at': church.created_at,
            'updated_at': church.updated_at
        }
        for church in churches
    ]
