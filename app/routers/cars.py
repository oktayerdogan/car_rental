from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import uuid 
from .. import models, schemas, database, auth

router = APIRouter(
    prefix="/cars",
    tags=["Cars"]
)

get_db = database.get_db

# 💾 RESİMLERİN KAYDEDİLECEĞİ KLASÖR
IMAGEDIR = "static/images/"

if not os.path.exists(IMAGEDIR):
    os.makedirs(IMAGEDIR)


# ✅ EKLEME İŞLEMİ (SADECE ADMIN)
@router.post("/", response_model=schemas.Car, status_code=status.HTTP_201_CREATED)
def create_car(
    brand: str = Form(...),
    model: str = Form(...),
    year: int = Form(...),
    price_per_day: float = Form(...),
    gear_type: str = Form("Otomatik"),
    fuel_type: str = Form("Benzin"),
    is_available: bool = Form(True),
    files: List[UploadFile] = File(default=[]), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    # 1. Arabayı DB'ye Kaydet
    new_car = models.Car(
        brand=brand,
        model=model,
        year=year,
        price_per_day=price_per_day,
        gear_type=gear_type,
        fuel_type=fuel_type,
        is_available=is_available,
        image_url="" 
    )
    db.add(new_car)
    db.commit()
    db.refresh(new_car)

    # 2. Resimleri Kaydet
    if files:
        saved_urls = []
        for file in files:
            # Benzersiz isim oluştur
            unique_filename = f"{uuid.uuid4()}_{file.filename.replace(' ', '_')}"
            file_path = f"{IMAGEDIR}{unique_filename}"
            
            # 1. Fiziksel Kayıt (Klasöre)
            with open(file_path, "wb+") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # URL Oluştur
            img_url = f"http://127.0.0.1:8000/static/images/{unique_filename}"
            
            # 2. Veritabanı Kaydı (CarImage Tablosuna)
            # 🚨 ARTIK TRY-EXCEPT YOK! KESİN KAYDEDİYORUZ.
            db_image = models.CarImage(url=img_url, car_id=new_car.id)
            db.add(db_image)
            
            saved_urls.append(img_url)

        # İlk resmi aracın kapak resmi (image_url) olarak güncelle
        if saved_urls:
            new_car.image_url = saved_urls[0]
            
        # Tüm resim eklemelerini onayla
        db.commit()
        db.refresh(new_car)

    return new_car


# ✅ LİSTELEME
@router.get("/", response_model=List[schemas.Car])
def get_cars(db: Session = Depends(get_db)):
    return db.query(models.Car).all()


# ✅ TEK ARAÇ GETİRME
@router.get("/{car_id}", response_model=schemas.Car)
def get_car(car_id: int, db: Session = Depends(get_db)):
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    return car


# ✅ SİLME (SADECE ADMIN)
@router.delete("/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_car(
    car_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.require_admin)
):
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    
    db.delete(car)
    db.commit()
    return