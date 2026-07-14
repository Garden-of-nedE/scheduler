from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name = Optional[str] = None

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes = True)
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    created_at = datetime

class Token(BaseModel):
    access_token = str
    token_type = str = "bearer"