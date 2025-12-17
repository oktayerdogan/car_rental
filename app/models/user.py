# app/models/user.py
"""
User Model (MVC Pattern - Model Layer)
Kullanıcı veritabanı modeli
"""

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..database import Base


class User(Base):
    """
    Kullanıcı Modeli
    
    Attributes:
        id: Benzersiz kullanıcı ID'si
        email: E-posta adresi (unique)
        password: Hash'lenmiş şifre
        role: Kullanıcı rolü (customer/admin)
        first_name: Ad
        last_name: Soyad
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="customer")
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    
    # İlişkiler
    reservations = relationship("Reservation", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    messages = relationship("Message", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
    
    def is_admin(self) -> bool:
        """Kullanıcının admin olup olmadığını kontrol eder"""
        return self.role == "admin"
