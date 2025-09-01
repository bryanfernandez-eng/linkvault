from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.crud import crud_user
from app.schemas.schemas import UserCreate

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
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/callback")
async def callback(request: Request, db: Session = Depends(get_db)):
    oauth = request.app.state.oauth
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        # Check if user exists
        user = crud_user.get_user_by_google_id(db, user_info['sub'])
        
        if not user:
            # Create new user
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

@router.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out successfully"}

@router.get("/check")
async def check_auth(request: Request):
    user_id = request.session.get('user_id')
    return {"authenticated": bool(user_id), "user_id": user_id}