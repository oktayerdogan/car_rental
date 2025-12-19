# app/services/email_service.py
"""
Email Service (MVC Pattern - Service Layer)
Outlook SMTP ile email gönderme servisi
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import date
import os
import logging

logger = logging.getLogger(__name__)

# Gmail SMTP Ayarları
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

# Email credentials (.env dosyasından okunur - GitHub'a gitmez!)
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
MAIL_FROM = os.getenv("MAIL_FROM", "")


def get_reservation_email_html(
    user_name: str,
    car_name: str,
    start_date: date,
    end_date: date,
    total_price: float
) -> str:
    """Rezervasyon onay emaili için HTML template"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: 'Segoe UI', Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #1E2022 0%, #2d3436 100%);
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 30px;
            }}
            .header h1 {{
                margin: 0;
                font-size: 28px;
            }}
            .header p {{
                margin: 10px 0 0;
                opacity: 0.9;
            }}
            .content {{
                padding: 30px;
                color: white;
            }}
            .info-box {{
                background: rgba(255,255,255,0.1);
                border-radius: 15px;
                padding: 20px;
                margin: 15px 0;
            }}
            .info-row {{
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }}
            .info-row:last-child {{
                border-bottom: none;
            }}
            .label {{
                color: #aaa;
            }}
            .value {{
                font-weight: bold;
                color: #fff;
            }}
            .total-box {{
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                border-radius: 15px;
                padding: 20px;
                text-align: center;
                margin-top: 20px;
            }}
            .total-box .amount {{
                font-size: 36px;
                font-weight: bold;
            }}
            .footer {{
                text-align: center;
                padding: 20px;
                color: #888;
                font-size: 12px;
            }}
            .success-icon {{
                font-size: 60px;
                margin-bottom: 10px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="success-icon">🚗</div>
                <h1>Rezervasyonunuz Onaylandı!</h1>
                <p>Teşekkür ederiz, {user_name}!</p>
            </div>
            <div class="content">
                <div class="info-box">
                    <div class="info-row">
                        <span class="label">Araç</span>
                        <span class="value">{car_name}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Başlangıç Tarihi</span>
                        <span class="value">{start_date.strftime('%d %B %Y')}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Bitiş Tarihi</span>
                        <span class="value">{end_date.strftime('%d %B %Y')}</span>
                    </div>
                </div>
                
                <div class="total-box">
                    <div>Toplam Tutar</div>
                    <div class="amount">{total_price:.2f} TL</div>
                </div>
            </div>
            <div class="footer">
                <p>Bu email otomatik olarak gönderilmiştir.</p>
                <p>© 2024 Rent A Car - Tüm hakları saklıdır.</p>
            </div>
        </div>
    </body>
    </html>
    """


def send_reservation_confirmation(
    to_email: str,
    user_name: str,
    car_name: str,
    start_date: date,
    end_date: date,
    total_price: float
) -> bool:
    """
    Rezervasyon onay emaili gönderir.
    
    Args:
        to_email: Alıcı email adresi
        user_name: Kullanıcı adı
        car_name: Araç adı
        start_date: Başlangıç tarihi
        end_date: Bitiş tarihi
        total_price: Toplam tutar
        
    Returns:
        bool: Email gönderim durumu
    """
    if not MAIL_USERNAME or not MAIL_PASSWORD:
        logger.warning("📧 Email credentials not configured, skipping email send")
        return False
    
    try:
        # Email oluştur
        msg = MIMEMultipart('alternative')
        msg['Subject'] = '🚗 Rent A Car - Rezervasyonunuz Onaylandı!'
        msg['From'] = MAIL_FROM or MAIL_USERNAME
        msg['To'] = to_email
        
        # HTML içerik
        html_content = get_reservation_email_html(
            user_name=user_name,
            car_name=car_name,
            start_date=start_date,
            end_date=end_date,
            total_price=total_price
        )
        
        msg.attach(MIMEText(html_content, 'html', 'utf-8'))
        
        # SMTP bağlantısı
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"📧 Reservation confirmation email sent to: {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"📧 Email sending failed: {str(e)}")
        return False
