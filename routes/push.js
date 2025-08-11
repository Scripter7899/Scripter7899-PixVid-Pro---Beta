const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const PushService = require('../services/pushService');
const Notification = require('../models/Notification');
const router = express.Router();

// @desc    Get VAPID public key
// @route   GET /api/push/vapid-public-key
// @access  Public
router.get('/vapid-public-key', (req, res) => {
  if (!process.env.VAPID_PUBLIC_KEY) {
    return res.status(503).json({
      success: false,
      message: 'Push notifications not configured on server'
    });
  }

  res.json({
    success: true,
    publicKey: process.env.VAPID_PUBLIC_KEY
  });
});

// @desc    Subscribe user to push notifications
// @route   POST /api/push/subscribe
// @access  Private
router.post('/subscribe', 
  protect,
  [
    body('endpoint').notEmpty().withMessage('Endpoint is required'),
    body('keys.p256dh').notEmpty().withMessage('p256dh key is required'),
    body('keys.auth').notEmpty().withMessage('auth key is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const subscriptionData = {
        endpoint: req.body.endpoint,
        keys: req.body.keys,
        userAgent: req.get('User-Agent')
      };

      const subscription = await PushService.subscribeUser(req.user._id, subscriptionData);

      res.status(201).json({
        success: true,
        message: 'Successfully subscribed to push notifications',
        subscription: {
          id: subscription._id,
          createdAt: subscription.createdAt
        }
      });
    } catch (error) {
      console.error('Push subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to subscribe to push notifications'
      });
    }
  }
);

// @desc    Unsubscribe user from push notifications
// @route   DELETE /api/push/unsubscribe
// @access  Private
router.delete('/unsubscribe', protect, async (req, res) => {
  try {
    await PushService.unsubscribeUser(req.user._id);

    res.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications'
    });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from push notifications'
    });
  }
});

// @desc    Test push notification (for current user)
// @route   POST /api/push/test
// @access  Private
router.post('/test', protect, async (req, res) => {
  try {
    const testNotification = {
      title: '🎉 Test Notification',
      body: 'This is a test notification from PixVid Pro!',
      icon: '/favicon.ico',
      url: '/',
      type: 'targeted',
      targetUsers: [req.user._id]
    };

    const result = await PushService.createAndSendNotification(
      testNotification, 
      req.user.email
    );

    res.json({
      success: true,
      message: 'Test notification sent',
      result
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
});

// ==================== ADMIN ROUTES ====================

// @desc    Get all notifications (admin)
// @route   GET /api/push/admin/notifications
// @access  Admin
router.get('/admin/notifications', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-targetUsers'); // Exclude targetUsers for performance

    const total = await Notification.countDocuments();

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// @desc    Create and send broadcast notification (admin)
// @route   POST /api/push/admin/broadcast
// @access  Admin
router.post('/admin/broadcast',
  requireAdmin,
  [
    body('title').isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
    body('body').isLength({ min: 1, max: 300 }).withMessage('Body must be 1-300 characters'),
    body('url').optional().isURL().withMessage('Invalid URL'),
    body('targetPlans').optional().isArray().withMessage('Target plans must be an array'),
    body('scheduledFor').optional().isISO8601().withMessage('Invalid date format')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const notificationData = {
        title: req.body.title,
        body: req.body.body,
        icon: req.body.icon || '/favicon.ico',
        badge: req.body.badge || '/favicon.ico',
        image: req.body.image,
        url: req.body.url || '/',
        tag: req.body.tag,
        type: 'broadcast',
        targetPlans: req.body.targetPlans,
        scheduledFor: req.body.scheduledFor,
        options: {
          requireInteraction: req.body.requireInteraction || false,
          silent: req.body.silent || false,
          ttl: req.body.ttl || 2419200
        }
      };

      const result = await PushService.createAndSendNotification(
        notificationData,
        req.user.email
      );

      res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        data: result
      });
    } catch (error) {
      console.error('Broadcast notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notification'
      });
    }
  }
);

// @desc    Get push notification statistics (admin)
// @route   GET /api/push/admin/stats
// @access  Admin
router.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    const [subscriptionStats, notificationStats] = await Promise.all([
      PushService.getSubscriptionCount(),
      PushService.getNotificationStats(days)
    ]);

    res.json({
      success: true,
      data: {
        subscriptions: subscriptionStats,
        notifications: notificationStats,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get push stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// @desc    Track notification click
// @route   POST /api/push/track-click
// @access  Public (to work with service worker)
router.post('/track-click', async (req, res) => {
  try {
    const { notificationId } = req.body;
    
    if (notificationId) {
      await Notification.findByIdAndUpdate(
        notificationId,
        { $inc: { 'stats.clickCount': 1 } }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Track click error:', error);
    res.json({ success: false });
  }
});

module.exports = router;
