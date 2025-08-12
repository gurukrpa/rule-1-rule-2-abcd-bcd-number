#!/usr/bin/env bash
set -euo pipefail

# 1) Files that look like test/debug/junk (keep any index.html)
find . -type f \
  \( -iname "*test*" -o -iname "*spec*" -o -iname "*.bak" -o -iname "*.tmp" -o -iname "*.log" -o -iname "*.orig" -o -iname "*.rej" -o -iname "*.swp" -o -iname ".ds_store" \) \
  ! -iname "index.html" \
  -not -path "./node_modules/*" -not -path "./.git/*" \
  > unwanted_files.txt

# 2) Common junk folders
: > unwanted_dirs.txt
for d in "__tests__" "__mocks__" "__snapshots__" "coverage" ".nyc_output" ".eslintcache"; do
  find . -type d -name "$d" -not -path "./node_modules/*" -not -path "./.git/*" >> unwanted_dirs.txt
done
# cypress subfolders
find . \( -type d -path "*/cypress/videos" -o -type d -path "*/cypress/screenshots" \) \
  -not -path "./node_modules/*" -not -path "./.git/*" >> unwanted_dirs.txt

echo "----- FILE CANDIDATES -----"
cat unwanted_files.txt || true
echo "----- DIR CANDIDATES -----"
cat unwanted_dirs.txt || true
