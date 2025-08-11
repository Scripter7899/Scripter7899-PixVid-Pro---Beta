const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getRazorpayInstance } = require('../config/razorpay');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { protect: auth } = require('../middleware/auth');

// Pricing configuration
const PRICING_PLANS = {
    pro_monthly: {
        name: 'Pro Monthly',
        amountINR: 47900, // ₹479 in paise
        amountUSD: 600,   // $6 in cents
        duration: 30,     // days
        tier: 'pro',
        type: 'monthly'
    },
    pro_plus_monthly: {
        name: 'Pro+ Monthly',
        amountINR: 82900, // ₹829 in paise
        amountUSD: 1000,  // $10 in cents
        duration: 30,     // days
        tier: 'pro_plus',
        type: 'monthly'
    },
    pro_annual: {
        name: 'Pro Annual',
        amountINR: 312900, // ₹3,129 in paise
        amountUSD: 3800,   // $38 in cents
        duration: 365,     // days
        tier: 'pro',
        type: 'annual'
    },
    pro_plus_annual: {
        name: 'Pro+ Annual',
        amountINR: 597900, // ₹5,979 in paise
        amountUSD: 7200,   // $72 in cents
        duration: 365,     // days
        tier: 'pro_plus',
        type: 'annual'
    }
};

// Create Razorpay order
router.post('/create-order', auth, async function(req, res) {
    try {
        const { planId, currency = 'INR' } = req.body;
        const userId = req.user._id;

        // Validate plan
        const planConfig = PRICING_PLANS[planId];
        if (!planConfig) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan selected'
            });
        }

        // Get Razorpay instance
        const razorpay = getRazorpayInstance();
        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: 'Payment service unavailable. Please try again later.'
            });
        }

        // Determine amount based on currency
        const amount = currency === 'USD' ? planConfig.amountUSD : planConfig.amountINR;
        // Create short receipt ID (max 40 chars for Razorpay)
        const timestamp = Date.now().toString().slice(-8); // Last 8 digits
        const userIdShort = userId.toString().slice(-8); // Last 8 chars of user ID
        const planShort = planId.slice(0, 6); // First 6 chars of plan
        const receiptId = `rcpt_${userIdShort}_${planShort}_${timestamp}`;

        // Create Razorpay order
        const orderOptions = {
            amount: amount,
            currency: currency,
            receipt: receiptId,
            notes: {
                planId: planId,
                planName: planConfig.name,
                userId: userId.toString(),
                planTier: planConfig.tier,
                planType: planConfig.type
            }
        };

        const order = await razorpay.orders.create(orderOptions);

        // Save payment record
        const payment = new Payment({
            userId: userId,
            razorpayOrderId: order.id,
            planId: planId,
            planName: planConfig.name,
            amount: amount,
            currency: currency,
            status: 'created',
            receiptId: receiptId,
            notes: orderOptions.notes
        });

        await payment.save();

        res.json({
            success: true,
            data: {
                orderId: order.id,
                amount: amount,
                currency: currency,
                planName: planConfig.name,
                razorpayKeyId: process.env.RAZORPAY_KEY_ID
            }
        });

    } catch (error) {
        console.error('Error creating payment order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order'
        });
    }
});

// Verify payment and activate subscription
router.post('/verify-payment', auth, async function(req, res) {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature 
        } = req.body;

        const userId = req.user._id;

        // Find payment record
        const payment = await Payment.findOne({ 
            razorpayOrderId: razorpay_order_id,
            userId: userId 
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            // Mark payment as failed
            payment.status = 'failed';
            payment.failureReason = 'Invalid signature';
            await payment.save();

            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // Payment verified successfully
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.status = 'paid';
        
        // Calculate subscription dates
        const planConfig = PRICING_PLANS[payment.planId];
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + (planConfig.duration * 24 * 60 * 60 * 1000));
        
        payment.subscriptionStartDate = startDate;
        payment.subscriptionEndDate = endDate;
        await payment.save();

        // Create or update subscription
        const existingSubscription = await Subscription.findOne({ 
            user: userId, 
            status: 'active' 
        });

        if (existingSubscription) {
            // Extend existing subscription
            existingSubscription.plan = payment.planId;
            existingSubscription.planType = planConfig.type;
            existingSubscription.planTier = planConfig.tier;
            existingSubscription.endDate = endDate;
            existingSubscription.paymentId = razorpay_payment_id;
            await existingSubscription.save();
        } else {
            // Create new subscription
            const subscription = new Subscription({
                user: userId,
                plan: payment.planId,
                planType: planConfig.type,
                planTier: planConfig.tier,
                status: 'active',
                startDate: startDate,
                endDate: endDate,
                paymentId: razorpay_payment_id,
                autoRenew: false
            });
            await subscription.save();
        }

        // Update user's subscription status
        await User.findByIdAndUpdate(userId, {
            subscriptionPlan: payment.planId,
            subscriptionStatus: 'active',
            subscriptionEndDate: endDate
        });

        res.json({
            success: true,
            message: 'Payment verified and subscription activated',
            data: {
                subscriptionPlan: payment.planId,
                subscriptionEndDate: endDate,
                paymentId: razorpay_payment_id
            }
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment'
        });
    }
});

// Get user's payment history
router.get('/history', auth, async function(req, res) {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;

        const payments = await Payment.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-razorpaySignature -notes');

        const total = await Payment.countDocuments({ userId });

        res.json({
            success: true,
            data: {
                payments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment history'
        });
    }
});

// Get current subscription status
router.get('/subscription', auth, async function(req, res) {
    try {
        const userId = req.user._id;

        const subscription = await Subscription.findOne({
            user: userId,
            status: 'active'
        }).sort({ endDate: -1 });

        if (!subscription) {
            return res.json({
                success: true,
                data: {
                    plan: 'free',
                    status: 'active',
                    isActive: true
                }
            });
        }

        const isActive = subscription.endDate > new Date();

        res.json({
            success: true,
            data: {
                plan: subscription.plan,
                planType: subscription.planType,
                planTier: subscription.planTier,
                status: isActive ? 'active' : 'expired',
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                isActive: isActive,
                isExpiringSoon: subscription.isExpiringSoon()
            }
        });

    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription status'
        });
    }
});

// Get pricing plans
router.get('/plans', async function(req, res) {
    try {
        const { currency = 'INR' } = req.query;
        
        const plans = Object.keys(PRICING_PLANS).map(planId => {
            const plan = PRICING_PLANS[planId];
            const amount = currency === 'USD' ? plan.amountUSD : plan.amountINR;
            const displayAmount = currency === 'USD' 
                ? `$${(amount / 100).toFixed(1)}` 
                : `₹${amount / 100}`;

            return {
                id: planId,
                name: plan.name,
                amount: amount,
                displayAmount: displayAmount,
                currency: currency,
                duration: plan.duration,
                tier: plan.tier,
                type: plan.type
            };
        });

        res.json({
            success: true,
            data: { plans, currency }
        });

    } catch (error) {
        console.error('Error fetching pricing plans:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pricing plans'
        });
    }
});

module.exports = router;
