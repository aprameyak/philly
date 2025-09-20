from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import enum

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

class CrimeIncident(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    the_geom: Optional[str] = None
    cartodb_id: Optional[int] = None
    the_geom_webmercator: Optional[str] = None
    objectid: Optional[int] = None
    dc_dist: Optional[int] = None
    psa: Optional[int] = None
    dispatch_date_time: Optional[str] = None
    dispatch_date: Optional[datetime] = None
    dispatch_time: Optional[str] = None
    hour: Optional[int] = None
    dc_key: Optional[str] = None
    location_block: Optional[str] = None
    ucr_general: Optional[int] = None
    text_general_code: Optional[str] = None
    point_x: Optional[float] = None
    point_y: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserReport(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    type: str  # Crime type (e.g., "theft", "vandalism", "assault")
    location: str  # User-entered location or "current location"
    use_current_location: bool = True
    photos: List[str] = []  # List of photo URIs
    description: str
    severity: str  # "low", "medium", "high"
    anonymous: bool = True
    contact: Optional[str] = None
    lat: Optional[float] = None  # GPS coordinates if available
    lng: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # "pending", "reviewed", "resolved"
    user_id: Optional[str] = None  # For future user authentication

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserData(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str  # Unique identifier for the user (device ID, email, etc.)
    total_submissions: int = 0  # Total number of reports submitted
    first_submission_date: Optional[datetime] = None
    last_submission_date: Optional[datetime] = None
    submission_types: dict = {}  # Count of each crime type reported
    total_photos_submitted: int = 0  # Total photos uploaded
    reports_resolved: int = 0  # Number of reports that were resolved
    reports_pending: int = 0  # Number of reports still pending
    streak_days: int = 0  # Current streak of consecutive days with submissions
    longest_streak: int = 0  # Longest streak achieved
    last_activity_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Gamification levels and achievements
    level: int = 1  # User level based on submissions
    experience_points: int = 0  # XP earned from submissions
    achievements: List[str] = []  # List of achievement IDs unlocked
    badges: List[str] = []  # List of badge IDs earned

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class User(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str  # Unique username (used as unique ID)
    password_hash: str  # Hashed password
    display_name: str  # User's display name
    total_contributions: int = 0  # Total number of reports submitted
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
