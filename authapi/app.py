from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, DateTime, create_engine
from datetime import datetime, timedelta
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import random
import json
from typing import List

# -------------------
# Database Setup
# -------------------
DATABASE_URL = "sqlite:///./users.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    display_name = Column(String, nullable=True)
    reports = Column(Integer, default=0)

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    type = Column(String)
    description = Column(String)
    latitude = Column(String, nullable=True)
    longitude = Column(String, nullable=True)
    severity = Column(Integer, nullable=True)
    photos = Column(String, nullable=True)  # JSON string of photo URLs
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------
# Pydantic Schemas
# -------------------
class CreateUserReportRequest(BaseModel):
    username: str
    type: str
    description: str
    latitude: float | None = None
    longitude: float | None = None
    severity: int | None = None
    photos: list[str] | None = None

class UserReportsResponse(BaseModel):
    username: str
    total_reports: int

class ReportResponse(BaseModel):
    id: int
    username: str
    type: str
    description: str
    latitude: str | None = None
    longitude: str | None = None
    severity: int | None = None
    photos: list[str] | None = None
    created_at: str

class CrimeIncident(BaseModel):
    latitude: float
    longitude: float
    crime_type: str
    severity: int
    date: str
    description: str

# -------------------
# FastAPI App
# -------------------
app = FastAPI()

# -------------------
# User Management Endpoints
# -------------------

class CreateUserRequest(BaseModel):
    username: str
    password: str
    display_name: str | None = None

class UserResponse(BaseModel):
    username: str
    display_name: str | None = None
    reports: int

@app.post("/users", response_model=UserResponse)
def create_user(user: CreateUserRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user
    db_user = User(
        username=user.username,
        password=user.password,  # In production, hash this password
        display_name=user.display_name or user.username,
        reports=0
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {
        "username": db_user.username,
        "display_name": db_user.display_name,
        "reports": db_user.reports
    }

# -------------------
# User Reports Endpoints (No Auth)
# -------------------
@app.post("/reports", response_model=UserReportsResponse)
def create_user_report(report: CreateUserReportRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == report.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create the report record
    db_report = Report(
        username=report.username,
        type=report.type,
        description=report.description,
        latitude=str(report.latitude) if report.latitude else None,
        longitude=str(report.longitude) if report.longitude else None,
        severity=report.severity,
        photos=json.dumps(report.photos) if report.photos else None
    )
    db.add(db_report)
    
    # Increment user's report count
    user.reports += 1
    db.commit()
    db.refresh(user)

    return {"username": user.username, "total_reports": user.reports}

@app.get("/reports/{username}", response_model=UserReportsResponse)
def get_user_reports(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": user.username, "total_reports": user.reports}

@app.get("/reports/{username}/all", response_model=List[ReportResponse])
def get_user_all_reports(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    reports = db.query(Report).filter(Report.username == username).order_by(Report.created_at.desc()).all()
    
    return [
        ReportResponse(
            id=report.id,
            username=report.username,
            type=report.type,
            description=report.description,
            latitude=report.latitude,
            longitude=report.longitude,
            severity=report.severity,
            photos=json.loads(report.photos) if report.photos else None,
            created_at=report.created_at.isoformat()
        )
        for report in reports
    ]

# -------------------
# Crime Data Endpoints
# -------------------

def generate_philadelphia_crime_data() -> List[CrimeIncident]:
    """Generate realistic crime data for Philadelphia"""
    crime_types = [
        "Theft", "Assault", "Burglary", "Robbery", "Vandalism", 
        "Drug Offense", "DUI", "Fraud", "Domestic Violence", "Public Disorder"
    ]
    
    # Philadelphia bounds (approximate)
    philly_bounds = {
        "north": 40.1379,
        "south": 39.8670,
        "east": -74.9558,
        "west": -75.2803
    }
    
    incidents = []
    base_date = datetime.now() - timedelta(days=30)
    
    for i in range(500):  # Generate 500 incidents
        # Random location within Philadelphia
        lat = random.uniform(philly_bounds["south"], philly_bounds["north"])
        lng = random.uniform(philly_bounds["west"], philly_bounds["east"])
        
        # Random crime type
        crime_type = random.choice(crime_types)
        
        # Random severity (1-5, where 5 is most severe)
        severity = random.randint(1, 5)
        
        # Random date within last 30 days
        random_days = random.randint(0, 30)
        incident_date = base_date + timedelta(days=random_days)
        
        incidents.append(CrimeIncident(
            latitude=lat,
            longitude=lng,
            crime_type=crime_type,
            severity=severity,
            date=incident_date.isoformat(),
            description=f"{crime_type} incident reported"
        ))
    
    return incidents

@app.get("/crime", response_model=List[CrimeIncident])
def get_crime_data():
    """Get crime incident data for Philadelphia"""
    return generate_philadelphia_crime_data()

@app.get("/crime/filtered")
def get_filtered_crime_data(
    crime_type: str = None,
    min_severity: int = 1,
    max_severity: int = 5,
    days_back: int = 30
):
    """Get filtered crime data"""
    all_incidents = generate_philadelphia_crime_data()
    
    # Filter by crime type
    if crime_type:
        all_incidents = [inc for inc in all_incidents if inc.crime_type.lower() == crime_type.lower()]
    
    # Filter by severity
    all_incidents = [inc for inc in all_incidents if min_severity <= inc.severity <= max_severity]
    
    # Filter by date
    cutoff_date = datetime.now() - timedelta(days=days_back)
    all_incidents = [inc for inc in all_incidents if datetime.fromisoformat(inc.date) >= cutoff_date]
    
    return all_incidents
