# PixVid Pro - Full-Stack Application

This project has been successfully modularized and upgraded to a full-stack application with real database integration and authentication.

## Project Structure

```
PixVid Pro/
├── index.html              # Main HTML file (clean structure)
├── styles.css              # All CSS styles and animations
├── script.js               # Frontend JavaScript functionality
├── server.js               # Express.js backend server
├── package.json            # Node.js dependencies
├── env.example             # Environment variables template
├── SETUP.md               # Detailed setup instructions
├── models/                # Database models (MongoDB)
│   ├── User.js            # User schema with authentication
│   ├── Video.js           # Video metadata and history  
│   ├── Subscription.js    # Subscription and billing
│   ├── Payment.js         # Payment transactions
│   ├── PushSubscription.js # Push notification subscriptions
│   └── Notification.js    # Broadcast notifications
├── routes/                # API endpoints
│   ├── auth.js           # Authentication routes
│   ├── payment.js        # Payment and subscription routes
│   └── push.js           # Push notification routes
├── middleware/            # Express middleware
│   └── auth.js           # JWT authentication
├── config/               # Configuration files
│   ├── database.js       # MongoDB connection
│   ├── passport.js       # Google OAuth configuration
│   └── razorpay.js       # Razorpay payment configuration
├── utils/                # Utility functions
│   └── jwt.js           # JWT token management
├── public/               # Static frontend files
│   ├── js/
│   │   ├── api.js        # Frontend API client
│   │   ├── payment.js    # Payment processing
│   │   └── pushNotifications.js # Push notification management
│   └── sw.js             # Service Worker for push notifications
└── web.html              # Original single-file version (backup)
```

## File Descriptions

### `index.html`
- Clean HTML structure without embedded CSS or JavaScript
- Links to external CSS (`styles.css`) and JavaScript (`script.js`) files
- Contains all the HTML markup for the PixVid Pro application

### `styles.css`
- All CSS styles, animations, and responsive design rules
- Includes modern design elements, gradients, and animations
- Mobile-first responsive design for all screen sizes

### `script.js`
- Complete JavaScript functionality for the application
- Includes AI prompt enhancement, file processing, queue management
- Authentication, dashboard, gallery, and subscription features

### `web.html`
- Original single-file version (kept as backup)
- Contains everything in one file for reference

## Features

### ✨ Core Functionality
- 🤖 **AI-Powered Video Generation** with Gemini API integration
- 🎵 **Premium Music Library** with local file support
- ⚡ **Smart Batch Processing** with queue management
- 🎯 **Advanced Motion Control** with customizable presets
- 📊 **Real-time Dashboard** with usage analytics
- 🌍 **World Gallery** for sharing creations
- 💎 **Subscription Management** with multiple tiers
- 💳 **Razorpay Payment Gateway** with multi-currency support
- 🌐 **Dynamic Pricing** (INR for India, USD for international)
- 🔔 **Push Notifications** with web push protocol
- 👑 **Admin Dashboard** for broadcast management

### 🔒 Authentication & Security
- 🔑 **Google OAuth Authentication** (Gmail accounts only)
- 🛡️ **JWT Token Management** with httpOnly cookies
- 🚦 **Rate Limiting** to prevent abuse
- 🔐 **Input Validation** with express-validator
- 🔒 **Payment Security** with Razorpay signature verification

## 💰 Pricing Plans

### Monthly Plans
- **Pro Monthly**: ₹479 (~$6)
  - Unlimited video generation
  - Full HD quality (1080p)
  - No watermarks
  - Priority support

- **Pro+ Monthly**: ₹829 (~$10)
  - Everything in Pro
  - 4K quality (2160p)
  - Advanced AI effects
  - Bulk processing

### Annual Plans (Best Value!)
- **Pro Annual**: ₹3,129 (Save 35%) (~$38)
  - Everything in Pro Monthly
  - Extended features
  - Dedicated support
  - Team collaboration

- **Pro+ Annual**: ₹5,979 (Save 40%) (~$72)
  - Everything in Pro+
  - White-label options
  - Custom integrations
  - Priority feature requests

### 🗄️ Database Integration
- 📊 **MongoDB Atlas** integration
- 👤 **User Profiles** with preferences
- 📹 **Video History** with 24-hour retention for free users
- 💳 **Subscription Tracking** with billing management
- 📈 **Analytics** and usage statistics

### 🎛️ Advanced Settings
- ⚙️ **Environment Variables** for secure configuration
- 🔄 **Auto-sync User Preferences** across devices
- 📱 **Responsive Design** for mobile and desktop
- 🎨 **Real-time UI Updates** based on user plan

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free)
- Gemini API key (optional)

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp env.example .env
# Edit .env with your database connection and API keys

# 3. Start development server
npm run dev
```

### Production
```bash
npm start
```

**📖 For detailed setup instructions, see [SETUP.md](SETUP.md)**

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### Health Check
- `GET /api/health` - Server status

## Environment Variables

Required variables in `.env`:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `GEMINI_API_KEY` - Google Gemini API key
- `PORT` - Server port (default: 3000)

## Security Features

- ✅ **Password Hashing** with bcrypt
- ✅ **JWT Authentication** with secure tokens
- ✅ **Rate Limiting** (100 requests/15min)
- ✅ **Input Validation** and sanitization
- ✅ **CORS Protection** with configurable origins
- ✅ **Security Headers** with Helmet.js
- ✅ **Environment Variables** for sensitive data

## Database Schema

### Users Collection
- User authentication and profile data
- Subscription plans and usage tracking
- User preferences and settings

### Videos Collection
- Video metadata and processing status
- Source images and output files
- Analytics and social features

### Subscriptions Collection
- Billing information and plan details
- Usage limits and feature access
- Payment history and renewals

## Development

### Frontend Development
- Edit `styles.css` for visual changes
- Edit `script.js` for client-side functionality
- Edit `index.html` for structural changes

### Backend Development  
- Add new routes in `routes/` directory
- Create new models in `models/` directory
- Add middleware in `middleware/` directory

### Database Changes
- Update models in `models/` directory
- Run migrations if needed
- Update API endpoints accordingly
