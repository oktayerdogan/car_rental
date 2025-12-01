from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas
from ..crud import reservation as reservation_crud

router = APIRouter(prefix="/reservations", tags=["Reservations"])


# ✔ Yeni rezervasyon oluştur
@router.post("/", response_model=schemas.ReservationResponse)
def create_reservation(reservation: schemas.ReservationCreate, db: Session = Depends(get_db)):

    # Tarih çakışması kontrolü
    conflict = reservation_crud.check_reservation_overlap(
        db=db,
        car_id=reservation.car_id,
        start_date=reservation.start_date,
        end_date=reservation.end_date
    )

    if conflict:
        raise HTTPException(status_code=400, detail="Bu araç seçilen tarihler arasında zaten kiralanmış.")

    return reservation_crud.create_reservation(db, reservation)


# ✔ Tüm rezervasyonları getir
@router.get("/", response_model=list[schemas.ReservationResponse])
def get_reservations(db: Session = Depends(get_db)):
    return reservation_crud.get_reservations(db)


# ✔ ID'ye göre rezervasyon getir
@router.get("/{reservation_id}", response_model=schemas.ReservationResponse)
def get_reservation(reservation_id: int, db: Session = Depends(get_db)):
    res = reservation_crud.get_reservation(db, reservation_id)
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
