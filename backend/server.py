from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_KEY = os.environ.get('ADMIN_KEY', 'flicksfromnai-admin-2025')

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class Photo(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = ""
    caption: str = ""
    category: str  # portrait | editorial | street | travel | events
    image_url: str  # external URL or data URL (base64)
    featured: bool = False
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PhotoCreate(BaseModel):
    title: Optional[str] = ""
    caption: Optional[str] = ""
    category: str
    image_url: str
    featured: Optional[bool] = False
    order: Optional[int] = 0


class PhotoUpdate(BaseModel):
    title: Optional[str] = None
    caption: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    featured: Optional[bool] = None
    order: Optional[int] = None


class AdminLoginRequest(BaseModel):
    key: str


# ---------- Auth Dependency (simple shared-secret) ----------
def require_admin(x_admin_key: Optional[str] = Header(None)):
    if not x_admin_key or x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "flicksfromnai API"}


@api_router.post("/admin/verify")
async def admin_verify(payload: AdminLoginRequest):
    if payload.key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Invalid admin key")
    return {"ok": True}


@api_router.get("/photos", response_model=List[Photo])
async def list_photos(category: Optional[str] = None, featured: Optional[bool] = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    cursor = db.photos.find(query, {"_id": 0}).sort([("order", 1), ("created_at", -1)])
    photos = await cursor.to_list(1000)
    for p in photos:
        if isinstance(p.get("created_at"), str):
            p["created_at"] = datetime.fromisoformat(p["created_at"])
    return photos


@api_router.post("/photos", response_model=Photo, dependencies=[Depends(require_admin)])
async def create_photo(payload: PhotoCreate):
    photo = Photo(**payload.model_dump())
    doc = photo.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.photos.insert_one(doc)
    return photo


@api_router.patch("/photos/{photo_id}", response_model=Photo, dependencies=[Depends(require_admin)])
async def update_photo(photo_id: str, payload: PhotoUpdate):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates")
    result = await db.photos.update_one({"id": photo_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Photo not found")
    doc = await db.photos.find_one({"id": photo_id}, {"_id": 0})
    if isinstance(doc.get("created_at"), str):
        doc["created_at"] = datetime.fromisoformat(doc["created_at"])
    return doc


@api_router.delete("/photos/{photo_id}", dependencies=[Depends(require_admin)])
async def delete_photo(photo_id: str):
    result = await db.photos.delete_one({"id": photo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Photo not found")
    return {"ok": True}


# ---------- Seed default photos on startup ----------
DEFAULT_PHOTOS = [
    # portrait
    {"category": "portrait", "image_url": "https://images.unsplash.com/photo-1532170579297-281918c8ae72?auto=format&fit=crop&w=1200&q=80", "title": "Quiet Light", "caption": "Natural light portrait series", "featured": True, "order": 1},
    {"category": "portrait", "image_url": "https://images.pexels.com/photos/21316136/pexels-photo-21316136.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200", "title": "Shadow Study", "caption": "Studio portrait", "featured": True, "order": 2},
    {"category": "portrait", "image_url": "https://images.unsplash.com/photo-1675726205553-4e348f24da2c?auto=format&fit=crop&w=1200&q=80", "title": "Solace", "caption": "Editorial portrait", "featured": False, "order": 3},
    # editorial
    {"category": "editorial", "image_url": "https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?auto=format&fit=crop&w=1200&q=80", "title": "Vogue Cut", "caption": "Editorial shoot", "featured": True, "order": 4},
    {"category": "editorial", "image_url": "https://images.pexels.com/photos/20483654/pexels-photo-20483654.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200", "title": "Atelier", "caption": "Fashion editorial", "featured": False, "order": 5},
    {"category": "editorial", "image_url": "https://images.unsplash.com/photo-1611702817472-92bdc6582fba?auto=format&fit=crop&w=1200&q=80", "title": "Noir", "caption": "Black & white editorial", "featured": True, "order": 6},
    # street
    {"category": "street", "image_url": "https://images.unsplash.com/photo-1713981276443-62ac6f3ed564?auto=format&fit=crop&w=1200&q=80", "title": "Crosswalk", "caption": "Street series", "featured": False, "order": 7},
    {"category": "street", "image_url": "https://images.unsplash.com/photo-1695963279977-f20918e05dbf?auto=format&fit=crop&w=1200&q=80", "title": "Neon Hours", "caption": "Night street", "featured": True, "order": 8},
    {"category": "street", "image_url": "https://images.unsplash.com/photo-1673095288333-ac62dbbad575?auto=format&fit=crop&w=1200&q=80", "title": "Passerby", "caption": "Candid street", "featured": False, "order": 9},
    # travel
    {"category": "travel", "image_url": "https://images.unsplash.com/photo-1551309292-e185c0b6e22a?auto=format&fit=crop&w=1200&q=80", "title": "Coastlines", "caption": "Travel diary", "featured": True, "order": 10},
    {"category": "travel", "image_url": "https://images.unsplash.com/photo-1670702146868-bc7797ef47a5?auto=format&fit=crop&w=1200&q=80", "title": "Distant Hills", "caption": "Mountain travel", "featured": False, "order": 11},
    {"category": "travel", "image_url": "https://images.pexels.com/photos/10701705/pexels-photo-10701705.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200", "title": "Roads Less Traveled", "caption": "Travel photography", "featured": False, "order": 12},
    # events
    {"category": "events", "image_url": "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80", "title": "First Dance", "caption": "Wedding day", "featured": True, "order": 13},
    {"category": "events", "image_url": "https://images.unsplash.com/photo-1563841930606-67e2bce48b78?auto=format&fit=crop&w=1200&q=80", "title": "Celebration", "caption": "Event coverage", "featured": False, "order": 14},
    {"category": "events", "image_url": "https://images.pexels.com/photos/18433033/pexels-photo-18433033.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200", "title": "Vows", "caption": "Wedding moment", "featured": False, "order": 15},
]


@app.on_event("startup")
async def seed_default_photos():
    count = await db.photos.count_documents({})
    if count == 0:
        docs = []
        for p in DEFAULT_PHOTOS:
            photo = Photo(**p)
            doc = photo.model_dump()
            doc["created_at"] = doc["created_at"].isoformat()
            docs.append(doc)
        await db.photos.insert_many(docs)
        logger.info(f"Seeded {len(docs)} default photos")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
