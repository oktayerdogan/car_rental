# app/routers/reviews.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])

# 👇 YORUM OLUŞTUR (Giriş yapmış kullanıcı)
@router.post("/", response_model=schemas.ReviewResponse)
def create_review(
    review: schemas.ReviewCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Rating kontrolü (1-5 arası)
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating 1-5 arasında olmalıdır."
        )
    
    # Araç var mı kontrol et
    car = db.query(models.Car).filter(models.Car.id == review.car_id).first()
    if not car:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Araç bulunamadı."
        )
    
    # Aynı kullanıcı aynı araca daha önce yorum yapmış mı kontrol et
    existing_review = db.query(models.Review).filter(
        models.Review.user_id == current_user.id,
        models.Review.car_id == review.car_id
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu araca zaten yorum yapmışsınız."
        )
    
    # Yorum oluştur
    db_review = models.Review(
        user_id=current_user.id,
        car_id=review.car_id,
        rating=review.rating,
        comment=review.comment
    )
    
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    return db_review

# 👇 BELİRLİ BİR ARACA AİT YORUMLARI GETİR (Herkese açık)
@router.get("/car/{car_id}", response_model=List[schemas.ReviewResponse])
def get_car_reviews(car_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(
        models.Review.car_id == car_id
    ).order_by(models.Review.created_at.desc()).all()
    
    return reviews

# 👇 TÜM YORUMLARI GETİR (Sadece Admin)
@router.get("/", response_model=List[schemas.ReviewResponse])
def get_all_reviews(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gereklidir."
        )
    
    reviews = db.query(models.Review).order_by(models.Review.created_at.desc()).all()
    return reviews

# 👇 YORUM SİL (Sadece Admin)
@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gereklidir."
        )
    
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Yorum bulunamadı."
        )
    
    db.delete(review)
    db.commit()
    
    return {"message": f"Yorum #{review_id} başarıyla silindi."}
