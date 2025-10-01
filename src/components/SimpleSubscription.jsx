import React, { useEffect, useState } from 'react';

const SimpleSubscription = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Component mounted');
    console.log('Zoho script available:', !!window.ZohoWidgets);
    console.log('Script in DOM:', !!document.querySelector('script[src*="ZohoWidgets.js"]'));
    
    // Try to load the script if it's not available
    const loadZohoScript = () => {
      if (window.ZohoWidgets) {
        console.log('ZohoWidgets already available');
        setLoading(false);
        return;
      }

      // Check if script exists in DOM
      if (!document.querySelector('script[src*="ZohoWidgets.js"]')) {
        console.log('Loading Zoho script...');
        const script = document.createElement('script');
        script.src = 'https://js.zohostatic.com/zoho-widgets/v1/ZohoWidgets.js';
        script.async = true;
        script.onload = () => {
          console.log('Zoho script loaded successfully');
          // Wait a bit for initialization
          setTimeout(() => {
            console.log('ZohoWidgets after load:', !!window.ZohoWidgets);
            if (window.ZohoWidgets && window.ZohoWidgets.init) {
              console.log('Initializing ZohoWidgets...');
              window.ZohoWidgets.init();
            }
            setLoading(false);
          }, 1000);
        };
        script.onerror = () => {
          console.error('Failed to load Zoho script');
          setLoading(false);
        };
        document.head.appendChild(script);
      } else {
        console.log('Script exists, waiting for initialization...');
        // Script exists but ZohoWidgets not available yet
        const checkInterval = setInterval(() => {
          if (window.ZohoWidgets) {
            console.log('ZohoWidgets became available');
            clearInterval(checkInterval);
            setLoading(false);
          }
        }, 100);
        
        // Clear interval after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          setLoading(false);
        }, 10000);
      }
    };

    loadZohoScript();
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '500px' }}>
      <h1 style={{ color: 'black', textAlign: 'center', marginBottom: '20px' }}>
        Choose Your Plan
      </h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        border: '2px solid #ccc',
        minHeight: '400px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div 
          id="zf-widget-root-id-3ci321w2g"
          data-pricing-table="true"
          data-digest="2-f6d7d76394615324512bf09531b89abe02c90b7e6e2f25881839d40ce063bf28c7964d874c3812d3b737c2b253195bdf0d92a6b786b94127b193a337fe627a18"
          data-product_url="https://billing.zoho.in"
          style={{ 
            width: '100%', 
            minHeight: '400px',
            backgroundColor: '#f9f9f9',
            border: '1px dashed #999',
            borderRadius: '4px'
          }}
        >
          {loading ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '400px',
              color: '#666',
              flexDirection: 'column'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '10px'
              }}></div>
              <p>Loading payment options...</p>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '400px',
              color: '#666'
            }}>
              Payment widget should appear here
            </div>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
        <p>Secure payment processing powered by Zoho</p>
        <button 
          onClick={() => {
            console.log('Manual test - ZohoWidgets:', !!window.ZohoWidgets);
            console.log('Script in DOM:', !!document.querySelector('script[src*="ZohoWidgets.js"]'));
            // Try to fetch the script URL
            fetch('https://js.zohostatic.com/zoho-widgets/v1/ZohoWidgets.js')
              .then(response => {
                console.log('Script URL response:', response.status);
                if (response.ok) {
                  console.log('Script URL is accessible');
                } else {
                  console.log('Script URL returned error:', response.status);
                }
              })
              .catch(error => {
                console.error('Script URL fetch error:', error);
              });
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Test Zoho Script
        </button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SimpleSubscription;
