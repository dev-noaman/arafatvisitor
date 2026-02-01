# Fixing "Too Many Redirects" Error

## Diagnosis Steps

Run these commands on your VPS to identify the issue:

```bash
# 1. Check current Nginx configuration
cat /etc/nginx/sites-enabled/arafatvisitor

# 2. Check if SSL certificate exists
ls -la /etc/letsencrypt/live/

# 3. Test Nginx configuration
nginx -t

# 4. Check Nginx error logs
tail -50 /var/log/nginx/error.log

# 5. Check if certbot created SSL configuration
ls -la /etc/nginx/sites-enabled/
```

## Solution Options

### Option 1: Remove HTTPS Redirect (Quick Fix)

If SSL certificate installation failed, remove the redirect to restore HTTP access:

```bash
# SSH into your VPS
ssh your-user@your-vps-ip

# Edit the Nginx configuration
sudo nano /etc/nginx/sites-enabled/arafatvisitor

# Look for and REMOVE or COMMENT OUT these lines:
# return 301 https://$server_name$request_uri;
# or
# if ($scheme != "https") { return 301 https://$host$request_uri; }

# Save and exit (Ctrl+X, then Y, then Enter)

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Option 2: Fix SSL Certificate Installation

If you want HTTPS working, properly install the SSL certificate:

```bash
# SSH into your VPS
ssh your-user@your-vps-ip

# Check DNS propagation
nslookup your-domain.com

# Try obtaining SSL certificate manually
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# If successful, test Nginx
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Option 3: Temporary HTTP-Only Configuration

If you need to get the site working immediately, use HTTP only:

```bash
# SSH into your VPS
ssh your-user@your-vps-ip

# Create a simple HTTP-only configuration
sudo nano /etc/nginx/sites-enabled/arafatvisitor

# Replace entire content with:
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        root /var/www/arafatvisitor/frontend;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}

# Save and exit (Ctrl+X, then Y, then Enter)

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Verify the Fix

After applying any fix:

```bash
# Test HTTP access
curl -I http://your-domain.com

# Test API
curl http://your-domain.com/api

# Check Nginx is running
sudo systemctl status nginx
```

## Re-run Deployment with Fixed Workflow

Once you've restored access, the updated workflow should work correctly:

1. Go to GitHub repository
2. Navigate to Actions tab
3. Select "Deploy to VPS" workflow
4. Click "Run workflow"
5. Check the "init" checkbox
6. Click "Run workflow" button

The updated workflow will:
- Properly configure Nginx without syntax errors
- Correctly install SSL certificates
- Handle domain names with or without protocol prefix
