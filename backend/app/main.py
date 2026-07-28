from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, timetable, assessments, events, courses, enrollments
from app.config import settings

app = FastAPI(title = "Student Scheduler API")
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(enrollments.router)
app.include_router(timetable.router)
app.include_router(assessments.router)
app.include_router(events.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins = settings.cors_origin_list,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)