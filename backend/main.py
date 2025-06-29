from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

import crud
import schemas
from database import get_db

app = FastAPI(title="Church Location Search API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Church Location Search API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/churches", response_model=List[schemas.ChurchInDB])
def get_churches(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    churches = crud.get_churches(db, skip=skip, limit=limit)
    return churches

@app.get("/churches/{church_id}", response_model=schemas.ChurchInDB)
def get_church(church_id: int, db: Session = Depends(get_db)):
    church = crud.get_church(db, church_id=church_id)
    if church is None:
        raise HTTPException(status_code=404, detail="Church not found")
    
    # Get coordinates for the response
    from sqlalchemy import func
    result = db.query(
        crud.Church.id,
        crud.Church.osm_id,
        crud.Church.name,
        crud.Church.denomination,
        crud.Church.religion,
        crud.Church.amenity,
        crud.Church.building,
        crud.Church.address,
        crud.Church.phone,
        crud.Church.website,
        crud.Church.description,
        crud.Church.created_at,
        crud.Church.updated_at,
        func.ST_X(crud.Church.location).label('longitude'),
        func.ST_Y(crud.Church.location).label('latitude')
    ).filter(crud.Church.id == church_id).first()
    
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

@app.post("/churches", response_model=schemas.ChurchInDB)
def create_church(church: schemas.ChurchCreate, db: Session = Depends(get_db)):
    return crud.create_church(db=db, church=church)

@app.put("/churches/{church_id}", response_model=schemas.ChurchInDB)
def update_church(
    church_id: int, 
    church_update: schemas.ChurchUpdate, 
    db: Session = Depends(get_db)
):
    church = crud.update_church(db, church_id=church_id, church_update=church_update)
    if church is None:
        raise HTTPException(status_code=404, detail="Church not found")
    return church

@app.delete("/churches/{church_id}")
def delete_church(church_id: int, db: Session = Depends(get_db)):
    success = crud.delete_church(db, church_id=church_id)
    if not success:
        raise HTTPException(status_code=404, detail="Church not found")
    return {"message": "Church deleted successfully"}

@app.get("/churches/search/text", response_model=List[schemas.ChurchInDB])
def search_churches(
    q: str = Query(..., description="Search query"),
    limit: int = Query(50, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    churches = crud.search_churches(db, query=q, limit=limit)
    return churches

@app.get("/churches/search/nearby", response_model=List[schemas.ChurchInDB])
def find_nearby_churches(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lng: float = Query(..., ge=-180, le=180, description="Longitude"),
    radius: float = Query(10, ge=0.1, le=100, description="Search radius in kilometers"),
    limit: int = Query(50, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    churches = crud.find_nearby_churches(
        db, 
        latitude=lat, 
        longitude=lng, 
        radius_km=radius, 
        limit=limit
    )
    return churches

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
