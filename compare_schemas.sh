#!/bin/bash

# 🔍 Compare Production vs Automation Database Schema
# This script compares table structures between environments

echo "🎯 Comparing Production vs Automation Database Schema..."
echo "📅 $(date)"
echo ""

# Production Database (from .env.production - you'll need to provide these)
PROD_HOST="db.zndkprjytuhzufdqhnmt.supabase.co"
PROD_DB="postgres"
PROD_USER="postgres"
PROD_PASSWORD="YOUR_PRODUCTION_PASSWORD"  # You need to provide this

# Automation Database (from .env.automation)
AUTO_HOST="db.oqbusqbsmvwkwhggzvhl.supabase.co"
AUTO_DB="postgres"
AUTO_USER="postgres"
AUTO_PASSWORD="YOUR_AUTOMATION_PASSWORD"  # You need to provide this

echo "🗄️ Production:  $PROD_HOST"
echo "🧪 Automation:  $AUTO_HOST"
echo ""

# Check if passwords are set
if [[ "$PROD_PASSWORD" == "YOUR_PRODUCTION_PASSWORD" ]] || [[ "$AUTO_PASSWORD" == "YOUR_AUTOMATION_PASSWORD" ]]; then
    echo "❌ Please update the database passwords in this script first!"
    echo ""
    echo "You can find the passwords in:"
    echo "1. Production: Supabase dashboard > Settings > Database > Connection string"
    echo "2. Automation: Supabase dashboard > Settings > Database > Connection string"
    echo ""
    echo "Or use the alternative method below..."
    exit 1
fi

echo "📊 Getting production table info..."
psql "postgresql://$PROD_USER:$PROD_PASSWORD@$PROD_HOST:5432/$PROD_DB" \
    -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position;" \
    > prod_schema.txt

echo "📊 Getting automation table info..."
psql "postgresql://$AUTO_USER:$AUTO_PASSWORD@$AUTO_HOST:5432/$AUTO_DB" \
    -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position;" \
    > auto_schema.txt

echo "🔍 Comparing schemas..."
echo ""
echo "=== SCHEMA DIFFERENCES ==="
diff prod_schema.txt auto_schema.txt

echo ""
echo "📁 Files created:"
echo "  - prod_schema.txt (production schema)"
echo "  - auto_schema.txt (automation schema)"
echo ""
echo "✅ Schema comparison complete!"
