from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# MongoDB connection string
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "appdata")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "crimedata")
USER_REPORTS_COLLECTION = os.getenv("USER_REPORTS_COLLECTION", "crimereports")
USER_DATA_COLLECTION = os.getenv("USER_DATA_COLLECTION", "userdata")
USERS_COLLECTION = os.getenv("USERS_COLLECTION", "users")

# Create MongoDB client
client = AsyncIOMotorClient(MONGODB_URL)
database = client[DATABASE_NAME]
collection = database[COLLECTION_NAME]
user_reports_collection = database[USER_REPORTS_COLLECTION]
user_data_collection = database[USER_DATA_COLLECTION]
users_collection = database[USERS_COLLECTION]

# For synchronous operations (like seeding)
sync_client = MongoClient(MONGODB_URL)
sync_database = sync_client[DATABASE_NAME]
sync_collection = sync_database[COLLECTION_NAME]
sync_user_reports_collection = sync_database[USER_REPORTS_COLLECTION]
sync_user_data_collection = sync_database[USER_DATA_COLLECTION]
sync_users_collection = sync_database[USERS_COLLECTION]

# Dependency to get database
async def get_database():
    return database

# Dependency to get collection
async def get_collection():
    return collection

# Dependency to get user reports collection
async def get_user_reports_collection():
    return user_reports_collection

# Dependency to get user data collection
async def get_user_data_collection():
    return user_data_collection

# Dependency to get users collection
async def get_users_collection():
    return users_collection
