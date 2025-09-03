from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.crud import crud_user
from app.schemas.schemas import UserCreate, UserLogin
from urllib.parse import urlencode

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/login")
async def login(request: Request):
    oauth = request.app.state.oauth
    redirect_uri = "http://localhost:8000/auth/callback"
    # Force account selection picker using **kwargs for extra parameters
    return await oauth.google.authorize_redirect(
        request, 
        redirect_uri,
        **{"prompt": "select_account"}
    )

@router.get("/callback")
async def callback(request: Request, db: Session = Depends(get_db)):
    oauth = request.app.state.oauth
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        # Check if user exists by Google ID first
        user = crud_user.get_user_by_google_id(db, user_info['sub'])
        
        if user:
            # User found by Google ID - perfect, just login
            request.session['user_id'] = user.id
            return RedirectResponse(url="http://localhost:5173/dashboard")
        
        # Check if user exists by email (email/password account or previous Google account)
        user = crud_user.get_user_by_email(db, user_info['email'])
        
        if user:
            # User exists with this email - link Google account to existing user
            user.google_id = user_info['sub']
            user.name = user_info['name']  # Update name from Google if different
            db.commit()
            db.refresh(user)
            
            # Login the existing user
            request.session['user_id'] = user.id
            return RedirectResponse(url="http://localhost:5173/dashboard")
        
        # No existing user found - create new Google user
        user_create = UserCreate(
            email=user_info['email'],
            name=user_info['name'],
            google_id=user_info['sub']
        )
        user = crud_user.create_user(db, user_create)
        
        # Set session
        request.session['user_id'] = user.id
        
        # Redirect to frontend
        return RedirectResponse(url="http://localhost:5173/dashboard")
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")

@router.post("/register")
async def register(user_data: UserCreate, request: Request, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = crud_user.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate password
    if not user_data.password or len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Create user
    try:
        user = crud_user.create_user(db, user_data)
        # Set session
        request.session['user_id'] = user.id
        return {"message": "User created successfully", "user_id": user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to create user")

@router.post("/login-email")
async def login_email(login_data: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = crud_user.authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Set session
    request.session['user_id'] = user.id
    return {"message": "Login successful", "user_id": user.id}

@router.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out successfully"}

@router.get("/check")
async def check_auth(request: Request):
    user_id = request.session.get('user_id')
    return {"authenticated": bool(user_id), "user_id": user_id}