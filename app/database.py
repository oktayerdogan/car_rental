from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 🚨 ÖNEMLİ: Adres "sqlite" ile başlamalı, postgresql ile değil!
SQLALCHEMY_DATABASE_URL = "postgresql://admin:123@db:5432/rentacar"

# SQLite için "connect_args" parametresi zorunludur (Thread kontrolü için)
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()