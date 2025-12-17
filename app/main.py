from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # 👈 BU IMPORT ÇOK ÖNEMLİ
import os
from .database import engine, Base
from .routers import users, cars, reservations, auth, reviews, messages 

# Veritabanı tablolarını oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Car Rental API")

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

# 🚀 KRİTİK AYAR: STATİK DOSYALARI DIŞARI AÇMA
# Eğer "static" klasörü yoksa oluştur (Hata almamak için)
if not os.path.exists("static"):
    os.makedirs("static")

# "/static" adresine gelen istekleri "static" klasörüne yönlendir
app.mount("/static", StaticFiles(directory="static"), name="static")


# 🚀 Routerları Ekleme
app.include_router(auth.router, prefix="/auth") 
app.include_router(users.router)       
app.include_router(cars.router)        
app.include_router(reservations.router)
app.include_router(reviews.router)
app.include_router(messages.router) 

@app.get("/")
def read_root():
    return {"message": "Rent A Car API Çalışıyor! 🚀"}