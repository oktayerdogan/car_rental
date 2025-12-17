# app/controllers/car_controller.py
"""
Car Controller (MVC Pattern)
HTTP isteklerini karşılar ve CarService'e yönlendirir.
"""

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import uuid

from ..database import get_db
from .. import schemas
from ..models import Car, CarImage, User
from ..auth import require_admin
from ..services.car_service import CarService
from ..decorators.logging_decorator import log_request
from ..decorators.error_handler import handle_exceptions, handle_db_exceptions

router = APIRouter(prefix="/cars", tags=["Cars"])

# Resim klasörü
IMAGEDIR = "static/images/"
if not os.path.exists(IMAGEDIR):
    os.makedirs(IMAGEDIR)


@router.post("/", response_model=schemas.Car, status_code=status.HTTP_201_CREATED)
@handle_db_exceptions
@log_request
async def create_car(
    brand: str = Form(...),
    model: str = Form(...),
    year: int = Form(...),
    price_per_day: float = Form(...),
    gear_type: str = Form("Otomatik"),
    fuel_type: str = Form("Benzin"),
    is_available: bool = Form(True),
    files: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Yeni araç oluşturur (Admin Only)
    
    Controller -> Service pattern kullanılır.
    Decorator'lar: @handle_db_exceptions, @log_request
    """
    # Service Layer
    car_service = CarService(db)
    
    # Araç oluştur
    new_car = car_service.create_car(
        brand=brand,
        model=model,
        year=year,
        price_per_day=price_per_day,
        gear_type=gear_type,
        fuel_type=fuel_type
    )
    
    # Resimleri kaydet
    if files:
        saved_urls = []
        for file in files:
            unique_filename = f"{uuid.uuid4()}_{file.filename.replace(' ', '_')}"
            file_path = f"{IMAGEDIR}{unique_filename}"
            
            with open(file_path, "wb+") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            img_url = f"http://127.0.0.1:8000/static/images/{unique_filename}"
            car_service.add_car_image(new_car.id, img_url)
            saved_urls.append(img_url)
        
        if saved_urls:
            new_car.image_url = saved_urls[0]
            db.commit()
            db.refresh(new_car)
    
    return new_car


@router.get("/", response_model=List[schemas.Car])
@handle_exceptions
@log_request
async def get_all_cars(db: Session = Depends(get_db)):
    """
    Tüm araçları listeler
    
    Controller -> Service pattern kullanılır.
    """
    car_service = CarService(db)
    return car_service.get_all_cars()


@router.get("/{car_id}", response_model=schemas.Car)
@handle_exceptions
@log_request
async def get_car_by_id(car_id: int, db: Session = Depends(get_db)):
    """
    ID'ye göre araç getirir
    
    Controller -> Service pattern kullanılır.
    """
    car_service = CarService(db)
    car = car_service.get_car_by_id(car_id)
    
    if not car:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    
    return car


@router.delete("/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
@handle_db_exceptions
@log_request
async def delete_car(
    car_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Araç siler (Admin Only)
    
    Controller -> Service pattern kullanılır.
    """
    car_service = CarService(db)
    
    if not car_service.delete_car(car_id):
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    
    return None
