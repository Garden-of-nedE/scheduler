from datetime import datetime, time, date
from typing import Optional, List
from decimal import Decimal

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
    course_name: Optional[str] = None

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

class AssessmentBase(BaseModel):
    course_code: str
    title: str
    due_date: datetime
    weighting: Decimal
    total_marks: Decimal
    mark_achieved: Optional[Decimal] = None
    completed: bool = False

class RecurrenceCreate(BaseModel):
    frequency: str = "weekly"
    occurrences: int
    first_due_date: datetime
    skip_dates: List[date] = []

class AssessmentCreate(AssessmentBase):
    course_name: Optional[str] = None

class AssessmentUpdate(BaseModel):
    course_code: Optional[str] = None
    title: Optional[str] = None
    due_date: Optional[datetime] = None
    weighting: Optional[Decimal] = None
    total_marks: Optional[Decimal] = None
    mark_achieved: Optional[Decimal] = None
    completed: Optional[bool] = None

class AssessmentOut(AssessmentBase):
    model_config = ConfigDict(from_attributes = True)
    id: str
    recurrence_group_id: Optional[str] = None

class AssessmentRecurringCreate(AssessmentBase):
    recurrence: RecurrenceCreate
    course_name: Optional[str] = None