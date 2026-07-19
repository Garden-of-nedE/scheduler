from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencys import get_current_user, require_admin

router = APIRouter(prefix = '/api/courses', tags = ["courses"])

@router.get("", response_model = list[schemas.CourseOut])
def list_courses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Course).order_by(models.Course.code).all()


@router.post("", response_model = schemas.CourseOut, status_code = status.HTTP_201_CREATED)
def create_course(
    course_in: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
): 
    existing = db.query(models.Course).filter(models.Course.code == course_in.code).first()
    if existing:
        raise HTTPException(status_code = 400, detail = f"Course '{course_in.code}' already exists")
    
    course = models.Course(code = course_in.code, name = course_in.name)
    db.add(course)
    db.commit()
    db.refresh(course)

    return course

@router.put("/{code}", response_model = schemas.CourseOut)
def update_course(
    code: str,
    course_in: schemas.CourseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    course = db.query(models.Course).filter(models.Course.code == code).first()
    if not course:
        raise HTTPException(status_code = 404, detail = "Course not found")   

    course.name = course_in.name 
    db.commit()
    db.refresh(course)

    return course

@router.delete("/{code}", status_code = status.HTTP_204_NO_CONTENT)
def delete_course(
    code: str,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(require_admin),
):
    course = db.query(models.Course).filter(models.Course.code == code).first()
    if not course:
        raise HTTPException(status_code = 404, detail = "Course not found")
    
    in_use =(
        db.query(models.TimetableEntry).filter(models.TimetableEntry.course_code == code).first()
        or db.query(models.Assessment).filter(models.Assessment.course_code == code).first()
        or db.query(models.Enrollment).filter(models.Enrollment.course_code == code).first()
    )
    
    if in_use:
        raise HTTPException(status_code = 400, detail = "Cannot delete course, still in use")
    
    db.delete(course)
    db.commit()