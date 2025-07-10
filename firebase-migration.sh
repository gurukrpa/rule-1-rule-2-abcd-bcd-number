#!/bin/bash
# Firebase Migration Script - Replace Supabase with Firebase services

echo "🔥 Starting Firebase Service Migration..."
echo "📋 This will replace CleanSupabaseService imports with CleanFirebaseService"
echo ""

# Define the project root
PROJECT_ROOT="/Volumes/t7 sharma/vs coad/rule-1-rule-2-abcd-bcd-number-main"
cd "$PROJECT_ROOT"

# Create backup directory
BACKUP_DIR="backup-before-firebase-migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "💾 Creating backup in $BACKUP_DIR..."

# Backup all service files
cp -r src/services "$BACKUP_DIR/"

# List of files to update (based on your comprehensive storage audit)
FILES_TO_UPDATE=(
  "src/components/ABCDBCDNumber.jsx"
  "src/components/UserData.jsx" 
  "src/components/PlanetsAnalysisPage.jsx"
  "src/hooks/useABCDData.js"
  "src/services/unifiedDataService.js"
  "src/components/modules/PlanetsServiceAdapter.js"
)

echo "🔄 Files to be updated:"
printf '%s\n' "${FILES_TO_UPDATE[@]}"
echo ""

# Function to update imports in a file
update_file() {
  local file="$1"
  echo "📝 Updating $file..."
  
  # Backup original file
  cp "$file" "$BACKUP_DIR/$(basename "$file").bak"
  
  # Replace imports
  sed -i '' 's/cleanSupabaseService/cleanFirebaseService/g' "$file"
  sed -i '' 's/CleanSupabaseService/CleanFirebaseService/g' "$file"
  sed -i '' "s|from './CleanSupabaseService'|from './CleanFirebaseService'|g" "$file"
  sed -i '' "s|from '../services/CleanSupabaseService'|from '../services/CleanFirebaseService'|g" "$file"
  sed -i '' "s|from '../../services/CleanSupabaseService'|from '../../services/CleanFirebaseService'|g" "$file"
  
  echo "  ✅ Updated $file"
}

# Update each file
for file in "${FILES_TO_UPDATE[@]}"; do
  if [ -f "$file" ]; then
    update_file "$file"
  else
    echo "  ⚠️ File not found: $file"
  fi
done

echo ""
echo "🎯 Migration Summary:"
echo "✅ Service imports updated from Supabase to Firebase"
echo "✅ All files backed up to $BACKUP_DIR"
echo ""
echo "📋 Next Steps:"
echo "1. Test the application with Firebase"
echo "2. Remove localStorage authentication dependencies"
echo "3. Enable Firebase Authentication"
echo "4. Deploy to Firebase Hosting"
echo ""
echo "🔥 Firebase migration completed!"
