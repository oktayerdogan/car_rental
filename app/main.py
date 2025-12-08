# app/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware # 👈 BU KRİTİK
from .routers import users, cars, reservations, auth
from .database import engine, Base

# Veritabanı tablolarını oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Car Rental API")

# Resim klasörünü dışarı aç
app.mount("/static", StaticFiles(directory="static"), name="static")

# 👇 CORS AYARLARI (EN GENİŞ İZİN)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🌟 TÜM ADRESLERE İZİN VER (Localhost, 127.0.0.1 vs.)
    allow_credentials=True,
    allow_methods=["*"],  # Tüm metodlara izin ver (GET, POST, DELETE...)
    allow_headers=["*"],  # Tüm başlıklara izin ver
)

# Router'ları ekle
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cars.router)
app.include_router(reservations.router)

@app.get("/")
def read_root():
    return {"message": "Rent A Car API Çalışıyor 🚀"}