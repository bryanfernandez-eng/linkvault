from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from app.core.database import SessionLocal
from app.crud import crud_section
from app.schemas.schemas import Section, SectionCreate, SectionUpdate, SectionReorder

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

@router.get("/", response_model=List[Section])
async def get_sections(
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user(request)
    return crud_section.get_sections(db, user_id)

@router.post("/", response_model=Section)
async def create_section(
    section: SectionCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user(request)
    return crud_section.create_section(db, section, user_id)

@router.put("/{section_id}", response_model=Section)
async def update_section(
    section_id: int,
    section_update: SectionUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user(request)
    section = crud_section.update_section(db, section_id, section_update, user_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    return section

@router.delete("/{section_id}")
async def delete_section(
    section_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user(request)
    success = crud_section.delete_section(db, section_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Section not found or cannot be deleted")
    return {"message": "Section deleted successfully"}

@router.post("/reorder")
async def reorder_sections(
    reorder_data: SectionReorder,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user(request)
    success = crud_section.reorder_sections(db, reorder_data.section_orders, user_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to reorder sections")
    return {"message": "Sections reordered successfully"}