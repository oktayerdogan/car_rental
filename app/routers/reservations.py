from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, models
from ..crud import reservation as reservation_crud
from ..auth import get_current_user

router = APIRouter(prefix="/reservations", tags=["Reservations"])

# ----------------------------------------------------------------
# 🚨 DÜZELTME BURADA: "/me" endpoint'ini EN ÜSTE aldık.
# Artık kod önce buraya bakacak, eğer adres "me" değilse
# aşağı inip ID kontrolü yapacak.
# ----------------------------------------------------------------

# ✔ Kullanıcının kendi rezervasyonlarını getir
@router.get("/me", response_model=list[schemas.ReservationResponse])
def get_my_reservations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)  # 🔹 Token ile kullanıcıyı alıyoruz
):
    return reservation_crud.get_reservations_by_user(db, user_id=current_user.id)


# ✔ Yeni rezervasyon oluştur
@router.post("/", response_model=schemas.ReservationResponse)
def create_reservation(
    reservation: schemas.ReservationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)  # 🔹 Token ile kullanıcıyı alıyoruz
):
    # Tarih çakışması kontrolü
    conflict = reservation_crud.check_reservation_overlap(
        db=db,
        car_id=reservation.car_id,
        start_date=reservation.start_date,
        end_date=reservation.end_date
    )
    if conflict:
        raise HTTPException(status_code=400, detail="Bu araç seçilen tarihler arasında zaten kiralanmış.")

    # User_id artık current_user.id üzerinden geliyor
    return reservation_crud.create_reservation(db, reservation, user_id=current_user.id)


# ✔ Tüm rezervasyonları getir (admin veya genel kullanım için)
@router.get("/", response_model=list[schemas.ReservationResponse])
def get_reservations(db: Session = Depends(get_db)):
    return reservation_crud.get_all_reservations(db)


# ----------------------------------------------------------------
# 🚨 DİKKAT: ID parametresi alanlar (/ {reservation_id}) aşağıda kalmalı
# ----------------------------------------------------------------

# ✔ ID'ye göre rezervasyon getir
@router.get("/{reservation_id}", response_model=schemas.ReservationResponse)
def get_reservation(reservation_id: int, db: Session = Depends(get_db)):
    res = reservation_crud.get_reservation_by_id(db, reservation_id)
    if not res:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı.")
    return res


# ✔ Rezervasyon sil
@router.delete("/{reservation_id}")
def delete_reservation(reservation_id: int, db: Session = Depends(get_db)):
    success = reservation_crud.delete_reservation(db, reservation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı.")
    return {"message": "Rezervasyon silindi."}