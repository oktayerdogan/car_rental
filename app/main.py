# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import users, cars, reservations, auth 

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

# 🚀 Rotaları Sisteme Dahil Etme
# ---------------------------------------------------------

# 1. Auth için prefix'i BURADAN veriyoruz.
# Çünkü auth.py dosyasının içinde prefix yok.
# Sonuç: http://127.0.0.1:8000/auth/login çalışacak.
app.include_router(auth.router, prefix="/auth") 

# 2. Diğerleri için prefix vermiyoruz.
# Çünkü onların kendi dosyalarında (cars.py, users.py) zaten prefix="/cars" yazıyor.
# Buradan da verirsek "/cars/cars/" olur ve bozulur.
app.include_router(users.router)      
app.include_router(cars.router)       
app.include_router(reservations.router) 

@app.get("/")
def read_root():
    return {"message": "Rent A Car API Çalışıyor! 🚀"}