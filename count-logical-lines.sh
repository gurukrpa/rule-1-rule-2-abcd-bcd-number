#!/bin/bash

# Script to count logical lines of code in the application
# Excludes: comments, blank lines, import/export only lines, and simple braces

echo "🔍 Analyzing logical lines of code in the application..."
echo ""

TOTAL_LOGICAL_LINES=0
TOTAL_FILES=0
TOTAL_PHYSICAL_LINES=0

# Function to count logical lines in a file
count_logical_lines() {
    local file="$1"
    local physical_lines=$(wc -l < "$file")
    
    # Count logical lines by excluding:
    # - Empty lines
    # - Lines with only whitespace
    # - Lines that are only comments (// or /* */)
    # - Lines with only braces { or }
    # - Pure import/export lines (but count complex ones)
    local logical_lines=$(grep -v -E '^\s*$|^\s*//|^\s*/\*|^\s*\*/|^\s*\*|^\s*[{}]\s*$' "$file" | \
                         grep -v -E '^\s*import\s+[^{]*from|^\s*export\s+default|^\s*export\s*\{[^}]*\}' | \
                         wc -l)
    
    echo "  $file: $logical_lines logical lines ($physical_lines total)"
    
    TOTAL_LOGICAL_LINES=$((TOTAL_LOGICAL_LINES + logical_lines))
    TOTAL_PHYSICAL_LINES=$((TOTAL_PHYSICAL_LINES + physical_lines))
    TOTAL_FILES=$((TOTAL_FILES + 1))
}

echo "📂 Main Application Files:"
if [ -f "src/App.jsx" ]; then count_logical_lines "src/App.jsx"; fi
if [ -f "src/main.jsx" ]; then count_logical_lines "src/main.jsx"; fi
if [ -f "src/supabaseClient.js" ]; then count_logical_lines "src/supabaseClient.js"; fi

echo ""
echo "📂 Components:"
find src/components/ -name "*.js" -o -name "*.jsx" | grep -v "^\._" | grep -v "/\._" | sort | while read file; do
    count_logical_lines "$file"
done

echo ""
echo "📂 Services:"
find src/services/ -name "*.js" -o -name "*.jsx" | grep -v "^\._" | grep -v "/\._" | sort | while read file; do
    count_logical_lines "$file"
done

echo ""
echo "📂 Pages:"
find src/pages/ -name "*.js" -o -name "*.jsx" | grep -v "^\._" | grep -v "/\._" | sort | while read file; do
    count_logical_lines "$file"
done

echo ""
echo "📂 Utilities & Helpers:"
find src/utils/ src/helpers/ src/hooks/ -name "*.js" -o -name "*.jsx" 2>/dev/null | grep -v "^\._" | grep -v "/\._" | sort | while read file; do
    count_logical_lines "$file"
done

echo ""
echo "📂 Other Files:"
find src/ -maxdepth 1 -name "*.js" -o -name "*.jsx" | grep -v "^\._" | grep -v "/\._" | grep -v "App.jsx" | grep -v "main.jsx" | sort | while read file; do
    count_logical_lines "$file"
done

echo ""
echo "==============================================="
echo "📊 SUMMARY:"
echo "Total Files Analyzed: $TOTAL_FILES"
echo "Total Physical Lines: $TOTAL_PHYSICAL_LINES"
echo "Total Logical Lines: $TOTAL_LOGICAL_LINES"
echo "==============================================="
