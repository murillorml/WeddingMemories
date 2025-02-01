from pydantic import BaseModel, EmailStr, constr
from typing import Optional, List
from datetime import datetime

# Wedding schemas
class WeddingBase(BaseModel):
    groom_name: str
    bride_name: str
    date: str
    location: str
    banner_image: str
    description: Optional[str] = None
    email: EmailStr

class WeddingCreate(WeddingBase):
    password: str
    pin: constr(min_length=6, max_length=6, pattern=r'^\d{6}$')  # Ensure PIN is exactly 6 digits

class PinVerification(BaseModel):
    wedding_id: str
    pin: constr(min_length=6, max_length=6, pattern=r'^\d{6}$')

class WeddingUpdate(BaseModel):
    groom_name: Optional[str] = None
    bride_name: Optional[str] = None
    date: Optional[str] = None
    location: Optional[str] = None
    banner_image: Optional[str] = None
    description: Optional[str] = None

class Wedding(WeddingBase):
    id: str
    pin: str  # Include pin in the response
    created_at: datetime

    class Config:
        from_attributes = True

# Guest schemas
class GuestBase(BaseModel):
    name: str
    wedding_id: str

class GuestCreate(GuestBase):
    pass

class Guest(GuestBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Memory schemas
class PhotoBase(BaseModel):
    url: str
    guest_id: str
    wedding_id: str

class PhotoCreate(PhotoBase):
    pass

class Photo(PhotoBase):
    id: str
    created_at: datetime
    guest: Guest

    class Config:
        from_attributes = True

class VideoBase(BaseModel):
    url: str
    guest_id: str
    wedding_id: str

class VideoCreate(VideoBase):
    pass

class Video(VideoBase):
    id: str
    created_at: datetime
    guest: Guest

    class Config:
        from_attributes = True

class AudioBase(BaseModel):
    url: str
    duration: Optional[str] = None
    guest_id: str
    wedding_id: str

class AudioCreate(AudioBase):
    pass

class Audio(AudioBase):
    id: str
    created_at: datetime
    guest: Guest

    class Config:
        from_attributes = True

class MessageBase(BaseModel):
    content: str
    guest_id: str
    wedding_id: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: str
    created_at: datetime
    guest: Guest

    class Config:
        from_attributes = True

class WeddingMemories(BaseModel):
    photos: List[Photo]
    videos: List[Video]
    audios: List[Audio]
    messages: List[Message]

    class Config:
        from_attributes = True