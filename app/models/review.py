# app/models/review.py
"""
Review Model (MVC Pattern - Model Layer)
Yorum veritabanı modeli
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Review(Base):
    """
    Yorum Modeli
    
    Attributes:
        id: Benzersiz yorum ID'si
        user_id: Yorumu yapan kullanıcı ID'si
        car_id: Yorumlanan araç ID'si
        rating: Puan (1-5)
        comment: Yorum metni
        created_at: Oluşturulma tarihi
    """
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    car_id = Column(Integer, ForeignKey("cars.id"))
    rating = Column(Integer, nullable=False)
    comment = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # İlişkiler
    user = relationship("User", back_populates="reviews")
    car = relationship("Car", back_populates="reviews")
    
    def __repr__(self):
        return f"<Review(id={self.id}, rating={self.rating}, car_id={self.car_id})>"
