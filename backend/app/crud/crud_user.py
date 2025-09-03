from sqlalchemy.orm import Session
from app.models.models import User, Section
from app.schemas.schemas import UserCreate
from app.core.security import hash_password, verify_password

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_google_id(db: Session, google_id: str):
    return db.query(User).filter(User.google_id == google_id).first()

def create_user(db: Session, user: UserCreate):
    password_hash = None
    if user.password:
        password_hash = hash_password(user.password)
    
    db_user = User(
        email=user.email,
        name=user.name,
        google_id=user.google_id,
        password_hash=password_hash
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create default "Uncategorized" section
    uncategorized = Section(
        name="Uncategorized",
        order=999,  # Put at bottom
        user_id=db_user.id
    )
    db.add(uncategorized)
    db.commit()
    
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    """Authenticate user with email and password."""
    user = get_user_by_email(db, email)
    if not user or not user.password_hash:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user