/api/insert
 body - json with the columns {
    "dc_dist", "dispatch_date_time", "location_block", "text_general_code", "lat", "lng", "danger_code", "description"
 }
 for an event happening; adds to the local csv storage
 returns {"success" : True} or {"error" : e}



/api/score
 body - json with the columns {
    "lat", "lon", "time"
 }
 lat and lon must be numbers, time can be a string
 returns {
  "danger_score": <int>, 
  "reasons": [
    "<reason 1>",
    "<reason 2>",
    "<reason 3>",
    "<reason 4>",
    "<reason 5>"
  ],
  "events": {
    "<event_id>": {
      "dc_dist": <int>,
      "dispatch_date_time": "<YYYY-MM-DD HH:MM:SS+00>",
      "location_block": "<street or block description>",
      "text_general_code": "<crime type>",
      "lat": <float>,
      "lng": <float>,
      "danger_code": <int or null>
    },
    "<event_id_2>": {
      "dc_dist": <int>,
      "dispatch_date_time": "<YYYY-MM-DD HH:MM:SS+00>",
      "location_block": "<street or block description>",
      "text_general_code": "<crime type>",
      "lat": <float>,
      "lng": <float>,
      "danger_code": <int or null>
    }
  }
}



