# Payment System Setup Guide

## Overview
This guide explains how to set up the complete payment system integration with Razorpay in your WealthAI1 React application.

## Prerequisites
1. Backend server running with payment integration (see backend Payment folder)
2. Razorpay account and API keys
3. React application with the required dependencies

## Setup Steps

### 1. Environment Configuration
Create a `.env` file in your React app root directory:

```env
# Payment System Configuration
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id_here
REACT_APP_RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Backend API URL
REACT_APP_API_BASE_URL=http://localhost:8000

# Environment
REACT_APP_ENVIRONMENT=development
```

### 2. Backend Server
Ensure your backend server is running with payment integration:

```bash
cd WealthAI1-Complete/wealthai1-backend-main
python start_payment_server.py
```

The server should be accessible at `http://localhost:8000`

### 3. Frontend Dependencies
The payment system uses these existing dependencies:
- `axios` - for API calls
- `react` - for components
- `tailwindcss` - for styling

### 4. Components Created
- `PaymentContext.jsx` - Payment state management
- `PaymentForm.jsx` - Payment order creation form
- `PaymentHistory.jsx` - Transaction history display
- `PaymentAnalytics.jsx` - Payment statistics and analytics
- Enhanced `PaymentPage.jsx` - Main payment page with tabs

### 5. Features
- **Create Payment**: Form to create payment orders
- **Payment History**: View all transaction history
- **Analytics**: Payment statistics and breakdowns
- **Subscription Plans**: Existing subscription management
- **Razorpay Integration**: Secure payment processing

### 6. API Endpoints Used
- `POST /api/payment/order` - Create payment order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/history` - Get payment history
- `GET /api/payment/analytics` - Get payment analytics

### 7. Testing
1. Start your backend server
2. Start your React app: `npm start`
3. Navigate to the Payment page
4. Create a test payment order
5. Complete payment via Razorpay test gateway

### 8. Security Notes
- Never expose API keys in frontend code
- Use environment variables for sensitive data
- Implement proper authentication for payment endpoints
- Use HTTPS in production

### 9. Customization
- Modify `PaymentForm.jsx` to add custom fields
- Update `PaymentContext.jsx` for different API endpoints
- Customize styling in components using Tailwind classes
- Add additional payment methods as needed

## Troubleshooting

### Common Issues
1. **Razorpay not loading**: Check if script is included in index.html
2. **API errors**: Verify backend server is running and accessible
3. **Payment failures**: Check Razorpay test keys and backend logs
4. **CORS issues**: Ensure backend CORS is configured for your frontend domain

### Debug Mode
Enable console logging in PaymentContext.jsx for debugging:
```javascript
console.log('Payment response:', response);
```

## Production Deployment
1. Update environment variables with production values
2. Use HTTPS for all payment operations
3. Implement proper error handling and logging
4. Test payment flows thoroughly
5. Monitor payment success rates and failures
