#!/bin/bash

echo "🔍 Downloading Real Philadelphia Crime Data..."

# Create dbapi directory if it doesn't exist
mkdir -p dbapi

# Download recent crime data from Philadelphia Open Data
echo "📥 Downloading crime incidents from OpenDataPhilly..."

# Download 2024 crime data (last 1000 records for testing)
curl -o "dbapi/crime_2025.csv" "https://phl.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20incidents_part1_part2%20WHERE%20dispatch_date%20%3E=%20%272024-01-01%27%20ORDER%20BY%20dispatch_date%20DESC%20LIMIT%201000&format=csv"

if [ $? -eq 0 ]; then
    echo "✅ Successfully downloaded real crime data!"
    echo "📊 Data saved to: dbapi/crime_2025.csv"
    
    # Show basic info about the data
    if command -v wc &> /dev/null; then
        line_count=$(wc -l < "dbapi/crime_2025.csv")
        echo "📈 Total records: $((line_count - 1))" # Subtract header row
    fi
    
    echo ""
    echo "🚀 To use real data:"
    echo "1. Start dbapi: cd dbapi && python api.py"
    echo "2. The frontend will automatically use real data if available"
    echo "3. Check console logs to see 'Using real crime data from dbapi'"
    
else
    echo "❌ Failed to download real crime data"
    echo "💡 The app will fallback to simulated data from authapi"
fi
