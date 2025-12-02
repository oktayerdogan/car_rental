from pydantic import BaseModel
from datetime import date

#User
class UserBase(BaseModel):
    email:str
class UserCreate(UserBase): #kullanıcıdan alınan bilgiler.kayıt yaparken sadece email ve password alınıyor.
    password:str
class UserResponse(UserBase): #kullanıcıya dönen bilgiler.kullanınıcıya id email ve role bilgileri dönüyor.
    id:int
    role:str
    class Config:
        from_attributes = True
        
#car
class CarBase(BaseModel):
    brand:str
    model:str
    year:int
    price_per_day:int
class CarCreate(CarBase): #kullanıcıdan alınan bilgiler.pass yazıyor çünkü CarBaseden miras almıştık oradan gelen bilgileri kullanıyoruz
    pass
class CarResponse(CarBase): #kullanıcıya dönen bilgiler
    id:int
    is_available:bool
    
    class Config:
        orm_mode=True
        
#reservation
class ReservationCreate(BaseModel):
    car_id:int
    start_date:date
    end_date:date
class ReservationResponse(BaseModel):
    id:int
    car_id:int
    user_id:int
    start_date:date
    end_date:date
    
    class Config:
        from_attributes = True
        
class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
