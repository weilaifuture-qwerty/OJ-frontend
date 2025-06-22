#!/bin/bash

echo "🔄 Merging master branch into main branch"
echo "========================================"

# Navigate to the project directory
cd "$(dirname "$0")"

# Step 1: Ensure we're on the latest master
echo "Step 1: Checking out master branch..."
git checkout master
echo "✅ On master branch"

# Step 2: Push master to origin (if not already pushed)
echo ""
echo "Step 2: Ensuring master is pushed to origin..."
git push -u origin master
echo "✅ Master branch is up to date on origin"

# Step 3: Fetch all branches
echo ""
echo "Step 3: Fetching all branches from origin..."
git fetch origin

# Step 4: Check if main branch exists locally
echo ""
echo "Step 4: Checking for main branch..."
if git show-ref --verify --quiet refs/heads/main; then
    echo "Main branch exists locally"
    git checkout main
    git pull origin main
else
    echo "Main branch doesn't exist locally, creating it..."
    # Check if main exists on remote
    if git ls-remote --heads origin main | grep -q main; then
        echo "Main branch exists on remote, checking it out..."
        git checkout -b main origin/main
    else
        echo "Main branch doesn't exist on remote either, creating new main branch..."
        git checkout -b main
    fi
fi

# Step 5: Merge master into main
echo ""
echo "Step 5: Merging master into main..."
git merge master -m "Merge master branch into main

Includes all Vue 3 migration updates and new features:
- User status/mood system
- Daily check-in feature  
- Homework management
- Homepage redesign
- Bug fixes and improvements"

# Step 6: Push main to origin
echo ""
echo "Step 6: Pushing main branch to origin..."
git push -u origin main

# Step 7: Optionally set main as default branch
echo ""
echo "✅ Successfully merged master into main!"
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/weilaifuture-qwerty/OJ-frontend/settings/branches"
echo "2. Change the default branch from 'master' to 'main' if desired"
echo ""
echo "Current branch status:"
git branch -vv