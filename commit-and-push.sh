#!/bin/bash

echo "🚀 Git Remote Change and Push Script"
echo "===================================="

# Navigate to the project directory
cd "$(dirname "$0")"

# Step 1: Change remote
echo "Step 1: Changing remote repository..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/weilaifuture-qwerty/OJ-frontend
echo "✅ Remote changed to: https://github.com/weilaifuture-qwerty/OJ-frontend"

# Step 2: Show current status
echo ""
echo "Step 2: Current status..."
echo "Modified files: $(git status --porcelain | grep -c "^ M")"
echo "Deleted files: $(git status --porcelain | grep -c "^ D")"
echo "Untracked files: $(git status --porcelain | grep -c "^??")"

# Step 3: Stage all changes
echo ""
echo "Step 3: Staging all changes..."
git add .
echo "✅ All changes staged"

# Step 4: Create commit
echo ""
echo "Step 4: Creating commit..."
git commit -m "Major frontend update: Vue 3 migration and new features

- Migrated from Vue 2 to Vue 3 with Composition API
- Updated from Webpack to Vite build system
- Implemented user status/mood system with emoji display
- Added daily check-in feature with streak tracking
- Created homework management system for students
- Redesigned homepage layout for better UX
- Fixed multiple console errors and warnings
- Updated all dependencies to latest versions
- Fixed Element Plus component compatibility issues
- Added student assignment functionality for admins

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "✅ Commit created"

# Step 5: Push to repository
echo ""
echo "Step 5: Pushing to GitHub..."
echo "This will push to: https://github.com/weilaifuture-qwerty/OJ-frontend (master branch)"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

git push -u origin master

echo ""
echo "🎉 Done! Your changes have been pushed to GitHub."
echo "View your repository at: https://github.com/weilaifuture-qwerty/OJ-frontend"