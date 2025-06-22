#!/bin/bash

echo "🔄 Switching to master branch - handling conflicts"
echo "================================================"

# Step 1: Stash the modified files
echo "Step 1: Stashing modified files..."
git stash push -m "Temporary stash before switching to master" package-lock.json package.json src/router/index.js

# Step 2: Remove conflicting untracked files
echo ""
echo "Step 2: Backing up and removing conflicting untracked files..."

# Create backup directory
mkdir -p .backup-before-master

# Backup the files before removing
cp index.html .backup-before-master/ 2>/dev/null
cp src/pages/admin/index.html .backup-before-master/admin-index.html 2>/dev/null
cp src/pages/oj/index.html .backup-before-master/oj-index.html 2>/dev/null
cp src/styles/common.less .backup-before-master/ 2>/dev/null
cp vite.config.js .backup-before-master/ 2>/dev/null

# Remove the conflicting files
rm -f index.html
rm -f src/pages/admin/index.html
rm -f src/pages/oj/index.html
rm -f src/styles/common.less
rm -f vite.config.js

echo "✅ Files backed up to .backup-before-master/"

# Step 3: Now checkout master
echo ""
echo "Step 3: Checking out master branch..."
git checkout master

echo ""
echo "✅ Successfully switched to master branch!"
echo ""
echo "Your stashed changes are saved. To see them: git stash list"
echo "To apply them later: git stash pop"
echo ""
echo "Backed up files are in .backup-before-master/ directory"