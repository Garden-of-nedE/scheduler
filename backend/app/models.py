class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid = False), primary_key = True, default = gen_uuid)
    email = Column(String, unique = True, index = True, nullable = False)
    hashed_password = Column(String, nullable = False)
    full_name = Column(String, nullable = True)
    created_at = Column(DateTime(timezone = True), server_default = func.now())

    timetable_entries = relationship("TimetableEntry", back_populates = "owner", cascade = "all, delete-orphan")

class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id = Column(UUID(as_uuid = False), primary_key = True, default = gen_uuid)
    user_id = Column(UUID(as_uuid = False), ForeignKey("users.id", ondelete = "CASCADE"), nullable = False, index = True)

    course_code = Column(String, nullable = False)
    course_name = Column(String, nullable = False)
    day_of_week = Column(Enum(DayOfWeek), nullable = False)
    start_time = Column(Time, nullable = False)
    end_time = Column(Time, nullable = False)
    location = Column(String, nullable = True)
    color = Column(String, nullable = True, default = "#6B95A7")
    notes = Column(Text, nullable = True)

    owner = relationship("User", back_populates = "timetable_entries")
