# app/models/reservation.py
"""
Reservation Model (MVC Pattern - Model Layer)
Rezervasyon veritabanı modeli
"""

from sqlalchemy import Column, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class Reservation(Base):
    """
    Rezervasyon Modeli
    
    Attributes:
        id: Benzersiz rezervasyon ID'si
        user_id: Rezervasyonu yapan kullanıcı ID'si
        car_id: Kiralanan araç ID'si
        start_date: Kiralama başlangıç tarihi
        end_date: Kiralama bitiş tarihi
    """
    __tablename__ = "reservations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    car_id = Column(Integer, ForeignKey("cars.id"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    
    # İlişkiler
    user = relationship("User", back_populates="reservations")
    car = relationship("Car", back_populates="reservations")
    
    def __repr__(self):
        return f"<Reservation(id={self.id}, user_id={self.user_id}, car_id={self.car_id})>"
    
    def get_duration_days(self) -> int:
        """Kiralama süresini gün olarak döndürür"""
        return (self.end_date - self.start_date).days + 1
