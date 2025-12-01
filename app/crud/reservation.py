from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import date
from .. import models, schemas

# Yeni rezervasyon oluşturma
def create_reservation(db: Session, reservation: schemas.ReservationCreate):
    db_res = models.Reservation(
        car_id=reservation.car_id,
        user_id=1,  # Şimdilik sabit kullanıcı
        start_date=reservation.start_date,
        end_date=reservation.end_date
    )
    db.add(db_res)
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
    res = get_reservation_by_id(db, reservation_id)
    if res:
        db.delete(res)
        db.commit()
        return True
    return False
