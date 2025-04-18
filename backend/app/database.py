from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime

# Use environment variable for production or the connection string directly for development
DATABASE_URL = os.getenv("DATABASE_URL", 
    "postgresql://neondb_owner:npg_3AM4SWOZGJIL@ep-steep-unit-a45ly51a-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# User model for authentication
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
# Document model to store metadata
class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    file_path = Column(String)
    uploaded_by = Column(Integer)  # User ID
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    file_type = Column(String)  # PDF, JPG, etc.
    status = Column(String)  # Processed, Processing, Error
    size = Column(Integer)  # Size in bytes
    analysis_results = Column(Text)  # JSON string with analysis results

# Create tables in the database
def create_tables():
    Base.metadata.create_all(bind=engine)

# Database session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 