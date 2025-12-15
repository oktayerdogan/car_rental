from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, models
from ..crud import reservation as reservation_crud
from ..crud import car as car_crud
from ..auth import get_current_user, require_admin
from ..services.payment import iyzico_service

router = APIRouter(prefix="/reservations", tags=["Reservations"])

# ✔ Kullanıcının kendi rezervasyonlarını getir (Müşteri için)
@router.get("/me", response_model=list[schemas.ReservationResponse])
def get_my_reservations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) 
):
    """Mevcut kullanıcının (Müşteri) kendi rezervasyonlarını listeler."""
    return reservation_crud.get_reservations_by_user(db, user_id=current_user.id)


# ✔ Yeni rezervasyon oluştur (Ödeme ile birlikte)
@router.post("/", response_model=schemas.PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_reservation_with_payment(
    reservation: schemas.ReservationWithPayment,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Yeni rezervasyon oluşturur (Ödeme işlemi ile birlikte).
    
    1. Tarih çakışması kontrolü yapılır
    2. Araç bilgileri alınır ve toplam tutar hesaplanır
    3. Iyzico'ya ödeme isteği gönderilir
    4. Ödeme başarılıysa rezervasyon veritabanına kaydedilir
    5. Ödeme başarısızsa hata döndürülür
    """
    
    # 1. Tarih çakışması kontrolü
    conflict = reservation_crud.check_reservation_overlap(
        db=db,
        car_id=reservation.car_id,
        start_date=reservation.start_date,
        end_date=reservation.end_date
    )
    if conflict:
        raise HTTPException(
            status_code=400, 
            detail="Bu araç seçilen tarihler arasında zaten kiralanmış."
        )
    
    # 2. Araç bilgilerini al
    car = car_crud.get_car(db, reservation.car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Araç bulunamadı.")
    
    if not car.is_available:
        raise HTTPException(status_code=400, detail="Bu araç şu anda müsait değil.")
    
    # 3. Toplam tutarı hesapla (gün sayısı × günlük fiyat)
    rental_days = (reservation.end_date - reservation.start_date).days
    if rental_days <= 0:
        raise HTTPException(status_code=400, detail="Bitiş tarihi başlangıç tarihinden sonra olmalıdır.")
    
    total_price = rental_days * car.price_per_day
    car_name = f"{car.brand} {car.model} ({car.year})"
    
    # 4. Iyzico'ya ödeme isteği gönder
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
    
    # 5. Ödeme sonucuna göre işlem yap
    if payment_result['success']:
        # Ödeme başarılı - Rezervasyonu veritabanına kaydet
        reservation_create = schemas.ReservationCreate(
            car_id=reservation.car_id,
            start_date=reservation.start_date,
            end_date=reservation.end_date
        )
        db_reservation = reservation_crud.create_reservation(
            db, reservation_create, user_id=current_user.id
        )
        
        return schemas.PaymentResponse(
            success=True,
            message=f"Ödeme başarılı! Toplam tutar: {total_price} TL. Rezervasyon oluşturuldu.",
            payment_id=payment_result.get('payment_id'),
            reservation=db_reservation
        )
    else:
        # Ödeme başarısız - Hata döndür
        error_msg = payment_result.get('error_message', 'Ödeme işlemi başarısız oldu.')
        raise HTTPException(
            status_code=400,
            detail=f"Ödeme başarısız: {error_msg}"
        )


# 👑 ✔ Tüm rezervasyonları getir (Admin için)
@router.get("/", response_model=list[schemas.ReservationResponse])
def get_reservations(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(require_admin)
):
    """Tüm rezervasyonları listeler (Admin Paneli için)."""
    return reservation_crud.get_all_reservations(db)


# ✔ ID'ye göre rezervasyon getir
@router.get("/{reservation_id}", response_model=schemas.ReservationResponse)
def get_reservation(reservation_id: int, db: Session = Depends(get_db)):
    """ID ile tek bir rezervasyonu getirir."""
    res = reservation_crud.get_reservation_by_id(db, reservation_id)
    if not res:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı.")
    return res


# ✔ Rezervasyon sil (Müşteri veya Admin yapabilir)
@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reservation(
    reservation_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Rezervasyon siler (Sadece sahibi veya Admin)."""
    res = reservation_crud.get_reservation_by_id(db, reservation_id)
    
    if not res:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı.")
        
    is_owner = res.user_id == current_user.id
    is_admin = current_user.role == "admin"
    
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Bu rezervasyonu silme yetkiniz yok."
        )

    success = reservation_crud.delete_reservation(db, reservation_id)
    if not success:
        raise HTTPException(status_code=500, detail="Silme işlemi başarısız oldu.")
        
    return {"message": "Rezervasyon silindi."}