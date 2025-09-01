from sqlalchemy.orm import Session
from app.models.models import Link
from app.schemas.schemas import LinkCreate, LinkUpdate
from app.crud.crud_section import get_uncategorized_section

def get_links(db: Session, user_id: int):
    return db.query(Link).filter(Link.user_id == user_id).all()

def get_link(db: Session, link_id: int, user_id: int):
    return db.query(Link).filter(Link.id == link_id, Link.user_id == user_id).first()

def get_pinned_links(db: Session, user_id: int):
    return db.query(Link).filter(Link.user_id == user_id, Link.is_pinned == True).all()

def create_link(db: Session, link: LinkCreate, user_id: int):
    # If no section specified, use Uncategorized
    section_id = link.section_id
    if not section_id:
        uncategorized = get_uncategorized_section(db, user_id)
        section_id = uncategorized.id if uncategorized else None
    
    db_link = Link(
        title=link.title,
        url=link.url,
        description=link.description,
        is_pinned=link.is_pinned,
        user_id=user_id,
        section_id=section_id
    )
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link

def update_link(db: Session, link_id: int, link_update: LinkUpdate, user_id: int):
    db_link = get_link(db, link_id, user_id)
    if not db_link:
        return None
    
    if link_update.title is not None:
        db_link.title = link_update.title
    if link_update.url is not None:
        db_link.url = link_update.url
    if link_update.description is not None:
        db_link.description = link_update.description
    if link_update.is_pinned is not None:
        db_link.is_pinned = link_update.is_pinned
    if link_update.section_id is not None:
        db_link.section_id = link_update.section_id
    
    db.commit()
    db.refresh(db_link)
    return db_link

def delete_link(db: Session, link_id: int, user_id: int):
    db_link = get_link(db, link_id, user_id)
    if not db_link:
        return False
    
    db.delete(db_link)
    db.commit()
    return True