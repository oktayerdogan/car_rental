# app/views/__init__.py
"""
Views Package (MVC Pattern)
Pydantic şemaları (response modelleri) burada tanımlanır.
Bu paket, API yanıt formatlarını belirler (View katmanı).

Not: Mevcut schemas.py dosyası korunarak sadece referans olarak eklendi.
Gelecekte şemalar buraya taşınabilir.
"""

# Şemalar şu an ana dizindeki schemas.py'den import ediliyor
# Gelecekte buraya taşınabilir

from ..schemas import (
    UserCreate,
    UserResponse,
    Car,
    CarImage,
    ReservationCreate,
    ReservationResponse,
    ReviewCreate,
    ReviewResponse,
    MessageCreate,
    MessageResponse,
    MessageReply
)

__all__ = [
    "UserCreate",
    "UserResponse",
    "Car",
    "CarImage",
    "ReservationCreate",
    "ReservationResponse",
    "ReviewCreate",
    "ReviewResponse",
    "MessageCreate",
    "MessageResponse",
    "MessageReply"
]
