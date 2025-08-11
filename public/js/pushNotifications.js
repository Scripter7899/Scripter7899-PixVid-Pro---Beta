// Push Notifications Client-Side Management
class PushNotificationManager {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.isSubscribed = false;
    this.registration = null;
    this.vapidPublicKey = null;
  }

  async init() {
    if (!this.isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully');

      // Get VAPID public key
      await this.getVapidPublicKey();

      // Check current subscription status
      await this.checkSubscriptionStatus();

      // Auto-request permissions will be triggered when user logs in

      // Listen for service worker updates
      this.registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
      });

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async autoRequestPermissions() {
    try {
      // Only proceed if notifications are supported and we have a registration
      if (!this.isSupported || !this.registration) {
        return false;
      }

      // Check current permission status
      const permission = Notification.permission;
      
      if (permission === 'granted') {
        // Already granted, try to subscribe if not already subscribed
        if (!this.isSubscribed) {
          console.log('🔔 Permission already granted, subscribing to notifications...');
          await this.subscribeWithoutPrompt();
        }
        return true;
      } else if (permission === 'default') {
        // Show a user-friendly prompt - the banner will handle the actual permission request
        await this.showPermissionPrompt();
        return true;
      } else {
        // Permission denied - respect user's choice
        console.log('🔕 Notification permission denied by user');
        return false;
      }
    } catch (error) {
      console.error('Error in auto-request permissions:', error);
      return false;
    }
  }

  async showPermissionPrompt() {
    return new Promise((resolve) => {
      // Add CSS animations to the document if not already added
      if (!document.getElementById('notification-banner-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-banner-styles';
        style.textContent = `
          @keyframes slideUpFadeIn {
            0% {
              transform: translateY(100%);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes slideDownFadeOut {
            0% {
              transform: translateY(0);
              opacity: 1;
            }
            100% {
              transform: translateY(100%);
              opacity: 0;
            }
          }
          
          @keyframes bellShake {
            0%, 100% { transform: rotate(0deg); }
            10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
            20%, 40%, 60%, 80% { transform: rotate(10deg); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
          }
          
          .notification-banner {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 20px;
            z-index: 10000;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3), 0 0 20px rgba(102, 126, 234, 0.4);
            font-family: 'Inter', sans-serif;
            animation: slideUpFadeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            max-width: 500px;
            margin: 0 auto;
            overflow: hidden;
          }
          
          .notification-banner::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: shimmer 3s infinite;
          }
          
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          
          .notification-banner.closing {
            animation: slideDownFadeOut 0.4s cubic-bezier(0.55, 0.06, 0.68, 0.19);
          }
          
          .notification-content {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
          }
          
          .notification-icon {
            font-size: 2rem;
            animation: bellShake 2s infinite;
            filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));
          }
          
          .notification-text {
            flex: 1;
          }
          
          .notification-title {
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 5px;
            background: linear-gradient(45deg, #fff, #e0e7ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .notification-subtitle {
            font-size: 0.9rem;
            opacity: 0.9;
            line-height: 1.4;
          }
          
          .notification-buttons {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }
          
          .notification-btn {
            padding: 10px 20px;
            border-radius: 25px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
            overflow: hidden;
          }
          
          .notification-btn:hover {
            transform: translateY(-2px);
            animation: pulse 0.6s infinite;
          }
          
          .notification-btn-allow {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
          }
          
          .notification-btn-allow:hover {
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
          }
          
          .notification-btn-dismiss {
            background: rgba(255,255,255,0.15);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            backdrop-filter: blur(10px);
          }
          
          .notification-btn-dismiss:hover {
            background: rgba(255,255,255,0.25);
          }
          
          .sparkles {
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            pointer-events: none;
          }
          
          .sparkle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: #fff;
            border-radius: 50%;
            animation: sparkle 2s infinite;
          }
          
          @media (max-width: 600px) {
            .notification-banner {
              left: 10px;
              right: 10px;
              bottom: 10px;
              padding: 15px;
            }
            
            .notification-content {
              flex-direction: column;
              text-align: center;
              gap: 10px;
            }
            
            .notification-buttons {
              justify-content: center;
              flex-wrap: wrap;
            }
          }
        `;
        document.head.appendChild(style);
      }

      // Create the beautiful notification banner
      const banner = document.createElement('div');
      banner.className = 'notification-banner';
      
      // Add sparkles for extra magic
      const sparkles = document.createElement('div');
      sparkles.className = 'sparkles';
      for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 2 + 's';
        sparkles.appendChild(sparkle);
      }
      banner.appendChild(sparkles);
      
      banner.innerHTML += `
        <div class="notification-content">
          <div class="notification-icon">🔔</div>
          <div class="notification-text">
            <div class="notification-title">Stay Connected!</div>
            <div class="notification-subtitle">Get instant notifications about new features, special offers, and important updates from PixVid Pro.</div>
          </div>
        </div>
        <div class="notification-buttons">
          <button id="allow-notifications" class="notification-btn notification-btn-allow">
            ✨ Allow Notifications
          </button>
          <button id="dismiss-notifications" class="notification-btn notification-btn-dismiss">
            Maybe Later
          </button>
        </div>
      `;

      document.body.appendChild(banner);

      // Smooth dismiss function
      const dismissBanner = (result) => {
        banner.classList.add('closing');
        setTimeout(() => {
          if (document.body.contains(banner)) {
            document.body.removeChild(banner);
          }
          resolve(result);
        }, 400);
      };

      // Add click handlers with enhanced feedback
      document.getElementById('allow-notifications').onclick = async (e) => {
        e.target.style.transform = 'scale(0.95)';
        e.target.disabled = true;
        e.target.innerHTML = '⏳ Requesting...';
        
        try {
          // Directly request permission and subscribe
          const result = await window.pushManager.subscribe();
          dismissBanner(result);
        } catch (error) {
          console.error('Error subscribing:', error);
          e.target.innerHTML = '❌ Failed';
          setTimeout(() => {
            dismissBanner(false);
          }, 1000);
        }
      };

      document.getElementById('dismiss-notifications').onclick = (e) => {
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
          dismissBanner(false);
        }, 100);
      };

      // Auto-dismiss after 15 seconds with fade warning
      const warningTimeout = setTimeout(() => {
        const buttons = banner.querySelector('.notification-buttons');
        if (buttons) {
          buttons.style.opacity = '0.7';
          buttons.style.animation = 'pulse 1s infinite';
        }
      }, 12000);

      const autoTimeout = setTimeout(() => {
        if (document.body.contains(banner)) {
          dismissBanner(false);
        }
        clearTimeout(warningTimeout);
      }, 15000);

      // Clear timeouts if user interacts
      banner.addEventListener('click', () => {
        clearTimeout(warningTimeout);
        clearTimeout(autoTimeout);
      });
    });
  }

  async subscribeWithoutPrompt() {
    try {
      if (!this.registration || !this.vapidPublicKey) {
        throw new Error('Service worker or VAPID key not available');
      }

      // Subscribe to push notifications
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(subscription.toJSON())
      });

      const data = await response.json();

      if (data.success) {
        this.isSubscribed = true;
        console.log('🔔 Automatically subscribed to push notifications');
        return true;
      } else {
        throw new Error(data.message || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Error in automatic subscription:', error);
      return false;
    }
  }

  async getVapidPublicKey() {
    try {
      const response = await fetch('/api/push/vapid-public-key');
      const data = await response.json();
      
      if (data.success) {
        this.vapidPublicKey = data.publicKey;
        return this.vapidPublicKey;
      } else {
        throw new Error('Failed to get VAPID public key');
      }
    } catch (error) {
      console.error('Error getting VAPID public key:', error);
      throw error;
    }
  }

  async checkSubscriptionStatus() {
    if (!this.registration) return false;

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      this.isSubscribed = !!subscription;
      return this.isSubscribed;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Push notifications not supported');
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else if (permission === 'denied') {
      console.log('Notification permission denied');
      throw new Error('Notification permission denied');
    } else {
      console.log('Notification permission dismissed');
      throw new Error('Notification permission not granted');
    }
  }

  async subscribe() {
    try {
      if (!this.registration || !this.vapidPublicKey) {
        throw new Error('Service worker or VAPID key not available');
      }

      // Request notification permission
      await this.requestPermission();

      // Subscribe to push notifications
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(subscription.toJSON())
      });

      const data = await response.json();

      if (data.success) {
        this.isSubscribed = true;
        console.log('Successfully subscribed to push notifications');
        this.showNotificationStatus('✅ Notifications enabled! You\'ll receive important updates.', 'success');
        return true;
      } else {
        throw new Error(data.message || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      this.showNotificationStatus('❌ Failed to enable notifications. ' + error.message, 'error');
      throw error;
    }
  }

  async unsubscribe() {
    try {
      if (!this.registration) {
        throw new Error('Service worker not available');
      }

      const subscription = await this.registration.pushManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe from browser
        await subscription.unsubscribe();
        
        // Remove from server
        const response = await fetch('/api/push/unsubscribe', {
          method: 'DELETE',
          credentials: 'include'
        });

        const data = await response.json();
        
        if (data.success) {
          this.isSubscribed = false;
          console.log('Successfully unsubscribed from push notifications');
          this.showNotificationStatus('🔕 Notifications disabled.', 'info');
          return true;
        } else {
          throw new Error(data.message || 'Failed to unsubscribe');
        }
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      this.showNotificationStatus('❌ Failed to disable notifications. ' + error.message, 'error');
      throw error;
    }
  }

  async sendTestNotification() {
    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        this.showNotificationStatus('🧪 Test notification sent!', 'success');
        return true;
      } else {
        throw new Error(data.message || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      this.showNotificationStatus('❌ Failed to send test notification. ' + error.message, 'error');
      throw error;
    }
  }

  // Utility function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Show notification status to user
  showNotificationStatus(message, type = 'info') {
    // Use existing notification system if available
    if (typeof showNotification === 'function') {
      showNotification(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  // Get subscription info for debugging
  async getSubscriptionInfo() {
    if (!this.registration) return null;

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      return subscription ? subscription.toJSON() : null;
    } catch (error) {
      console.error('Error getting subscription info:', error);
      return null;
    }
  }
}

// Create global instance
window.pushManager = new PushNotificationManager();

// Function to trigger permission request for logged-in users
window.requestNotificationPermissionsForUser = async () => {
  if (window.pushManager && window.pushManager.isSupported) {
    await window.pushManager.autoRequestPermissions();
  }
};

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await window.pushManager.init();
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
  }
});
