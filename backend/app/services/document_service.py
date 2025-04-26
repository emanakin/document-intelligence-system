import os
import random
import uuid
from fastapi import UploadFile
from sqlalchemy.orm import Session
from fastapi import HTTPException
from fastapi import status
import asyncio
from websocket.manager import manager

from models.document import Document
from models.schemas.document import DocumentCreate, DocumentAnalysis
from core.aws import generate_presigned_url, upload_to_s3
from config import settings
from core.logging import setup_logger
from services.analysis_service import analyze_document

# Create logger
doc_logger = setup_logger("document_service")

async def create_document(db: Session, document: DocumentCreate, file: UploadFile = None):
    if not file:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File upload required")

    try:
        content       = await file.read()
        file_size     = len(content)
        content_type  = file.content_type
        ext           = os.path.splitext(file.filename)[1] or ""
        s3_key        = f"user-files/{document.user_id}/{uuid.uuid4().hex}{ext}"

        if not upload_to_s3(content, s3_key, content_type):
            raise HTTPException(status_code=500, detail="S3 upload failed")

        analysis = await analyze_document(content, content_type, ext)

        db_doc = Document(
            filename=document.filename,
            s3_key=s3_key,
            content_type=content_type,
            file_size=file_size,
            page_count=1,
            status="processed",
            user_id=document.user_id,
            analysis=analysis
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)
        doc_logger.info(f"document:created id={db_doc.id}")
        asyncio.create_task(_run_analysis_and_update(db_doc, content, content_type, ext, db))
        return db_doc

    except HTTPException:
        raise
    except Exception as e:
        doc_logger.error(f"document:error {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Document processing failed")

def get_document(db: Session, document_id: int):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if doc and doc.s3_key:
        try:
            # Pass original filename to preserve the extension during download
            presigned_url = generate_presigned_url(
                doc.s3_key, 
                original_filename=doc.filename
            )
            if presigned_url:
                doc.file_url = presigned_url
        except Exception as e:
            print(f"Error handling document: {str(e)}")
            
    return doc

def get_all_documents(db: Session, user_id: int):
    return db.query(Document).filter(Document.user_id == user_id).all()

async def _run_analysis_and_update(doc, content, ctype, ext, db):
    async def progress(percent, message):
        await manager.broadcast(str(doc.id), {"percent": percent, "message": message})

    analysis = await analyze_document(content, ctype, ext, progress_cb=progress)
    # persist final result
    db.query(Document).filter(Document.id == doc.id).update({"analysis": analysis})
    db.commit()
    await manager.broadcast(str(doc.id), {"percent": 100, "message": "complete", "analysis": analysis})