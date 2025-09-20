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
    for lat2, lon2 in zip(df.lat, df.lng):
        dists.append(meters_dist(lat, lat2, long, lon2))
    
    copy = df.copy()
    copy['dist'] = dists
    copy = copy.sort_values(by = 'dist').loc[5, :]

    if str(copy['danger_code']).lower() == 'nan':
        copy['danger_code'] = [danger_scores[i] if i in danger_scores else 3 for i in copy.text_general_code]

    copy = copy[[
        "dc_dist", "dispatch_date_time", "location_block", "text_general_code", "lat", "lng", "danger_code"
    ]]
    return copy.T.to_json()



def get_rating(lat, long, time):
    x = get_closest(df, lat, long)
    g = generate(x, lat, long, time)
    return g

print(json.dumps(
        get_rating(
            39.957074, -75.195155, "10PM 9/20/2025"
        ), 
        indent = 2
    )   
)