#!/bin/bash

echo "🚀 Creating Pull Request from master to main"
echo "==========================================="

# Step 1: Ensure we're on master and it's up to date
echo "Step 1: Checking current branch and status..."
git status --short

# Step 2: Stage and commit all current changes
echo ""
echo "Step 2: Committing all current changes on master..."
git add -A
git commit -m "Complete frontend overhaul with Vue 3 migration

Major updates include:
- Migrated from Vue 2 to Vue 3 with Composition API
- Switched from Webpack to Vite for faster builds
- Implemented user status/mood system with emoji display
- Added daily check-in feature with streak tracking
- Created homework management system
- Redesigned homepage for better UX
- Fixed Element Plus component compatibility
- Updated all dependencies to latest versions
- Fixed routing and build configuration
- Resolved CSRF and API integration issues

This represents a complete modernization of the frontend stack.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Step 3: Push master to origin
echo ""
echo "Step 3: Pushing master branch to origin..."
git push -u origin master

# Step 4: Check if main branch exists on remote
echo ""
echo "Step 4: Fetching remote branches..."
git fetch origin

# Step 5: Create/update main branch
echo ""
echo "Step 5: Setting up main branch..."
if git show-ref --verify --quiet refs/remotes/origin/main; then
    echo "Main branch exists on remote"
    # Check if local main exists
    if git show-ref --verify --quiet refs/heads/main; then
        git checkout main
        git pull origin main
    else
        git checkout -b main origin/main
    fi
else
    echo "Main branch doesn't exist on remote, creating it..."
    # Create main from the initial commit or an empty state
    git checkout -b main
    # Push to create it on remote
    git push -u origin main
fi

# Step 6: Switch back to master
echo ""
echo "Step 6: Switching back to master..."
git checkout master

# Step 7: Create the pull request using GitHub CLI
echo ""
echo "Step 7: Creating pull request..."
echo ""

# Check if gh CLI is installed
if command -v gh &> /dev/null; then
    echo "Creating PR using GitHub CLI..."
    gh pr create \
        --base main \
        --head master \
        --title "Merge master: Complete Vue 3 migration and feature updates" \
        --body "## Summary

This PR merges all the recent frontend updates from master into main, including:

### 🚀 Major Changes

- **Vue 3 Migration**: Complete migration from Vue 2 to Vue 3 with Composition API
- **Build System**: Switched from Webpack to Vite for improved dev experience
- **New Features**:
  - User status/mood system with emoji display
  - Daily check-in with streak tracking
  - Homework management system for students
  - Redesigned homepage layout

### 🐛 Bug Fixes

- Fixed Element Plus component compatibility issues
- Resolved routing and 404 errors
- Fixed CSRF token handling
- Corrected API integration issues
- Fixed console errors and warnings

### 📦 Dependencies

- Updated all npm packages to latest versions
- Migrated from Vue CLI to Vite
- Updated UI libraries (Element Plus, View UI Plus)

### 🏗️ Technical Improvements

- Better TypeScript support preparation
- Improved build performance
- Modern JavaScript features
- Better code organization

This represents a complete modernization of the frontend codebase.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

    echo ""
    echo "✅ Pull request created successfully!"
    echo "Visit the PR at the URL shown above"
else
    echo "GitHub CLI (gh) is not installed."
    echo ""
    echo "To create the PR manually:"
    echo "1. Go to https://github.com/weilaifuture-qwerty/OJ-frontend"
    echo "2. Click 'Pull requests' tab"
    echo "3. Click 'New pull request'"
    echo "4. Set base: main, compare: master"
    echo "5. Click 'Create pull request'"
    echo ""
    echo "Or install GitHub CLI:"
    echo "brew install gh"
    echo "gh auth login"
    echo "Then run this script again"
fi

echo ""
echo "Current branch status:"
git branch -vv