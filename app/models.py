from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__="users"
    
    id= Column(Integer,primary_key=True,index=True)
    email=Column(String, unique=True, index=True,nullable=False)
    password=Column(String,nullable=False)
    role=Column(String,default="customer")
    
    reservations=relationship("Reservation", back_populates="user") #1 to many(bir user birden fazla reservation yapabilir)
    
class Car(Base):
    __tablename__="cars"
    
    id=Column(Integer,primary_key=True,index=True)
    brand=Column(String,nullable=False)
    model=Column(String,nullable=False)
    year=Column(Integer, nullable=False)
    is_available=Column(Boolean, default=True)
    price_per_day=Column(Integer, nullable=False)
    
    reservations=relationship("Reservation", back_populates="car") #1 to many(bir araba birden fazla kez kiralanabilir)
    
class Reservation(Base):
    __tablename__="reservations"
    
    id=Column(Integer,primary_key=True,index=True)
    user_id=Column(Integer,ForeignKey("users.id"))
    car_id=Column(Integer,ForeignKey("cars.id"))
    start_date=Column(Date,nullable=False)
    end_date=Column(Date,nullable=False)
    
    user = relationship("User",back_populates="reservations")
    car = relationship("Car",back_populates="reservations")