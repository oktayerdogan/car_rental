from fastapi import FastAPI
from .database import Base,engine
from .routers import users

Base.metadata.create_all(bind=engine)
app=FastAPI(title="Car Rental API")
app.include_router(users.router)