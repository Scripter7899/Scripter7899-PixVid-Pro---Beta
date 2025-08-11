# 🌐 Hostinger DNS Setup for PixVid Pro

## Step-by-Step DNS Configuration

### 1. 📋 Information You'll Need
- **Your RDP Server IP Address**: `XXX.XXX.XXX.XXX`
- **Your Domain**: `yourdomain.com` (purchased from Hostinger)

### 2. 🔧 DNS Records to Configure

Login to your **Hostinger Control Panel** and navigate to **DNS Zone**.

#### A Records (Required)
```
Type: A
Name: @
Value: YOUR_RDP_SERVER_IP
TTL: 3600 (1 hour)
```

```
Type: A
Name: www
Value: YOUR_RDP_SERVER_IP
TTL: 3600 (1 hour)
```

#### CNAME Records (Optional but Recommended)
```
Type: CNAME
Name: api
Value: yourdomain.com
TTL: 3600 (1 hour)
```

```
Type: CNAME
Name: admin
Value: yourdomain.com
TTL: 3600 (1 hour)
```

### 3. 📧 Email Records (If using email)
```
Type: MX
Name: @
Value: mail.hostinger.com
Priority: 10
TTL: 3600
```

### 4. 🔍 Verification Steps

#### Check DNS Propagation
Visit these websites to verify your DNS is working:
- https://dnschecker.org/
- https://www.whatsmydns.net/

Enter your domain and check if it resolves to your RDP server IP.

#### Test Access
Once DNS propagates (can take 0-48 hours):
- http://yourdomain.com
- https://yourdomain.com (after SSL setup)

### 5. 🔐 SSL Certificate Setup

#### Option A: Let's Encrypt (Free)
```powershell
# On your RDP server, install Certbot
# Download from: https://certbot.eff.org/

# Run certification
certbot --iis -d yourdomain.com -d www.yourdomain.com
```

#### Option B: Hostinger SSL
1. Purchase SSL certificate from Hostinger
2. Download certificate files
3. Install in IIS Manager:
   - Server Certificates
   - Import certificate
   - Bind to your website on port 443

### 6. 🚀 Update Application URLs

#### Google OAuth Settings
Update your Google Cloud Console:
- **Authorized JavaScript origins**: 
  - `https://yourdomain.com`
- **Authorized redirect URIs**: 
  - `https://yourdomain.com/api/auth/google/callback`

#### Razorpay Settings
Update your Razorpay Dashboard:
- **Website URL**: `https://yourdomain.com`
- **Webhook URL**: `https://yourdomain.com/api/payment/webhook`

#### Update .env file
```env
BASE_URL=https://yourdomain.com
CONTACT_EMAIL=contact@yourdomain.com
```

### 7. ✅ Final Verification Checklist

- [ ] Domain resolves to your RDP server IP
- [ ] HTTP (port 80) accessible
- [ ] HTTPS (port 443) accessible with valid SSL
- [ ] All legal pages load correctly
- [ ] Google OAuth login works
- [ ] Payment flow works
- [ ] Admin panel accessible
- [ ] Push notifications work

### 8. 🔧 Common DNS Issues

#### "Site can't be reached"
- Check if DNS has propagated (use dnschecker.org)
- Verify RDP server IP is correct
- Check Windows firewall allows ports 80 and 443

#### "Certificate error"
- Ensure SSL certificate is properly installed
- Check certificate matches your domain
- Verify certificate chain is complete

#### "Mixed content warnings"
- Ensure all resources load over HTTPS
- Check for any HTTP links in your code
- Update any hardcoded URLs to use HTTPS

### 9. 📱 Mobile & Device Testing

Test on multiple devices:
- Desktop browsers (Chrome, Firefox, Edge, Safari)
- Mobile browsers (iOS Safari, Android Chrome)
- Different screen sizes
- Different network connections

### 10. 🎯 Razorpay Verification Requirements

Ensure these pages are accessible:
- ✅ https://yourdomain.com/about.html
- ✅ https://yourdomain.com/contact.html
- ✅ https://yourdomain.com/pricing.html
- ✅ https://yourdomain.com/privacy.html
- ✅ https://yourdomain.com/terms.html
- ✅ https://yourdomain.com/refund.html

All pages should:
- Load over HTTPS
- Display proper content
- Have working navigation
- Show consistent branding

---

**⚠️ Important Notes:**
1. DNS propagation can take 0-48 hours
2. Always test thoroughly before submitting to Razorpay
3. Keep backup of all configuration files
4. Monitor server logs after going live
