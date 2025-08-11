# Google OAuth Setup Instructions

## 📋 Overview
PixVid Pro now uses Google OAuth for authentication to ensure only verified Gmail accounts can access the platform. This prevents abuse from temporary email services and provides better security.

## 🔧 Setup Steps

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `pixvid-pro-oauth`
4. Click "Create"

### 2. Enable Google+ API
1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Configure the OAuth consent screen if prompted:
   - User Type: External
   - App name: PixVid Pro
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
4. Create OAuth Client ID:
   - Application type: Web application
   - Name: PixVid Pro Web Client
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`

### 4. Configure Environment Variables
1. Copy the Client ID and Client Secret from Google Cloud Console
2. Add to your `.env` file:
```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
SESSION_SECRET=your_random_session_secret_here
```

### 5. Update Production URLs
When deploying to production, update:
- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs: `https://yourdomain.com/api/auth/google/callback`

## 🔒 Security Features
- ✅ Only Gmail accounts are allowed
- ✅ Email verification handled by Google
- ✅ Secure OAuth 2.0 flow
- ✅ Session-based authentication
- ✅ Prevents temporary email abuse

## 🚀 Testing
1. Start your server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Continue with Google"
4. Complete Google authentication
5. You should be redirected back to the dashboard

## 📝 Notes
- Email/password registration is now disabled
- Only Google OAuth authentication is allowed
- Users must have Gmail accounts (@gmail.com)
- All existing email/password users will need to re-register with Google OAuth
