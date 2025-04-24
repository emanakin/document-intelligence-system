import os
import random
import uuid
from fastapi import UploadFile
from sqlalchemy.orm import Session
from botocore.exceptions import ClientError
from fastapi import HTTPException
from fastapi import status

from models.document import Document
from models.schemas.document import DocumentCreate, AnalysisResponse, InsightResponse
from core.aws import s3_client, S3_BUCKET_NAME, generate_presigned_url, upload_to_s3
from config import settings
from core.logging import setup_logger

# Create logger
doc_logger = setup_logger("document_service")

async def create_document(db: Session, document: DocumentCreate, file: UploadFile = None):
    doc_logger.info(f"Creating document: filename={document.filename if document else 'None'}, user_id={document.user_id}")
    
    # Handle file upload if provided
    s3_key = None
    content_type = None
    file_size = 0
    
    if file:
        try:
            # Read file content
            doc_logger.debug(f"Reading file content: {file.filename}, content_type={file.content_type}")
            content = await file.read()
            file_size = len(content)
            content_type = file.content_type
            
            # Generate unique S3 key using user_id and UUID
            file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
            random_id = uuid.uuid4().hex
            s3_key = f"user-files/{document.user_id}/{random_id}{file_extension}"
            
            doc_logger.info(f"Generated S3 key: {s3_key}")
            
            # Upload to S3 using our new function
            upload_successful = upload_to_s3(content, s3_key, content_type)
            
            if not upload_successful:
                doc_logger.error("S3 upload failed")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to upload file to storage"
                )
            
            # Create database record ONLY if S3 upload succeeds
            doc_logger.debug("Creating database record")
            db_document = Document(
                filename=document.filename,
                s3_key=s3_key,
                content_type=content_type,
                file_size=file_size,
                page_count=1,  # Default value
                status="uploaded",
                user_id=document.user_id
            )
            
            db.add(db_document)
            db.commit()
            db.refresh(db_document)
            doc_logger.info(f"Document created successfully: id={db_document.id}")
            return db_document
            
        except HTTPException as he:
            # Re-raise HTTP exceptions
            doc_logger.error(f"HTTP exception: {str(he)}")
            raise
        except Exception as e:
            # Catch and report all other exceptions
            doc_logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            # Re-raise the exception with a clear message
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process document: {str(e)}"
            )
    else:
        # Handle URL-only documents if that's a use case
        doc_logger.error("No file provided")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File upload is required"
        )

def get_document(db: Session, document_id: int):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if doc and doc.file_path:  # If document has an S3 key
        try:
            # Pass original filename to preserve the extension during download
            presigned_url = generate_presigned_url(
                doc.file_path, 
                original_filename=doc.filename
            )
            if presigned_url:
                doc.file_url = presigned_url
        except Exception as e:
            print(f"Error handling document: {str(e)}")
            
    return doc

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