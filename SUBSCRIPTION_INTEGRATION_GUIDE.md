# Subscription & Trial Management Integration Guide

## Overview
This implementation provides a complete subscription and trial management system with the following features:

1. **Automatic subscription creation** for first-time users with 30-day free trial
2. **Product-specific trial enablement** - users can enable trials for individual products
3. **Access control** - checks trial status and product access before allowing access
4. **Payment integration** - redirects to payment when trial expires or no subscription

## Key Components

### 1. SubscriptionService (`src/services/subscriptionService.js`)
Handles all API calls to your backend:
- `getSubscriptionStatus(email)` - Get user's subscription status
- `createSubscription(userData)` - Create new subscription for first-time user
- `getAllProductsStatus(email)` - Get status of all products for user
- `enableProductTrial(email, productCode)` - Enable trial for specific product
- `checkProductAccess(email, productCode)` - Check if user has access to product

### 2. SubscriptionContext (`src/context/SubscriptionContext.jsx`)
Manages subscription state across the app:
- Automatically loads subscription data when user logs in
- Provides methods to enable trials and check access
- Handles trial status calculations

### 3. TrialEnableModal (`src/components/TrialEnableModal.jsx`)
Modal component for enabling product trials:
- Shows when user has active trial but product not enabled
- Allows user to enable trial for specific product
- Handles API calls and error states

### 4. useProductAccess Hook (`src/hooks/useProductAccess.js`)
Custom hook for product access logic:
- `handleProductClick()` - Main function to handle product clicks
- Checks trial status and product access
- Shows appropriate modal (trial or payment) based on status

## Integration Steps

### 1. Update Your Login Process
When a user successfully logs in for the first time, the system will automatically:
- Create a subscription with 30-day trial
- Set all products as inactive initially
- Load subscription data into context

### 2. Add Product Access Checks
For any product component, use the `useProductAccess` hook:

```jsx
import useProductAccess from '../hooks/useProductAccess';

const YourProductComponent = () => {
  const { handleProductClick, isCheckingAccess } = useProductAccess();
  const [showPayment, setShowPayment] = useState(false);

  const handleClick = async () => {
    await handleProductClick(
      'market_ai', // product code
      'Market AI', // product name
      () => setShowPayment(true), // show payment callback
      (code, name) => { /* show trial modal callback */ }
    );
  };

  return (
    <button onClick={handleClick} disabled={isCheckingAccess}>
      Access Market AI
    </button>
  );
};
```

### 3. Product Codes
Use these product codes in your API calls:
- `market_ai` - Market AI
- `chat_ai` - Chat AI  
- `automation_ai` - Automation AI
- `trade_ai` - Trade AI
- `wealth_ai_combo` - WealthAI Combo

## User Flow

### First-Time User
1. User logs in → Subscription automatically created with 30-day trial
2. User clicks on Market AI → Trial enablement modal appears
3. User enables trial → Product becomes active
4. User can access Market AI features

### Existing User with Active Trial
1. User clicks on new product → Trial enablement modal appears
2. User enables trial → Product becomes active
3. User can access product features

### Trial Expired User
1. User clicks on any product → Payment popup appears
2. User subscribes → All products become active
3. User can access all features

## API Endpoints Required

Your backend should implement these endpoints:
- `GET /api/subscription/status-simple/{email}` - Get subscription status
- `POST /api/subscription/create-simple` - Create subscription
- `GET /api/subscription/product/status-simple/{email}` - Get products status
- `POST /api/subscription/product/enable-trial-simple/{email}/{product_code}` - Enable trial
- `GET /api/subscription/product/access-simple/{email}/{product_code}` - Check access

## Testing

1. **Test first-time user flow:**
   - Create new user account
   - Verify subscription is created automatically
   - Click on product and verify trial modal appears

2. **Test trial enablement:**
   - Enable trial for one product
   - Verify product becomes active
   - Try accessing other products (should show trial modal)

3. **Test trial expiration:**
   - Simulate trial expiration in backend
   - Verify payment popup appears when accessing products

## Customization

### Modify Trial Duration
Update the trial duration in your backend API when creating subscriptions.

### Add More Products
1. Add product code to the product map in `PaymentPopup.jsx`
2. Add product name to the title function
3. Update your backend to handle the new product code

### Customize Modals
Modify `TrialEnableModal.jsx` to match your design system and add any additional features.

## Error Handling

The system includes comprehensive error handling:
- API call failures are caught and logged
- User-friendly error messages are displayed
- Fallback states for network issues
- Loading states during API calls

## Security Notes

- All API calls include user email validation
- Subscription data is stored in context, not localStorage
- Trial status is verified on each product access attempt
- Payment popup only shows when trial is expired or no subscription exists
