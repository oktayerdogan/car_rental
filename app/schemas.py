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

# --- RESİM ŞEMASI ---
class CarImage(BaseModel):
    id: int
    url: str
    class Config:
        from_attributes = True

# --- CAR ŞEMALARI ---
class CarBase(BaseModel):
    brand: str
    model: str
    year: int
    price_per_day: float
    gear_type: str = "Otomatik"
    fuel_type: str = "Benzin"

class CarCreate(CarBase):
    pass

class Car(CarBase):
    id: int
    is_available: bool
    image_url: Optional[str] = None # Kapak resmi

    # 👇 GALERİ İÇİN KRİTİK NOKTA
    images: List[CarImage] = [] 
    
    class Config:
        from_attributes = True

# --- RESERVATION ŞEMALARI ---
class ReservationCreate(BaseModel):
    car_id: int
    start_date: date
    end_date: date

# 👇 GÜNCELLENDİ: Admin Panelinde detayları görmek için
class ReservationResponse(BaseModel):
    id: int
    car_id: int
    user_id: int
    start_date: date
    end_date: date
    
    # Nested (İç içe) Objeler:
    # Backend artık sadece ID değil, tüm araba ve kullanıcı bilgisini de gönderecek.
    car: Optional[Car] = None 
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# --- ÖDEME ŞEMALARI ---
class PaymentCard(BaseModel):
    """Kart bilgileri şeması"""
    card_holder_name: str
    card_number: str
    expire_month: str
    expire_year: str
    cvc: str

class ReservationWithPayment(BaseModel):
    """Ödeme ile birlikte rezervasyon oluşturma şeması"""
    car_id: int
    start_date: date
    end_date: date
    payment_card: PaymentCard

class PaymentResponse(BaseModel):
    """Ödeme sonucu yanıt şeması"""
    success: bool
    message: str
    payment_id: Optional[str] = None
    reservation: Optional[ReservationResponse] = None