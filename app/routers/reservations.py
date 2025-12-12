from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schemas, models
from ..crud import reservation as reservation_crud
from ..auth import get_current_user, require_admin  # 👈 require_admin'i ekledik!

router = APIRouter(prefix="/reservations", tags=["Reservations"])

# ✔ Kullanıcının kendi rezervasyonlarını getir (Müşteri için)
@router.get("/me", response_model=list[schemas.ReservationResponse])
def get_my_reservations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) 
):
    """Mevcut kullanıcının (Müşteri) kendi rezervasyonlarını listeler."""
    return reservation_crud.get_reservations_by_user(db, user_id=current_user.id)


# ✔ Yeni rezervasyon oluştur (Müşteri için)
@router.post("/", response_model=schemas.ReservationResponse, status_code=status.HTTP_201_CREATED)
def create_reservation(
    reservation: schemas.ReservationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)  # Token zorunlu
):
    """Yeni rezervasyon oluşturur (Ödeme ekranından sonra çağrılır)."""
    # 1. Tarih çakışması kontrolü
    conflict = reservation_crud.check_reservation_overlap(
        db=db,
        car_id=reservation.car_id,
        start_date=reservation.start_date,
        end_date=reservation.end_date
    )
    if conflict:
        raise HTTPException(status_code=400, detail="Bu araç seçilen tarihler arasında zaten kiralanmış.")

    # 2. Rezervasyonu oluştur
    return reservation_crud.create_reservation(db, reservation, user_id=current_user.id)


# 👑 ✔ Tüm rezervasyonları getir (Admin için)
@router.get("/", response_model=list[schemas.ReservationResponse])
def get_reservations(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(require_admin) # 👈 Sadece Admin görebilir!
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
    current_user: models.User = Depends(get_current_user) # Token ile kullanıcıyı al
):
    """Rezervasyon siler (Sadece sahibi veya Admin)."""
    res = reservation_crud.get_reservation_by_id(db, reservation_id)
    
    if not res:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı.")
        
    # 🚨 GÜVENLİK KONTROLÜ: Silme yetkisi sadece: 
    # 1. Rezervasyonu yapan kişiye (res.user_id) 
    # 2. Veya Admin'e (current_user.role == "admin") aittir.
    is_owner = res.user_id == current_user.id
    is_admin = current_user.role == "admin"
    
    if not is_owner and not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu rezervasyonu silme yetkiniz yok.")


    success = reservation_crud.delete_reservation(db, reservation_id)
    if not success:
        # Bu kısma normalde düşmemeli ama garanti için
        raise HTTPException(status_code=500, detail="Silme işlemi başarısız oldu.")
        
    return {"message": "Rezervasyon silindi."}