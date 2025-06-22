#!/bin/bash

# Fix Vite 404 issue by removing conflicting static HTML files
echo "Fixing Vite 404 issue..."

# Navigate to the project directory
cd "$(dirname "$0")"

# Rename the conflicting public/index.html file
if [ -f "public/index.html" ]; then
    mv public/index.html public/index.html.disabled
    echo "✓ Renamed public/index.html to public/index.html.disabled"
fi

# Also rename the admin index if it exists
if [ -f "public/admin/index.html" ]; then
    mv public/admin/index.html public/admin/index.html.disabled
    echo "✓ Renamed public/admin/index.html to public/admin/index.html.disabled"
fi

echo ""
echo "Fix complete! Now restart your dev server with: npm run dev"
echo ""
echo "You should now be able to access:"
echo "- Main site: http://localhost:8080/"
echo "- Admin panel: http://localhost:8080/admin.html"