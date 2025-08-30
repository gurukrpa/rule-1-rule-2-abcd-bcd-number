#!/bin/bash

echo "🔮 Testing Vedic API Server"
echo "================================"

# Test root endpoint
echo "📡 Testing root endpoint..."
curl -s http://localhost:8086/ | jq '.name, .version'

echo ""
echo "🧮 Testing compute endpoint..."
curl -s -X POST http://localhost:8086/api/compute \
  -H "Content-Type: application/json" \
  -d '{
    "dateTime": "2025-08-26T14:30:00",
    "tz": "Asia/Kolkata", 
    "lat": 28.6139,
    "lon": 77.2090
  }' | jq '.asc.sign, .specials.gulika.token, .specials.mandi.token'

echo ""
echo "📊 Testing varga endpoint..."
curl -s -X POST http://localhost:8086/api/varga \
  -H "Content-Type: application/json" \
  -d '{
    "dateTime": "2025-08-26T14:30:00",
    "tz": "Asia/Kolkata",
    "lat": 28.6139, 
    "lon": 77.2090,
    "charts": ["D1", "D9"]
  }' | jq '.vargas.D1.su.sign, .vargas.D9.su.sign'

echo ""
echo "✅ API Testing Complete!"
