# app/controllers/message_controller.py
"""
Message Controller (MVC Pattern)
Mesajlaşma işlemlerini yönetir.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from .. import schemas
from ..models import Message, User
from ..auth import get_current_user, require_admin
from ..decorators.logging_decorator import log_request
from ..decorators.error_handler import handle_exceptions, handle_db_exceptions

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/", response_model=schemas.MessageResponse)
@handle_db_exceptions
@log_request
async def send_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Kullanıcı admin'e mesaj gönderir.
    
    Decorator'lar: @handle_db_exceptions, @log_request
    """
    if not message.subject.strip() or not message.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Konu ve mesaj içeriği boş olamaz."
        )
    
    db_message = Message(
        user_id=current_user.id,
        subject=message.subject.strip(),
        content=message.content.strip()
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return db_message


@router.get("/me", response_model=List[schemas.MessageResponse])
@handle_exceptions
@log_request
async def get_my_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Kullanıcının kendi mesajlarını listeler.
    
    Decorator'lar: @handle_exceptions, @log_request
    """
    messages = db.query(Message).filter(
        Message.user_id == current_user.id
    ).order_by(Message.created_at.desc()).all()
    
    return messages


@router.get("/", response_model=List[schemas.MessageResponse])
@handle_exceptions
@log_request
async def get_all_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Tüm mesajları listeler (Admin Only).
    
    Decorator'lar: @handle_exceptions, @log_request
    """
    messages = db.query(Message).order_by(
        Message.is_read.asc(),
        Message.created_at.desc()
    ).all()
    
    return messages


@router.get("/unread-count")
@handle_exceptions
@log_request
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Okunmamış mesaj sayısını döndürür (Admin Only).
    
    Decorator'lar: @handle_exceptions, @log_request
    """
    count = db.query(Message).filter(Message.is_read == False).count()
    return {"unread_count": count}


@router.put("/{message_id}/read")
@handle_db_exceptions
@log_request
async def mark_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Mesajı okundu olarak işaretler (Admin Only).
    
    Decorator'lar: @handle_db_exceptions, @log_request
    """
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı.")
    
    message.is_read = True
    db.commit()
    
    return {"message": "Mesaj okundu olarak işaretlendi."}


@router.put("/{message_id}/reply", response_model=schemas.MessageResponse)
@handle_db_exceptions
@log_request
async def reply_to_message(
    message_id: int,
    reply_data: schemas.MessageReply,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Admin mesaja yanıt verir.
    
    Decorator'lar: @handle_db_exceptions, @log_request
    """
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı.")
    
    if not reply_data.reply.strip():
        raise HTTPException(status_code=400, detail="Yanıt boş olamaz.")
    
    message.reply = reply_data.reply.strip()
    message.replied_at = datetime.utcnow()
    message.is_read = True
    
    db.commit()
    db.refresh(message)
    
    return message


@router.delete("/{message_id}")
@handle_db_exceptions
@log_request
async def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Mesajı siler (Admin Only).
    
    Decorator'lar: @handle_db_exceptions, @log_request
    """
    message = db.query(Message).filter(Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı.")
    
    db.delete(message)
    db.commit()
    
    return {"message": f"Mesaj #{message_id} silindi."}
