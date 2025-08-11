const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only configure Google OAuth if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        // Update user info and login
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }

      // Check if user exists with this email (from different auth method)
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.picture = profile.photos[0]?.value;
        user.authProvider = 'google';
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }

      // Validate Gmail email
      const email = profile.emails[0].value;
      if (!email.endsWith('@gmail.com')) {
        return done(new Error('Only Gmail accounts are allowed'), null);
      }

      // Create new user
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: email,
        picture: profile.photos[0]?.value,
        authProvider: 'google',
        isEmailVerified: true,
        lastLogin: new Date()
      });

      return done(null, user);
    } catch (error) {
      console.error('Google OAuth Error:', error);
      return done(error, null);
    }
  }
  ));
} else {
  console.warn('⚠️  Google OAuth credentials not found. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.');
  console.warn('📝 Follow the setup guide in GOOGLE_OAUTH_SETUP.md to configure Google OAuth.');
}

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
