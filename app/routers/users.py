from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from ..import schemas,models
from ..database import get_db
from ..crud import user as user_crud
from ..auth import verify_password,create_access_token

router = APIRouter(prefix="/users",tags=["Users"])

@router.post("/register",response_model=schemas.UserResponse) #dönen veri UserResponse formatında olacak
def register(user: schemas.userCreate, db:Session=Depends(get_db)):
    existing = user_crud.get_user_by_email(db,user.email)
    if existing:
        raise HTTPException(status_code=400,detail="Bu e-mail zaten kayıtlı.")
    return user_crud.create_user(db,user)

@router.post("/login")
def  login(user: schemas.userCreate,db:Session=Depends(get_db)):
    db_user=user_crud.get_user_by_email(db,user.email)
    if not db_user or not verify_password(user.password,db_user.password):
        raise HTTPException(status_code=400,detail="e-mail veya şifre yanlış")
    
    token=create_access_token({"sub":db_user.email})
    return {"access_token":token,"token_type":"bearer"}