from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from geoalchemy2 import Geometry
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/church_locator")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Church(Base):
    __tablename__ = "churches"

    id = Column(Integer, primary_key=True, index=True)
    osm_id = Column(BigInteger, unique=True, index=True)
    name = Column(String(255), index=True)
    denomination = Column(String(100))
    religion = Column(String(50))
    amenity = Column(String(50))
    building = Column(String(50))
    location = Column(Geometry('POINT', srid=4326), nullable=False)
    address = Column(String(255))
    phone = Column(String(50))
    website = Column(String(255))
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
