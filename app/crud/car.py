from sqlalchemy.orm import Session
from .. import models,schemas

def create_car(db: Session, car: schemas.CarCreate):
    db_car=models.Car(**car.dict())
    db.add(db_car)
    db.commit()
    db.refresh(db_car)
    return db_car

def get_cars(db:Session):
    return db.query(models.Car).all()

def get_car(db:Session, car_id:int):
    return db.query(models.Car).filter(models.Car.id==car_id).first()

def delete_car(db:Session,car_id:int):
    car = get_car(db,car_id)
    if car:
        db.delete(car)
        db.commit()
        return True
    return False