# app/models/message.py
"""
Message Model (MVC Pattern - Model Layer)
Mesaj veritabanı modeli
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Message(Base):
    """
    Mesaj Modeli (Kullanıcı-Admin arası iletişim)
    
    Attributes:
        id: Benzersiz mesaj ID'si
        user_id: Mesajı gönderen kullanıcı ID'si
        subject: Mesaj konusu
        content: Mesaj içeriği
        reply: Admin yanıtı
        is_read: Okunma durumu
        created_at: Gönderilme tarihi
        replied_at: Yanıtlanma tarihi
    """
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String, nullable=False)
    content = Column(String, nullable=False)
    reply = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    replied_at = Column(DateTime, nullable=True)
    
    # İlişki
    user = relationship("User", back_populates="messages")
    
    def __repr__(self):
        return f"<Message(id={self.id}, subject='{self.subject}', is_read={self.is_read})>"
    
    def is_replied(self) -> bool:
        """Mesajın yanıtlanıp yanıtlanmadığını kontrol eder"""
        return self.reply is not None
