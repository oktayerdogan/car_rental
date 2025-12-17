# app/decorators/logging_decorator.py
"""
Logging Decorators (Wrapper Pattern)
Bu modül, istek/yanıt loglama işlemleri için decorator'lar içerir.
"""

from functools import wraps
from typing import Callable
import logging
import time
from datetime import datetime

# Logger konfigürasyonu
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("RentACar")


def log_request(func: Callable) -> Callable:
    """
    Request Logging Decorator (Wrapper)
    
    Bu decorator, gelen istekleri loglar.
    İstek zamanı, fonksiyon adı ve parametreleri kaydedilir.
    
    Kullanım:
        @log_request
        async def my_endpoint():
            ...
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # İstek başlangıç zamanı
        start_time = time.time()
        request_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Log: İstek başlangıcı
        logger.info(f"📥 REQUEST [{request_time}]")
        logger.info(f"   ├── Function: {func.__name__}")
        logger.info(f"   ├── Module: {func.__module__}")
        
        # Parametreleri logla (hassas verileri gizle)
        safe_kwargs = {k: "***" if "password" in k.lower() else v 
                       for k, v in kwargs.items() if k not in ['db', 'current_user']}
        if safe_kwargs:
            logger.info(f"   └── Params: {safe_kwargs}")
        
        try:
            # Fonksiyonu çalıştır
            result = await func(*args, **kwargs)
            
            # Süre hesapla
            duration = time.time() - start_time
            
            # Log: Başarılı yanıt
            logger.info(f"📤 RESPONSE [{func.__name__}]")
            logger.info(f"   ├── Status: SUCCESS ✅")
            logger.info(f"   └── Duration: {duration:.3f}s")
            
            return result
            
        except Exception as e:
            # Süre hesapla
            duration = time.time() - start_time
            
            # Log: Hata
            logger.error(f"📤 RESPONSE [{func.__name__}]")
            logger.error(f"   ├── Status: ERROR ❌")
            logger.error(f"   ├── Error: {type(e).__name__}: {str(e)}")
            logger.error(f"   └── Duration: {duration:.3f}s")
            
            raise
    
    return wrapper


def log_response(func: Callable) -> Callable:
    """
    Response Logging Decorator (Wrapper)
    
    Bu decorator, yanıtları detaylı olarak loglar.
    Yanıt tipi ve özet bilgiler kaydedilir.
    
    Kullanım:
        @log_response
        async def my_endpoint():
            ...
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        result = await func(*args, **kwargs)
        
        # Yanıt tipini logla
        response_type = type(result).__name__
        logger.info(f"📋 Response Type: {response_type}")
        
        # Liste ise eleman sayısını logla
        if isinstance(result, list):
            logger.info(f"   └── Items: {len(result)}")
        elif hasattr(result, 'id'):
            logger.info(f"   └── ID: {result.id}")
        
        return result
    
    return wrapper


def log_db_operation(operation: str) -> Callable:
    """
    Database Operation Logging Decorator (Wrapper)
    
    Bu decorator, veritabanı işlemlerini loglar.
    
    Args:
        operation: İşlem adı (CREATE, READ, UPDATE, DELETE)
        
    Kullanım:
        @log_db_operation("CREATE")
        async def create_item():
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            logger.info(f"🗄️ DB Operation: {operation}")
            logger.info(f"   └── Function: {func.__name__}")
            
            result = await func(*args, **kwargs)
            
            logger.info(f"✅ DB {operation} completed successfully")
            return result
        
        return wrapper
    return decorator


# Utility: Custom logger oluşturma
def get_logger(name: str) -> logging.Logger:
    """
    Modül için özel logger oluşturur.
    
    Args:
        name: Logger adı
        
    Returns:
        logging.Logger: Konfigüre edilmiş logger
    """
    custom_logger = logging.getLogger(name)
    custom_logger.setLevel(logging.INFO)
    return custom_logger
