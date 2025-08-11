const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    razorpaySignature: {
        type: String,
        default: null
    },
    planId: {
        type: String,
        required: true,
        enum: ['pro_monthly', 'pro_plus_monthly', 'pro_annual', 'pro_plus_annual']
    },
    planName: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true // Amount in smallest currency unit (paise for INR, cents for USD)
    },
    currency: {
        type: String,
        required: true,
        enum: ['INR', 'USD'],
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'attempted', 'paid', 'failed', 'cancelled'],
        default: 'created'
    },
    receiptId: {
        type: String,
        required: true
    },
    notes: {
        type: Object,
        default: {}
    },
    failureReason: {
        type: String,
        default: null
    },
    paymentMethod: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    subscriptionStartDate: {
        type: Date,
        default: null
    },
    subscriptionEndDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ subscriptionEndDate: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

