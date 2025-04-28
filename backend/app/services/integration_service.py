import random
from sqlalchemy.orm import Session

from models.schemas.document import IntegrationResponse
from services.document_service import get_document

def integrate_with_external_system(db: Session, document_id: int, user_id: int):
    document = get_document(db, document_id)
    if not document or document.user_id != user_id:
        return None
    
    # mock
    systems = ["ERP", "CRM", "Accounting Software", "Document Management System"]
    integrated_system = random.choice(systems)
    
    # success/failure simulation
    success = random.random() < 0.9
    
    return IntegrationResponse(
        document_id=document.id,
        integrated_with=integrated_system,
        success=success,
        reference_id=f"REF-{random.randint(10000, 99999)}" if success else None,
        details="Successfully sent document data to external system" if success else "Integration failed: timeout error"
    ) 