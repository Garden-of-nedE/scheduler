from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencys import get_current_user
from app.crud import get_or_create_course

router = APIRouter(prefix = '/api/enrollments', tags = ["enrollments"])

@router.get("", response_model = list[schemas.EnrollmentOut])
def list_enrollments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Enrollment).filter(models.Enrollment.user_id == current_user.id).all()


@router.post("", response_model = schemas.EnrollmentOut, status_code = status.HTTP_201_CREATED)
def create_enrollment(
    enrol_in: schemas.EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
): 
    try:
        get_or_create_course(db, code = enrol_in.course_code, name = enrol_in.course_name)
    except ValueError as e:
        raise HTTPException(status_code = 400, detail = str(e))

    existing = (
        db.query(models.Enrollment)
        .filter(
            models.Enrollment.user_id == current_user.id,
            models.Enrollment.course_code == enrol_in.course_code
        )
        .first()
    )
    
    if existing:
        raise HTTPException(status_code = 400, detail = "Already enrolled in this Unit")
    
    enrollment = models.Enrollment(user_id = current_user.id, course_code = enrol_in.course_code)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return enrollment

@router.delete("/{enrollment_id}", status_code = status.HTTP_204_NO_CONTENT)
def delete_enrollment(
    enrollment_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    enrollment = (
        db.query(models.Enrollment)
        .filter(
            models.Enrollment.id == enrollment_id,
            models.Enrollment.user_id == current_user.id,
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(status_code = 404, detail = "Enrollment not found")
    
    db.delete(enrollment)
    db.commit()

@router.put("/{enrollment_id}", response_model = schemas.EnrollmentOut)
def update_enrollment(
    enrollment_id: str,
    enrol_in: schemas.EnrollmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    enrollment = (
        db.query(models.Enrollment)
        .filter(
            models.Enrollment.id == enrollment_id,
            models.Enrollment.user_id == current_user.id,
        )
        .first()
    )

    if not enrollment:
        raise HTTPException(status_code = 404, detail = "Enrollment not found")
    
    enrollment.color = enrol_in.color
    db.commit()
    db.refresh(enrollment)

    return enrollment