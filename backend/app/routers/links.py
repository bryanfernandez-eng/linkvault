from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from app.core.database import SessionLocal
from app.crud import crud_link, crud_section
from app.schemas.schemas import Link, LinkCreate, LinkUpdate, DashboardResponse, SectionWithLinks

router = APIRouter()

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

@router.get("/", response_model=List[Link])
async def get_links(
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user(request)
    return crud_link.get_links(db, user_id)

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user(request)
    
    # Get pinned links
    pinned_links = crud_link.get_pinned_links(db, user_id)
    
    # Get sections with their links
    sections = crud_section.get_sections(db, user_id)
    sections_with_links = []
    
    for section in sections:
        section_dict = {
            "id": section.id,
            "name": section.name,
            "order": section.order,
            "user_id": section.user_id,
            "created_at": section.created_at,
            "links": [link for link in section.links if not link.is_pinned]
        }
        sections_with_links.append(section_dict)
    
    return {
        "pinned_links": pinned_links,
        "sections": sections_with_links
    }

@router.post("/", response_model=Link)
async def create_link(
    link: LinkCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user(request)
    return crud_link.create_link(db, link, user_id)

@router.put("/{link_id}", response_model=Link)
async def update_link(
    link_id: int,
    link_update: LinkUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user(request)
    link = crud_link.update_link(db, link_id, link_update, user_id)
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    return link

@router.delete("/{link_id}")
async def delete_link(
    link_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user(request)
    success = crud_link.delete_link(db, link_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Link not found")
    return {"message": "Link deleted successfully"}