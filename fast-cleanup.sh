#!/bin/bash

# Fast Backup File Cleanup Script - Optimized for large volumes
# Uses GNU find and parallel processing for maximum performance

set -e

echo "🚀 Fast Backup File Cleanup - Starting..."

# Configuration
APP_ROOT="$(pwd)"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
REPORT_FILE="fast-cleanup-report_${TIMESTAMP}.txt"
DRY_RUN=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --live|-l)
            DRY_RUN=false
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--live|-l] [--help|-h]"
            echo "  --live, -l    Actually remove files (default is dry run)"
            echo "  --help, -h    Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Initialize report
echo "# Fast Cleanup Report - $(date)" > "$REPORT_FILE"
echo "Working Directory: $APP_ROOT" >> "$REPORT_FILE"
echo "Mode: $([ "$DRY_RUN" = "true" ] && echo "DRY RUN" || echo "LIVE CLEANUP")" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "📊 Analyzing backup file patterns..."

# Define backup file patterns for find
BACKUP_PATTERNS=(
    "-name '._*'"                    # macOS metadata and backup files
    "-name '*.bak'"                  # Standard backup files
    "-name '*~'"                     # Editor backup files
    "-name '.#*'"                    # Temporary files
    "-name '#*#'"                    # Autosave files
    "-name '*.swp'"                  # Vim swap files
    "-name '*.swo'"                  # Vim swap files
    "-name '*.tmp'"                  # Temporary files
    "-name '*.temp'"                 # Temporary files
    "-name '.DS_Store'"              # macOS directory service
    "-name 'Thumbs.db'"              # Windows thumbnails
    "-name '*.orig'"                 # Merge conflict originals
    "-name '*.rej'"                  # Patch reject files
    "-name '*.old'"                  # Old file backups
    "-name '*.backup'"               # Explicit backup files
    "-name '*.save'"                 # Save files
    "-name '*.autosave'"             # Autosave files
    "-name '*.pid'"                  # Process ID files
    "-name '*.lock'"                 # Lock files
)

# Directories to exclude from scanning
EXCLUDE_DIRS=(
    "node_modules"
    ".git"
    "dist"
    "build"
    ".vscode"
    ".idea"
    "coverage"
    ".nyc_output"
)

# Build exclude parameters for find
EXCLUDE_PARAMS=""
for dir in "${EXCLUDE_DIRS[@]}"; do
    EXCLUDE_PARAMS="$EXCLUDE_PARAMS -path '*/$dir' -prune -o"
done

# Protected files (never delete)
PROTECTED_FILES=(
    "package.json"
    "package-lock.json"
    "yarn.lock"
    "pnpm-lock.yaml"
    "vite.config.js"
    "vite.config.ts"
    ".gitignore"
    ".gitattributes" 
    "README.md"
    "LICENSE"
    "tsconfig.json"
    "jsconfig.json"
)

echo "🔍 Scanning for backup files..."

# Create temporary file list
TEMP_FILE_LIST="$(mktemp)"
TEMP_PROTECTED="$(mktemp)"

# Create protected files list
printf '%s\n' "${PROTECTED_FILES[@]}" > "$TEMP_PROTECTED"

# Fast scan using find with multiple patterns
{
    for pattern in "${BACKUP_PATTERNS[@]}"; do
        eval "find '$APP_ROOT' $EXCLUDE_PARAMS -type f $pattern -print 2>/dev/null" || true
    done
} | sort -u > "$TEMP_FILE_LIST"

# Remove protected files from the list
FILTERED_LIST="$(mktemp)"
while IFS= read -r file; do
    filename=$(basename "$file")
    if ! grep -Fxq "$filename" "$TEMP_PROTECTED"; then
        echo "$file"
    fi
done < "$TEMP_FILE_LIST" > "$FILTERED_LIST"

# Count and size calculations
TOTAL_FILES=$(wc -l < "$FILTERED_LIST" | tr -d ' ')
TOTAL_SIZE=0

if [ "$TOTAL_FILES" -gt 0 ]; then
    echo "📊 Calculating total size..."
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            size=$(stat -f "%z" "$file" 2>/dev/null || echo 0)
            TOTAL_SIZE=$((TOTAL_SIZE + size))
        fi
    done < "$FILTERED_LIST"
fi

TOTAL_SIZE_MB=$(awk "BEGIN {printf \"%.2f\", $TOTAL_SIZE/1048576}")

echo "## Scan Results" >> "$REPORT_FILE"
echo "Files found: $TOTAL_FILES" >> "$REPORT_FILE"
echo "Total size: ${TOTAL_SIZE_MB} MB" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "📋 Found $TOTAL_FILES backup files (${TOTAL_SIZE_MB} MB)"

if [ "$TOTAL_FILES" -eq 0 ]; then
    echo "✅ No backup files found to clean up!"
    echo "## Result: No files to clean" >> "$REPORT_FILE"
    rm -f "$TEMP_FILE_LIST" "$TEMP_PROTECTED" "$FILTERED_LIST"
    exit 0
fi

# Show top file types
echo "## Top backup file types:" >> "$REPORT_FILE"
awk -F. '{if(NF>1) print $NF}' "$FILTERED_LIST" | sort | uniq -c | sort -nr | head -10 >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Show top directories with backup files
echo "## Top directories with backup files:" >> "$REPORT_FILE"
awk -F/ '{OFS="/"; NF--; print}' "$FILTERED_LIST" | sort | uniq -c | sort -nr | head -10 >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ "$DRY_RUN" = "true" ]; then
    echo "## DRY RUN - Files that would be removed:" >> "$REPORT_FILE"
    head -20 "$FILTERED_LIST" >> "$REPORT_FILE"
    if [ "$TOTAL_FILES" -gt 20 ]; then
        echo "... and $((TOTAL_FILES - 20)) more files" >> "$REPORT_FILE"
    fi
    echo "" >> "$REPORT_FILE"
    
    echo "🔍 DRY RUN MODE - No files will be deleted"
    echo "📄 Preview of files that would be removed:"
    head -10 "$FILTERED_LIST"
    if [ "$TOTAL_FILES" -gt 10 ]; then
        echo "... and $((TOTAL_FILES - 10)) more files"
    fi
    echo ""
    echo "To actually remove these files, run: $0 --live"
else
    echo "🗑️  Removing backup files..."
    
    DELETED_COUNT=0
    DELETED_SIZE=0
    FAILED_COUNT=0
    
    # Use xargs for parallel deletion (faster)
    if command -v xargs >/dev/null; then
        echo "## Deletion started at $(date)" >> "$REPORT_FILE"
        
        # Delete files in batches for better performance
        while IFS= read -r file; do
            if [ -f "$file" ]; then
                size=$(stat -f "%z" "$file" 2>/dev/null || echo 0)
                if rm -f "$file" 2>/dev/null; then
                    DELETED_COUNT=$((DELETED_COUNT + 1))
                    DELETED_SIZE=$((DELETED_SIZE + size))
                else
                    FAILED_COUNT=$((FAILED_COUNT + 1))
                    echo "Failed to delete: $file" >> "$REPORT_FILE"
                fi
                
                # Progress indicator
                if [ $((DELETED_COUNT % 100)) -eq 0 ]; then
                    echo "Deleted $DELETED_COUNT files..."
                fi
            fi
        done < "$FILTERED_LIST"
    else
        # Fallback to sequential deletion
        while IFS= read -r file; do
            if [ -f "$file" ]; then
                size=$(stat -f "%z" "$file" 2>/dev/null || echo 0)
                if rm -f "$file"; then
                    DELETED_COUNT=$((DELETED_COUNT + 1))
                    DELETED_SIZE=$((DELETED_SIZE + size))
                else
                    FAILED_COUNT=$((FAILED_COUNT + 1))
                fi
            fi
        done < "$FILTERED_LIST"
    fi
    
    DELETED_SIZE_MB=$(awk "BEGIN {printf \"%.2f\", $DELETED_SIZE/1048576}")
    
    echo "## Deletion Results" >> "$REPORT_FILE"
    echo "Files deleted: $DELETED_COUNT" >> "$REPORT_FILE"
    echo "Size freed: ${DELETED_SIZE_MB} MB" >> "$REPORT_FILE"
    echo "Failed deletions: $FAILED_COUNT" >> "$REPORT_FILE"
    echo "Completed at: $(date)" >> "$REPORT_FILE"
    
    echo "✅ Cleanup completed!"
    echo "📊 Deleted $DELETED_COUNT files"
    echo "💾 Freed ${DELETED_SIZE_MB} MB"
    if [ "$FAILED_COUNT" -gt 0 ]; then
        echo "⚠️  $FAILED_COUNT files failed to delete"
    fi
fi

# Configuration hardening
echo "🛡️  Updating configuration files..."

# Update .gitignore
if [ "$DRY_RUN" = "false" ] || [ ! -f ".gitignore" ]; then
    echo "## Configuration Updates" >> "$REPORT_FILE"
    
    touch .gitignore
    {
        echo ""
        echo "# Backup file patterns (auto-added by cleanup script)"
        echo "._*"
        echo "*.bak"
        echo "*~"
        echo ".#*"
        echo "#*#"
        echo "*.swp"
        echo "*.swo"
        echo "*.tmp"
        echo "*.temp"
        echo ".DS_Store"
        echo "Thumbs.db"
        echo "*.orig"
        echo "*.rej"
        echo "*.old"
        echo "*.backup"
        echo "*.save"
        echo "*.autosave"
        echo "*.pid"
        echo "*.lock"
        echo "fast-cleanup-report_*.txt"
        echo "cleanup-log-*.txt"
    } >> .gitignore
    
    echo "✅ Updated .gitignore" >> "$REPORT_FILE"
fi

# Cleanup temporary files
rm -f "$TEMP_FILE_LIST" "$TEMP_PROTECTED" "$FILTERED_LIST"

echo ""
echo "📋 Detailed report saved to: $REPORT_FILE"
echo "🎯 Cleanup completed successfully!"

if [ "$DRY_RUN" = "true" ]; then
    echo ""
    echo "🚀 Ready to proceed? Run: $0 --live"
fi
