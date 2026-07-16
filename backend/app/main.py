from fastapi import FastAPI
from app.database import Base, engine
from app.routers import auth, timetable

Base.metadata.create_all(bind = engine)

app = FastAPI(title = "Student Scheduler API")
app.include_router(auth.router)
app.include_router(timetable.router)