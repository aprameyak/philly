import pandas as pd
import os
import json
from math import hypot, cos, radians
from score import generate
from utils import danger_scores
from score import generate
from datetime import datetime

def meters_dist(lat1, lat2, lon1, lon2):
    dx = (lon2 - lon1) * 111_320 * cos(radians((lat1 + lat2)/2))  # meters
    dy = (lat2 - lat1) * 110_540  # meters

    distance = hypot(dx, dy)

    return distance


df = pd.read_csv("crime_2025.csv")


def get_closest(df, lat, long):
    dists = []
    # Use point_y for latitude and point_x for longitude (real data format)
    for lat2, lon2 in zip(df.point_y, df.point_x):
        dists.append(meters_dist(lat, lat2, long, lon2))
    
    copy = df.copy()
    copy['dist'] = dists
    copy = copy.sort_values(by = 'dist').iloc[5]  # Use iloc instead of loc for integer indexing

    # Add danger_code if it doesn't exist
    if 'danger_code' not in copy or pd.isna(copy.get('danger_code')):
        copy['danger_code'] = danger_scores.get(copy.get('text_general_code'), 3)

    # Return relevant fields, using point_y/point_x for coordinates
    result = {
        "dc_dist": int(copy.get('dc_dist', 0)) if pd.notna(copy.get('dc_dist')) else 0,
        "dispatch_date_time": str(copy.get('dispatch_date_time', '')),
        "location_block": str(copy.get('location_block', '')),
        "text_general_code": str(copy.get('text_general_code', '')),
        "lat": float(copy.get('point_y', 0)) if pd.notna(copy.get('point_y')) else 0.0,  # point_y is latitude
        "lng": float(copy.get('point_x', 0)) if pd.notna(copy.get('point_x')) else 0.0,  # point_x is longitude
        "danger_code": int(copy.get('danger_code', 3))
    }
    return json.dumps(result)



def get_rating(lat, long, time):
    x = get_closest(df, lat, long)
    g = generate(x, lat, long, time)
    return g

# Test call removed - dbapi will work without hardcoded positions