// Payment Module for PixVid Pro
class PaymentManager {
    constructor(apiClient) {
        this.api = apiClient;
        this.currency = 'INR'; // Default currency
        this.isIndianUser = true;
        this.razorpayKeyId = null;
        this.init();
    }

    async init() {
        // Detect user location for currency
        this.isIndianUser = await this.detectIndianUser();
        this.currency = this.isIndianUser ? 'INR' : 'USD';
        console.log(`Payment Manager initialized - Currency: ${this.currency}`);
    }

    async detectIndianUser() {
        try {
            // Try to get user's location from timezone
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (timezone === 'Asia/Kolkata' || timezone === 'Asia/Calcutta') {
                return true;
            }
            
            // Fallback: Try to detect from IP (simplified)
            const response = await fetch('https://ipapi.co/json/', { 
                timeout: 3000,
                signal: AbortSignal.timeout(3000)
            });
            const data = await response.json();
            return data.country_code === 'IN';
        } catch (error) {
            console.log('Location detection failed, defaulting to Indian pricing');
            // Default to Indian pricing if detection fails
            return true;
        }
    }

    async createOrder(planId) {
        try {
            if (!this.api) {
                throw new Error('API client not available');
            }

            window.showNotification('Creating payment order...', 'info');

            const result = await this.api.createRazorpayOrder(planId, this.currency);

            if (!result.success) {
                throw new Error(result.message || 'Failed to create payment order');
            }

            this.razorpayKeyId = result.data.razorpayKeyId;
            return result.data;

        } catch (error) {
            console.error('Error creating payment order:', error);
            window.showNotification(`Failed to create payment order: ${error.message}`, 'error');
            return null;
        }
    }

    async openPaymentModal(orderData, planId) {
        return new Promise((resolve, reject) => {
            if (!window.Razorpay) {
                reject(new Error('Razorpay SDK not loaded'));
                return;
            }

            const options = {
                key: orderData.razorpayKeyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'PixVid Pro',
                description: `Subscribe to ${orderData.planName}`,
                order_id: orderData.orderId,
                image: '/favicon.ico', // Your logo
                handler: async (response) => {
                    try {
                        const verificationResult = await this.verifyPayment(response);
                        resolve(verificationResult);
                    } catch (error) {
                        reject(error);
                    }
                },
                prefill: {
                    name: window.AppState?.user?.name || '',
                    email: window.AppState?.user?.email || ''
                },
                notes: {
                    planId: planId,
                    userId: window.AppState?.user?._id
                },
                theme: {
                    color: '#4FC3F7'
                },
                modal: {
                    ondismiss: () => {
                        reject(new Error('Payment cancelled by user'));
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        });
    }

    async verifyPayment(paymentResponse) {
        try {
            window.showNotification('Verifying payment...', 'info');

            const result = await this.api.verifyRazorpayPayment(
                paymentResponse.razorpay_order_id,
                paymentResponse.razorpay_payment_id,
                paymentResponse.razorpay_signature,
                paymentResponse.planId || 'unknown'
            );

            if (!result.success) {
                throw new Error(result.message || 'Payment verification failed');
            }

            return result;

        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    }

    async processPayment(planId) {
        try {
            // Step 1: Create order
            const orderData = await this.createOrder(planId);
            if (!orderData) {
                return false;
            }

            // Step 2: Open payment modal
            const verificationResult = await this.openPaymentModal(orderData, planId);

            // Step 3: Handle successful payment
            if (verificationResult.success) {
                window.showNotification(`🎉 Successfully subscribed to ${orderData.planName}!`, 'success');
                
                // Update user state
                if (window.AppState?.user) {
                    window.AppState.user.plan = verificationResult.data.subscriptionPlan;
                    window.AppState.user.subscriptionEndDate = verificationResult.data.subscriptionEndDate;
                }

                // Update UI
                if (window.updateUI) window.updateUI();
                if (window.updateDashboard) window.updateDashboard();

                // Auto-redirect to dashboard after 2 seconds
                setTimeout(() => {
                    if (window.showSection) window.showSection('dashboard');
                }, 2000);

                return true;
            }

            return false;

        } catch (error) {
            console.error('Payment process failed:', error);
            
            if (error.message.includes('cancelled')) {
                window.showNotification('Payment cancelled', 'warning');
            } else {
                window.showNotification(`Payment failed: ${error.message}`, 'error');
            }
            
            return false;
        }
    }

    async getSubscriptionStatus() {
        try {
            const result = await this.api.getSubscriptionStatus();
            return result.success ? result.data : null;

        } catch (error) {
            console.error('Error fetching subscription status:', error);
            return null;
        }
    }

    async getPaymentHistory(page = 1) {
        try {
            const result = await this.api.getPaymentHistory();
            return result.success ? result.data : null;

        } catch (error) {
            console.error('Error fetching payment history:', error);
            return null;
        }
    }

    formatCurrency(amount, currency = this.currency) {
        if (currency === 'USD') {
            return `$${(amount / 100).toFixed(2)}`;
        } else {
            return `₹${(amount / 100).toFixed(0)}`;
        }
    }

    getPlanDisplayPrice(planId) {
        const plans = {
            'pro_monthly': { amountINR: 47900, amountUSD: 600 },
            'pro_plus_monthly': { amountINR: 82900, amountUSD: 1000 },
                                'pro_annual': { amountINR: 312900, amountUSD: 3800 },
            'pro_plus_annual': { amountINR: 597900, amountUSD: 7200 }
        };

        const plan = plans[planId];
        if (!plan) return 'N/A';

        const amount = this.currency === 'USD' ? plan.amountUSD : plan.amountINR;
        return this.formatCurrency(amount);
    }

    // Alias for processPayment - this is what script.js calls
    async subscribeToPlan(planId) {
        console.log('🔄 PaymentManager.subscribeToPlan called with planId:', planId);
        return await this.processPayment(planId);
    }
}

// Initialize PaymentManager with api client
function initializePaymentManager() {
    if (window.api) {
        window.paymentManager = new PaymentManager(window.api);
        console.log('✅ PaymentManager initialized successfully');
        return true;
    } else {
        console.warn('⚠️ API client not available for PaymentManager');
        return false;
    }
}

// Try to initialize immediately
if (!initializePaymentManager()) {
    // If failed, try again after a delay
    setTimeout(initializePaymentManager, 1000);
}
