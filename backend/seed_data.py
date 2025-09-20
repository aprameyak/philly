from database import sync_collection
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def seed_incidents():
    # Check if data already exists
    existing_count = sync_collection.count_documents({})
    if existing_count > 0:
        print(f"Data already exists ({existing_count} documents), skipping seed...")
        return
    
    # Sample incidents based on your MongoDB schema
    incidents = [
        {
            "the_geom": "0101000020E610000034D87A0A89CB52C02834C6AA68F54340",
            "cartodb_id": 1,
            "the_geom_webmercator": "0101000020110F0000252B547DE0EC5FC18229656129845241",
            "objectid": 31803412,
            "dc_dist": 1,
            "psa": 2,
            "dispatch_date_time": "2025-01-19 02:21:00+00",
            "dispatch_date": datetime(2025, 1, 19),
            "dispatch_time": "02:21:00",
            "hour": 2,
            "dc_key": "202501190221",
            "location_block": "1500 BLOCK MARKET ST",
            "ucr_general": 300,
            "text_general_code": "Robbery No Firearm",
            "point_x": -75.1652,
            "point_y": 39.9526,
            "lat": 39.9526,
            "lng": -75.1652
        },
        {
            "the_geom": "0101000020E61000006085A41489CF52C010B29AEBCAF44340",
            "cartodb_id": 2,
            "the_geom_webmercator": "0101000020110F00003AF38DECABF35FC1A250FBB47A835241",
            "objectid": 31111013,
            "dc_dist": 12,
            "psa": 1,
            "dispatch_date_time": "2025-01-18 18:30:00+00",
            "dispatch_date": datetime(2025, 1, 18),
            "dispatch_time": "18:30:00",
            "hour": 18,
            "dc_key": "202501181830",
            "location_block": "1400 BLOCK SOUTH BROAD ST",
            "ucr_general": 400,
            "text_general_code": "Theft from Vehicle",
            "point_x": -75.1667,
            "point_y": 39.9500,
            "lat": 39.9500,
            "lng": -75.1667
        },
        {
            "the_geom": "0101000020E6100000A0E0620D89CF52C010B29AEBCAF44340",
            "cartodb_id": 3,
            "the_geom_webmercator": "0101000020110F00003AF38DECABF35FC1A250FBB47A835241",
            "objectid": 31111014,
            "dc_dist": 3,
            "psa": 2,
            "dispatch_date_time": "2025-01-18 14:15:00+00",
            "dispatch_date": datetime(2025, 1, 18),
            "dispatch_time": "14:15:00",
            "hour": 14,
            "dc_key": "202501181415",
            "location_block": "200 BLOCK CHRISTIAN ST",
            "ucr_general": 500,
            "text_general_code": "Burglary Residential",
            "point_x": -75.1500,
            "point_y": 39.9413,
            "lat": 39.9413,
            "lng": -75.1500
        },
        {
            "the_geom": "0101000020E6100000B0E0620D89CF52C010B29AEBCAF44340",
            "cartodb_id": 4,
            "the_geom_webmercator": "0101000020110F00003AF38DECABF35FC1A250FBB47A835241",
            "objectid": 31111015,
            "dc_dist": 5,
            "psa": 1,
            "dispatch_date_time": "2025-01-17 23:30:00+00",
            "dispatch_date": datetime(2025, 1, 17),
            "dispatch_time": "23:30:00",
            "hour": 23,
            "dc_key": "202501172330",
            "location_block": "200 BLOCK BROWN ST",
            "ucr_general": 600,
            "text_general_code": "Theft of Vehicle",
            "point_x": -75.1419,
            "point_y": 39.9661,
            "lat": 39.9661,
            "lng": -75.1419
        },
        {
            "the_geom": "0101000020E6100000C0E0620D89CF52C010B29AEBCAF44340",
            "cartodb_id": 5,
            "the_geom_webmercator": "0101000020110F00003AF38DECABF35FC1A250FBB47A835241",
            "objectid": 31111016,
            "dc_dist": 7,
            "psa": 3,
            "dispatch_date_time": "2025-01-17 16:45:00+00",
            "dispatch_date": datetime(2025, 1, 17),
            "dispatch_time": "16:45:00",
            "hour": 16,
            "dc_key": "202501171645",
            "location_block": "1200 BLOCK FRANKFORD AVE",
            "ucr_general": 700,
            "text_general_code": "Drug Violations",
            "point_x": -75.1350,
            "point_y": 39.9703,
            "lat": 39.9703,
            "lng": -75.1350
        }
    ]
    
    # Insert incidents into MongoDB
    result = sync_collection.insert_many(incidents)
    print(f"Seeded {len(result.inserted_ids)} incidents into the database")
    print(f"Database: {os.getenv('DATABASE_NAME', 'appdata')}")
    print(f"Collection: {os.getenv('COLLECTION_NAME', 'crimedata')}")

if __name__ == "__main__":
    seed_incidents()
