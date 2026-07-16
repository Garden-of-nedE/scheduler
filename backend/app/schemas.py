from datetime import datetime, time
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict
from app.models import DayOfWeek

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes = True)
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TimetableEntryBase(BaseModel):
    course_code: str
    class_type: Optional[str] = None
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    location: Optional[str] = None
    color: Optional[str] = "#6B95A7"

class TimetableEntryCreate(TimetableEntryBase):
    pass

class TimetableEntryUpdate(BaseModel):
    course_code: Optional[str] = None
    class_type: Optional[str] = None
    day_of_week: Optional[DayOfWeek] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    location: Optional[str] = None
    color: Optional[str] = None

class TimetableEntryOut(TimetableEntryBase):
    model_config = ConfigDict(from_attribute = True)
    id: str 
