# app/services/reservation_service.py
"""
Reservation Service - Business Logic Layer (MVC Pattern)
Bu modül, rezervasyon işlemleri için iş mantığını içerir.
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from functools import wraps
import logging

from ..models import Reservation, Car, User
from ..decorators.logging_decorator import get_logger

logger = get_logger("ReservationService")


class ReservationService:
    """
    Rezervasyon Servisi (MVC - Service Layer)
    
    Bu sınıf, rezervasyon ile ilgili tüm iş mantığını içerir.
    Controller (Router) bu servisi kullanarak işlemleri gerçekleştirir.
    """
    
    def __init__(self, db: Session):
        """
        Service başlatıcı
        
        Args:
            db: SQLAlchemy veritabanı oturumu
        """
        self.db = db
        logger.info("📅 ReservationService initialized")
    
    def get_all_reservations(self) -> List[Reservation]:
        """
        Tüm rezervasyonları getirir.
        
        Returns:
            List[Reservation]: Rezervasyon listesi
        """
        logger.info("📋 Fetching all reservations")
        reservations = self.db.query(Reservation).all()
        logger.info(f"✅ Found {len(reservations)} reservations")
        return reservations
    
    def get_user_reservations(self, user_id: int) -> List[Reservation]:
        """
        Kullanıcının rezervasyonlarını getirir.
        
        Args:
            user_id: Kullanıcı ID'si
            
        Returns:
            List[Reservation]: Kullanıcının rezervasyonları
        """
        logger.info(f"📋 Fetching reservations for user: {user_id}")
        reservations = self.db.query(Reservation).filter(
            Reservation.user_id == user_id
        ).all()
        logger.info(f"✅ Found {len(reservations)} reservations for user {user_id}")
        return reservations
    
    def get_reservation_by_id(self, reservation_id: int) -> Optional[Reservation]:
        """
        ID'ye göre rezervasyon getirir.
        
        Args:
            reservation_id: Rezervasyon ID'si
            
        Returns:
            Optional[Reservation]: Bulunan rezervasyon veya None
        """
        logger.info(f"🔍 Fetching reservation with ID: {reservation_id}")
        reservation = self.db.query(Reservation).filter(
            Reservation.id == reservation_id
        ).first()
        
        if reservation:
            logger.info(f"✅ Found reservation: {reservation_id}")
        else:
            logger.warning(f"⚠️ Reservation not found: {reservation_id}")
        
        return reservation
    
    def check_car_availability(self, car_id: int, start_date: date, end_date: date) -> bool:
        """
        Aracın belirtilen tarih aralığında müsait olup olmadığını kontrol eder.
        
        Args:
            car_id: Araç ID'si
            start_date: Başlangıç tarihi
            end_date: Bitiş tarihi
            
        Returns:
            bool: Araç müsait mi
        """
        logger.info(f"🔍 Checking availability for car {car_id}: {start_date} - {end_date}")
        
        # Çakışan rezervasyon var mı kontrol et
        conflicting = self.db.query(Reservation).filter(
            Reservation.car_id == car_id,
            Reservation.start_date <= end_date,
            Reservation.end_date >= start_date
        ).first()
        
        is_available = conflicting is None
        
        if is_available:
            logger.info(f"✅ Car {car_id} is available for selected dates")
        else:
            logger.warning(f"⚠️ Car {car_id} is not available - conflicts with reservation {conflicting.id}")
        
        return is_available
    
    def create_reservation(self, user_id: int, car_id: int, 
                          start_date: date, end_date: date) -> Reservation:
        """
        Yeni rezervasyon oluşturur.
        
        Args:
            user_id: Kullanıcı ID'si
            car_id: Araç ID'si
            start_date: Başlangıç tarihi
            end_date: Bitiş tarihi
            
        Returns:
            Reservation: Oluşturulan rezervasyon
            
        Raises:
            ValueError: Araç müsait değilse
        """
        logger.info(f"➕ Creating reservation: User {user_id}, Car {car_id}")
        
        # Müsaitlik kontrolü
        if not self.check_car_availability(car_id, start_date, end_date):
            logger.error(f"❌ Cannot create reservation: Car {car_id} not available")
            raise ValueError("Araç seçilen tarihler için müsait değil.")
        
        # Rezervasyon oluştur
        reservation = Reservation(
            user_id=user_id,
            car_id=car_id,
            start_date=start_date,
            end_date=end_date
        )
        
        self.db.add(reservation)
        
        # Aracı meşgul olarak işaretle
        car = self.db.query(Car).filter(Car.id == car_id).first()
        if car:
            car.is_available = False
        
        self.db.commit()
        self.db.refresh(reservation)
        
        logger.info(f"✅ Reservation created with ID: {reservation.id}")
        return reservation
    
    def cancel_reservation(self, reservation_id: int, user_id: int = None) -> bool:
        """
        Rezervasyonu iptal eder.
        
        Args:
            reservation_id: Rezervasyon ID'si
            user_id: İsteğe bağlı kullanıcı ID kontrolü
            
        Returns:
            bool: İptal başarılı mı
        """
        logger.info(f"🗑️ Cancelling reservation: {reservation_id}")
        
        reservation = self.get_reservation_by_id(reservation_id)
        if not reservation:
            logger.warning(f"⚠️ Cannot cancel: Reservation {reservation_id} not found")
            return False
        
        # Kullanıcı kontrolü (admin değilse)
        if user_id and reservation.user_id != user_id:
            logger.warning(f"⚠️ User {user_id} cannot cancel reservation {reservation_id}")
            return False
        
        # Aracı müsait yap
        car = self.db.query(Car).filter(Car.id == reservation.car_id).first()
        if car:
            car.is_available = True
        
        # Rezervasyonu sil
        self.db.delete(reservation)
        self.db.commit()
        
        logger.info(f"✅ Reservation {reservation_id} cancelled successfully")
        return True
    
    def calculate_total_price(self, car_id: int, start_date: date, end_date: date) -> float:
        """
        Toplam kiralama ücretini hesaplar.
        
        Args:
            car_id: Araç ID'si
            start_date: Başlangıç tarihi
            end_date: Bitiş tarihi
            
        Returns:
            float: Toplam ücret
        """
        car = self.db.query(Car).filter(Car.id == car_id).first()
        if not car:
            return 0.0
        
        days = (end_date - start_date).days + 1
        total = car.price_per_day * days
        
        logger.info(f"💰 Calculated price for car {car_id}: {days} days x {car.price_per_day} = {total}")
        return total


# Decorator kullanımı için wrapper fonksiyon
def with_reservation_service(func):
    """
    Reservation Service Injection Decorator
    
    Bu decorator, fonksiyona ReservationService instance'ı enjekte eder.
    """
    @wraps(func)
    async def wrapper(*args, db: Session, **kwargs):
        service = ReservationService(db)
        kwargs['reservation_service'] = service
        return await func(*args, db=db, **kwargs)
    return wrapper
