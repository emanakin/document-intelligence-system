from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.database import get_db
from models.schemas.document import IntegrationResponse
from services.integration_service import integrate_with_external_system
from utils.auth import get_current_user

router = APIRouter(prefix="/integration", tags=["External Integration"])

@router.post("/external/{document_id}", response_model=IntegrationResponse)
def external_integration(
    document_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = integrate_with_external_system(db, document_id, current_user.id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or integration failed"
        )
    return result 