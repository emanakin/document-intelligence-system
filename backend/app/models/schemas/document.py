from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class DocumentBase(BaseModel):
    filename: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None

class DocumentCreate(DocumentBase):
    user_id: int

class DocumentResponse(DocumentBase):
    id: int
    created_at: datetime
    file_path: Optional[str] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = "PDF"
    file_size: Optional[int] = 0
    page_count: Optional[int] = 1
    status: Optional[str] = "Processed"
    analysis: Optional[Dict[str, Any]] = {}
    
    class Config:
        from_attributes = True

class AnalysisResponse(BaseModel):
    document_id: int
    document_type: str
    confidence: float
    extracted_text: str
    fraud_detected: bool
    analysis_date: str

class InsightResponse(BaseModel):
    document_id: int
    insights: List[str]
    summary: str
    risk_score: float

class IntegrationResponse(BaseModel):
    document_id: int
    integrated_with: str
    success: bool
    reference_id: Optional[str] = None
    details: str 