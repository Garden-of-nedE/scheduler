from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.security import hash_password, verify_password, create_access_token
from app.dependencys import get_current_user

router = APIRouter(prefix = "/api/auth", tags = ["auth"])

@router.post("/register", response_model = schemas.UserOut, status_code = status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code = 400, detail = "Account with this email already exists.")
    
    user = models.User(
        email = user_in.email,
        hashed_password = hash_passsword(user_in.password),
        full_name = user_in.full_name,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model = schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password == user.hashed_password):
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "Incorrect email or password",
            headers = {"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(subject = user.id)
    return schemas.Token(access_token = token)

@router.get("/me", response_model = schemas.UserOut)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user