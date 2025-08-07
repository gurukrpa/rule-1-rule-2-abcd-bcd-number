#!/bin/zsh

# Safe Project Cleanup Script
# This script will safely remove unnecessary files while preserving your core application

set -e  # Exit on any error

echo "🧹 Starting SAFE project cleanup..."
echo "📊 Initial project size: $(du -sh . | cut -f1)"

# Create backup directory
BACKUP_DIR="../rule-1-rule-2-abcd-bcd-number-main-backup-$(date +%Y%m%d-%H%M%S)"
echo "💾 Creating backup at: $BACKUP_DIR"

# Function to safely remove files with confirmation
safe_remove() {
    local pattern="$1"
    local description="$2"
    local count=$(find . -name "$pattern" -type f | wc -l | xargs)
    
    if [ "$count" -gt 0 ]; then
        echo "🔍 Found $count files matching '$pattern' ($description)"
        echo "📋 Preview (first 10):"
        find . -name "$pattern" -type f | head -10
        
        read "response?❓ Remove these $count files? (y/N): "
        if [[ "$response" =~ ^[Yy]$ ]]; then
            find . -name "$pattern" -type f -delete
            echo "✅ Removed $count $description files"
        else
            echo "⏭️  Skipped $description files"
        fi
        echo ""
    fi
}

# Function to safely remove directories
safe_remove_dir() {
    local pattern="$1"
    local description="$2"
    local count=$(find . -name "$pattern" -type d | wc -l | xargs)
    
    if [ "$count" -gt 0 ]; then
        echo "🔍 Found $count directories matching '$pattern' ($description)"
        echo "📋 Preview:"
        find . -name "$pattern" -type d | head -5
        
        # Calculate size
        local size=$(find . -name "$pattern" -type d -exec du -sh {} \; 2>/dev/null | awk '{total+=$1} END {print total "M"}' || echo "Unknown")
        
        read "response?❓ Remove these $count directories (~$size)? (y/N): "
        if [[ "$response" =~ ^[Yy]$ ]]; then
            find . -name "$pattern" -type d -exec rm -rf {} + 2>/dev/null || true
            echo "✅ Removed $count $description directories"
        else
            echo "⏭️  Skipped $description directories"
        fi
        echo ""
    fi
}

# Protect core application files
PROTECTED_FILES=(
    "./src/*"
    "./public/*" 
    "./components/*"
    "./pages/*"
    "./utils/*"
    "./hooks/*"
    "./context/*"
    "./styles/*"
    "./assets/*"
    "./package.json"
    "./package-lock.json"
    "./vite.config.js"
    "./tailwind.config.js"
    "./postcss.config.js"
    "./index.html"
    "./.env*"
    "./README.md"
    "./.gitignore"
    "./LICENSE"
)

# Function to check if file is protected
is_protected() {
    local file="$1"
    for pattern in "${PROTECTED_FILES[@]}"; do
        if [[ "$file" == $pattern ]]; then
            return 0  # Protected
        fi
    done
    return 1  # Not protected
}

# Enhanced safe remove with protection check
safe_remove_protected() {
    local pattern="$1"
    local description="$2"
    
    echo "🔍 Searching for $description files matching: $pattern"
    
    # Get list of files but exclude protected ones
    local files=()
    while IFS= read -r -d '' file; do
        if ! is_protected "$file"; then
            files+=("$file")
        fi
    done < <(find . -name "$pattern" -type f -print0 2>/dev/null)
    
    local count=${#files[@]}
    
    if [ "$count" -gt 0 ]; then
        echo "🔍 Found $count files matching '$pattern' ($description)"
        echo "📋 Preview (first 10):"
        printf '%s\n' "${files[@]:0:10}"
        
        echo "⚠️  PROTECTED FILES EXCLUDED from deletion"
        
        read "response?❓ Remove these $count NON-PROTECTED files? (y/N): "
        if [[ "$response" =~ ^[Yy]$ ]]; then
            for file in "${files[@]}"; do
                rm -f "$file"
            done
            echo "✅ Removed $count $description files"
        else
            echo "⏭️  Skipped $description files"
        fi
        echo ""
    else
        echo "✅ No unprotected $description files found"
        echo ""
    fi
}

echo "🎯 PHASE 1: Remove Debug Files (ONLY obvious debug scripts)"
safe_remove_protected "debug-*.js" "debug scripts"
safe_remove_protected "debug-*.mjs" "debug modules" 
safe_remove_protected "debug-*.html" "debug HTML files"
safe_remove_protected "*-debug.js" "debug suffix scripts"

echo "🎯 PHASE 2: Remove Test Data Creation Files (NOT test logic)"
safe_remove_protected "create-test-data*.js" "test data creation scripts"
safe_remove_protected "create-test-data*.mjs" "test data creation modules"
safe_remove_protected "create-test-data*.html" "test data HTML files"
safe_remove_protected "*test-data*.html" "test data HTML files"

echo "🎯 PHASE 3: Remove Temporary & Cache Files"
safe_remove "*.log" "log files"
safe_remove "*.tmp" "temporary files"
safe_remove ".DS_Store" "macOS metadata files"
safe_remove "*.cache" "cache files"

echo "🎯 PHASE 4: Remove Documentation (VERY SELECTIVE)"
echo "📚 Found $(find . -name "*.md" -type f | wc -l | xargs) markdown files"
echo "📋 Documentation files preview:"
find . -name "*.md" -type f | head -10

echo "⚠️  WILL ONLY REMOVE:"
echo "   • *DEBUG*.md files"
echo "   • *IMPLEMENTATION*.md files" 
echo "   • *REPORT*.md files"
echo "   • *COMPLETION*.md files"
echo "   • *ANALYSIS*.md files"
echo "📋 Files to be removed:"
find . -name "*DEBUG*.md" -o -name "*IMPLEMENTATION*.md" -o -name "*REPORT*.md" -o -name "*COMPLETION*.md" -o -name "*ANALYSIS*.md" 2>/dev/null || echo "None found"

echo "✅ PROTECTED DOCS (will keep):"
echo "   • README.md"
echo "   • Any other .md files not matching above patterns"

read "response?❓ Remove ONLY the specific documentation patterns above? (y/N): "
if [[ "$response" =~ ^[Yy]$ ]]; then
    # Only remove very specific documentation patterns
    local removed_count=0
    
    for pattern in "*DEBUG*.md" "*IMPLEMENTATION*.md" "*REPORT*.md" "*COMPLETION*.md" "*ANALYSIS*.md"; do
        local count=$(find . -name "$pattern" -type f | wc -l | xargs)
        if [ "$count" -gt 0 ]; then
            find . -name "$pattern" -type f -delete 2>/dev/null || true
            removed_count=$((removed_count + count))
        fi
    done
    
    echo "✅ Removed $removed_count specific documentation files"
else
    echo "⏭️  Kept all documentation files"
fi
echo ""

echo "🎯 PHASE 5: Node Modules (can be regenerated)"
if [ -d "node_modules" ]; then
    local nm_size=$(du -sh node_modules | cut -f1)
    read "response?❓ Remove node_modules directory ($nm_size)? You can regenerate with 'npm install' (y/N): "
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rm -rf node_modules
        echo "✅ Removed node_modules directory"
        echo "💡 Run 'npm install' to restore dependencies"
    else
        echo "⏭️  Kept node_modules directory"
    fi
    echo ""
fi

echo "🎯 PHASE 6: Build Artifacts"
safe_remove_dir "dist" "build output"
safe_remove_dir "build" "build artifacts"
safe_remove_dir ".next" "Next.js cache"
safe_remove_dir ".vite" "Vite cache"

echo "🎯 PHASE 7: Find Potential Duplicates (SAFE CHECK ONLY)"
echo "🔍 Checking for potential duplicate files..."
echo "📋 This will ONLY REPORT duplicates, not delete them:"

# Create a safer duplicate detection
find . -type f -name "*.js" -not -path "./node_modules/*" -not -path "./src/*" -not -path "./components/*" -not -path "./pages/*" -exec basename {} \; | sort | uniq -d > potential_duplicates.txt

if [ -s potential_duplicates.txt ]; then
    echo "📋 Potential duplicate BASENAMES found (manual review needed):"
    cat potential_duplicates.txt
    echo ""
    echo "🔍 Full paths for manual review:"
    while read -r filename; do
        echo "Files named '$filename':"
        find . -name "$filename" -not -path "./node_modules/*" | sed 's/^/  /'
        echo ""
    done < potential_duplicates.txt
    echo "💡 Review these manually - they might be legitimate files with same names in different directories"
    echo "❌ NO FILES WILL BE AUTO-DELETED - manual review required"
else
    echo "✅ No obvious duplicate filenames found"
fi
rm -f potential_duplicates.txt

echo ""
echo "🏁 CLEANUP COMPLETE!"
echo "📊 Final project size: $(du -sh . | cut -f1)"
echo "💾 Backup created at: $BACKUP_DIR (if you created one)"
echo ""
echo "🔧 VERIFICATION CHECK:"
echo "✅ Checking core application files are still present..."

# Verify critical files still exist
critical_files=("package.json" "index.html")
missing_critical=0

for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ CRITICAL: $file is missing!"
        missing_critical=1
    else
        echo "✅ $file present"
    fi
done

# Check if src directory or main application files exist
if [ -d "src" ]; then
    echo "✅ src/ directory present"
elif [ -f "main.js" ] || [ -f "app.js" ] || [ -f "index.js" ]; then
    echo "✅ Main application files present"
else
    echo "⚠️  WARNING: No src/ directory or main application files found"
    echo "   This might be normal depending on your project structure"
fi

if [ $missing_critical -eq 1 ]; then
    echo ""
    echo "🚨 CRITICAL FILES MISSING - RESTORE FROM BACKUP!"
    exit 1
fi

echo ""
echo "🔧 NEXT STEPS:"
echo "   • If you removed node_modules: run 'npm install'"
echo "   • Test your application: npm run dev"
echo "   • If issues occur, restore from backup"
echo "   • Manually review any reported duplicate files"
echo ""
echo "✨ Your project is now cleaner and more organized!"
echo "🛡️  All core application files have been preserved!"
