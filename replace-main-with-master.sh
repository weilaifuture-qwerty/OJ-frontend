#!/bin/bash

echo "🔄 Replacing main branch with master branch content"
echo "=================================================="
echo ""
echo "⚠️  WARNING: This will completely replace main with master's content!"
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Step 1: Ensure we're on master and it's clean
echo "Step 1: Checking current status..."
git status --short

# Step 2: Fetch latest from remote
echo ""
echo "Step 2: Fetching latest from remote..."
git fetch origin

# Step 3: Create a backup of main (just in case)
echo ""
echo "Step 3: Creating backup of current main branch..."
git checkout main 2>/dev/null || git checkout -b main
git branch -m main main-backup-$(date +%Y%m%d-%H%M%S)

# Step 4: Create new main from master
echo ""
echo "Step 4: Creating new main branch from master..."
git checkout master
git checkout -b main

# Step 5: Force push to replace remote main
echo ""
echo "Step 5: Force pushing to replace remote main..."
echo "This will replace the entire main branch on GitHub with master's content."
echo ""
echo "Press Enter to confirm force push or Ctrl+C to cancel..."
read

git push --force-with-lease origin main

echo ""
echo "✅ Successfully replaced main with master's content!"
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/weilaifuture-qwerty/OJ-frontend/settings/branches"
echo "2. Change the default branch from 'master' to 'main'"
echo "3. Optionally delete the master branch once main is set as default"
echo ""
echo "Current branches:"
git branch -a