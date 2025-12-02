from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import date
from .. import models, schemas

# Yeni rezervasyon oluşturma
def create_reservation(db: Session, reservation: schemas.ReservationCreate, user_id: int):
    db_res = models.Reservation(
        car_id=reservation.car_id,
        user_id=user_id,  # Artık dışarıdan gelen ID'yi alıyor
        start_date=reservation.start_date,
        end_date=reservation.end_date
    )
    db.add(db_res)
    db_car = db.query(models.Car).filter(models.Car.id == reservation.car_id).first()
    if db_car:
        db_car.is_available = False
    db.commit()
    db.refresh(db_res)
    return db_res


# Araç belirtilen tarihlerde kiralanmış mı?
def check_reservation_overlap(db: Session, car_id: int, start_date: date, end_date: date):
    return db.query(models.Reservation).filter(
        and_(
            models.Reservation.car_id == car_id,
            models.Reservation.start_date <= end_date,
            models.Reservation.end_date >= start_date
        )
    ).first()


def get_all_reservations(db: Session):
    return db.query(models.Reservation).all()


def get_reservation_by_id(db: Session, reservation_id: int):
    return db.query(models.Reservation).filter(
        models.Reservation.id == reservation_id
    ).first()


def delete_reservation(db: Session, reservation_id: int):
    # 1. Rezervasyonu bul
    res = get_reservation_by_id(db, reservation_id)
    
    if res:
        # 2. Bu rezervasyona ait arabayı bul
        car = db.query(models.Car).filter(models.Car.id == res.car_id).first()
        
        # 3. Arabayı tekrar müsait (True) yap
        if car:
            car.is_available = True
            
        # 4. Rezervasyonu sil
        db.delete(res)
        db.commit()
        return True
        
    return False

def get_reservations_by_user(db: Session, user_id: int):
    return db.query(models.Reservation).filter(models.Reservation.user_id == user_id).all()

