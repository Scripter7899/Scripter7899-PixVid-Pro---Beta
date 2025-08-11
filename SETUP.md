# PixVid Pro - Setup Instructions

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Click "Try Free" and create an account
3. Choose the **FREE tier** (M0 Sandbox)

### Step 2: Create a Cluster
1. Choose **AWS** as cloud provider
2. Select the nearest region to you
3. Choose **M0 Sandbox** (FREE forever)
4. Name your cluster (e.g., "pixvidpro-cluster")
5. Click "Create Cluster"

### Step 3: Set Up Database Access
1. Go to **Database Access** in the left sidebar
2. Click "Add New Database User"
3. Choose **Password** authentication
4. Create a username and strong password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Set Up Network Access
1. Go to **Network Access** in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to **Clusters** and click "Connect"
2. Choose "Connect your application"
3. Select **Node.js** and version **4.1 or later**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   ```

## 🔑 Environment Variables Setup

### Step 1: Create .env File
1. Copy `env.example` to `.env` in the project root
2. Fill in your values:

```bash
# Database Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/pixvidpro?retryWrites=true&w=majority
DB_NAME=pixvidpro

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# API Keys
GEMINI_API_KEY=your-gemini-api-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=another-super-secret-key-for-sessions

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Step 2: Generate Secure Secrets
Use this command to generate secure random strings:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 Installation & Running

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Start Production Server
```bash
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api

## 🔧 Project Structure

```
PixVid Pro/
├── models/                 # Database models
│   ├── User.js            # User schema
│   ├── Video.js           # Video schema  
│   └── Subscription.js    # Subscription schema
├── routes/                # API routes
│   └── auth.js           # Authentication routes
├── middleware/            # Express middleware
│   └── auth.js           # Authentication middleware
├── config/               # Configuration files
│   └── database.js       # Database connection
├── utils/                # Utility functions
│   └── jwt.js           # JWT utilities
├── public/               # Static files
│   └── js/
│       └── api.js        # Frontend API client
├── index.html            # Main HTML file
├── styles.css            # CSS styles
├── script.js             # Frontend JavaScript
├── server.js             # Express server
├── package.json          # Dependencies
├── env.example           # Environment variables template
└── .env                  # Your environment variables (create this)
```

## 🧪 Testing the Setup

### 1. Check Server Health
Visit: http://localhost:3000/api/health

### 2. Test Registration
1. Open http://localhost:3000
2. Click "Sign Up Free"
3. Fill in the form and submit
4. Check your MongoDB Atlas database for the new user

### 3. Test Login
1. Use the credentials you just created
2. You should be logged in successfully

## 📊 Database Collections

The app will automatically create these collections:
- **users** - User accounts and preferences
- **videos** - Generated videos and metadata
- **subscriptions** - User subscription details

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Environment variable protection

## 🎯 Next Steps

1. **Set up MongoDB Atlas** (follow steps above)
2. **Get Gemini API key** (optional for AI features)
3. **Configure environment variables**
4. **Run the application**
5. **Test authentication**

## 💡 Optional Enhancements

- **Email verification**: Set up email service for user verification
- **Payment integration**: Add Stripe/Razorpay for subscriptions
- **File storage**: Add AWS S3 or Cloudinary for video storage
- **CDN**: Add CloudFlare for better performance

## 🆘 Troubleshooting

### MongoDB Connection Issues
- Check if IP address is whitelisted
- Verify username/password in connection string
- Ensure cluster is running

### Authentication Issues
- Check JWT_SECRET is set
- Verify .env file is loaded
- Check browser console for errors

### Server Won't Start
- Check if port 3000 is available
- Verify all required environment variables are set
- Check for syntax errors in .env file

## 📞 Support

If you encounter issues:
1. Check the console logs
2. Verify your .env configuration
3. Ensure MongoDB connection is working
4. Check that all dependencies are installed
