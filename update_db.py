import sqlite3

# Veritabanı dosyasına bağlan
conn = sqlite3.connect('rentacar.db') # Eğer dosya adın sql_app.db ise burayı değiştir
cursor = conn.cursor()

print("Veritabanı güncelleniyor...")

# 1. ADIM: 'cars' tablosuna eksik sütunları ekle
# Eğer bu sütunlar zaten varsa hata verir, o yüzden try-except ile deniyoruz.

columns_to_add = [
    ("image_url", "VARCHAR"),
    ("gear_type", "VARCHAR DEFAULT 'Otomatik'"),
    ("fuel_type", "VARCHAR DEFAULT 'Benzin'")
]

for col_name, col_type in columns_to_add:
    try:
        cursor.execute(f"ALTER TABLE cars ADD COLUMN {col_name} {col_type}")
        print(f"✅ '{col_name}' sütunu eklendi.")
    except sqlite3.OperationalError as e:
        print(f"ℹ️ '{col_name}' zaten var veya eklenemedi: {e}")

# 2. ADIM: 'car_images' tablosunu oluştur (Eğer yoksa)
try:
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS car_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url VARCHAR,
        car_id INTEGER,
        FOREIGN KEY(car_id) REFERENCES cars(id)
    )
    """)
    print("✅ 'car_images' tablosu kontrol edildi/oluşturuldu.")
except Exception as e:
    print(f"❌ Tablo oluşturma hatası: {e}")

# Değişiklikleri kaydet ve çık
conn.commit()
conn.close()

print("\n🚀 Güncelleme tamamlandı! Backend'i yeniden başlatabilirsin.")