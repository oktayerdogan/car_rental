from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import database, schemas, models, utils, oauth2

router = APIRouter(tags=['Authentication'])

@router.post('/login', response_model=schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    
    # 1. Kullanıcıyı bul
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()

    # 2. Kullanıcı yoksa hata ver
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Invalid Credentials")

    # 3. Şifreyi kontrol et (utils.py'den geliyor)
    if not utils.verify(user_credentials.password, user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Invalid Credentials")

    # 4. Token oluştur (oauth2.py'den geliyor)
    # Token içine user_id ve role bilgisini gömüyoruz
    access_token = oauth2.create_access_token(data={"user_id": user.id, "role": user.role})

    # 5. Token'ı döndür
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.role, 
        "user_id": user.id
    }