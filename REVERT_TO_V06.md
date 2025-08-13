# Git Tag v0.6 - Revert Instructions

## What is v0.6?
This tag represents a clean, working state of the application with:
- UserList page functioning with mock data
- Test components removed
- Clean navigation
- Application running on localhost:5173
- Git repository reinitialized and cleaned

## How to Revert to v0.6

### Option 1: Reset to v0.6 (destructive - loses all changes after v0.6)
```bash
cd "/Volumes/t7 sharma/vs coad/rule-1-rule-2-abcd-bcd-number-main"
git reset --hard v0.6
```

### Option 2: Create a new branch from v0.6 (safe - preserves current work)
```bash
cd "/Volumes/t7 sharma/vs coad/rule-1-rule-2-abcd-bcd-number-main"
git checkout -b revert-to-v06 v0.6
```

### Option 3: Check what changed since v0.6
```bash
cd "/Volumes/t7 sharma/vs coad/rule-1-rule-2-abcd-bcd-number-main"
git diff v0.6..HEAD
```

### Option 4: See all tags
```bash
git tag -l
```

### Option 5: Show tag details
```bash
git show v0.6
```

## Current State at v0.6
- ✅ Application working and clean
- ✅ UserList page functional
- ✅ No test components interfering
- ✅ Git repository healthy
- ✅ Ready for continued development

## Current Branch: rule-1-pages-fix
- **Purpose:** Working on Rule 1 page fixes and improvements
- **Based on:** v0.6 tag (clean working state)
- **Created:** August 13, 2025

### Switch Between Branches
```bash
# Switch back to main branch
git checkout main

# Switch to rule-1-pages-fix branch
git checkout rule-1-pages-fix

# List all branches
git branch
```

Created: August 13, 2025
Commit: a9c6b1e (v0.6)
Current Branch: rule-1-pages-fix
