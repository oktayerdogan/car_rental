# app/decorators/error_handler.py
"""
Error Handling Decorators (Wrapper Pattern)
Bu modül, hata yönetimi için decorator'lar içerir.
"""

from functools import wraps
from typing import Callable
from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
import logging

# Logger
logger = logging.getLogger("RentACar.ErrorHandler")


def handle_exceptions(func: Callable) -> Callable:
    """
    General Exception Handler Decorator (Wrapper)
    
    Bu decorator, genel hataları yakalar ve uygun HTTP yanıtlarına dönüştürür.
    Tüm hatalar loglanır ve kullanıcıya anlamlı mesajlar döner.
    
    Kullanım:
        @handle_exceptions
        async def my_endpoint():
            ...
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
            
        except HTTPException:
            # FastAPI HTTP exceptions'ı olduğu gibi geçir
            raise
            
        except ValueError as e:
            # Değer hataları - 400 Bad Request
            logger.warning(f"⚠️ ValueError in {func.__name__}: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Geçersiz değer: {str(e)}"
            )
            
        except PermissionError as e:
            # Yetki hataları - 403 Forbidden
            logger.warning(f"🚫 PermissionError in {func.__name__}: {e}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Erişim reddedildi: {str(e)}"
            )
            
        except FileNotFoundError as e:
            # Bulunamadı hataları - 404 Not Found
            logger.warning(f"🔍 FileNotFoundError in {func.__name__}: {e}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Kaynak bulunamadı: {str(e)}"
            )
            
        except Exception as e:
            # Genel hatalar - 500 Internal Server Error
            logger.error(f"❌ Unexpected error in {func.__name__}: {type(e).__name__}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin."
            )
    
    return wrapper


def handle_db_exceptions(func: Callable) -> Callable:
    """
    Database Exception Handler Decorator (Wrapper)
    
    Bu decorator, veritabanı hatalarını yakalar ve uygun yanıtlara dönüştürür.
    SQLAlchemy hatalarını işler.
    
    Kullanım:
        @handle_db_exceptions
        async def db_operation():
            ...
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
            
        except IntegrityError as e:
            # Bütünlük hatası (duplicate key, foreign key violation)
            logger.error(f"🔗 IntegrityError in {func.__name__}: {e}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bu kayıt zaten mevcut veya ilişkili kayıt bulunamadı."
            )
            
        except SQLAlchemyError as e:
            # Genel veritabanı hatası
            logger.error(f"🗄️ SQLAlchemyError in {func.__name__}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Veritabanı hatası oluştu. Lütfen daha sonra tekrar deneyin."
            )
            
        except Exception as e:
            # Diğer hatalar
            logger.error(f"❌ Error in {func.__name__}: {type(e).__name__}: {e}")
            raise
    
    return wrapper


def validate_input(validation_func: Callable) -> Callable:
    """
    Input Validation Decorator (Wrapper)
    
    Bu decorator, girdileri doğrulama fonksiyonuna göre kontrol eder.
    
    Args:
        validation_func: Doğrulama fonksiyonu
        
    Kullanım:
        @validate_input(lambda x: x > 0)
        async def my_endpoint(value: int):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Doğrulama işlemi
            for key, value in kwargs.items():
                if not validation_func(value):
                    logger.warning(f"⚠️ Validation failed for {key}: {value}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Geçersiz değer: {key}"
                    )
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


def retry_on_failure(max_retries: int = 3, delay: float = 1.0) -> Callable:
    """
    Retry Decorator (Wrapper)
    
    Bu decorator, başarısız işlemleri belirtilen sayıda tekrar dener.
    
    Args:
        max_retries: Maksimum tekrar sayısı
        delay: Tekrarlar arası bekleme süresi (saniye)
        
    Kullanım:
        @retry_on_failure(max_retries=3)
        async def unreliable_operation():
            ...
    """
    import asyncio
    
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    logger.warning(f"🔄 Retry {attempt + 1}/{max_retries} for {func.__name__}: {e}")
                    
                    if attempt < max_retries - 1:
                        await asyncio.sleep(delay)
            
            logger.error(f"❌ All retries failed for {func.__name__}")
            raise last_exception
        
        return wrapper
    return decorator
