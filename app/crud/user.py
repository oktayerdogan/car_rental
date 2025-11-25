from sqlalchemy.orm import Session
from ..import models,schemas
from ..auth import hash_password

def create_user(db:Session,user:schemas.userCreate):
    hashed_pw=hash_password(user.password)
    db_user=models.User(email=user.email,password=hashed_pw)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session,email:str):
    return db.query(models.User).filter(models.User.email==email).first()