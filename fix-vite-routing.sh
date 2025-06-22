#!/bin/bash

# Backup and rename conflicting files in public directory
echo "Fixing Vite routing by renaming conflicting public files..."

# Rename public/index.html to avoid conflict
if [ -f "public/index.html" ]; then
    mv public/index.html public/dev-portal.html
    echo "✓ Renamed public/index.html to public/dev-portal.html"
fi

# Rename public/admin/index.html
if [ -f "public/admin/index.html" ]; then
    mv public/admin/index.html public/admin/redirect.html.bak
    echo "✓ Renamed public/admin/index.html to public/admin/redirect.html.bak"
fi

echo ""
echo "Files renamed successfully!"
echo ""
echo "After restarting the dev server, you should be able to access:"
echo "  - Main site: http://localhost:8080/"
echo "  - Admin panel: http://localhost:8080/admin.html"
echo ""
echo "The development portal is now available at: http://localhost:8080/dev-portal.html"