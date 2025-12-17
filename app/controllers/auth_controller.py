# app/controllers/auth_controller.py
"""
Auth Controller (MVC Pattern)
Kimlik doğrulama işlemlerini yönetir.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..auth import verify_password, create_access_token
from ..services.user_service import UserService
from ..decorators.logging_decorator import log_request
from ..decorators.error_handler import handle_exceptions

router = APIRouter(tags=['Authentication'])


@router.post('/login')
@handle_exceptions
@log_request
async def login(
    user_credentials: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    Kullanıcı girişi yapar ve JWT token döner.
    
    Controller -> Service pattern kullanılır.
    Decorator'lar: @handle_exceptions, @log_request
    """
    # Service Layer
    user_service = UserService(db)
    
    # Kullanıcı doğrulama
    user = user_service.authenticate_user(
        email=user_credentials.username,
        password=user_credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Geçersiz bilgiler"
        )
    
    # Token oluştur
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id
    }
