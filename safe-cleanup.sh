#!/bin/bash

# 🧹 Safe Application Cleanup Script
# This script safely removes debug, test, and unwanted files while preserving index.html and essential files

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Starting Safe Application Cleanup...${NC}"
echo -e "${YELLOW}⚠️  This will remove debug, test, and documentation files while preserving index.html and core application files.${NC}"
echo ""

# Create backup directory with timestamp
BACKUP_DIR="cleanup-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}📋 Creating backup in: $BACKUP_DIR${NC}"

# Function to safely move files to backup
backup_and_remove() {
    local pattern="$1"
    local description="$2"
    
    echo -e "${YELLOW}Processing: $description${NC}"
    
    # Find and move files matching pattern
    find . -maxdepth 1 -name "$pattern" -type f 2>/dev/null | while read -r file; do
        if [ "$file" != "./index.html" ] && [ -f "$file" ]; then  # Extra safety checks
            echo "  Moving: $file"
            mv "$file" "$BACKUP_DIR/" 2>/dev/null || echo "  Warning: Could not move $file"
        fi
    done
}

# Function to safely remove directories
backup_and_remove_dir() {
    local dir="$1"
    local description="$2"
    
    if [ -d "$dir" ]; then
        echo -e "${YELLOW}Moving directory: $description${NC}"
        mv "$dir" "$BACKUP_DIR/" 2>/dev/null || echo "  Warning: Could not move directory $dir"
    fi
}

echo -e "${GREEN}✅ Confirmed preservation of index.html${NC}"

# 1. Remove debug files
echo -e "\n${BLUE}1. Cleaning debug files...${NC}"
backup_and_remove "debug-*.js" "Debug JavaScript files"
backup_and_remove "debug-*.mjs" "Debug ES Module files"
backup_and_remove "debug-*.html" "Debug HTML files"
backup_and_remove "*-debug.js" "Debug suffix files"
backup_and_remove "*-debug.log" "Debug log files"

# 2. Remove test files
echo -e "\n${BLUE}2. Cleaning test files...${NC}"
backup_and_remove "test-*.js" "Test JavaScript files"
backup_and_remove "test-*.mjs" "Test ES Module files"
backup_and_remove "test-*.html" "Test HTML files"
backup_and_remove "*-test.js" "Test suffix files"

# 3. Remove diagnostic files
echo -e "\n${BLUE}3. Cleaning diagnostic files...${NC}"
backup_and_remove "*diagnostic*.js" "Diagnostic files"
backup_and_remove "diagnose-*.js" "Diagnosis files"
backup_and_remove "comprehensive-*.js" "Comprehensive test files"

# 4. Remove verification files
echo -e "\n${BLUE}4. Cleaning verification files...${NC}"
backup_and_remove "verify-*.js" "Verification files"
backup_and_remove "verify-*.mjs" "Verification ES Module files"
backup_and_remove "*-verification-*.js" "Verification test files"

# 5. Remove fix/patch files
echo -e "\n${BLUE}5. Cleaning fix and patch files...${NC}"
backup_and_remove "fix-*.js" "Fix JavaScript files"
backup_and_remove "*-fix-*.js" "Fix implementation files"
backup_and_remove "*-fix.js" "Fix suffix files"

# 6. Remove check files
echo -e "\n${BLUE}6. Cleaning check files...${NC}"
backup_and_remove "check-*.js" "Check JavaScript files"
backup_and_remove "check-*.mjs" "Check ES Module files"

# 7. Remove inspection files
echo -e "\n${BLUE}7. Cleaning inspection files...${NC}"
backup_and_remove "inspect-*.js" "Inspection files"
backup_and_remove "inspect-*.mjs" "Inspection ES Module files"

# 8. Remove investigation files
echo -e "\n${BLUE}8. Cleaning investigation files...${NC}"
backup_and_remove "investigate-*.js" "Investigation files"

# 9. Remove bookmarklet files
echo -e "\n${BLUE}9. Cleaning bookmarklet files...${NC}"
backup_and_remove "*-bookmarklet.html" "Bookmarklet files"
backup_and_remove "*bookmarklets*.html" "Bookmarklet collections"

# 10. Remove step-by-step files
echo -e "\n${BLUE}10. Cleaning step-by-step files...${NC}"
backup_and_remove "step-by-step-*.js" "Step-by-step files"

# 11. Remove documentation files (keeping README.md)
echo -e "\n${BLUE}11. Cleaning documentation files...${NC}"
backup_and_remove "*-COMPLETE.md" "Completion documentation"
backup_and_remove "*-FIX*.md" "Fix documentation"
backup_and_remove "*-SOLUTION*.md" "Solution documentation"
backup_and_remove "*-ANALYSIS*.md" "Analysis documentation"
backup_and_remove "*-IMPLEMENTATION*.md" "Implementation documentation"
backup_and_remove "*-SUMMARY.md" "Summary documentation"
backup_and_remove "*-GUIDE*.md" "Guide documentation"
backup_and_remove "*-INSTRUCTIONS.md" "Instructions documentation"
backup_and_remove "*-CHECKLIST.md" "Checklist documentation"
backup_and_remove "*-SETUP*.md" "Setup documentation"
backup_and_remove "*-ISSUE*.md" "Issue documentation"
backup_and_remove "CLEANUP-PLAN.md" "Cleanup plan"

# 12. Remove SQL files (keep only if needed for production)
echo -e "\n${BLUE}12. Cleaning SQL files...${NC}"
backup_and_remove "CREATE-*.sql" "Create table SQL files"
backup_and_remove "FIX-*.sql" "Fix SQL files"
backup_and_remove "QUICK-*.sql" "Quick fix SQL files"
backup_and_remove "STEP-*.sql" "Step SQL files"
backup_and_remove "*-database.sql" "Database SQL files"

# 13. Remove misc files
echo -e "\n${BLUE}13. Cleaning miscellaneous files...${NC}"
backup_and_remove "*.log" "Log files"
backup_and_remove "*-plan.js" "Plan files"
backup_and_remove "simple-*.js" "Simple test files"
backup_and_remove "minimal-*.js" "Minimal test files"
backup_and_remove "quick-*.js" "Quick test files"
backup_and_remove "real-time-*.js" "Real-time debug files"
backup_and_remove "realtime-*.js" "Realtime debug files"
backup_and_remove "*-realtime*.js" "Realtime implementation files"
backup_and_remove "master-*.js" "Master debug files"
backup_and_remove "emergency-*.js" "Emergency debug files"
backup_and_remove "final-*.js" "Final test files"
backup_and_remove "direct-*.js" "Direct test files"
backup_and_remove "enhanced-*.html" "Enhanced test HTML files"
backup_and_remove "timing-*.html" "Timing fix HTML files"
backup_and_remove "number-box-*.html" "Number box test HTML files"
backup_and_remove "gradient-*.js" "Gradient debug files"
backup_and_remove "state-*.js" "State debug files"
backup_and_remove "specific-*.js" "Specific debug files"

# 14. Remove deployment scripts (keep main ones)
echo -e "\n${BLUE}14. Cleaning deployment scripts...${NC}"
backup_and_remove "deploy-gh-pages-backup.sh" "GitHub Pages backup deploy script"
backup_and_remove "enable-firebase.sh" "Firebase enable script"
backup_and_remove "validate-setup.sh" "Validation script"

# 15. Remove migration files
echo -e "\n${BLUE}15. Cleaning migration files...${NC}"
backup_and_remove "migrate-*.js" "Migration files"

# 16. Remove create-table instruction files
echo -e "\n${BLUE}16. Cleaning table creation files...${NC}"
backup_and_remove "create-table-instructions.html" "Table creation instructions"
backup_and_remove "create-table.js" "Table creation script"
backup_and_remove "create-real-database.sql" "Real database creation"
backup_and_remove "create-topic-clicks-browser.js" "Browser table creation"

# 17. Remove duplicate JSX files in root (they should be in src/)
echo -e "\n${BLUE}17. Cleaning misplaced JSX files...${NC}"
backup_and_remove "*.jsx" "JSX files in root"

# 18. Remove specific numbered files
echo -e "\n${BLUE}18. Cleaning numbered files...${NC}"
backup_and_remove "0" "Zero file"

# 19. Remove macOS system files
echo -e "\n${BLUE}19. Cleaning macOS system files...${NC}"
backup_and_remove "._*" "macOS metadata files"

# 20. Remove directories that are debug/test related
echo -e "\n${BLUE}20. Cleaning debug directories...${NC}"
backup_and_remove_dir "debug-files" "Debug files directory"
backup_and_remove_dir "archive" "Archive directory"

# 21. Clean up any HTML files except index.html and those in public/
echo -e "\n${BLUE}21. Final HTML cleanup (preserving index.html)...${NC}"
find . -maxdepth 1 -name "*.html" -not -name "index.html" -type f | while read -r file; do
    echo "  Moving HTML file: $file"
    mv "$file" "$BACKUP_DIR/"
done

echo -e "\n${GREEN}✅ Cleanup completed successfully!${NC}"
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  • ${GREEN}✅ index.html preserved${NC}"
echo -e "  • ${GREEN}✅ Core application files preserved${NC}"
echo -e "  • ${GREEN}✅ Debug files moved to backup${NC}"
echo -e "  • ${GREEN}✅ Test files moved to backup${NC}"
echo -e "  • ${GREEN}✅ Documentation files moved to backup${NC}"
echo -e "  • ${GREEN}✅ Unwanted files moved to backup${NC}"

echo -e "\n${YELLOW}📁 Backup location: $BACKUP_DIR${NC}"
echo -e "${YELLOW}📝 You can restore any files from the backup if needed${NC}"

# Show remaining files count
REMAINING_COUNT=$(find . -maxdepth 1 -type f | wc -l)
echo -e "\n${BLUE}📈 Files remaining in root: $REMAINING_COUNT${NC}"

echo -e "\n${GREEN}🎉 Application cleanup complete! Your index.html and core files are safe.${NC}"
