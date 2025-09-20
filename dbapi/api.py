from rate import get_rating
from flask import Flask, request, jsonify
import pandas as pd
import requests
from score import score_single

app = Flask(__name__)

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
def all_crime():

    x = []

    print("Finding all crime")

    cat = [
        "id",
        "_id",
        "the_geom",
        "the_geom_webmercator",
        "psa",
        "dispatch_date_time",
        "dispatch_date",
        "dispatch_time",
        "dc_key",
        "location_block",
        "text_general_code",
    ]


    numerical = ['lat', 'lng', 'point_x', 'point_y', 'cartodb_id', 'objectid', 'dc_dist', 'hour', 'ucr_general']


    x = []
    for idx, row in df.iterrows():
        dic = {}
        for c in cat:
            dic[c] = row.get(c)
        for c in numerical:
            dic[c] = float(row.get(c) or 0)

        
        x.append(dic)
        

    return x


@app.route("/incidents/<string:id>", methods=["POST"])
def get_data(id):
    #id = db index
    return df.iloc[int(id), :].T.to_json()





if __name__ == "__main__":
    app.run(debug=True)
