import os
import random
from fastapi import UploadFile
from sqlalchemy.orm import Session

from models.document import Document
from models.schemas.document import DocumentCreate, AnalysisResponse, InsightResponse

# Simulated storage directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def create_document(db: Session, document: DocumentCreate, file: UploadFile = None):
    # Handle file upload if provided
    file_path = None
    if file:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    
    # Create database record
    db_document = Document(
        filename=document.filename,
        url=document.url,
        file_path=file_path,
        description=document.description,
        user_id=document.user_id
    )
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def get_document(db: Session, document_id: int):
    return db.query(Document).filter(Document.id == document_id).first()

def get_all_documents(db: Session, user_id: int):
    return db.query(Document).filter(Document.user_id == user_id).all()

def analyze_document(db: Session, document_id: int, user_id: int):
    document = get_document(db, document_id)
    if not document or document.user_id != user_id:
        return None
    
    # Mock analysis generation
    document_type = random.choice(["Invoice", "Contract", "Report", "Receipt"])
    fraud_detected = random.random() < 0.1  # 10% chance of fraud
    
    return AnalysisResponse(
        document_id=document.id,
        document_type=document_type,
        confidence=round(random.uniform(0.7, 0.99), 2),
        extracted_text="Sample extracted text from document...",
        fraud_detected=fraud_detected,
        analysis_date="2023-10-01"
    )

def generate_insights(db: Session, document_id: int, user_id: int):
    document = get_document(db, document_id)
    if not document or document.user_id != user_id:
        return None
    
    # Mock insights generation
    insights = [
        "This document shows payment terms of NET 30.",
        "Invoice amount is 15% higher than average for this vendor.",
        "Similar documents were processed 3 times in the last month."
    ]
    
    return InsightResponse(
        document_id=document.id,
        insights=insights,
        summary="This appears to be a standard invoice with normal payment terms.",
        risk_score=round(random.uniform(0, 100), 1)
    ) 