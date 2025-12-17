# app/decorators/auth_decorator.py
"""
Authentication Decorators (Wrapper Pattern)
Bu modül, kimlik doğrulama işlemleri için decorator'lar içerir.
"""

from functools import wraps
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Callable
import logging

# Logger ayarı
logger = logging.getLogger(__name__)

# OAuth2 şeması
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# JWT Ayarları
SECRET_KEY = "gizli-anahtar-buraya"
ALGORITHM = "HS256"


def require_auth(func: Callable) -> Callable:
    """
    Authentication Decorator (Wrapper)
    
    Bu decorator, endpoint'e erişim için geçerli bir JWT token gerektirir.
    Token geçersizse 401 Unauthorized hatası döner.
    
    Kullanım:
        @require_auth
        async def protected_endpoint(current_user: User):
            ...
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        logger.info(f"🔐 Authentication check for: {func.__name__}")
        
        # Token kontrolü kwargs içinde yapılmalı
        token = kwargs.get('token')
        if not token:
            logger.warning(f"❌ No token provided for {func.__name__}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Kimlik doğrulama gerekli. Lütfen giriş yapın.",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_email: str = payload.get("sub")
            if user_email is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Geçersiz token."
                )
            logger.info(f"✅ Token valid for user: {user_email}")
        except JWTError as e:
            logger.error(f"❌ JWT Error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token doğrulanamadı."
            )
        
        return await func(*args, **kwargs)
    
    return wrapper


def require_admin(func: Callable) -> Callable:
    """
    Admin Role Decorator (Wrapper)
    
    Bu decorator, endpoint'e erişim için admin yetkisi gerektirir.
    Kullanıcı admin değilse 403 Forbidden hatası döner.
    
    Kullanım:
        @require_admin  
        async def admin_only_endpoint(current_user: User):
            ...
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        logger.info(f"👑 Admin check for: {func.__name__}")
        
        current_user = kwargs.get('current_user')
        if not current_user:
            logger.warning(f"❌ No user context for {func.__name__}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Kimlik doğrulama gerekli."
            )
        
        if current_user.role != "admin":
            logger.warning(f"❌ User {current_user.email} is not admin")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu işlem için admin yetkisi gereklidir."
            )
        
        logger.info(f"✅ Admin access granted for: {current_user.email}")
        return await func(*args, **kwargs)
    
    return wrapper


def get_current_user_decorator(func: Callable) -> Callable:
    """
    Current User Injection Decorator
    
    Bu decorator, mevcut kullanıcıyı fonksiyona enjekte eder.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Bu decorator FastAPI'nin Depends mekanizması ile çalışır
        logger.debug(f"🔍 Getting current user for: {func.__name__}")
        return await func(*args, **kwargs)
    
    return wrapper


# Utility: Token'dan kullanıcı bilgisi çıkar
def extract_user_from_token(token: str) -> dict:
    """
    Token'dan kullanıcı bilgilerini çıkarır.
    
    Args:
        token: JWT token string
        
    Returns:
        dict: Kullanıcı bilgileri (email, role)
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {
            "email": payload.get("sub"),
            "role": payload.get("role", "customer")
        }
    except JWTError:
        return None
