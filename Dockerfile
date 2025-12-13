# 1. Python'un hafif sürümünü kullanıyoruz
FROM python:3.10-slim

# 2. Çalışma dizinini ayarla
WORKDIR /app

# 3. Ortam değişkenlerini ayarla (Python'un daha hızlı çalışması için)
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 4. Gerekli kütüphaneleri kopyala ve yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Projedeki tüm kodları içeri kopyala
COPY . .

# 6. Uygulamayı başlat
# Host 0.0.0.0 olmalı ki dışarıdan erişilebilsin
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]