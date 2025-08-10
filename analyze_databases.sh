#!/bin/bash

# 🔍 Comprehensive Database Analysis
# Shows what's actually in both databases

echo "🎯 Comprehensive Database Analysis"
echo "📅 $(date)"
echo ""

# Test production database
echo "🗄️ PRODUCTION DATABASE ANALYSIS"
echo "================================"
echo "URL: https://zndkprjytuhzufdqhnmt.supabase.co"
echo ""

echo "Testing basic connection..."
PROD_TEST=$(curl -s -w "%{http_code}" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNzY0NzYsImV4cCI6MjA0NDc1MjQ3Nn0.YgKPdqNV0HCaTaAGI4K5fFi9I5q-KpI4HQJfNQXYT2Q" "https://zndkprjytuhzufdqhnmt.supabase.co/rest/v1/users?select=count" -o prod_response.txt)

echo "Response code: ${PROD_TEST: -3}"
echo "Response body:"
cat prod_response.txt 2>/dev/null || echo "No response file"
echo ""

# Test automation database  
echo "🧪 AUTOMATION DATABASE ANALYSIS"
echo "==============================="
echo "URL: https://oqbusqbsmvwkwhggzvhl.supabase.co"
echo ""

echo "Testing basic connection..."
AUTO_TEST=$(curl -s -w "%{http_code}" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnVzcWJzbXZ3a3doZ2d6dmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjMxMjYsImV4cCI6MjA3MDI5OTEyNn0.kXRSa-AdjuSIzOonl98OQi6H2eTjZ4WjQ_5l_m1eVq4" "https://oqbusqbsmvwkwhggzvhl.supabase.co/rest/v1/users?select=count" -o auto_response.txt)

echo "Response code: ${AUTO_TEST: -3}"
echo "Response body:"
cat auto_response.txt 2>/dev/null || echo "No response file"
echo ""

# Check if we can see actual table structure
echo "🔍 CHECKING TABLE STRUCTURE"
echo "============================="

echo "Automation users table sample:"
curl -s -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnVzcWJzbXZ3a3doZ2d6dmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjMxMjYsImV4cCI6MjA3MDI5OTEyNn0.kXRSa-AdjuSIzOonl98OQi6H2eTjZ4WjQ_5l_m1eVq4" "https://oqbusqbsmvwkwhggzvhl.supabase.co/rest/v1/users?select=*&limit=1" | jq . 2>/dev/null || echo "Could not parse JSON"

echo ""
echo "🎯 CONCLUSION"
echo "============="
echo "Based on your earlier debug results, we know:"
echo "✅ Automation database is accessible" 
echo "✅ Users table exists but was missing hr/days columns"
echo "❌ Production database may need different auth or be restricted"
echo ""
echo "The fix for automation database:"
echo "1. Add hr and days columns to users table"
echo "2. Test user creation functionality"
echo ""

# Clean up temp files
rm -f prod_response.txt auto_response.txt 2>/dev/null

echo "✅ Analysis complete!"
