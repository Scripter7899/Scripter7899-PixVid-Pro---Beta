# ⚡ Quick Deployment Commands for Windows RDP

## 🚀 Copy & Paste Commands for Fast Setup

### 1. 📦 Install Required Software (Run as Administrator)

```powershell
# Enable IIS
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpLogging, IIS-RequestFiltering, IIS-StaticContent, IIS-DefaultDocument

# Install PM2 globally
npm install -g pm2
npm install -g pm2-windows-startup
npm install -g nodemon

# Setup PM2 startup
pm2-startup install
```

### 2. 🔥 Configure Windows Firewall

```powershell
# Allow HTTP/HTTPS traffic
New-NetFirewallRule -DisplayName "HTTP Inbound" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "HTTPS Inbound" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
New-NetFirewallRule -DisplayName "Node.js" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow

# Allow custom port (if using different port)
New-NetFirewallRule -DisplayName "Custom Port 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### 3. 📁 Project Setup

```bash
# Navigate to web directory
cd C:\inetpub\wwwroot

# Clone project (if using Git)
git clone https://github.com/yourusername/pixvid-pro.git
cd pixvid-pro

# OR create directory and upload files manually
mkdir pixvid-pro
cd pixvid-pro
# Upload your project files here

# Install dependencies
npm install

# Create logs directory
mkdir logs

# Copy production environment file
copy production.env .env
# Edit .env with your actual values using notepad
notepad .env
```

### 4. 🔧 Configure Production Environment

```bash
# Generate JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate session secret  
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Test MongoDB connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ MongoDB Connected')).catch(err => console.log('❌ MongoDB Error:', err.message))"
```

### 5. 🚀 Start Application

#### Option A: Using PM2 (Recommended)
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Check status
pm2 status

# View logs
pm2 logs pixvid-pro

# Save PM2 configuration
pm2 save

# Monitor
pm2 monit
```

#### Option B: Using Node directly (for testing)
```bash
# Set environment
set NODE_ENV=production
set PORT=80

# Start application
node server.js
```

### 6. 🌐 IIS Setup (Alternative to PM2)

```powershell
# Import IIS module
Import-Module WebAdministration

# Create new website
New-Website -Name "PixVid-Pro" -Port 80 -PhysicalPath "C:\inetpub\wwwroot\pixvid-pro"

# Create HTTPS binding (after SSL certificate)
New-WebBinding -Name "PixVid-Pro" -Protocol https -Port 443

# Start website
Start-Website -Name "PixVid-Pro"
```

### 7. 🔍 Quick Testing Commands

```bash
# Test local access
curl http://localhost/api/health
curl http://localhost

# Test external access (replace with your domain)
curl http://yourdomain.com/api/health
curl https://yourdomain.com

# Check if ports are open
netstat -ano | findstr :80
netstat -ano | findstr :443

# Check running processes
tasklist | findstr node
pm2 list
```

### 8. 🔐 SSL Certificate Setup (Let's Encrypt)

```powershell
# Download Certbot for Windows from:
# https://certbot.eff.org/instructions?ws=iis&os=windows

# After installation, run:
certbot --iis -d yourdomain.com -d www.yourdomain.com

# Auto-renewal test
certbot renew --dry-run
```

### 9. 🛠️ Troubleshooting Commands

```bash
# Check PM2 logs
pm2 logs pixvid-pro --lines 50

# Restart PM2 application
pm2 restart pixvid-pro

# Stop PM2 application
pm2 stop pixvid-pro

# Delete PM2 application
pm2 delete pixvid-pro

# Kill process on port 80
netstat -ano | findstr :80
taskkill /PID <process_id> /F

# Check IIS logs
dir C:\inetpub\logs\LogFiles\

# View latest IIS log
type "C:\inetpub\logs\LogFiles\W3SVC1\*.log" | more
```

### 10. 📊 Monitoring Commands

```bash
# Real-time PM2 monitoring
pm2 monit

# Check system resources
wmic cpu get loadpercentage /value
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value

# Check disk space
wmic logicaldisk get size,freespace,caption

# Monitor network connections
netstat -ano | findstr :80
netstat -ano | findstr :443
```

### 11. 🔄 Update/Restart Commands

```bash
# Pull latest code (if using Git)
git pull origin main

# Install new dependencies
npm install

# Restart application
pm2 restart pixvid-pro

# Or reload without downtime
pm2 reload pixvid-pro

# View restart logs
pm2 logs pixvid-pro --lines 100
```

### 12. 🗄️ Database Operations

```bash
# Test MongoDB connection
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✅ Connected'); process.exit(0); }).catch(err => { console.log('❌ Error:', err.message); process.exit(1); })"

# Backup database (if using local MongoDB)
mongodump --db pixvidpro --out backup/

# Check MongoDB Atlas connection from server
ping cluster0.mongodb.net
```

---

## 🎯 Quick Checklist Before Going Live

```bash
# 1. Environment check
echo $NODE_ENV

# 2. Port check
netstat -ano | findstr :80

# 3. Application status
pm2 status

# 4. Domain resolution
nslookup yourdomain.com

# 5. SSL certificate
certbot certificates

# 6. Firewall status
netsh advfirewall show allprofiles

# 7. Test all endpoints
curl https://yourdomain.com/api/health
curl https://yourdomain.com/about.html
curl https://yourdomain.com/api/auth/google
```

**🚨 Emergency Stop Command:**
```bash
pm2 stop all
```

**🔄 Emergency Restart Command:**
```bash
pm2 restart all
```
