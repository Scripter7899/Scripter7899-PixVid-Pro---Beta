// API Configuration and utility functions
class API {
  constructor() {
    this.baseURL = '/api';
    // Using httpOnly cookies for authentication - no token management needed
  }

  // Get authentication headers
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: this.getHeaders(),
      credentials: 'include',
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication API methods
  async register(userData) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async login(credentials) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.request('/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await this.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Profile update failed');
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await this.request('/auth/password', {
        method: 'PUT',
        body: JSON.stringify(passwordData)
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Password change failed');
    }
  }

  async deleteAccount(password) {
    try {
      const response = await this.request('/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ password })
      });
      
      // Cookie will be cleared by server
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Account deletion failed');
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.request('/health');
      return response;
    } catch (error) {
      throw new Error('Server health check failed');
    }
  }

  // Check if user is authenticated (will check with server)
  async isAuthenticated() {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Payment API methods
  async createRazorpayOrder(planId, currency = 'INR') {
    return this.request('/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, currency })
    });
  }

  async verifyRazorpayPayment(orderId, paymentId, signature, planId) {
    return this.request('/payment/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        planId
      })
    });
  }

  async getPaymentHistory() {
    return this.request('/payment/history');
  }

  async getSubscriptionStatus() {
    return this.request('/payment/subscription');
  }

  async recordPaymentFailure(orderId, error) {
    // Optional: record payment failures for debugging
    console.warn('Payment failed:', { orderId, error });
  }
}

// Create global API instance
window.api = new API();
