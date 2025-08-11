const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Configure web-push only if VAPID keys are available
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:your-email@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log('✅ Web Push configured with VAPID keys');
} else {
  console.warn('⚠️ VAPID keys not found in environment variables. Push notifications will be disabled.');
}

class PushService {
  static async subscribeUser(userId, subscriptionData) {
    try {
      // Remove any existing subscription for this user
      await PushSubscription.deleteMany({ user: userId });
      
      // Create new subscription
      const pushSubscription = new PushSubscription({
        user: userId,
        endpoint: subscriptionData.endpoint,
        keys: {
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth
        },
        userAgent: subscriptionData.userAgent
      });
      
      await pushSubscription.save();
      return pushSubscription;
    } catch (error) {
      console.error('Error subscribing user for push notifications:', error);
      throw error;
    }
  }

  static async unsubscribeUser(userId) {
    try {
      await PushSubscription.deleteMany({ user: userId });
      return true;
    } catch (error) {
      console.error('Error unsubscribing user from push notifications:', error);
      throw error;
    }
  }

  static async sendNotification(notificationId) {
    try {
      // Check if VAPID is configured
      if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        throw new Error('VAPID keys not configured. Push notifications are disabled.');
      }

      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      let targetSubscriptions = [];
      
      if (notification.type === 'broadcast') {
        // Send to all active subscriptions
        targetSubscriptions = await PushSubscription.find({ isActive: true })
          .populate('user', 'plan email');
        
        // Filter by target plans if specified
        if (notification.targetPlans && notification.targetPlans.length > 0) {
          targetSubscriptions = targetSubscriptions.filter(sub => 
            notification.targetPlans.includes(sub.user.plan)
          );
        }
      } else if (notification.type === 'targeted') {
        // Send to specific users
        targetSubscriptions = await PushSubscription.find({
          user: { $in: notification.targetUsers },
          isActive: true
        }).populate('user', 'plan email');
      }

      const payload = {
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        badge: notification.badge,
        image: notification.image,
        url: notification.url,
        tag: notification.tag,
        data: {
          notificationId: notification._id,
          url: notification.url,
          clickAction: notification.url
        }
      };

      const options = {
        TTL: notification.options.ttl,
        urgency: 'normal',
        headers: {}
      };

      let successCount = 0;
      let failureCount = 0;
      const failedEndpoints = [];

      // Send notifications in batches to avoid overwhelming the system
      const batchSize = 100;
      for (let i = 0; i < targetSubscriptions.length; i += batchSize) {
        const batch = targetSubscriptions.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (subscription) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: subscription.keys.p256dh,
                  auth: subscription.keys.auth
                }
              },
              JSON.stringify(payload),
              options
            );
            
            // Update last used
            subscription.lastUsed = new Date();
            await subscription.save();
            
            successCount++;
          } catch (error) {
            console.error(`Failed to send notification to ${subscription.user.email}:`, error.message);
            failureCount++;
            failedEndpoints.push(subscription.endpoint);
            
            // If the subscription is invalid, deactivate it
            if (error.statusCode === 410 || error.statusCode === 404) {
              await subscription.deactivate();
            }
          }
        });

        await Promise.allSettled(batchPromises);
      }

      // Update notification stats
      await notification.markAsSent({
        totalSent: targetSubscriptions.length,
        successCount,
        failureCount
      });

      console.log(`Notification sent: ${successCount} successful, ${failureCount} failed`);
      
      return {
        success: true,
        totalSent: targetSubscriptions.length,
        successCount,
        failureCount,
        failedEndpoints
      };
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  static async createAndSendNotification(notificationData, createdBy) {
    try {
      const notification = new Notification({
        ...notificationData,
        createdBy,
        status: 'scheduled'
      });
      
      await notification.save();
      
      // Send immediately if no specific schedule time
      if (!notificationData.scheduledFor || new Date(notificationData.scheduledFor) <= new Date()) {
        return await this.sendNotification(notification._id);
      }
      
      return { success: true, notification };
    } catch (error) {
      console.error('Error creating and sending notification:', error);
      throw error;
    }
  }

  static async getSubscriptionCount() {
    try {
      const totalCount = await PushSubscription.countDocuments({ isActive: true });
      const planBreakdown = await PushSubscription.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $group: {
            _id: '$user.plan',
            count: { $sum: 1 }
          }
        }
      ]);
      
      return {
        total: totalCount,
        breakdown: planBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Error getting subscription count:', error);
      throw error;
    }
  }

  static async getNotificationStats(days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const stats = await Notification.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalNotifications: { $sum: 1 },
            totalSent: { $sum: '$stats.totalSent' },
            totalSuccess: { $sum: '$stats.successCount' },
            totalFailures: { $sum: '$stats.failureCount' },
            totalClicks: { $sum: '$stats.clickCount' }
          }
        }
      ]);
      
      return stats[0] || {
        totalNotifications: 0,
        totalSent: 0,
        totalSuccess: 0,
        totalFailures: 0,
        totalClicks: 0
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
}

module.exports = PushService;
