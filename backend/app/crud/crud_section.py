from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Section, Link
from app.schemas.schemas import SectionCreate, SectionUpdate
from typing import List

def get_sections(db: Session, user_id: int):
    return db.query(Section).filter(Section.user_id == user_id).order_by(Section.order).all()

def get_section(db: Session, section_id: int, user_id: int):
    return db.query(Section).filter(Section.id == section_id, Section.user_id == user_id).first()

def get_uncategorized_section(db: Session, user_id: int):
    return db.query(Section).filter(
        Section.user_id == user_id, 
        Section.name == "Uncategorized"
    ).first()

def create_section(db: Session, section: SectionCreate, user_id: int):
    # Get next order number
    max_order = db.query(func.max(Section.order)).filter(Section.user_id == user_id).scalar()
    next_order = (max_order or 0) + 1
    
    db_section = Section(
        name=section.name,
        order=next_order,
        user_id=user_id
    )
    db.add(db_section)
    db.commit()
    db.refresh(db_section)
    return db_section

def update_section(db: Session, section_id: int, section_update: SectionUpdate, user_id: int):
    db_section = get_section(db, section_id, user_id)
    if not db_section:
        return None
    
    if section_update.name is not None:
        db_section.name = section_update.name
    if section_update.order is not None:
        db_section.order = section_update.order
    
    db.commit()
    db.refresh(db_section)
    return db_section

def delete_section(db: Session, section_id: int, user_id: int):
    db_section = get_section(db, section_id, user_id)
    if not db_section:
        return False
    
    # Don't allow deleting Uncategorized section
    if db_section.name == "Uncategorized":
        return False
    
    # Move all links to Uncategorized before deleting
    uncategorized = get_uncategorized_section(db, user_id)
    db.query(Link).filter(Link.section_id == section_id).update({"section_id": uncategorized.id})
    
    db.delete(db_section)
    db.commit()
    return True

def reorder_sections(db: Session, section_orders: List[dict], user_id: int):
    """Update section orders based on list of {id, order} dicts"""
    for item in section_orders:
        section = get_section(db, item["id"], user_id)
        if section:
            section.order = item["order"]
    
    db.commit()
    return True