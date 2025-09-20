from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class CrimeIncidentBase(BaseModel):
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

class CrimeIncidentCreate(CrimeIncidentBase):
    pass

class CrimeIncidentResponse(CrimeIncidentBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# User Report Schemas
class UserReportBase(BaseModel):
    type: str
    location: str
    use_current_location: bool = True
    photos: List[str] = []
    description: str
    severity: str
    anonymous: bool = True
    contact: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    user_id: Optional[str] = None

class UserReportCreate(UserReportBase):
    pass

class UserReportResponse(UserReportBase):
    id: str = Field(alias="_id")
    timestamp: datetime
    status: str

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# User Data Schemas for Gamification
class UserDataBase(BaseModel):
    user_id: str
    total_submissions: int = 0
    first_submission_date: Optional[datetime] = None
    last_submission_date: Optional[datetime] = None
    submission_types: dict = {}
    total_photos_submitted: int = 0
    reports_resolved: int = 0
    reports_pending: int = 0
    streak_days: int = 0
    longest_streak: int = 0
    last_activity_date: Optional[datetime] = None
    level: int = 1
    experience_points: int = 0
    achievements: List[str] = []
    badges: List[str] = []

class UserDataCreate(UserDataBase):
    pass

class UserDataUpdate(BaseModel):
    total_submissions: Optional[int] = None
    last_submission_date: Optional[datetime] = None
    submission_types: Optional[dict] = None
    total_photos_submitted: Optional[int] = None
    reports_resolved: Optional[int] = None
    reports_pending: Optional[int] = None
    streak_days: Optional[int] = None
    longest_streak: Optional[int] = None
    last_activity_date: Optional[datetime] = None
    level: Optional[int] = None
    experience_points: Optional[int] = None
    achievements: Optional[List[str]] = None
    badges: Optional[List[str]] = None

class UserDataResponse(UserDataBase):
    id: str = Field(alias="_id")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# Authentication Schemas
class UserRegister(BaseModel):
    username: str
    password: str
    display_name: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    username: str
    display_name: str
    total_contributions: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
