const express = require('express');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { sendTokenResponse, generateToken } = require('../utils/jwt');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Google OAuth login
// @route   GET /api/auth/google
// @access  Public
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect('/?error=oauth_not_configured');
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get('/google/callback', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect('/?error=oauth_not_configured');
  }
  passport.authenticate('google', { failureRedirect: '/?error=auth_failed' })(req, res, next);
}, 
  async (req, res) => {
    try {
      const user = req.user;
      
      // Create free subscription if new user
      const existingSubscription = await Subscription.findOne({ user: user._id });
      if (!existingSubscription) {
        await Subscription.create({
          user: user._id,
          plan: 'free',
          status: 'active',
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year for free plan
        });
      }

      // Generate JWT token using the utility function
      const token = generateToken(user._id);
      
      // Set cookie with proper JWT token
      res.cookie('token', token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Redirect to dashboard
      res.redirect('/?login=success');
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('/?error=auth_error');
    }
  }
);

// @desc    Register user (DISABLED - Google OAuth only)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Email registration is disabled. Please use "Continue with Google" to create an account.'
  });
});

// @desc    Login user (DISABLED - Google OAuth only)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Email login is disabled. Please use "Continue with Google" to sign in.'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = req.user;
    
    // Get subscription details
    const subscription = await Subscription.findOne({ user: user._id });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          avatar: user.avatar,
          preferences: user.preferences,
          planFeatures: user.planFeatures,
          remainingCredits: user.remainingCredits,
          totalVideos: user.totalVideos,
          creditsUsed: user.creditsUsed,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          subscription: subscription,
          isAdmin: user.email === process.env.ADMIN_EMAIL
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('preferences.autoEnhancePrompt')
    .optional()
    .isBoolean()
    .withMessage('autoEnhancePrompt must be a boolean'),
  body('preferences.defaultMotion')
    .optional()
    .isIn(['gentle', 'smooth', 'dynamic', 'cinematic'])
    .withMessage('Invalid motion type'),
  body('preferences.defaultAspectRatio')
    .optional()
    .isIn(['16:9', '9:16', '1:1'])
    .withMessage('Invalid aspect ratio'),
  body('preferences.compressionEnabled')
    .optional()
    .isBoolean()
    .withMessage('compressionEnabled must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, preferences } = req.body;
    const user = req.user;

    // Update fields
    if (name) user.name = name;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferences: user.preferences
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Delete account
// @route   DELETE /api/auth/account
// @access  Private
router.delete('/account', protect, [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { password } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Soft delete by deactivating account
    user.isActive = false;
    await user.save();

    // Also deactivate subscription
    await Subscription.updateOne(
      { user: user._id },
      { status: 'cancelled', cancelledAt: new Date(), cancellationReason: 'Account deleted' }
    );

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during account deletion'
    });
  }
});

module.exports = router;
