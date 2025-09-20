from rate import get_rating
from flask import Flask, request, jsonify
import pandas as pd
import requests
import threading
from score import score_single

from flask_cors import CORS
app = Flask(__name__)
CORS(app) 

df = pd.read_csv("crime_2025.csv")


@app.route("/", methods=["GET"])
def home():
    return "Crime in Philly sucks dude"


@app.route("/incidents", methods=["POST"])
def insert():
    try:
        data = request.json

        new_row = {col: str(data.get(col)) 
                   for col in df.columns}

        # Infer danger_score if missing/empty
        if not new_row.get("danger_score"):
            new_row["danger_score"] = score_single(
                str(new_row.get("text_general_code")),
                str(new_row.get("description"))
            )

        # Append row correctly
        copy = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        copy.to_csv("crime_2025.csv", index=False)

        # Return last row as JSON
        last_row = copy.iloc[-1, :].to_dict()
        last_row["_id"] = len(copy) - 1
        return last_row

    except Exception as e:
        print(f"Received error {e}") 
        return {"error": str(e)}

    


@app.route("/score", methods=["POST"])
def score():
    try:
        data = request.json
        return get_rating(data['lat'], data['lon'], data['time'])
    
    except Exception as e:
        print(f"Recieved error {e}")
        return {"error" : str(e)}


@app.route("/crime", methods=['GET'])
@app.route("/crime", methods=['GET'])
def all_crime():
    relevant_cols = [
        "id", "_id", "the_geom", "cartodb_id", "the_geom_webmercator",
        "objectid", "dc_dist", "psa", "dispatch_date_time", "dispatch_date",
        "dispatch_time", "hour", "dc_key", "location_block", "ucr_general",
        "text_general_code", "point_x", "point_y", "lat", "lng"
    ]

    numerical = [
        'lat', 'lng', 'point_x', 'point_y',
        'cartodb_id', 'objectid', 'dc_dist', 'hour', 'ucr_general'
    ]

    results = []
    for _, row in df.iterrows():
        d = {col: row.get(col, None) for col in relevant_cols}
        for col in numerical:
            val = d.get(col)
            if pd.notna(val):
                try:
                    d[col] = int(val)
                except:
                    try:
                        d[col] = float(val)
                    except:
                        d[col] = None
            else:
                d[col] = None
        results.append(d)

    # 🚀 always return a JSON array
    return jsonify(results[:100])



@app.route("/incidents/<string:id>", methods=["POST"])
def get_data(id):
    #id = db index
    return df.iloc[int(id), :].T.to_json()





if __name__ == "__main__":
    app.run(debug=True)