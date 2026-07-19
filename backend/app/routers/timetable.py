from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencys import get_current_user
from app.crud import get_or_create_course

router = APIRouter(prefix = "/api/timetable", tags = ["timetable"])

def _get_entry_or_404(db: Session, entry_id: str, user_id: str) -> models.TimetableEntry:
    entry = (
        db.query(models.TimetableEntry)
        .filter(models.TimetableEntry.id == entry_id, models.TimetableEntry.user_id == user_id)
        .first()
    )

    if not entry:
        raise HTTPException(status_code = 404, detail = "Timetable entry not found")
    
    return entry


@router.get("", response_model = list[schemas.TimetableEntryOut])
def list_entries(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.TimetableEntry)
        .filter(models.TimetableEntry.user_id == current_user.id)
        .order_by(models.TimetableEntry.day_of_week, models.TimetableEntry.start_time)
        .all()
    )

@router.post("", response_model = schemas.TimetableEntryOut, status_code = status.HTTP_201_CREATED)
def create_entry(
    entry_in: schemas.TimetableEntryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):  
    enrolled = (
        db.query(models.Enrollment)
        .filter(
            models.Enrollment.user_id == current_user.id,
            models.Enrollment.course_code == entry_in.course_code,
        )
        .first()
    )

    if not enrolled:
        raise HTTPException(status_code = 400, detail = f"Not enrolled in {entry_in.course_code}")

    if entry_in.end_time <= entry_in.start_time:
        raise HTTPException(status_code = 400, detail = "end_time must be after start_time")
    
    entry = models.TimetableEntry(
        course_code = entry_in.course_code,
        class_type = entry_in.class_type,
        day_of_week = entry_in.day_of_week,
        start_time = entry_in.start_time,
        end_time = entry_in.end_time,
        location = entry_in.location,
        user_id = current_user.id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return entry

@router.delete("/{entry_id}", status_code = status.HTTP_204_NO_CONTENT)
def delete_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    entry = _get_entry_or_404(db, entry_id, current_user.id)
    db.delete(entry)
    db.commit()

@router.get("/{entry_id}", response_model = schemas.TimetableEntryOut)
def get_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return _get_entry_or_404(db, entry_id, current_user.id)

NON_NULLABLE_FIELDS = {"course_code", "day_of_week", "start_time", "end_time"}
@router.put("/{entry_id}", response_model = schemas.TimetableEntryOut)
def update_entry(
    entry_id: str,
    entry_in: schemas.TimetableEntryUpdate,
    db : Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    entry = _get_entry_or_404(db, entry_id, current_user.id)

    if entry_in.course_code is not None:
        enrolled = (
            db.query(models.Enrollment)
            .filter(
                models.Enrollment.user_id == current_user.id,
                models.Enrollment.course_code == entry_in.course_code,
            )
            .first()
        )

        if not enrolled:
            raise HTTPException(status_code = 400, detail = f"Not enrolled in {entry_in.course_code}")

    update_data = entry_in.model_dump(exclude_unset = True)
    for field in NON_NULLABLE_FIELDS:
        if field in update_data and update_data[field] is None:
            raise HTTPException(status_code = 400, detail = f"{field} cannot be set to null")

    for field, value in update_data.items():
        setattr(entry, field, value)

    if entry.end_time <= entry.start_time:
        raise HTTPException(status_code = 400, detail = "end_time must be after start_time")
    
    db.commit()
    db.refresh(entry)

    return entry