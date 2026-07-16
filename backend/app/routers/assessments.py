from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
from datetime import timedelta

from app.database import get_db
from app import models, schemas
from app.dependencys import get_current_user
from app.crud import get_or_create_course

router = APIRouter(prefix = "/api/assessments", tags = ["assessments"])

def _get_task_or_404(db: Session, task_id: str, user_id: str) -> models.Assessment:
    task = (
        db.query(models.Assessment)
        .filter(models.Assessment.id == task_id, models.Assessment.user_id == user_id)
        .first()
    )

    if not task:
        raise HTTPException(status_code = 404, detail = "Assessment task not found")
    
    return task

@router.get("", response_model = list[schemas.AssessmentOut])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == current_user.id)
        .order_by(models.Assessment.due_date, models.Assessment.course_code)
        .all()
    )

@router.post("", response_model = schemas.AssessmentOut, status_code = status.HTTP_201_CREATED)
def create_task(
    task_in: schemas.AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        get_or_create_course(db, code = task_in.course_code, name = task_in.course_name)
    except ValueError as e:
        raise HTTPException(status_code = 400, detail = str(e))
    
    task = models.Assessment(
        course_code = task_in.course_code,
        title = task_in.title,
        due_date = task_in.due_date,
        weighting = task_in.weighting,
        total_marks = task_in.total_marks,
        mark_achieved = None,
        completed = False,
        user_id = current_user.id,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task

@router.delete("/{task_id}", status_code = status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = _get_task_or_404(db, task_id, current_user.id)
    db.delete(task)
    db.commit()

# ==== Recurrent Assessments ====
@router.post("/recurring", response_model = list[schemas.AssessmentOut], status_code = status.HTTP_201_CREATED)
def create_recurring_task(
    task_in: schemas.AssessmentRecurringCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        get_or_create_course(db, code = task_in.course_code, name = task_in.course_name)
    except ValueError as e:
        raise HTTPException(status_code = 400, detail = str(e))
    
    group_id = str(uuid.uuid4())
    created = []

    current_date = task_in.recurrence.first_due_date
    generated_count = 0

    while generated_count < task_in.recurrence.occurrences:
        if current_date.date() not in task_in.recurrence.skip_dates:
            task = models.Assessment(
                course_code = task_in.course_code,
                title = task_in.title,
                due_date = task_in.due_date,
                weighting = task_in.weighting,
                total_marks = task_in.total_marks,
                mark_achieved = None,
                completed = False,
                user_id = current_user.id,
                recurrence_group_id = group_id
            )
            db.add(task)
            created.append(task)
            generated_count += 1

        current_date += timedelta(weeks = 1)
    
    db.commit()
    for task in created:
        db.refresh(task)
    
    return created

@router.delete("/series/{recurrence_group_id}", status_code = status.HTTP_204_NO_CONTENT)
def delete_series(
    recurrence_group_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db.query(models.Assessment).filter(
        models.Assessment.recurrence_group_id == recurrence_group_id,
        models.Assessment.user_id == current_user.id,
    ).delete()
    db.commit()