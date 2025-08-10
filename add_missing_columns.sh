#!/bin/bash

# 🔧 Apply Fixed Schema via SQL Direct Execution
# This script applies the corrected schema using direct SQL execution

echo "🎯 Applying Fixed Schema to Automation Database..."
echo "📅 $(date)"
echo ""

# First, let's just add the missing columns to the existing users table
echo "📝 Adding missing hr and days columns to users table..."

# Add hr column
echo "Adding hr column..."
curl -X POST \
  'https://oqbusqbsmvwkwhggzvhl.supabase.co/rest/v1/rpc/sql' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnVzcWJzbXZ3a3doZ2d6dmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjMxMjYsImV4cCI6MjA3MDI5OTEyNn0.kXRSa-AdjuSIzOonl98OQi6H2eTjZ4WjQ_5l_m1eVq4" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnVzcWJzbXZ3a3doZ2d6dmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjMxMjYsImV4cCI6MjA3MDI5OTEyNn0.kXRSa-AdjuSIzOonl98OQi6H2eTjZ4WjQ_5l_m1eVq4" \
  -H "Content-Type: application/json" \
  -d '{"sql": "ALTER TABLE users ADD COLUMN IF NOT EXISTS hr INTEGER DEFAULT 0;"}'

echo ""

# Add days column  
echo "Adding days column..."
curl -X POST \
  'https://oqbusqbsmvwkwhggzvhl.supabase.co/rest/v1/rpc/sql' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnVzcWJzbXZ3a3doZ2d6dmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjMxMjYsImV4cCI6MjA3MDI5OTEyNn0.kXRSa-AdjuSIzOonl98OQi6H2eTjZ4WjQ_5l_m1eVq4" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnVzcWJzbXZ3a3doZ2d6dmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjMxMjYsImV4cCI6MjA3MDI5OTEyNn0.kXRSa-AdjuSIzOonl98OQi6H2eTjZ4WjQ_5l_m1eVq4" \
  -H "Content-Type: application/json" \
  -d '{"sql": "ALTER TABLE users ADD COLUMN IF NOT EXISTS days INTEGER DEFAULT 0;"}'

echo ""
echo "✅ Column additions complete!"
echo ""
echo "🧪 Testing the fix..."

# Test the table structure
curl -s -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnVzcWJzbXZ3a3doZ2d6dmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjMxMjYsImV4cCI6MjA3MDI5OTEyNn0.kXRSa-AdjuSIzOonl98OQi6H2eTjZ4WjQ_5l_m1eVq4" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnVzcWJzbXZ3a3doZ2d6dmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjMxMjYsImV4cCI6MjA3MDI5OTEyNn0.kXRSa-AdjuSIzOonl98OQi6H2eTjZ4WjQ_5l_m1eVq4" \
  "https://oqbusqbsmvwkwhggzvhl.supabase.co/rest/v1/users?select=*&limit=1"

echo ""
echo "🎉 Schema fix complete!"
echo "🌐 You can now test user creation at: http://localhost:5173/users"
echo "🔍 Or run debug tests at: http://localhost:5173/debug"
