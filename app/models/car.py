# app/models/car.py
"""
Car Model (MVC Pattern - Model Layer)
Araç ve araç resmi veritabanı modelleri
"""

from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class Car(Base):
    """
    Araç Modeli
    
    Attributes:
        id: Benzersiz araç ID'si
        brand: Marka
        model: Model
        year: Yıl
        is_available: Müsaitlik durumu
        price_per_day: Günlük kiralama fiyatı
        image_url: Kapak resmi URL'si
        gear_type: Vites tipi
        fuel_type: Yakıt tipi
    """
    __tablename__ = "cars"
    
    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    is_available = Column(Boolean, default=True)
    price_per_day = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    gear_type = Column(String, default="Otomatik")
    fuel_type = Column(String, default="Benzin")
    
    # İlişkiler
    reservations = relationship("Reservation", back_populates="car")
    images = relationship("CarImage", back_populates="car", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="car", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Car(id={self.id}, brand='{self.brand}', model='{self.model}')>"
    
    def get_full_name(self) -> str:
        """Araç tam adını döndürür"""
        return f"{self.brand} {self.model} ({self.year})"


class CarImage(Base):
    """
    Araç Resmi Modeli
    
    Attributes:
        id: Benzersiz resim ID'si
        url: Resim URL'si
        car_id: İlişkili araç ID'si
    """
    __tablename__ = "car_images"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String)
    car_id = Column(Integer, ForeignKey("cars.id"))
    
    # İlişki
    car = relationship("Car", back_populates="images")
    
    def __repr__(self):
        return f"<CarImage(id={self.id}, car_id={self.car_id})>"
