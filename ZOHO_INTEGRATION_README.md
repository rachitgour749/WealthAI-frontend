# Zoho Payment Widget Integration

## Overview
This project includes a professional React integration for Zoho's payment widget, providing secure payment processing with proper error handling, loading states, and memory management.

## Components

### 1. ZohoPaymentWidget (`src/components/ZohoPaymentWidget.jsx`)
A reusable React component that wraps the Zoho payment widget with:
- Loading states with animated spinners
- Error handling with retry functionality
- Proper cleanup to prevent memory leaks
- Responsive design with Tailwind CSS
- Security indicators and status badges

### 2. Subscription (`src/components/subscription.jsx`)
The main subscription page component that:
- Uses the ZohoPaymentWidget component
- Handles payment success/error callbacks
- Displays payment status messages
- Shows additional information cards
- Provides a complete user experience

### 3. useZohoWidget Hook (`src/hooks/useZohoWidget.js`)
A custom React hook that manages:
- Script loading and cleanup
- Widget initialization
- Event listeners
- Error states and retry logic
- Memory leak prevention

## Features

### ✅ Professional Implementation
- **Proper Script Management**: Dynamically loads Zoho script with error handling
- **Memory Leak Prevention**: Automatic cleanup on component unmount
- **Error Handling**: Comprehensive error states with retry functionality
- **Loading States**: Beautiful loading animations with progress indicators
- **Event Management**: Proper event listener setup and cleanup

### ✅ User Experience
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Visual Feedback**: Status indicators and success/error messages
- **Security Badges**: Trust indicators for secure payments
- **Smooth Animations**: Professional loading and transition effects

### ✅ Developer Experience
- **TypeScript-style Documentation**: Comprehensive JSDoc comments
- **Reusable Components**: Modular design for easy reuse
- **Custom Hooks**: Separation of concerns with useZohoWidget
- **Error Logging**: Detailed console logging for debugging
- **Clean Code**: Well-structured, maintainable codebase

## Usage

### Basic Usage
```jsx
import ZohoPaymentWidget from './components/ZohoPaymentWidget';

function PaymentPage() {
  const handleSuccess = (event) => {
    console.log('Payment successful:', event);
  };

  const handleError = (event) => {
    console.error('Payment failed:', event);
  };

  return (
    <ZohoPaymentWidget
      widgetId="your-widget-id"
      pricingTable={true}
      digest="your-digest"
      productUrl="https://billing.zoho.in"
      onPaymentSuccess={handleSuccess}
      onPaymentError={handleError}
    />
  );
}
```

### Using the Custom Hook
```jsx
import { useZohoWidget } from './hooks/useZohoWidget';

function CustomPaymentComponent() {
  const { widgetRef, loading, error, retry } = useZohoWidget({
    widgetId: "your-widget-id",
    onSuccess: (event) => console.log('Success:', event),
    onError: (event) => console.error('Error:', event)
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div ref={widgetRef} />;
}
```

## Configuration

### Widget Props
- `widgetId`: Unique identifier for the widget
- `pricingTable`: Boolean to enable pricing table display
- `digest`: Security digest from Zoho
- `productUrl`: Zoho billing URL
- `onPaymentSuccess`: Callback for successful payments
- `onPaymentError`: Callback for payment errors
- `className`: Additional CSS classes
- `style`: Inline styles

### Environment Variables
The widget uses the following configuration:
```javascript
const defaultConfig = {
  widgetId: "zf-widget-root-id-3ci321w2g",
  pricingTable: true,
  digest: "2-f6d7d76394615324512bf09531b89abe02c90b7e6e2f25881839d40ce063bf28c7964d874c3812d3b737c2b253195bdf0d92a6b786b94127b193a337fe627a18",
  productUrl: "https://billing.zoho.in"
};
```

## Integration Steps

1. **Copy the components** to your React project
2. **Install dependencies**: `react-icons` for icons
3. **Import and use** the ZohoPaymentWidget component
4. **Configure** your Zoho widget settings
5. **Handle callbacks** for payment success/error events

## Error Handling

The integration includes comprehensive error handling:
- Script loading failures
- Widget initialization errors
- Payment processing errors
- Network connectivity issues
- Automatic retry functionality

## Security Features

- **Secure Script Loading**: HTTPS-only script loading
- **Input Validation**: Proper data attribute validation
- **Event Security**: Secure event listener management
- **Memory Safety**: Proper cleanup prevents memory leaks

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance

- **Lazy Loading**: Script loads only when needed
- **Memory Efficient**: Proper cleanup prevents leaks
- **Fast Rendering**: Optimized React patterns
- **Minimal Bundle**: No unnecessary dependencies

## Troubleshooting

### Common Issues

1. **Widget not loading**
   - Check network connectivity
   - Verify widget ID and digest
   - Check browser console for errors

2. **Script loading errors**
   - Ensure HTTPS is enabled
   - Check Zoho script URL accessibility
   - Verify no ad blockers are interfering

3. **Payment events not firing**
   - Check event listener setup
   - Verify callback functions are defined
   - Check Zoho widget configuration

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('zoho-widget-debug', 'true');
```

## Contributing

When modifying the integration:
1. Maintain backward compatibility
2. Add proper error handling
3. Update documentation
4. Test across different browsers
5. Ensure memory leak prevention

## License

This integration is part of the WealthAI project and follows the same licensing terms.
