# OnlineJudge Frontend Deployment Guide

This guide provides instructions for deploying the OnlineJudge frontend application.

## Prerequisites

- Node.js 16+ and Yarn/npm
- Nginx or Docker (optional)
- Access to your server via SSH

## Deployment Options

### Option 1: Docker Deployment (Recommended)

1. **Build and run with Docker Compose:**
```bash
# Clone the repository
git clone https://github.com/your-repo/OnlineJudgeFE.git
cd OnlineJudgeFE

# Build and start the container
docker-compose up -d --build
```

2. **Access the application:**
- The frontend will be available at `http://your-server-ip:3000`

### Option 2: Static File Deployment with Nginx

1. **Build the application locally:**
```bash
# Install dependencies
yarn install

# Build for production
yarn build
```

2. **Upload to server:**
```bash
# Transfer built files to server
scp -r dist/* user@your-server:/var/www/html/oj-frontend/
```

3. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/html/oj-frontend;
    index index.html;
    
    # Vue Router support
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://backend-server:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://backend-server:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Static asset caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. **Reload Nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Option 3: Alibaba Cloud OSS + CDN Deployment

1. **Build the application:**
```bash
yarn build
```

2. **Upload to OSS:**
```bash
# Install ossutil
wget http://gosspublic.alicdn.com/ossutil/1.7.14/ossutil64
chmod 755 ossutil64

# Configure ossutil
./ossutil64 config

# Upload files
./ossutil64 cp -r dist/ oss://your-bucket-name/oj-frontend/ --update
```

3. **Configure CDN:**
- Set up CDN domain in Alibaba Cloud Console
- Point CDN origin to your OSS bucket
- Configure cache rules for static assets

## Configuration

### Environment Variables

Create `.env.production` file:
```env
# API endpoint
VITE_API_BASE_URL=https://api.your-domain.com

# Public path (CDN URL if using CDN)
VITE_PUBLIC_PATH=/

# App title
VITE_APP_TITLE=Online Judge
```

### Build Configuration

The `vite.config.js` is already configured for production builds with:
- Code splitting
- Asset optimization
- Gzip compression
- Tree shaking

## SSL Certificate Setup

### Using Let's Encrypt
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Using Alibaba Cloud SSL
1. Apply for free SSL certificate in Alibaba Cloud Console
2. Download certificate files
3. Configure in Nginx:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    # ... rest of configuration
}
```

## Performance Optimization

### 1. Enable Gzip Compression
Already configured in `nginx.conf`

### 2. Use CDN
- Configure Alibaba Cloud CDN
- Update `VITE_PUBLIC_PATH` to CDN URL

### 3. Enable HTTP/2
Add `http2` to listen directive in Nginx

### 4. Browser Caching
Configure cache headers for static assets (already in nginx.conf)

## Monitoring

### Check Application Status
```bash
# Docker
docker ps
docker logs oj_frontend

# Nginx
sudo systemctl status nginx
tail -f /var/log/nginx/error.log
```

### Performance Monitoring
- Use Alibaba Cloud monitoring
- Set up Google Analytics or similar
- Monitor Core Web Vitals

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
yarn install
yarn build
```

### Nginx 404 Errors
Ensure Vue Router history mode is properly configured in nginx.conf

### API Connection Issues
- Check CORS settings in backend
- Verify API_URL in environment variables
- Check network security groups

### Docker Issues
```bash
# Rebuild image
docker-compose build --no-cache

# View logs
docker-compose logs -f

# Restart container
docker-compose restart
```

## Rollback Strategy

1. **Keep previous builds:**
```bash
# Before deploying new version
mv /var/www/html/oj-frontend /var/www/html/oj-frontend-backup
```

2. **Quick rollback:**
```bash
# Restore previous version
mv /var/www/html/oj-frontend-backup /var/www/html/oj-frontend
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: yarn install
      - run: yarn build
      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          source: "dist/*"
          target: "/var/www/html/oj-frontend"
```

## Security Recommendations

1. **Use HTTPS everywhere**
2. **Set security headers:**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

3. **Regular updates:**
```bash
# Check for vulnerabilities
yarn audit

# Update dependencies
yarn upgrade
```

## Support

For issues or questions:
1. Check the browser console for errors
2. Review nginx error logs
3. Verify API connectivity
4. Check build logs