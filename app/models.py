from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="customer")
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    
    reservations = relationship("Reservation", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    messages = relationship("Message", back_populates="user") 

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
    reviews = relationship("Review", back_populates="car", cascade="all, delete-orphan")

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

# 👇 YENİ TABLO: ARABA YORUMLARI
class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    car_id = Column(Integer, ForeignKey("cars.id"))
    rating = Column(Integer, nullable=False)  # 1-5 yıldız
    comment = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="reviews")
    car = relationship("Car", back_populates="reviews")

# 👇 YENİ TABLO: MESAJLAR (Kullanıcı-Admin arası)
class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String, nullable=False)  # Mesaj konusu
    content = Column(String, nullable=False)  # Mesaj içeriği
    reply = Column(String, nullable=True)  # Admin yanıtı
    is_read = Column(Boolean, default=False)  # Okundu mu?
    created_at = Column(DateTime, default=datetime.utcnow)
    replied_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="messages")