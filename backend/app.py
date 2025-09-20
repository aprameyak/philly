from flask import Flask, jsonify
from pymongo import MongoClient
from bson.json_util import dumps
import os


MONGO_URL = os.getenv(MONGO_URL)

DATABASE_NAME = "appdata"
COLLECTION_NAME = "crimedata"

client = MongoClient(MONGO_URL)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]


app = Flask(__name__)

@app.route("/crimes", methods=["GET"])
def get_all_entries():
    try:
        entries = list(collection.find().limit(100))
        return dumps(entries), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
