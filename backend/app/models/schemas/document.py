from typing import Optional, Dict
from pydantic import BaseModel
from datetime import datetime

class DocumentBase(BaseModel):
    filename: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None

class DocumentCreate(DocumentBase):
    user_id: int

class DocumentAnalysis(BaseModel):
    invoiceNumber: Optional[str] = None
    clientName: Optional[str] = None
    invoiceDate: Optional[str] = None
    dueDate: Optional[str] = None
    totalAmount: Optional[str] = None
    classification: Optional[str] = None
    fraudCheck: Optional[Dict[str, str]] = None
    insights: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    created_at: datetime
    file_url: Optional[str] = None
    file_type: Optional[str] = "PDF"
    file_size: Optional[int] = 0
    page_count: Optional[int] = 1
    status: Optional[str] = "processed"
    analysis: Optional[DocumentAnalysis] = None
    
    class Config:
        from_attributes = True

class IntegrationResponse(BaseModel):
    document_id: int
    integrated_with: str
    success: bool
    reference_id: Optional[str] = None
    details: str 