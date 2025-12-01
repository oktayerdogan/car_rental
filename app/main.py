from fastapi import FastAPI
from .database import Base,engine
from .routers import users
from .routers import cars
from .routers import reservations

Base.metadata.create_all(bind=engine)
app=FastAPI(title="Car Rental API")
app.include_router(users.router)
app.include_router(cars.router)
app.include_router(reservations.router)

@app.get("/")
def root():
    return {"message": "Car Rental API is running!"}
