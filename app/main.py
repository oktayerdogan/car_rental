from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <--- 1. BU EKLENDİ
from .database import Base, engine
from .routers import users, cars, reservations

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Car Rental API")

# ---------------------------------------------------------
# 2. CORS AYARLARI (Frontend ile Bağlantı İzni)
# ---------------------------------------------------------
origins = [
    "http://localhost:3000",      # Frontend'in adresi
    "http://127.0.0.1:3000",      # Bazen burayı kullanır
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # Sadece bu adreslere izin ver
    allow_credentials=True,
    allow_methods=["*"],          # GET, POST, DELETE vb. hepsine izin ver
    allow_headers=["*"],          # Token headerlarına izin ver
)
# ---------------------------------------------------------

app.include_router(users.router)
app.include_router(cars.router)
app.include_router(reservations.router)

@app.get("/")
def root():
    return {"message": "Car Rental API is running!"}