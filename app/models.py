from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Float
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="customer")
    
    reservations = relationship("Reservation", back_populates="user") 

class Car(Base):
    __tablename__ = "cars"
    
    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    is_available = Column(Boolean, default=True)
    price_per_day = Column(Float, nullable=False) # Fiyatı Float yaptık (kuruşlu fiyatlar için)
    
    # 👇 YENİ EKLENEN SÜTUNLAR
    image_url = Column(String, nullable=True)      # Kapak Resmi (Listedeki resim)
    gear_type = Column(String, default="Otomatik") # Vites Tipi
    fuel_type = Column(String, default="Benzin")   # Yakıt Tipi

    # 👇 İLİŞKİLER
    reservations = relationship("Reservation", back_populates="car")
    # Bir arabanın BİRDEN ÇOK resmi olabilir (One-to-Many)
    images = relationship("CarImage", back_populates="car", cascade="all, delete-orphan")

# 👇 YENİ TABLO: ARABA RESİMLERİ
class CarImage(Base):
    __tablename__ = "car_images"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String) # Resmin yolu (örn: http://.../static/images/car1_Pic2.jpg)
    car_id = Column(Integer, ForeignKey("cars.id"))

    car = relationship("Car", back_populates="images")

class Reservation(Base):
    __tablename__ = "reservations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    car_id = Column(Integer, ForeignKey("cars.id"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    
    user = relationship("User", back_populates="reservations")
    car = relationship("Car", back_populates="reservations")