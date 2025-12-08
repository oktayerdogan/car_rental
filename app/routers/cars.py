from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
from .. import models, schemas, database, auth

router = APIRouter(
    prefix="/cars",
    tags=["Cars"]
)

get_db = database.get_db
get_current_user = auth.get_current_user

# ✅ EKLEME İŞLEMİ (RESİMLİ & DETAYLI)
# Sadece Admin yapabilir
@router.post("/", response_model=schemas.Car)
def create_car(
    brand: str = Form(...),
    model: str = Form(...),
    year: int = Form(...),
    price_per_day: float = Form(...),
    gear_type: str = Form("Otomatik"),
    fuel_type: str = Form("Benzin"),
    files: List[UploadFile] = File(default=[]), # Resim Listesi
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Yetki Kontrolü
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Sadece admin araç ekleyebilir")

    # 2. Arabayı DB'ye Kaydet
    new_car = models.Car(
        brand=brand,
        model=model,
        year=year,
        price_per_day=price_per_day,
        gear_type=gear_type,
        fuel_type=fuel_type
    )
    db.add(new_car)
    db.commit()
    db.refresh(new_car)

    # 3. Resimleri Kaydet (Varsa)
    if not os.path.exists("static/images"):
        os.makedirs("static/images")

    if files:
        for index, file in enumerate(files):
            # Dosya ismini temizle ve benzersiz yap
            safe_filename = f"{new_car.id}_{file.filename.replace(' ', '_')}"
            file_location = f"static/images/{safe_filename}"
            
            # Sunucuya (Klasöre) Kaydet
            with open(file_location, "wb+") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # URL Oluştur
            img_url = f"http://127.0.0.1:8000/{file_location}"
            
            # Resim Tablosuna Ekle
            db_image = models.CarImage(url=img_url, car_id=new_car.id)
            db.add(db_image)

            # İlk resmi kapak resmi olarak ayarla
            if index == 0:
                new_car.image_url = img_url
        
        db.commit()
        db.refresh(new_car)

    return new_car

# ✅ LİSTELEME (HERKES YAPABİLİR)
@router.get("/", response_model=List[schemas.Car])
def get_cars(db: Session = Depends(get_db)):
    return db.query(models.Car).all()

# ✅ TEK ARAÇ GETİRME
@router.get("/{car_id}", response_model=schemas.Car)
def get_car(car_id: int, db: Session = Depends(get_db)):
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return car

# ✅ SİLME (SADECE ADMIN)
@router.delete("/{car_id}")
def delete_car(car_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Yetkisiz işlem")
    
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # İlişkili resimleri de silebiliriz (Veritabanı cascade ayarlıysa otomatik silinir)
    db.delete(car)
    db.commit()
    return {"message": "Car Deleted"}