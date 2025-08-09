#!/bin/bash

# OnlineJudge Frontend Deployment Script
# This script builds and deploys the frontend application

set -e

echo "========================================="
echo "OnlineJudge Frontend Deployment"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js installed"
else
    print_success "Node.js is installed ($(node -v))"
fi

# Check if Yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "Installing Yarn..."
    npm install -g yarn
    print_success "Yarn installed"
else
    print_success "Yarn is installed ($(yarn -v))"
fi

# Install dependencies
echo "Installing dependencies..."
yarn install --frozen-lockfile
print_success "Dependencies installed"

# Build the application
echo "Building the application..."
yarn build
print_success "Application built"

# Option 1: Docker deployment
if command -v docker &> /dev/null; then
    echo ""
    echo "Docker deployment option:"
    echo "Building Docker image..."
    docker build -t oj-frontend .
    print_success "Docker image built"
    
    echo "Starting container..."
    docker-compose up -d
    print_success "Container started"
fi

# Option 2: Static file deployment (nginx)
if [ -d "dist" ]; then
    echo ""
    echo "Static file deployment option:"
    echo "The built files are in the 'dist' directory"
    echo "You can serve them with nginx by:"
    echo "  1. Copy dist/* to /var/www/html/oj-frontend/"
    echo "  2. Configure nginx to serve from that directory"
    
    # If nginx is installed locally
    if command -v nginx &> /dev/null; then
        print_warning "Deploy to nginx? (y/n)"
        read -r response
        if [[ "$response" == "y" ]]; then
            sudo mkdir -p /var/www/html/oj-frontend
            sudo cp -r dist/* /var/www/html/oj-frontend/
            print_success "Files copied to nginx directory"
            
            # Create nginx configuration
            sudo tee /etc/nginx/sites-available/oj-frontend > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/html/oj-frontend;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend-server:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF
            sudo ln -sf /etc/nginx/sites-available/oj-frontend /etc/nginx/sites-enabled/
            sudo nginx -t && sudo systemctl reload nginx
            print_success "Nginx configured and reloaded"
        fi
    fi
fi

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Update API_URL in .env.production"
echo "  2. Configure your domain DNS"
echo "  3. Set up SSL certificate"
echo ""
print_warning "Remember to update the backend API URL in your configuration!"