from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ChurchBase(BaseModel):
    name: Optional[str] = None
    denomination: Optional[str] = None
    religion: Optional[str] = None
    amenity: Optional[str] = None
    building: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None

class ChurchCreate(ChurchBase):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    osm_id: Optional[int] = None

class ChurchUpdate(ChurchBase):
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

class ChurchInDB(ChurchBase):
    id: int
    osm_id: Optional[int] = None
    latitude: float
    longitude: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChurchSearch(BaseModel):
    query: str
    limit: Optional[int] = 50

class ProximitySearch(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    radius_km: float = Field(default=10, ge=0.1, le=100)
    limit: Optional[int] = 50
