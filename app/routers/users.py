from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm # <--- 1. BUNU EKLE
from .. import schemas, models
from ..database import get_db
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-mail zaten kayıtlı.")

    hashed_pw = hash_password(user.password)
    # İlk kayıt olanı admin yapmak istersen burayı role="admin" yapabilirsin test için
    db_user = models.User(email=user.email, password=hashed_pw, role="user")
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- DEĞİŞİKLİK BURADA ---
@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)): # <--- 2. user YERİNE form_data GELDİ
    
    # form_data.username, Swagger'daki "Username" kutusuna yazdığın şeydir (bizim için email)
    db_user = db.query(models.User).filter(models.User.email == form_data.username).first() 
    
    if not db_user or not verify_password(form_data.password, db_user.password):
        raise HTTPException(status_code=400, detail="E-mail veya şifre hatalı.")

    token = create_access_token({"sub": str(db_user.id)})
    return {"access_token": token, "token_type": "bearer"}