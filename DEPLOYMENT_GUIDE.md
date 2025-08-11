# 🚀 PixVid Pro - Windows RDP Deployment Guide

## Overview
This guide will help you deploy PixVid Pro on your Windows RDP server and connect it to your Hostinger domain for Razorpay evaluation.

## Prerequisites
- Windows RDP server with admin access
- Hostinger domain purchased
- Node.js 18+ installed on RDP server
- MongoDB Atlas account (already configured)

## 📋 Step-by-Step Deployment

### 1. 🛠️ Prepare Windows RDP Server

#### Install Required Software
```powershell
# Download and install Node.js (if not already installed)
# Visit: https://nodejs.org/en/download/
# Choose "Windows Installer (.msi)" for x64

# Install PM2 globally for process management
npm install -g pm2
npm install -g pm2-windows-startup

# Install IIS (Internet Information Services)
# Open PowerShell as Administrator and run:
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpLogging, IIS-RequestFiltering, IIS-StaticContent, IIS-DefaultDocument
```

#### Install IISNode for Node.js integration
```powershell
# Download from: https://github.com/Azure/iisnode/releases
# Install iisnode-full-v0.2.21-x64.msi
```

### 2. 📁 Upload Project to RDP Server

#### Option A: Using Git (Recommended)
```bash
# Clone your repository
git clone <your-repo-url>
cd PixVid-Pro

# Install dependencies
npm install

# Install production dependencies
npm install --production
```

#### Option B: Manual Upload
- Copy your entire project folder to RDP server
- Place in: `C:\inetpub\wwwroot\pixvid-pro\`

### 3. 🔧 Configure Production Environment

#### Create production .env file
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pixvidpro?retryWrites=true&w=majority
DB_NAME=pixvidpro

# Server
NODE_ENV=production
PORT=80
BASE_URL=https://yourdomain.com

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-for-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Session
SESSION_SECRET=your-session-secret

# Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=your-email@gmail.com

# Admin
ADMIN_EMAIL=your-admin@gmail.com

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Contact
CONTACT_EMAIL=contact@yourdomain.com
```

### 4. 🌐 Configure IIS

#### Create web.config for IIS
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="DynamicContent">
          <match url="/*" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <httpErrors existingResponse="PassThrough" />
    <iisnode node_env="production" />
  </system.webServer>
</configuration>
```

### 5. 🔒 Configure Windows Firewall

```powershell
# Open PowerShell as Administrator

# Allow HTTP (port 80)
New-NetFirewallRule -DisplayName "HTTP Inbound" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Allow HTTPS (port 443)
New-NetFirewallRule -DisplayName "HTTPS Inbound" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# Allow Node.js
New-NetFirewallRule -DisplayName "Node.js" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

### 6. 🎯 Configure Hostinger Domain

#### DNS Settings in Hostinger
1. Login to Hostinger control panel
2. Go to DNS Zone
3. Add/Update these records:

```
Type: A
Name: @
Value: YOUR_RDP_SERVER_IP
TTL: 3600

Type: A  
Name: www
Value: YOUR_RDP_SERVER_IP
TTL: 3600

Type: CNAME
Name: api
Value: yourdomain.com
TTL: 3600
```

### 7. 🔐 SSL Certificate Setup

#### Option A: Let's Encrypt (Free)
```powershell
# Install Certbot for Windows
# Download from: https://certbot.eff.org/instructions?ws=iis&os=windows

# Run certbot
certbot --iis -d yourdomain.com -d www.yourdomain.com
```

#### Option B: Hostinger SSL
- Purchase SSL from Hostinger
- Follow their installation guide for IIS

### 8. 🚀 Deploy and Start Application

#### Using PM2 (Recommended)
```bash
# Install PM2 startup
pm2-startup install

# Start application
pm2 start server.js --name "pixvid-pro" --env production

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs pixvid-pro
```

#### Alternative: Using IIS directly
- Copy project to `C:\inetpub\wwwroot\pixvid-pro\`
- Open IIS Manager
- Create new site pointing to your project folder
- Set port to 80 (HTTP) and 443 (HTTPS)

### 9. ✅ Verification Steps

#### Test Local Access
```bash
# Test on RDP server
curl http://localhost/api/health
curl https://yourdomain.com/api/health
```

#### Test External Access
- Visit: `https://yourdomain.com`
- Test registration/login
- Test payment flow
- Check all legal pages

### 10. 🔧 Troubleshooting

#### Common Issues

**Port conflicts:**
```powershell
# Check what's using port 80
netstat -ano | findstr :80
# Kill process if needed
taskkill /PID <process_id> /F
```

**IIS Node errors:**
- Check `C:\inetpub\logs\LogFiles\` for error logs
- Verify Node.js path in IIS
- Check web.config syntax

**MongoDB connection:**
- Verify MongoDB Atlas IP whitelist includes RDP server IP
- Test connection string separately

## 🎯 Production Checklist

### Before Going Live:
- [ ] All environment variables set correctly
- [ ] MongoDB connection working
- [ ] SSL certificate installed and working
- [ ] Domain DNS pointing to server
- [ ] Firewall configured
- [ ] PM2 or IIS service running
- [ ] Google OAuth callback URLs updated
- [ ] Razorpay webhook URLs updated
- [ ] All legal pages accessible
- [ ] Payment flow tested

### Security Considerations:
- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable Windows firewall
- [ ] Regular security updates
- [ ] Monitor logs regularly
- [ ] Backup database regularly

## 📞 Support

If you encounter issues:
1. Check server logs: `pm2 logs pixvid-pro`
2. Check IIS logs: `C:\inetpub\logs\LogFiles\`
3. Verify DNS propagation: https://dnschecker.org/
4. Test SSL: https://www.ssllabs.com/ssltest/

---

**Note:** After deployment, update Google OAuth and Razorpay settings with your new domain URLs.
