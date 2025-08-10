#!/bin/bash

# 🔍 Compare Database Schemas using REST API
# This approach uses the Supabase REST API to compare table structures

echo "🎯 Comparing Production vs Automation Database Schema (REST API method)..."
echo "📅 $(date)"
echo ""

# Production Database API
PROD_URL="https://zndkprjytuhzufdqhnmt.supabase.co"
PROD_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNzY0NzYsImV4cCI6MjA0NDc1MjQ3Nn0.YgKPdqNV0HCaTaAGI4K5fFi9I5q-KpI4HQJfNQXYT2Q"

# Automation Database API  
AUTO_URL="https://oqbusqbsmvwkwhggzvhl.supabase.co"
AUTO_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnVzcWJzbXZ3a3doZ2d6dmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjMxMjYsImV4cCI6MjA3MDI5OTEyNn0.kXRSa-AdjuSIzOonl98OQi6H2eTjZ4WjQ_5l_m1eVq4"

echo "🗄️ Production:  $PROD_URL"
echo "🧪 Automation:  $AUTO_URL"
echo ""

# Function to get table info via REST API
get_table_info() {
    local url=$1
    local key=$2
    local output_file=$3
    
    echo "📊 Getting table info from $url..."
    
    # Try to get users table structure
    echo "=== USERS TABLE ===" > $output_file
    curl -s -H "apikey: $key" -H "Authorization: Bearer $key" \
        "$url/rest/v1/users?select=*&limit=1" | jq 'if type == "array" then .[0] // {} else . end' | jq 'keys' >> $output_file 2>/dev/null || echo "Error getting users table" >> $output_file
    
    # Try to get other common tables
    for table in "user_dates" "excel_data" "hour_entries" "house" "hr_data"; do
        echo "" >> $output_file
        echo "=== ${table^^} TABLE ===" >> $output_file
        curl -s -H "apikey: $key" -H "Authorization: Bearer $key" \
            "$url/rest/v1/$table?select=*&limit=1" | jq 'if type == "array" then .[0] // {} else . end' | jq 'keys' >> $output_file 2>/dev/null || echo "Table not found or no access" >> $output_file
    done
}

# Get production schema
get_table_info "$PROD_URL" "$PROD_ANON_KEY" "prod_api_schema.txt"

echo ""

# Get automation schema  
get_table_info "$AUTO_URL" "$AUTO_ANON_KEY" "auto_api_schema.txt"

echo ""
echo "🔍 Comparing schemas..."
echo ""
echo "=== SCHEMA DIFFERENCES ==="
diff prod_api_schema.txt auto_api_schema.txt

echo ""
echo "📁 Files created:"
echo "  - prod_api_schema.txt (production schema via API)"
echo "  - auto_api_schema.txt (automation schema via API)"
echo ""

# Show the actual content for manual review
echo "📋 Production Schema Summary:"
echo "$(grep -E '^=== .* TABLE ===$' prod_api_schema.txt | wc -l) tables found"
head -20 prod_api_schema.txt

echo ""
echo "📋 Automation Schema Summary:"  
echo "$(grep -E '^=== .* TABLE ===$' auto_api_schema.txt | wc -l) tables found"
head -20 auto_api_schema.txt

echo ""
echo "✅ API-based schema comparison complete!"
