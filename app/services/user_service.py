# app/services/user_service.py
"""
User Service - Business Logic Layer (MVC Pattern)
Bu modül, kullanıcı işlemleri için iş mantığını içerir.
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from functools import wraps
import logging
from passlib.context import CryptContext

from ..models import User
from ..decorators.logging_decorator import get_logger

logger = get_logger("UserService")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    """
    Kullanıcı Servisi (MVC - Service Layer)
    
    Bu sınıf, kullanıcı ile ilgili tüm iş mantığını içerir.
    Controller (Router) bu servisi kullanarak işlemleri gerçekleştirir.
    """
    
    def __init__(self, db: Session):
        """
        Service başlatıcı
        
        Args:
            db: SQLAlchemy veritabanı oturumu
        """
        self.db = db
        logger.info("👤 UserService initialized")
    
    def get_all_users(self) -> List[User]:
        """
        Tüm kullanıcıları getirir.
        
        Returns:
            List[User]: Kullanıcı listesi
        """
        logger.info("📋 Fetching all users")
        users = self.db.query(User).all()
        logger.info(f"✅ Found {len(users)} users")
        return users
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """
        ID'ye göre kullanıcı getirir.
        
        Args:
            user_id: Kullanıcı ID'si
            
        Returns:
            Optional[User]: Bulunan kullanıcı veya None
        """
        logger.info(f"🔍 Fetching user with ID: {user_id}")
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if user:
            logger.info(f"✅ Found user: {user.email}")
        else:
            logger.warning(f"⚠️ User not found with ID: {user_id}")
        
        return user
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        E-posta adresine göre kullanıcı getirir.
        
        Args:
            email: E-posta adresi
            
        Returns:
            Optional[User]: Bulunan kullanıcı veya None
        """
        logger.info(f"🔍 Fetching user with email: {email}")
        user = self.db.query(User).filter(User.email == email).first()
        
        if user:
            logger.info(f"✅ Found user: {email}")
        else:
            logger.warning(f"⚠️ User not found with email: {email}")
        
        return user
    
    def create_user(self, email: str, password: str, 
                    first_name: str = None, last_name: str = None,
                    role: str = "customer") -> User:
        """
        Yeni kullanıcı oluşturur.
        
        Args:
            email: E-posta adresi
            password: Şifre (hash'lenmemiş)
            first_name: Ad
            last_name: Soyad
            role: Rol (customer/admin)
            
        Returns:
            User: Oluşturulan kullanıcı
            
        Raises:
            ValueError: E-posta zaten kullanılıyorsa
        """
        logger.info(f"➕ Creating new user: {email}")
        
        # E-posta kontrolü
        existing = self.get_user_by_email(email)
        if existing:
            logger.error(f"❌ Email already exists: {email}")
            raise ValueError("Bu e-posta adresi zaten kullanılıyor.")
        
        # Şifreyi hash'le
        hashed_password = pwd_context.hash(password)
        
        # Kullanıcı oluştur
        user = User(
            email=email,
            password=hashed_password,
            first_name=first_name,
            last_name=last_name,
            role=role
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        logger.info(f"✅ User created with ID: {user.id}")
        return user
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Şifre doğrulaması yapar.
        
        Args:
            plain_password: Düz şifre
            hashed_password: Hash'lenmiş şifre
            
        Returns:
            bool: Şifre doğru mu
        """
        is_valid = pwd_context.verify(plain_password, hashed_password)
        
        if is_valid:
            logger.info("✅ Password verified successfully")
        else:
            logger.warning("❌ Password verification failed")
        
        return is_valid
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Kullanıcı kimlik doğrulaması yapar.
        
        Args:
            email: E-posta adresi
            password: Şifre
            
        Returns:
            Optional[User]: Doğrulanmış kullanıcı veya None
        """
        logger.info(f"🔐 Authenticating user: {email}")
        
        user = self.get_user_by_email(email)
        if not user:
            logger.warning(f"❌ Authentication failed: User not found")
            return None
        
        if not self.verify_password(password, user.password):
            logger.warning(f"❌ Authentication failed: Invalid password")
            return None
        
        logger.info(f"✅ User authenticated: {email}")
        return user
    
    def update_user(self, user_id: int, **kwargs) -> Optional[User]:
        """
        Kullanıcı bilgilerini günceller.
        
        Args:
            user_id: Kullanıcı ID'si
            **kwargs: Güncellenecek alanlar
            
        Returns:
            Optional[User]: Güncellenen kullanıcı veya None
        """
        logger.info(f"🔄 Updating user: {user_id}")
        
        user = self.get_user_by_id(user_id)
        if not user:
            return None
        
        for key, value in kwargs.items():
            if hasattr(user, key) and key != 'id':
                setattr(user, key, value)
        
        self.db.commit()
        self.db.refresh(user)
        
        logger.info(f"✅ User {user_id} updated successfully")
        return user
    
    def delete_user(self, user_id: int) -> bool:
        """
        Kullanıcı siler.
        
        Args:
            user_id: Kullanıcı ID'si
            
        Returns:
            bool: Silme başarılı mı
        """
        logger.info(f"🗑️ Deleting user: {user_id}")
        
        user = self.get_user_by_id(user_id)
        if not user:
            logger.warning(f"⚠️ Cannot delete: User {user_id} not found")
            return False
        
        self.db.delete(user)
        self.db.commit()
        
        logger.info(f"✅ User {user_id} deleted successfully")
        return True
    
    def is_admin(self, user: User) -> bool:
        """
        Kullanıcının admin olup olmadığını kontrol eder.
        
        Args:
            user: Kullanıcı
            
        Returns:
            bool: Admin mi
        """
        return user.role == "admin"


# Decorator kullanımı için wrapper fonksiyon
def with_user_service(func):
    """
    User Service Injection Decorator
    
    Bu decorator, fonksiyona UserService instance'ı enjekte eder.
    """
    @wraps(func)
    async def wrapper(*args, db: Session, **kwargs):
        service = UserService(db)
        kwargs['user_service'] = service
        return await func(*args, db=db, **kwargs)
    return wrapper
