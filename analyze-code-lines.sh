#!/bin/zsh

# Advanced Logical Lines Counter for React Application
# This script counts only meaningful code lines, excluding:
# - Blank lines and whitespace-only lines
# - Single and multi-line comments
# - Simple import/export statements
# - Standalone braces
# - JSX closing tags only
# - Console.log statements (debug code)

echo "🔍 Analyzing Logical Lines of Code in React Application"
echo "========================================================"

TOTAL_LOGICAL=0
TOTAL_PHYSICAL=0
TOTAL_FILES=0

# Function to count logical lines in a file
count_logical_lines() {
    local file="$1"
    local category="$2"
    
    if [[ ! -f "$file" ]]; then
        return
    fi
    
    local physical=$(wc -l < "$file")
    
    # More sophisticated logical line counting
    local logical=$(sed 's/\/\/.*$//' "$file" | \
                   sed '/\/\*/,/\*\//d' | \
                   grep -v -E '^\s*$' | \
                   grep -v -E '^\s*[{}]\s*$' | \
                   grep -v -E '^\s*import\s+.*from\s+['"'"'"][^'"'"'"]*['"'"'"];?\s*$' | \
                   grep -v -E '^\s*export\s+default\s+\w+;?\s*$' | \
                   grep -v -E '^\s*export\s*\{[^}]*\}\s*;?\s*$' | \
                   grep -v -E '^\s*</[^>]+>\s*$' | \
                   grep -v -E '^\s*console\.(log|warn|error|info)' | \
                   wc -l)
    
    echo "[$category] $file"
    echo "  Physical: $physical lines | Logical: $logical lines"
    
    TOTAL_LOGICAL=$((TOTAL_LOGICAL + logical))
    TOTAL_PHYSICAL=$((TOTAL_PHYSICAL + physical))
    TOTAL_FILES=$((TOTAL_FILES + 1))
}

echo ""
echo "📁 MAIN APPLICATION FILES"
echo "------------------------"
count_logical_lines "src/App.jsx" "MAIN"
count_logical_lines "src/main.jsx" "MAIN"
count_logical_lines "src/supabaseClient.js" "CONFIG"

echo ""
echo "📁 COMPONENTS (Top 10 largest)"
echo "------------------------------"
find src/components/ -name "*.jsx" | grep -v "/\._" | \
head -10 | while read file; do
    count_logical_lines "$file" "COMPONENT"
done

echo ""
echo "📁 SERVICES"
echo "-----------"
find src/services/ -name "*.js" | grep -v "/\._" | \
head -5 | while read file; do
    count_logical_lines "$file" "SERVICE"
done

echo ""
echo "📁 UTILITIES & HELPERS"
echo "----------------------"
find src/utils/ src/helpers/ -name "*.js" 2>/dev/null | grep -v "/\._" | \
while read file; do
    count_logical_lines "$file" "UTIL"
done

# Get comprehensive totals
echo ""
echo "🔄 Computing comprehensive statistics..."

ALL_LOGICAL=$(find src/ -name "*.js" -o -name "*.jsx" | grep -v "/\._" | \
              xargs sed 's/\/\/.*$//' | \
              sed '/\/\*/,/\*\//d' | \
              grep -v -E '^\s*$' | \
              grep -v -E '^\s*[{}]\s*$' | \
              grep -v -E '^\s*import\s+.*from\s+['"'"'"][^'"'"'"]*['"'"'"];?\s*$' | \
              grep -v -E '^\s*export\s+default\s+\w+;?\s*$' | \
              grep -v -E '^\s*export\s*\{[^}]*\}\s*;?\s*$' | \
              grep -v -E '^\s*</[^>]+>\s*$' | \
              grep -v -E '^\s*console\.(log|warn|error|info)' | \
              wc -l)

ALL_PHYSICAL=$(find src/ -name "*.js" -o -name "*.jsx" | grep -v "/\._" | xargs wc -l | tail -1 | awk '{print $1}')
FILE_COUNT=$(find src/ -name "*.js" -o -name "*.jsx" | grep -v "/\._" | wc -l)

echo ""
echo "========================================================"
echo "📊 COMPREHENSIVE CODE ANALYSIS RESULTS"
echo "========================================================"
echo "Total Source Files: $FILE_COUNT"
echo "Total Physical Lines: $ALL_PHYSICAL"
echo "Total Logical Lines: $ALL_LOGICAL"
echo ""
echo "📈 Code Density: $(echo "scale=1; $ALL_LOGICAL * 100 / $ALL_PHYSICAL" | bc)% logical content"
echo "📝 Average Lines per File: $(echo "scale=1; $ALL_LOGICAL / $FILE_COUNT" | bc) logical lines"
echo ""
echo "🗂️ BREAKDOWN BY DIRECTORY:"
echo "Components: $(find src/components/ -name "*.jsx" | grep -v "/\._" | wc -l | tr -d ' ') files"
echo "Services: $(find src/services/ -name "*.js" | grep -v "/\._" | wc -l | tr -d ' ') files"
echo "Utils/Helpers: $(find src/utils/ src/helpers/ -name "*.js" 2>/dev/null | grep -v "/\._" | wc -l | tr -d ' ') files"
echo "Other: $(find src/ -maxdepth 1 -name "*.js" -o -name "*.jsx" | grep -v "/\._" | wc -l | tr -d ' ') files"
echo "========================================================"
