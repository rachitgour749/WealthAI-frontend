import React, { useEffect, useRef, useState } from 'react';

const Subscription = () => {
  const widgetRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadZohoWidget = () => {
      try {
        // Check if script already exists
        const existingScript = document.querySelector('script[src="https://js.zohostatic.com/books/zfwidgets/assets/js/zf-widget.js"]');
        
        if (existingScript) {
          console.log('Zoho script already loaded');
        setIsLoading(false);
        return;
      }

        // Create and load the script
      const script = document.createElement('script');
      script.src = 'https://js.zohostatic.com/books/zfwidgets/assets/js/zf-widget.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Zoho widget script loaded successfully');
          if (isMounted) {
              setIsLoading(false);
          }
      };
      
      script.onerror = () => {
          console.error('Failed to load Zoho widget script');
          if (isMounted) {
            setError('Failed to load pricing widget');
        setIsLoading(false);
          }
      };
      
      document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading Zoho widget:', err);
        if (isMounted) {
          setError('Failed to initialize widget');
          setIsLoading(false);
        }
      }
    };

    // Load the widget
    loadZohoWidget();

    // Cleanup
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Reload the page to retry
    window.location.reload();
  };

  if (error) {
    return (
      <div style={{ 
        padding: '24px',
        textAlign: 'center',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '24px'
      }}>
        <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Unable to Load Pricing</h3>
        <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>
        <button 
          onClick={handleRetry}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="zoho-widget-container">
      <div
        ref={widgetRef}
        id="zf-widget-root-id-3ci321w2g"
        data-pricing-table="true"
        data-digest="2-f6d7d76394615324512bf09531b89abe02c90b7e6e2f25881839d40ce063bf28c7964d874c3812d3b737c2b253195bdf0d92a6b786b94127b193a337fe627a18"
        data-product_url="https://billing.zoho.in"
        className="zoho-pricing-widget min-h-[200px]"
      >
        {/* Loading placeholder - will be hidden once widget loads */}
        {isLoading && (
          <div className="loading-placeholder text-center p-8">
            <div className="animate-pulse space-y-4">
              {/* Simulate pricing table structure */}
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-gray-100 rounded-lg p-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <div className="inline-flex items-center space-x-2 text-gray-500">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Loading pricing information...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Optional: Create a wrapper component with additional props for customization
export const ZohoPricingWidgetWrapper = ({ 
  className = "", 
  loadingText = "Loading pricing information...",
  errorText = "Unable to load pricing widget",
  onLoad,
  onError 
}) => {
  return (
    <div className={`zoho-pricing-wrapper ${className}`}>
      <Subscription />
    </div>
  );
};

export default Subscription;