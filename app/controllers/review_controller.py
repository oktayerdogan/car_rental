# app/controllers/review_controller.py
"""
Review Controller (MVC Pattern)
Yorum işlemlerini yönetir.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import schemas
from ..models import Review, Car, User
from ..auth import get_current_user, require_admin
from ..decorators.logging_decorator import log_request
from ..decorators.error_handler import handle_exceptions, handle_db_exceptions

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/", response_model=schemas.ReviewResponse)
@handle_db_exceptions
@log_request
async def create_review(
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Yeni yorum oluşturur.
    
    Controller -> Model pattern kullanılır.
    Decorator'lar: @handle_db_exceptions, @log_request
    """
    # Rating kontrolü (1-5 arası)
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating 1-5 arasında olmalıdır."
        )
    
    # Araç var mı kontrol et
    car = db.query(Car).filter(Car.id == review.car_id).first()
    if not car:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Araç bulunamadı."
        )
    
    # Aynı kullanıcı aynı araca daha önce yorum yapmış mı
    existing_review = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.car_id == review.car_id
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu araca zaten yorum yapmışsınız."
        )
    
    # Yorum oluştur
    db_review = Review(
        user_id=current_user.id,
        car_id=review.car_id,
        rating=review.rating,
        comment=review.comment
    )
    
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    return db_review


@router.get("/car/{car_id}", response_model=List[schemas.ReviewResponse])
@handle_exceptions
@log_request
async def get_car_reviews(car_id: int, db: Session = Depends(get_db)):
    """
    Belirli bir araca ait yorumları getirir.
    
    Decorator'lar: @handle_exceptions, @log_request
    """
    reviews = db.query(Review).filter(
        Review.car_id == car_id
    ).order_by(Review.created_at.desc()).all()
    
    return reviews


@router.get("/", response_model=List[schemas.ReviewResponse])
@handle_exceptions
@log_request
async def get_all_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Tüm yorumları listeler (Admin Only).
    
    Decorator'lar: @handle_exceptions, @log_request
    """
    reviews = db.query(Review).order_by(Review.created_at.desc()).all()
    return reviews


@router.delete("/{review_id}")
@handle_db_exceptions
@log_request
async def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Yorum siler (Admin Only).
    
    Decorator'lar: @handle_db_exceptions, @log_request
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Yorum bulunamadı."
        )
    
    db.delete(review)
    db.commit()
    
    return {"message": f"Yorum #{review_id} başarıyla silindi."}
