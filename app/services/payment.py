# app/services/payment.py
import os
import iyzipay
from typing import Optional
from datetime import date


class IyzicoService:
    """Iyzico ödeme işlemleri servisi"""
    
    def __init__(self):
        self.api_key = os.getenv("IYZICO_API_KEY", "sandbox-dWwyWcQHp2nNUYhBxfD9dQzB3FyuCEBA")
        self.secret_key = os.getenv("IYZICO_SECRET_KEY", "sandbox-eLeyIz2gbPqe2nUkeXwPpJsslk3KPyI8")
        self.base_url = os.getenv("IYZICO_BASE_URL", "sandbox-api.iyzipay.com")
        
        self.options = {
            'api_key': self.api_key,
            'secret_key': self.secret_key,
            'base_url': self.base_url
        }
    
    def create_payment(
        self,
        # Kart bilgileri
        card_holder_name: str,
        card_number: str,
        expire_month: str,
        expire_year: str,
        cvc: str,
        # Fiyat bilgileri
        price: float,
        # Ürün bilgileri
        car_name: str,
        car_id: int,
        # Kullanıcı bilgileri
        user_id: int,
        user_email: str,
        # Rezervasyon bilgileri
        start_date: date,
        end_date: date,
        # Opsiyonel alanlar
        user_name: str = "Test User",
        user_surname: str = "Test Surname",
        user_phone: str = "+905350000000",
        user_identity_number: str = "74300864791",
        user_city: str = "Istanbul",
        user_country: str = "Turkey",
        user_address: str = "Test Address",
        user_ip: str = "85.34.78.112"
    ) -> dict:
        """
        Iyzico ile ödeme işlemi gerçekleştirir.
        
        Returns:
            dict: Ödeme sonucu (status, payment_id, error_message vb.)
        """
        
        # Benzersiz conversation ID oluştur
        conversation_id = f"rental_{user_id}_{car_id}_{start_date.isoformat()}"
        
        # Sepet öğesi (Basket Item)
        basket_items = [
            {
                'id': str(car_id),
                'name': car_name,
                'category1': 'Araç Kiralama',
                'category2': 'Rent A Car',
                'itemType': 'VIRTUAL',
                'price': str(price)
            }
        ]
        
        # Alıcı bilgileri (Buyer)
        buyer = {
            'id': str(user_id),
            'name': user_name,
            'surname': user_surname,
            'gsmNumber': user_phone,
            'email': user_email,
            'identityNumber': user_identity_number,
            'lastLoginDate': '2024-01-01 12:00:00',
            'registrationDate': '2024-01-01 12:00:00',
            'registrationAddress': user_address,
            'ip': user_ip,
            'city': user_city,
            'country': user_country,
            'zipCode': '34000'
        }
        
        # Adres bilgileri
        address = {
            'contactName': f'{user_name} {user_surname}',
            'city': user_city,
            'country': user_country,
            'address': user_address,
            'zipCode': '34000'
        }
        
        # Kart bilgileri
        payment_card = {
            'cardHolderName': card_holder_name,
            'cardNumber': card_number,
            'expireMonth': expire_month,
            'expireYear': expire_year,
            'cvc': cvc,
            'registerCard': '0'
        }
        
        # Ödeme isteği
        request = {
            'locale': 'tr',
            'conversationId': conversation_id,
            'price': str(price),
            'paidPrice': str(price),
            'currency': 'TRY',
            'installment': '1',
            'basketId': f'B_{car_id}_{user_id}',
            'paymentChannel': 'WEB',
            'paymentGroup': 'PRODUCT',
            'paymentCard': payment_card,
            'buyer': buyer,
            'shippingAddress': address,
            'billingAddress': address,
            'basketItems': basket_items
        }
        
        try:
            # Iyzico API çağrısı
            payment = iyzipay.Payment().create(request, self.options)
            result = payment.read()
            
            # Debug: Tüm yanıtı logla
            print(f"[IYZICO DEBUG] Raw Response: {result}")
            
            # Sonucu parse et
            import json
            payment_result = json.loads(result)
            
            print(f"[IYZICO DEBUG] Parsed Response: {payment_result}")
            
            if payment_result.get('status') == 'success':
                return {
                    'success': True,
                    'payment_id': payment_result.get('paymentId'),
                    'conversation_id': conversation_id,
                    'message': 'Ödeme başarılı'
                }
            else:
                print(f"[IYZICO ERROR] Code: {payment_result.get('errorCode')}, Message: {payment_result.get('errorMessage')}")
                return {
                    'success': False,
                    'error_code': payment_result.get('errorCode'),
                    'error_message': payment_result.get('errorMessage', 'Ödeme başarısız'),
                    'conversation_id': conversation_id
                }
                
        except Exception as e:
            print(f"[IYZICO EXCEPTION] {str(e)}")
            return {
                'success': False,
                'error_message': str(e),
                'conversation_id': conversation_id
            }


# Singleton instance
iyzico_service = IyzicoService()
