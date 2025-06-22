#!/bin/bash

echo "🔄 Changing Git remote repository..."

# Navigate to the project directory
cd "$(dirname "$0")"

# Show current remote
echo "Current remote repository:"
git remote -v

# Remove the old remote
echo ""
echo "📤 Removing old remote..."
git remote remove origin

# Add your new remote
echo "📥 Adding new remote: https://github.com/weilaifuture-qwerty/OJ-frontend"
git remote add origin https://github.com/weilaifuture-qwerty/OJ-frontend

# Verify the change
echo ""
echo "✅ New remote configuration:"
git remote -v

echo ""
echo "📋 Current git status:"
git status --short

echo ""
echo "Now you can:"
echo "1. Stage your changes: git add ."
echo "2. Commit your changes: git commit -m \"Your commit message\""
echo "3. Push to your repository: git push -u origin master"
echo ""
echo "Or run the following commands:"
echo "  git add ."
echo "  git commit -m \"Update frontend with status system, daily check-in, homework features\""
echo "  git push -u origin master"