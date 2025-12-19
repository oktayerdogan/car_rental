# app/controllers/reservation_controller.py
"""
Reservation Controller (MVC Pattern)
Rezervasyon işlemlerini yönetir.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import schemas
from ..models import User
from ..crud import reservation as reservation_crud
from ..crud import car as car_crud
from ..auth import get_current_user, require_admin
from ..services.payment import iyzico_service
from ..services.reservation_service import ReservationService
from ..decorators.logging_decorator import log_request
from ..decorators.error_handler import handle_exceptions, handle_db_exceptions
from ..services.email_service import send_reservation_confirmation

router = APIRouter(prefix="/reservations", tags=["Reservations"])


@router.get("/me", response_model=List[schemas.ReservationResponse])
@handle_exceptions
@log_request
async def get_my_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Kullanıcının kendi rezervasyonlarını listeler.
    
    Controller -> Service pattern kullanılır.
    """
    reservation_service = ReservationService(db)
    return reservation_service.get_user_reservations(current_user.id)


@router.post("/", response_model=schemas.PaymentResponse, status_code=status.HTTP_201_CREATED)
@handle_db_exceptions
@log_request
async def create_reservation_with_payment(
    reservation: schemas.ReservationWithPayment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Yeni rezervasyon oluşturur (Ödeme işlemi ile birlikte).
    
    Controller -> Service pattern kullanılır.
    """
    reservation_service = ReservationService(db)
    
    # Tarih çakışması kontrolü
    if not reservation_service.check_car_availability(
        reservation.car_id, 
        reservation.start_date, 
        reservation.end_date
    ):
        raise HTTPException(
            status_code=400,
            detail="Bu araç seçilen tarihler arasında zaten kiralanmış."
        )
    
    # Araç bilgilerini al
    car = car_crud.get_car(db, reservation.car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Araç bulunamadı.")
    
    if not car.is_available:
        raise HTTPException(status_code=400, detail="Bu araç şu anda müsait değil.")
    
    # Toplam tutarı hesapla
    total_price = reservation_service.calculate_total_price(
        reservation.car_id,
        reservation.start_date,
        reservation.end_date
    )
    
    rental_days = (reservation.end_date - reservation.start_date).days
    if rental_days <= 0:
        raise HTTPException(status_code=400, detail="Bitiş tarihi başlangıç tarihinden sonra olmalıdır.")
    
    car_name = f"{car.brand} {car.model} ({car.year})"
    
    # Iyzico'ya ödeme isteği gönder
    payment_result = iyzico_service.create_payment(
        card_holder_name=reservation.payment_card.card_holder_name,
        card_number=reservation.payment_card.card_number,
        expire_month=reservation.payment_card.expire_month,
        expire_year=reservation.payment_card.expire_year,
        cvc=reservation.payment_card.cvc,
        price=total_price,
        car_name=car_name,
        car_id=car.id,
        user_id=current_user.id,
        user_email=current_user.email,
        start_date=reservation.start_date,
        end_date=reservation.end_date
    )
    
    # Ödeme sonucuna göre işlem yap
    if payment_result['success']:
        reservation_create = schemas.ReservationCreate(
            car_id=reservation.car_id,
            start_date=reservation.start_date,
            end_date=reservation.end_date
        )
        db_reservation = reservation_crud.create_reservation(
            db, reservation_create, user_id=current_user.id
        )
        
        # Rezervasyon onay emaili gönder
        try:
            send_reservation_confirmation(
                to_email=current_user.email,
                user_name=current_user.first_name or current_user.email.split('@')[0],
                car_name=car_name,
                start_date=reservation.start_date,
                end_date=reservation.end_date,
                total_price=total_price
            )
        except Exception as e:
            # Email gönderimi başarısız olsa bile rezervasyon devam eder
            pass
        
        return schemas.PaymentResponse(
            success=True,
            message=f"Ödeme başarılı! Toplam tutar: {total_price} TL. Rezervasyon oluşturuldu.",
            payment_id=payment_result.get('payment_id'),
            reservation=db_reservation
        )
    else:
        error_msg = payment_result.get('error_message', 'Ödeme işlemi başarısız oldu.')
        raise HTTPException(status_code=400, detail=f"Ödeme başarısız: {error_msg}")


@router.get("/", response_model=List[schemas.ReservationResponse])
@handle_exceptions
@log_request
async def get_all_reservations(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Tüm rezervasyonları listeler (Admin Only).
    
    Controller -> Service pattern kullanılır.
    """
    reservation_service = ReservationService(db)
    return reservation_service.get_all_reservations()


@router.get("/{reservation_id}", response_model=schemas.ReservationResponse)
@handle_exceptions
@log_request
async def get_reservation_by_id(
    reservation_id: int,
    db: Session = Depends(get_db)
):
    """
    ID ile rezervasyon getirir.
    
    Controller -> Service pattern kullanılır.
    """
    reservation_service = ReservationService(db)
    reservation = reservation_service.get_reservation_by_id(reservation_id)
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı.")
    
    return reservation


@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
@handle_db_exceptions
@log_request
async def delete_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Rezervasyon siler (Sadece sahibi veya Admin).
    
    Controller -> Service pattern kullanılır.
    """
    reservation_service = ReservationService(db)
    reservation = reservation_service.get_reservation_by_id(reservation_id)
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı.")
    
    is_owner = reservation.user_id == current_user.id
    is_admin = current_user.role == "admin"
    
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu rezervasyonu silme yetkiniz yok."
        )
    
    if not reservation_service.cancel_reservation(reservation_id):
        raise HTTPException(status_code=500, detail="Silme işlemi başarısız oldu.")
    
    return None
