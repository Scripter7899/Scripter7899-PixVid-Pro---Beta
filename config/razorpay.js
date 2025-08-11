const Razorpay = require('razorpay');

// Razorpay instance
let razorpayInstance = null;

function initializeRazorpay() {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        console.warn('⚠️  Razorpay credentials not found in environment variables');
        console.warn('⚠️  Payment functionality will not be available');
        return null;
    }
    
    try {
        razorpayInstance = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET,
        });
        
        console.log('✅ Razorpay configured successfully');
        return razorpayInstance;
    } catch (error) {
        console.error('❌ Failed to initialize Razorpay:', error);
        return null;
    }
}

function getRazorpayInstance() {
    if (!razorpayInstance) {
        razorpayInstance = initializeRazorpay();
    }
    return razorpayInstance;
}

module.exports = {
    initializeRazorpay,
    getRazorpayInstance
};

