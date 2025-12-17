# app/routers/messages.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import schemas, models
from ..database import get_db
from ..auth import get_current_user, require_admin

router = APIRouter(prefix="/messages", tags=["Messages"])

# Kullanıcı mesaj gönderir
@router.post("/", response_model=schemas.MessageResponse)
def send_message(
    message: schemas.MessageCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Kullanıcı admin'e mesaj gönderir"""
    
    if not message.subject.strip() or not message.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Konu ve mesaj içeriği boş olamaz."
        )
    
    db_message = models.Message(
        user_id=current_user.id,
        subject=message.subject.strip(),
        content=message.content.strip()
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return db_message

# Kullanıcı kendi mesajlarını görür
@router.get("/me", response_model=List[schemas.MessageResponse])
def get_my_messages(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Kullanıcının kendi mesajlarını listeler"""
    messages = db.query(models.Message).filter(
        models.Message.user_id == current_user.id
    ).order_by(models.Message.created_at.desc()).all()
    
    return messages

# Admin tüm mesajları görür
@router.get("/", response_model=List[schemas.MessageResponse])
def get_all_messages(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin tüm mesajları listeler"""
    messages = db.query(models.Message).order_by(
        models.Message.is_read.asc(),  # Okunmamışlar önce
        models.Message.created_at.desc()
    ).all()
    
    return messages

# Okunmamış mesaj sayısı (Admin)
@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Okunmamış mesaj sayısını döndürür"""
    count = db.query(models.Message).filter(
        models.Message.is_read == False
    ).count()
    
    return {"unread_count": count}

# Admin mesajı okur (is_read = True)
@router.put("/{message_id}/read")
def mark_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Mesajı okundu olarak işaretler"""
    message = db.query(models.Message).filter(models.Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı.")
    
    message.is_read = True
    db.commit()
    
    return {"message": "Mesaj okundu olarak işaretlendi."}

# Admin mesaja yanıt verir
@router.put("/{message_id}/reply", response_model=schemas.MessageResponse)
def reply_to_message(
    message_id: int,
    reply_data: schemas.MessageReply,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Admin mesaja yanıt verir"""
    message = db.query(models.Message).filter(models.Message.id == message_id).first()
    
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

# Mesaj silme (Admin)
@router.delete("/{message_id}")
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    """Mesajı siler"""
    message = db.query(models.Message).filter(models.Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı.")
    
    db.delete(message)
    db.commit()
    
    return {"message": f"Mesaj #{message_id} silindi."}
