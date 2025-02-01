from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime

def generate_uuid():
    return str(uuid.uuid4())

class Wedding(Base):
    __tablename__ = "weddings"

    id = Column(String, primary_key=True, default=generate_uuid)
    groom_name = Column(String, nullable=False)
    bride_name = Column(String, nullable=False)
    date = Column(String, nullable=False)
    location = Column(String, nullable=False)
    banner_image = Column(String, nullable=False)
    description = Column(String)
    password = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    pin = Column(String(6), nullable=False)  # Ensure PIN is String type with length 6
    created_at = Column(DateTime, default=datetime.utcnow)

    guests = relationship("Guest", back_populates="wedding", cascade="all, delete-orphan")
    photos = relationship("Photo", back_populates="wedding", cascade="all, delete-orphan")
    videos = relationship("Video", back_populates="wedding", cascade="all, delete-orphan")
    audios = relationship("Audio", back_populates="wedding", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="wedding", cascade="all, delete-orphan")

class Guest(Base):
    __tablename__ = "guests"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    wedding_id = Column(String, ForeignKey("weddings.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="guests")
    photos = relationship("Photo", back_populates="guest", cascade="all, delete-orphan")
    videos = relationship("Video", back_populates="guest", cascade="all, delete-orphan")
    audios = relationship("Audio", back_populates="guest", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="guest", cascade="all, delete-orphan")

class Photo(Base):
    __tablename__ = "photos"

    id = Column(String, primary_key=True, default=generate_uuid)
    url = Column(String, nullable=False)
    guest_id = Column(String, ForeignKey("guests.id"))
    wedding_id = Column(String, ForeignKey("weddings.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    guest = relationship("Guest", back_populates="photos")
    wedding = relationship("Wedding", back_populates="photos")

class Video(Base):
    __tablename__ = "videos"

    id = Column(String, primary_key=True, default=generate_uuid)
    url = Column(String, nullable=False)
    guest_id = Column(String, ForeignKey("guests.id"))
    wedding_id = Column(String, ForeignKey("weddings.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    guest = relationship("Guest", back_populates="videos")
    wedding = relationship("Wedding", back_populates="videos")

class Audio(Base):
    __tablename__ = "audios"

    id = Column(String, primary_key=True, default=generate_uuid)
    url = Column(String, nullable=False)
    duration = Column(String)
    guest_id = Column(String, ForeignKey("guests.id"))
    wedding_id = Column(String, ForeignKey("weddings.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    guest = relationship("Guest", back_populates="audios")
    wedding = relationship("Wedding", back_populates="audios")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    content = Column(String, nullable=False)
    guest_id = Column(String, ForeignKey("guests.id"))
    wedding_id = Column(String, ForeignKey("weddings.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    guest = relationship("Guest", back_populates="messages")
    wedding = relationship("Wedding", back_populates="messages")