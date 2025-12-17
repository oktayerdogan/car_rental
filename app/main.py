"""
Rent A Car API - Main Application
MVC Pattern Implementation
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import engine, Base

# MVC Pattern - Controllers (eski routers da desteklenir)
from .controllers import (
    car_router,
    auth_router, 
    reservation_router,
    review_router,
    message_router
)
from .routers import users  # User router henüz controller'a taşınmadı

# Veritabanı tablolarını oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Car Rental API",
    description="MVC Pattern ile Araç Kiralama Sistemi",
    version="2.0.0"
)

# CORS Ayarları
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Statik dosyalar klasörü
if not os.path.exists("static"):
    os.makedirs("static")

app.mount("/static", StaticFiles(directory="static"), name="static")


# ============================================
# MVC PATTERN - CONTROLLER ROUTING
# ============================================

# Auth Controller
app.include_router(auth_router, prefix="/auth")

# User Controller (henüz eski sistemde)
app.include_router(users.router)

# Car Controller
app.include_router(car_router)

# Reservation Controller
app.include_router(reservation_router)

# Review Controller
app.include_router(review_router)

# Message Controller
app.include_router(message_router)


@app.get("/")
def read_root():
    """API Ana Sayfa"""
    return {
        "message": "Rent A Car API Çalışıyor! 🚀",
        "version": "2.0.0",
        "pattern": "MVC (Model-View-Controller)",
        "features": [
            "Decorators: @log_request, @handle_exceptions",
            "Services: CarService, ReservationService, UserService",
            "Controllers: Ayrı klasörde organize"
        ]
    }