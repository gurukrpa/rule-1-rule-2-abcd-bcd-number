# 🚀 Git Workflow Quick Reference

## 🎯 **Before Starting Any New Logic**

```bash
# Option 1: Using helper script (recommended)
./git-helpers.sh new-logic step-7-new-feature

# Option 2: Manual commands
git add .
git commit -m "💾 Save before new logic"
git checkout -b step-7-new-feature
```

## 💾 **Save Progress While Working**

```bash
# Save your current work
./git-helpers.sh save-progress "Implemented new validation logic"

# Or manually
git add .
git commit -m "Step 7: Added input validation"
```

## ✅ **If Your Logic Works - Merge It**

```bash
# Merge successfully tested logic
./git-helpers.sh safe-merge step-7-new-feature

# Or manually
git checkout main
git merge step-7-new-feature
git branch -d step-7-new-feature  # Delete the branch
```

## ❌ **If Your Logic Breaks - Discard It**

```bash
# Discard failed experiment
./git-helpers.sh discard-experiment step-7-new-feature

# Or manually
git checkout main
git branch -D step-7-new-feature  # Force delete
```

## 📊 **Check Status Anytime**

```bash
# See current status
./git-helpers.sh status

# Or manually
git branch              # List branches
git log --oneline -5    # Recent commits
```

## 🛡️ **Emergency Backup**

```bash
# Create timestamped backup
./git-helpers.sh backup
```

## 🔄 **Go Back to Previous Version**

```bash
# See all commits
git log --oneline

# Go back to specific commit
git checkout <commit-hash>

# Create new branch from that point
git checkout -b fix-from-working-version
```

## 💡 **Naming Convention for Branches**

- `step-N-description` - For sequential development steps
- `fix-bug-name` - For bug fixes
- `test-new-feature` - For experimental features
- `backup-YYYYMMDD` - For backup branches

## 🎯 **Common Workflow Example**

```bash
# 1. Start new logic safely
./git-helpers.sh new-logic step-8-enhanced-ui

# 2. Write code, test it

# 3. Save progress
./git-helpers.sh save-progress "Enhanced UI with better styling"

# 4a. If it works - merge it
./git-helpers.sh safe-merge step-8-enhanced-ui

# 4b. If it breaks - discard it
./git-helpers.sh discard-experiment step-8-enhanced-ui
```

## 🚨 **Emergency Commands**

```bash
# Undo last commit (but keep changes)
git reset --soft HEAD~1

# Go back to main branch immediately
git checkout main

# See what changed in last commit
git show HEAD
```

---
*Remember: With Git, you can experiment fearlessly! Nothing is ever truly lost.* 🛡️
