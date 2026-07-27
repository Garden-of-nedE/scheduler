import uuid
import enum

from sqlalchemy import (Column, String, DateTime, Date, Time, ForeignKey, Enum, Time, Numeric, Boolean, UniqueConstraint, func)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

class DayOfWeek(str, enum.Enum):
    monday = "Monday"
    tuesday = "Tuesday"
    wednesday = "Wednesday"
    thursday = "Thursday"
    friday = "Friday"
    saturday = "Saturday"
    sunday = "Sunday"

class ConnectionStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"

class UserRole(str, enum.Enum):
    student = "student"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid = False), primary_key = True, default = gen_uuid)
    email = Column(String, unique = True, index = True, nullable = False)
    hashed_password = Column(String, nullable = False)
    full_name = Column(String, nullable = True)
    role = Column(Enum(UserRole), nullable = False, default = UserRole.student)
    created_at = Column(DateTime(timezone = True), server_default = func.now())

    timetable_entries = relationship("TimetableEntry", back_populates = "owner", cascade = "all, delete-orphan")
    assessments = relationship("Assessment", back_populates = "owner", cascade = "all, delete-orphan")
    events = relationship("Event", back_populates = "owner", cascade = "all, delete-orphan")
    sent_requests = relationship("Connections", foreign_keys = "Connections.requester_id", back_populates = "request", cascade = "all, delete-orphan")
    received_requests = relationship("Connections", foreign_keys = "Connections.invitee_id", back_populates = "invitee", cascade = "all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates = "owner", cascade = "all, delete-orphan")

class Course(Base):
    __tablename__ = "courses"

    code = Column(String, primary_key = True)
    name = Column(String, nullable = False)
    
    timetable_entries = relationship("TimetableEntry", back_populates = "course")
    assessments = relationship("Assessment", back_populates = "course")
    enrollments = relationship("Enrollment", back_populates = "course")

class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(UUID(as_uuid = False), primary_key = True, default = gen_uuid)
    user_id = Column(UUID(as_uuid = False), ForeignKey("users.id", ondelete = "CASCADE"))
    course_code = Column(String, ForeignKey("courses.code"), nullable = False, index = True)
    color = Column(String, nullable = True, default = "#6B95A7")

    __table_args__ = (
        UniqueConstraint("user_id", "course_code", name = "uq_user_enrollment"),
    )

    owner = relationship("User", back_populates = "enrollments")
    course = relationship("Course", back_populates = "enrollments")

class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id = Column(UUID(as_uuid = False), primary_key = True, default = gen_uuid)
    user_id = Column(UUID(as_uuid = False), ForeignKey("users.id", ondelete = "CASCADE"), nullable = False, index = True)
    course_code = Column(String, ForeignKey("courses.code"), nullable = False, index = True)
    
    class_type = Column(String, nullable = True)
    day_of_week = Column(Enum(DayOfWeek), nullable = False)
    start_time = Column(Time, nullable = False)
    end_time = Column(Time, nullable = False)
    location = Column(String, nullable = True)
    
    owner = relationship("User", back_populates = "timetable_entries")
    course = relationship("Course", back_populates = "timetable_entries")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(UUID(as_uuid = False), primary_key = True, default = gen_uuid)
    user_id = Column(UUID(as_uuid = False), ForeignKey("users.id", ondelete = "CASCADE"), nullable = False, index = True)
    course_code = Column(String, ForeignKey("courses.code"), nullable = False, index = True)
    recurrence_group_id = Column(UUID(as_uuid = False), nullable = True, index = True)

    task_name = Column(String, nullable = False)
    due_date = Column(Date, nullable = False)
    description = Column(String, nullable = True)
    deadline = Column(Time, nullable = True)
    weighting = Column(Numeric(5, 2), nullable = False)
    total_marks = Column(Numeric(5, 2), nullable = False)
    mark_achieved = Column(Numeric(5, 2), nullable = True)
    completed = Column(Boolean, nullable = False, default = False)

    owner = relationship("User", back_populates = "assessments")
    course = relationship("Course", back_populates = "assessments")

class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid = False), primary_key = True, default = gen_uuid)
    user_id = Column(UUID(as_uuid = False), ForeignKey("users.id", ondelete = "CASCADE"), nullable = False, index = True)

    title = Column(String, nullable = False)
    description = Column(String, nullable = True)
    event_date = Column(Date, nullable = False)
    start_time = Column(Time, nullable = False)
    end_time = Column(Time, nullable = True)
    location = Column(String, nullable = True)

    owner = relationship("User", back_populates = "events")


class Connections(Base):
    __tablename__ = "connections"

    id = Column(UUID(as_uuid = False), primary_key = True, default = gen_uuid)
    requester_id = Column(UUID(as_uuid = False), ForeignKey("users.id", ondelete = "CASCADE"), nullable = False, index = True)
    invitee_id = Column(UUID(as_uuid = False), ForeignKey("users.id", ondelete = "CASCADE"), nullable = False, index = True)
    status = Column(Enum(ConnectionStatus), nullable = False, default = ConnectionStatus.pending)
    created_at = Column(DateTime(timezone = True), server_default = func.now())

    __table_args__ = (
        UniqueConstraint("requester_id", "invitee_id", name = "unique_connection"),
    )

    request = relationship("User", foreign_keys = [requester_id], back_populates = "sent_requests")
    invitee = relationship("User", foreign_keys = [invitee_id], back_populates = "received_requests")