# Razorpay Setup Guide for PixVid Pro

This guide will help you set up Razorpay payment gateway for your PixVid Pro application.

## Prerequisites

1. **Indian Business Entity**: You need a registered business in India
2. **Bank Account**: Business bank account for settlements
3. **PAN Card**: For KYC verification
4. **GST Registration**: Required for certain business types

## Step 1: Create Razorpay Account

1. Visit [https://razorpay.com](https://razorpay.com)
2. Click "Sign Up" and create an account
3. Complete your business profile
4. Submit required documents for verification

## Step 2: Get API Keys

1. Log into your Razorpay Dashboard
2. Navigate to **Settings** → **API Keys**
3. Generate your API Keys:
   - **Test Mode Keys** (for development)
   - **Live Mode Keys** (for production)

## Step 3: Update Environment Variables

Add the following to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id-here
RAZORPAY_KEY_SECRET=your-razorpay-key-secret-here
```

### For Development (Test Mode):
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your-test-secret-key
```

### For Production (Live Mode):
```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your-live-secret-key
```

## Step 4: Configure Webhooks (Optional but Recommended)

1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/payment/webhook`
3. Select events:
   - `payment.authorized`
   - `payment.failed`
   - `payment.captured`
   - `order.paid`

## Step 5: Test the Integration

1. Start your server: `npm run dev`
2. Navigate to the pricing page
3. Try subscribing to a plan
4. Use Razorpay test cards:

### Test Card Numbers:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test UPI IDs:
- **Success**: success@razorpay
- **Failure**: failure@razorpay

## Step 6: Go Live

1. Complete account verification in Razorpay Dashboard
2. Switch from Test Mode to Live Mode
3. Update environment variables with live keys
4. Test with small amounts first

## Pricing Structure

Your current pricing plans:

### Monthly Plans:
- **Pro Monthly**: ₹479 (~$6)
- **Pro+ Monthly**: ₹829 (~$10)

### Annual Plans:
- **Pro Annual**: ₹3,129 (Save 35%) (~$38)
- **Pro+ Annual**: ₹5,979 (Save 40%) (~$72)

## Features by Plan

### Pro Plans:
- Unlimited video generation
- Full HD quality (1080p)
- No watermarks
- AI prompt enhancement
- Advanced motion control
- Priority support

### Pro+ Plans:
- Everything in Pro
- 4K quality (2160p)
- Multiple reference images
- Custom audio upload
- Advanced AI effects
- Priority queue
- Bulk video processing

### Annual Plans Include:
- Extended features
- Dedicated support
- Team collaboration
- Extended video history
- Beta feature access

## Transaction Fees

### Razorpay Fees:
- **Domestic Cards**: 2% + GST
- **International Cards**: 3% + GST
- **UPI/Wallets**: 0.7% + GST
- **Net Banking**: 0.9% + GST

## Settlement

- **Domestic**: T+1 settlement (next working day)
- **International**: T+3 settlement
- **Instant Settlement**: Available for additional fee

## Support

For Razorpay specific issues:
- Email: support@razorpay.com
- Phone: +91-80-61611011
- Documentation: https://razorpay.com/docs/

For PixVid Pro integration issues:
- Check server logs for detailed error messages
- Ensure all environment variables are set correctly
- Verify webhook configurations

## Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Always verify payments** on the server side
3. **Use HTTPS** in production
4. **Implement rate limiting** for payment endpoints
5. **Log all transactions** for audit purposes

## Troubleshooting

### Common Issues:

1. **"Payment service unavailable"**
   - Check if Razorpay keys are set in environment
   - Verify API key format

2. **"Payment verification failed"**
   - Check signature verification logic
   - Ensure secret key is correct

3. **"Order creation failed"**
   - Verify plan configuration
   - Check amount format (should be in smallest currency unit)

4. **Webhook not receiving events**
   - Verify webhook URL is accessible
   - Check webhook secret configuration

### Debug Mode:

Enable detailed logging by adding to your `.env`:
```env
DEBUG_PAYMENTS=true
```

This will log all payment-related activities to help with debugging.
