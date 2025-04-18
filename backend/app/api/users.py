from fastapi import APIRouter, Depends

from models.schemas.auth import UserResponse
from utils.auth import get_current_user

router = APIRouter(tags=["Users"])

@router.get("/users/me", response_model=UserResponse)
def get_current_user_profile(current_user = Depends(get_current_user)):
    """
    Get the current authenticated user's profile information.
    """
    return current_user 