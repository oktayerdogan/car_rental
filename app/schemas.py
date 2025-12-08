# app/schemas.py
from pydantic import BaseModel
from datetime import date
from typing import List, Optional

# --- TOKEN ŞEMALARI ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int

class UserLogin(BaseModel):
    email: str
    password: str

# --- USER ŞEMALARI ---
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    class Config:
        from_attributes = True

# --- RESİM ŞEMASI (YENİ) ---
class CarImage(BaseModel):
    id: int
    url: str
    class Config:
        from_attributes = True

# --- CAR ŞEMALARI (GÜNCELLENDİ) ---
class CarBase(BaseModel):
    brand: str
    model: str
    year: int
    price_per_day: float # Fiyatı float yaptık
    gear_type: str = "Otomatik" # Yeni alan
    fuel_type: str = "Benzin"   # Yeni alan

class CarCreate(CarBase):
    pass

# Router'da "response_model=schemas.Car" dediğimiz için bu ismin "Car" olması önemli
class Car(CarBase):
    id: int
    is_available: bool
    image_url: Optional[str] = None # Kapak resmi

    # Resim Galerisi Listesi
    images: List[CarImage] = [] 
    
    class Config:
        from_attributes = True

# --- RESERVATION ŞEMALARI ---
class ReservationCreate(BaseModel):
    car_id: int
    start_date: date
    end_date: date

class ReservationResponse(BaseModel):
    id: int
    car_id: int
    user_id: int
    start_date: date
    end_date: date
    
    class Config:
        from_attributes = True