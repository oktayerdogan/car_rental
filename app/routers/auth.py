from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import database, models, auth # auth.py import edildi

router = APIRouter(tags=['Authentication'])

@router.post('/login')
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    
    # 1. Kullanıcıyı bul
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Geçersiz bilgiler")

    # 2. Şifre Kontrolü
    if not auth.verify_password(user_credentials.password, user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Geçersiz bilgiler")

    # 3. Token Oluştur (KRİTİK DÜZELTME)
    # ID'yi "sub" anahtarı ile ve String olarak gönderiyoruz.
    access_token = auth.create_access_token(data={"sub": str(user.id), "role": user.role})

    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role, 
        "user_id": user.id
    }