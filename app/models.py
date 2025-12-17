# app/models.py
"""
Models Re-export (Backward Compatibility)

Bu dosya geriye uyumluluk için tüm modelleri yeniden export eder.
Modeller artık app/models/ klasöründe ayrı dosyalarda tanımlıdır.

MVC Pattern - Model Layer
"""

# Yeni models klasöründen import et
from .models.user import User
from .models.car import Car, CarImage
from .models.reservation import Reservation
from .models.review import Review
from .models.message import Message

# Geriye uyumluluk için export
__all__ = [
    "User",
    "Car", 
    "CarImage",
    "Reservation",
    "Review",
    "Message"
]