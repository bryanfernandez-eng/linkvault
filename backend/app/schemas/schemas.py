from pydantic import BaseModel, HttpUrl, validator, EmailStr
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    google_id: Optional[str] = None
    password: Optional[str] = None  # For email/password registration

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

# Section Schemas
class SectionBase(BaseModel):
    name: str

class SectionCreate(SectionBase):
    pass

class SectionUpdate(BaseModel):
    name: Optional[str] = None
    order: Optional[int] = None

class SectionReorder(BaseModel):
    section_orders: List[dict]  # [{"id": 1, "order": 0}, {"id": 2, "order": 1}]

class Section(SectionBase):
    id: int
    order: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Link Schemas
class LinkBase(BaseModel):
    title: str
    url: str
    description: Optional[str] = None
    is_pinned: Optional[bool] = False
    favicon_url: Optional[str] = None  

class LinkCreate(LinkBase):
    section_id: Optional[int] = None
    
    @validator('url')
    def validate_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            v = 'https://' + v
        return v

class LinkUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    is_pinned: Optional[bool] = None
    section_id: Optional[int] = None
    favicon_url: Optional[str] = None

    @validator('url')
    def validate_url(cls, v):
        if v and not v.startswith(('http://', 'https://')):
            v = 'https://' + v
        return v

class Link(LinkBase):
    id: int
    user_id: int
    section_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Response Schemas
class SectionWithLinks(Section):
    links: List[Link] = []
    
class DashboardResponse(BaseModel):
    pinned_links: List[Link]
    sections: List[SectionWithLinks]