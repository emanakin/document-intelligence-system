from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from typing import Optional
from sqlalchemy.orm import Session

from db.database import get_db
from models.schemas.document import DocumentResponse, DocumentCreate
from models.document import Document
from services.document_service import create_document, get_document, get_all_documents
from utils.auth import get_current_user
from core.aws import generate_presigned_url

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not file and not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either file or URL must be provided"
        )
    
    document_data = DocumentCreate(
        filename=file.filename if file else None,
        url=url,
        description=description,
        user_id=current_user.id
    )
    
    document = await create_document(db, document_data, file)
    return document

@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieve a specific document by ID for the authenticated user.
    Returns a presigned URL for accessing the document from S3 if available.
    """
    # Fetch the document and ensure it belongs to the current user
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or you do not have access to it"
        )
    
    # If the document has an S3 key, generate a presigned URL
    if doc.s3_key:
        try:
            presigned_url = generate_presigned_url(doc.s3_key, original_filename=doc.filename)
            if presigned_url:
                # Assuming DocumentResponse has a field like 'file_url' or 'presigned_url'
                doc.file_url = presigned_url
        except Exception as e:
            print(f"Error generating presigned URL: {str(e)}")
            # Continue with the response even if URL generation fails
    
    return doc

@router.get("/", response_model=list[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    documents = get_all_documents(db, current_user.id)
    return documents 