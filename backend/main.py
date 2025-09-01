from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
import os
from app.core.database import SessionLocal, engine
from app.models import models
from app.routers import auth, sections, links
from app.core.config import settings

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LinkVault", version="1.0.0")

# Add session middleware
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth setup
oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(request: Request):
    user_id = request.session.get('user_id')
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user_id

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(sections.router, prefix="/sections", tags=["sections"])
app.include_router(links.router, prefix="/links", tags=["links"])

# Make OAuth available to auth router
app.state.oauth = oauth

@app.get("/")
async def root():
    return {"message": "LinkVault API"}

@app.get("/me")
async def get_current_user_info(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user(request)
    from app.crud import crud_user
    user = crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "email": user.email, "name": user.name}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)