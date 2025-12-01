from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud ,schemas

router = APIRouter(prefix="/cars",tags=["Cars"])

@router.post("/", response_model=schemas.CarResponse)
def create_car(car: schemas.CarCreate, db:Session = Depends(get_db)):
    return crud.car.create_car(db, car)

@router.get("/",response_model=list[schemas.CarResponse])
def get_cars(db:Session = Depends(get_db)):
    return crud.car.get_cars(db)

@router.get("/{car_id}",response_model=schemas.CarResponse)
def get_car(car_id: int, db:Session=Depends(get_db)):
    car = crud.car.get_car(db,car_id)
    if car is None:
        raise HTTPException(status_code=404,detail="car not found")
    return car

@router.delete("/{car_id}")
def delete_car(car_id:int, db:Session=Depends(get_db)):
    success = crud.car.delete_car(db, car_id)
    if not success:
        raise HTTPException(status_code=404, detail="car not found")
    return{"message ":"Car Deleted"} 