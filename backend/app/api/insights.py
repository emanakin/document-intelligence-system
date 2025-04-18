from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.database import get_db
from models.schemas.document import AnalysisResponse, InsightResponse
from services.document_service import analyze_document, generate_insights
from utils.auth import get_current_user

router = APIRouter(prefix="/insights", tags=["Document Insights"])

@router.get("/analyze/{document_id}", response_model=AnalysisResponse)
def analyze_document_endpoint(
    document_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    analysis = analyze_document(db, document_id, current_user.id)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or analysis failed"
        )
    return analysis

@router.get("/generate/{document_id}", response_model=InsightResponse)
def generate_document_insights(
    document_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    insights = generate_insights(db, document_id, current_user.id)
    if not insights:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or insights generation failed"
        )
    return insights 