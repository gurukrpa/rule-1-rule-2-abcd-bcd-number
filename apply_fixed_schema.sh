#!/bin/bash

# 🔧 Apply Fixed Schema to Automation Database
# This script applies the corrected schema that includes hr and days columns

echo "🎯 Applying Fixed Schema to Automation Database..."
echo "📅 $(date)"
echo ""

# Check if we have the Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Set project reference
PROJECT_REF="oqbusqbsmvwkwhggzvhl"
echo "🗄️ Target Project: $PROJECT_REF"

# Apply the fixed schema
echo ""
echo "📝 Applying fixed schema with hr and days columns..."

supabase db reset --project-ref $PROJECT_REF --file automation_schema_fixed.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Fixed schema applied successfully!"
    echo ""
    echo "🧪 Testing the fix..."
    
    # Test that the columns exist
    echo "Testing users table structure..."
    supabase db diff --project-ref $PROJECT_REF | head -20
    
    echo ""
    echo "🎉 Schema fix complete!"
    echo "🌐 You can now test user creation at: http://localhost:5173/users"
    echo "🔍 Or run debug tests at: http://localhost:5173/debug"
    
else
    echo "❌ Failed to apply schema. Let's try manual approach..."
    echo ""
    echo "Please run this SQL manually in Supabase dashboard:"
    echo "1. Go to https://supabase.com/dashboard/project/$PROJECT_REF/sql"
    echo "2. Copy and paste the contents of automation_schema_fixed.sql"
    echo "3. Click 'Run'"
fi
