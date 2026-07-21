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

class CourseBase(BaseModel):
    code: str
    name: str

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    name: str

class CourseOut(CourseBase):
    model_config = ConfigDict(from_attribute = True)

class EnrollmentCreate(BaseModel):
    course_code: str
    course_name: Optional[str] = None   # Only required if course is brand new
    color: Optional[str] = "#4F6D7A"

class EnrollmentUpdate(BaseModel):
    color: str

class EnrollmentOut(BaseModel):
    model_config = ConfigDict(from_attributes = True)
    id: str
    course_code: str
    color: Optional[str] = None
    course: CourseOut

class TimetableEntryBase(BaseModel):
    course_code: str
    class_type: Optional[str] = None
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    location: Optional[str] = None

class TimetableEntryCreate(TimetableEntryBase):
    pass

class TimetableEntryUpdate(BaseModel):
    course_code: Optional[str] = None
    class_type: Optional[str] = None
    day_of_week: Optional[DayOfWeek] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    location: Optional[str] = None

class TimetableEntryOut(TimetableEntryBase):
    model_config = ConfigDict(from_attribute = True)
    id: str 

class AssessmentBase(BaseModel):
    course_code: str
    task_name: str
    due_date: date
    description: Optional[str] = None
    deadline: Optional[time] = None
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
    pass

class AssessmentUpdate(BaseModel):
    course_code: Optional[str] = None
    task_name: Optional[str] = None
    due_date: Optional[date] = None
    description: Optional[str] = None
    deadline: Optional[time] = None
    weighting: Optional[Decimal] = None
    total_marks: Optional[Decimal] = None
    mark_achieved: Optional[Decimal] = None
    completed: Optional[bool] = False

class AssessmentOut(AssessmentBase):
    model_config = ConfigDict(from_attributes = True)
    id: str
    recurrence_group_id: Optional[str] = None

class AssessmentRecurringCreate(AssessmentBase):
    recurrence: RecurrenceCreate

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: date
    start_time: time
    end_time: Optional[time] = None
    location: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    location: Optional[str] = None

class EventOut(EventBase):
    model_config = ConfigDict(from_attributes = True)
    id: str