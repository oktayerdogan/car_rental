# app/services/car_service.py
"""
Car Service - Business Logic Layer (MVC Pattern)
Bu modül, araç işlemleri için iş mantığını içerir.
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from functools import wraps
import logging

from ..models import Car, CarImage
from ..decorators.logging_decorator import log_request, get_logger

logger = get_logger("CarService")


class CarService:
    """
    Araç Servisi (MVC - Service Layer)
    
    Bu sınıf, araç ile ilgili tüm iş mantığını içerir.
    Controller (Router) bu servisi kullanarak işlemleri gerçekleştirir.
    """
    
    def __init__(self, db: Session):
        """
        Service başlatıcı
        
        Args:
            db: SQLAlchemy veritabanı oturumu
        """
        self.db = db
        logger.info("🚗 CarService initialized")
    
    def get_all_cars(self) -> List[Car]:
        """
        Tüm araçları getirir.
        
        Returns:
            List[Car]: Araç listesi
        """
        logger.info("📋 Fetching all cars")
        cars = self.db.query(Car).all()
        logger.info(f"✅ Found {len(cars)} cars")
        return cars
    
    def get_car_by_id(self, car_id: int) -> Optional[Car]:
        """
        ID'ye göre araç getirir.
        
        Args:
            car_id: Araç ID'si
            
        Returns:
            Optional[Car]: Bulunan araç veya None
        """
        logger.info(f"🔍 Fetching car with ID: {car_id}")
        car = self.db.query(Car).filter(Car.id == car_id).first()
        
        if car:
            logger.info(f"✅ Found car: {car.brand} {car.model}")
        else:
            logger.warning(f"⚠️ Car not found with ID: {car_id}")
        
        return car
    
    def get_available_cars(self) -> List[Car]:
        """
        Müsait araçları getirir.
        
        Returns:
            List[Car]: Müsait araç listesi
        """
        logger.info("📋 Fetching available cars")
        cars = self.db.query(Car).filter(Car.is_available == True).all()
        logger.info(f"✅ Found {len(cars)} available cars")
        return cars
    
    def get_rented_cars(self) -> List[Car]:
        """
        Kiradaki araçları getirir.
        
        Returns:
            List[Car]: Kiradaki araç listesi
        """
        logger.info("📋 Fetching rented cars")
        cars = self.db.query(Car).filter(Car.is_available == False).all()
        logger.info(f"✅ Found {len(cars)} rented cars")
        return cars
    
    def create_car(self, brand: str, model: str, year: int, 
                   price_per_day: float, gear_type: str = "Otomatik",
                   fuel_type: str = "Benzin", image_url: str = None) -> Car:
        """
        Yeni araç oluşturur.
        
        Args:
            brand: Marka
            model: Model
            year: Yıl
            price_per_day: Günlük fiyat
            gear_type: Vites tipi
            fuel_type: Yakıt tipi
            image_url: Kapak resmi URL'si
            
        Returns:
            Car: Oluşturulan araç
        """
        logger.info(f"➕ Creating new car: {brand} {model}")
        
        new_car = Car(
            brand=brand,
            model=model,
            year=year,
            price_per_day=price_per_day,
            gear_type=gear_type,
            fuel_type=fuel_type,
            image_url=image_url,
            is_available=True
        )
        
        self.db.add(new_car)
        self.db.commit()
        self.db.refresh(new_car)
        
        logger.info(f"✅ Car created with ID: {new_car.id}")
        return new_car
    
    def update_car_availability(self, car_id: int, is_available: bool) -> Optional[Car]:
        """
        Araç müsaitlik durumunu günceller.
        
        Args:
            car_id: Araç ID'si
            is_available: Yeni müsaitlik durumu
            
        Returns:
            Optional[Car]: Güncellenen araç veya None
        """
        logger.info(f"🔄 Updating car {car_id} availability to: {is_available}")
        
        car = self.get_car_by_id(car_id)
        if not car:
            return None
        
        car.is_available = is_available
        self.db.commit()
        self.db.refresh(car)
        
        logger.info(f"✅ Car {car_id} availability updated")
        return car
    
    def update_car(self, car_id: int, brand: str = None, model: str = None,
                   year: int = None, price_per_day: float = None,
                   gear_type: str = None, fuel_type: str = None,
                   is_available: bool = None) -> Optional[Car]:
        """
        Araç bilgilerini günceller (Admin için).
        
        Args:
            car_id: Araç ID'si
            Diğer argümanlar: Güncellenecek alanlar (None olanlar güncellenmez)
            
        Returns:
            Optional[Car]: Güncellenen araç veya None
        """
        logger.info(f"🔄 Updating car with ID: {car_id}")
        
        car = self.get_car_by_id(car_id)
        if not car:
            return None
        
        # Sadece gönderilen alanları güncelle
        if brand is not None:
            car.brand = brand
        if model is not None:
            car.model = model
        if year is not None:
            car.year = year
        if price_per_day is not None:
            car.price_per_day = price_per_day
        if gear_type is not None:
            car.gear_type = gear_type
        if fuel_type is not None:
            car.fuel_type = fuel_type
        if is_available is not None:
            car.is_available = is_available
        
        self.db.commit()
        self.db.refresh(car)
        
        logger.info(f"✅ Car {car_id} updated successfully")
        return car
    
    def delete_car(self, car_id: int) -> bool:
        """
        Araç siler.
        
        Args:
            car_id: Araç ID'si
            
        Returns:
            bool: Silme başarılı mı
        """
        logger.info(f"🗑️ Deleting car with ID: {car_id}")
        
        car = self.get_car_by_id(car_id)
        if not car:
            logger.warning(f"⚠️ Cannot delete: Car {car_id} not found")
            return False
        
        self.db.delete(car)
        self.db.commit()
        
        logger.info(f"✅ Car {car_id} deleted successfully")
        return True
    
    def add_car_image(self, car_id: int, image_url: str) -> Optional[CarImage]:
        """
        Araca resim ekler.
        
        Args:
            car_id: Araç ID'si
            image_url: Resim URL'si
            
        Returns:
            Optional[CarImage]: Oluşturulan resim kaydı veya None
        """
        logger.info(f"🖼️ Adding image to car {car_id}")
        
        car = self.get_car_by_id(car_id)
        if not car:
            return None
        
        car_image = CarImage(car_id=car_id, url=image_url)
        self.db.add(car_image)
        self.db.commit()
        self.db.refresh(car_image)
        
        logger.info(f"✅ Image added to car {car_id}")
        return car_image


# Decorator kullanımı için wrapper fonksiyon
def with_car_service(func):
    """
    Car Service Injection Decorator
    
    Bu decorator, fonksiyona CarService instance'ı enjekte eder.
    """
    @wraps(func)
    async def wrapper(*args, db: Session, **kwargs):
        service = CarService(db)
        kwargs['car_service'] = service
        return await func(*args, db=db, **kwargs)
    return wrapper
