from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencys import get_current_user

router = APIRouter(prefix = "/api/events", tags = ["events"])

def _get_event_or_404(db: Session, event_id: str, user_id: str) -> models.Event:
    event = (
        db.query(models.Event)
        .filter(models.Event.id == event_id, models.Event.user_id == user_id)
        .first()
    )

    if not event:
        raise HTTPException(status_code = 404, detail = "Event not found")
    
    return event

@router.get("", response_model = list[schemas.EventOut])
def list_events(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Event)
        .filter(models.Event.user_id == current_user.id)
        .order_by(models.Event.start_time, models.Event.title)
        .all()
    )

@router.post("", response_model = schemas.EventOut, status_code = status.HTTP_201_CREATED)
def create_event(
    event_in: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if event_in.end_time <= event_in.start_time:
        raise HTTPException(status_code = 400, detail = "end_time must be after start_time")
    
    event = models.Event(**event_in.model_dump(), user_id = current_user.id)

    db.add(event)
    db.commit()
    db.refresh(event)

    return event

@router.delete("/{event_id}", status_code = status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    event = _get_event_or_404(db, event_id, current_user.id)
    db.delete(event)
    db.commit()

NON_NULLABLE_FIELDS = {"title", "start_time"}
@router.put("/{event_id}", response_model = schemas.EventOut)
def update_event(
    event_id: str,
    event_in: schemas.EventUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    event = _get_event_or_404(db, event_id, current_user.id)

    update_data = event_in.model_dump(exclude_unset = True)
    for field in NON_NULLABLE_FIELDS:
        if field in update_data and update_data[field] is None:
            raise HTTPException(status_code = 400, detail = f"{field} cannot be set to null")

    for field, value in update_data.items():
        setattr(event, field, value)

    if event.end_time <= event.start_time:
        raise HTTPException(status_code = 400, detail = "end_time must be after start_time")
    
    db.commit()
    db.refresh(event)

    return event