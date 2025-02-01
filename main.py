from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
import models
import schemas
from database import SessionLocal, engine
from typing import List
import os
import shutil
from pathlib import Path
import uvicorn
from pydantic import BaseModel

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wedding Memories API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas as origens em produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
for dir_name in ["photos", "videos", "audios"]:
    (UPLOAD_DIR / dir_name).mkdir(exist_ok=True)

# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": str(exc)},
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Password verification schema
class PasswordVerification(BaseModel):
    wedding_id: str
    password: str

# PIN verification schema
class PinVerification(BaseModel):
    wedding_id: str
    pin: str

# Root endpoint
@app.get("/")
def read_root():
    return {
        "name": "Wedding Memories API",
        "version": "1.0.0",
        "description": "API for managing wedding memories including photos, videos, audios, and messages",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

# Password verification endpoint
@app.post("/weddings/verify-password/")
def verify_wedding_password(data: PasswordVerification, db: Session = Depends(get_db)):
    wedding = db.query(models.Wedding).filter(models.Wedding.id == data.wedding_id).first()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    return {"valid": wedding.password.strip() == data.password.strip()}

# PIN verification endpoint
@app.post("/weddings/verify-pin/")
def verify_wedding_pin(data: PinVerification, db: Session = Depends(get_db)):
    wedding = db.query(models.Wedding).filter(models.Wedding.id == data.wedding_id).first()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    # Ensure both PINs are properly formatted for comparison
    wedding_pin = wedding.pin.strip() if wedding.pin else ''
    input_pin = data.pin.strip() if data.pin else ''
    
    return {"valid": wedding_pin == input_pin}

# Wedding routes
@app.post("/weddings/", response_model=schemas.Wedding)
def create_wedding(wedding: schemas.WeddingCreate, db: Session = Depends(get_db)):
    # Ensure PIN is properly formatted
    if not wedding.pin or not wedding.pin.strip():
        raise HTTPException(status_code=400, detail="PIN is required")
    
    wedding_data = wedding.model_dump()
    wedding_data["pin"] = wedding.pin.strip().zfill(6)
    
    db_wedding = models.Wedding(**wedding_data)
    db.add(db_wedding)
    db.commit()
    db.refresh(db_wedding)
    return db_wedding

@app.get("/weddings/", response_model=List[schemas.Wedding])
def get_weddings(db: Session = Depends(get_db)):
    weddings = db.query(models.Wedding).all()
    # Ensure PINs are properly formatted
    for wedding in weddings:
        if wedding.pin:
            wedding.pin = wedding.pin.strip().zfill(6)
    return weddings

@app.get("/weddings/{wedding_id}", response_model=schemas.Wedding)
def get_wedding(wedding_id: str, db: Session = Depends(get_db)):
    wedding = db.query(models.Wedding).filter(models.Wedding.id == wedding_id).first()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    # Ensure PIN is properly formatted
    if wedding.pin:
        wedding.pin = wedding.pin.strip().zfill(6)
    
    return jsonable_encoder(wedding)

@app.put("/weddings/{wedding_id}", response_model=schemas.Wedding)
def update_wedding(wedding_id: str, wedding: schemas.WeddingUpdate, db: Session = Depends(get_db)):
    db_wedding = db.query(models.Wedding).filter(models.Wedding.id == wedding_id).first()
    if not db_wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    update_data = wedding.model_dump(exclude_unset=True)
    
    # If PIN is being updated, ensure it's properly formatted
    if "pin" in update_data:
        if not update_data["pin"] or not update_data["pin"].strip():
            raise HTTPException(status_code=400, detail="PIN cannot be empty")
        update_data["pin"] = update_data["pin"].strip().zfill(6)
    
    for field, value in update_data.items():
        setattr(db_wedding, field, value)
    
    db.commit()
    db.refresh(db_wedding)
    return db_wedding

# Guest routes
@app.post("/guests/", response_model=schemas.Guest)
def create_guest(guest: schemas.GuestCreate, db: Session = Depends(get_db)):
    db_guest = models.Guest(**guest.model_dump())
    db.add(db_guest)
    db.commit()
    db.refresh(db_guest)
    return db_guest

@app.get("/weddings/{wedding_id}/guests/", response_model=List[schemas.Guest])
def get_wedding_guests(wedding_id: str, db: Session = Depends(get_db)):
    return db.query(models.Guest).filter(models.Guest.wedding_id == wedding_id).all()

# File upload helper function
def save_upload_file(upload_file: UploadFile, destination: Path) -> str:
    try:
        file_path = destination / f"{datetime.now().timestamp()}_{upload_file.filename}"
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        return str(file_path)
    finally:
        upload_file.file.close()

# Memory routes (Photos, Videos, Audios, Messages)
@app.post("/memories/photos/", response_model=schemas.Photo)
async def create_photo(
    file: UploadFile = File(...),
    guest_id: str = Form(...),
    wedding_id: str = Form(...),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    guest = db.query(models.Guest).filter(models.Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    wedding = db.query(models.Wedding).filter(models.Wedding.id == wedding_id).first()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    try:
        file_path = save_upload_file(file, UPLOAD_DIR / "photos")
        
        db_photo = models.Photo(
            url=file_path,
            guest_id=guest_id,
            wedding_id=wedding_id
        )
        db.add(db_photo)
        db.commit()
        db.refresh(db_photo)
        
        db.refresh(db_photo, ['guest'])
        
        return db_photo
    except Exception as e:
        if 'file_path' in locals():
            try:
                os.remove(file_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/memories/videos/", response_model=schemas.Video)
async def create_video(
    file: UploadFile = File(...),
    guest_id: str = Form(...),
    wedding_id: str = Form(...),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    guest = db.query(models.Guest).filter(models.Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    wedding = db.query(models.Wedding).filter(models.Wedding.id == wedding_id).first()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    try:
        file_path = save_upload_file(file, UPLOAD_DIR / "videos")
        
        db_video = models.Video(
            url=file_path,
            guest_id=guest_id,
            wedding_id=wedding_id
        )
        db.add(db_video)
        db.commit()
        db.refresh(db_video)
        
        db.refresh(db_video, ['guest'])
        
        return db_video
    except Exception as e:
        if 'file_path' in locals():
            try:
                os.remove(file_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/memories/audios/", response_model=schemas.Audio)
async def create_audio(
    file: UploadFile = File(...),
    duration: str = Form(None),
    guest_id: str = Form(...),
    wedding_id: str = Form(...),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    guest = db.query(models.Guest).filter(models.Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    wedding = db.query(models.Wedding).filter(models.Wedding.id == wedding_id).first()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    try:
        file_path = save_upload_file(file, UPLOAD_DIR / "audios")
        
        db_audio = models.Audio(
            url=file_path,
            duration=duration,
            guest_id=guest_id,
            wedding_id=wedding_id
        )
        db.add(db_audio)
        db.commit()
        db.refresh(db_audio)
        
        db.refresh(db_audio, ['guest'])
        
        return db_audio
    except Exception as e:
        if 'file_path' in locals():
            try:
                os.remove(file_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/memories/messages/", response_model=schemas.Message)
def create_message(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    guest = db.query(models.Guest).filter(models.Guest.id == message.guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    wedding = db.query(models.Wedding).filter(models.Wedding.id == message.wedding_id).first()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    db_message = models.Message(**message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    db.refresh(db_message, ['guest'])
    
    return db_message

@app.get("/weddings/{wedding_id}/memories/", response_model=schemas.WeddingMemories)
def get_wedding_memories(wedding_id: str, db: Session = Depends(get_db)):
    photos = (
        db.query(models.Photo)
        .options(joinedload(models.Photo.guest))
        .filter(models.Photo.wedding_id == wedding_id)
        .all()
    )
    
    videos = (
        db.query(models.Video)
        .options(joinedload(models.Video.guest))
        .filter(models.Video.wedding_id == wedding_id)
        .all()
    )
    
    audios = (
        db.query(models.Audio)
        .options(joinedload(models.Audio.guest))
        .filter(models.Audio.wedding_id == wedding_id)
        .all()
    )
    
    messages = (
        db.query(models.Message)
        .options(joinedload(models.Message.guest))
        .filter(models.Message.wedding_id == wedding_id)
        .all()
    )
    
    return schemas.WeddingMemories(
        photos=photos,
        videos=videos,
        audios=audios,
        messages=messages
    )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)