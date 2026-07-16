# shared functions/logic for resource creation
from sqlalchemy.orm import Session

from app import models

def get_or_create_course(db: Session, code: str, name: str | None = None) -> models.Course:
    course = db.query(models.Course).filter(models.Course.code == code).first()
    if course:
        return course
    
    if not name:
        raise ValueError(f"Course '{code}' does not exist adn no name provided to create it")
    
    course = models.Course(code = code, name = name)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course