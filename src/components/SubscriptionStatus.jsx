import React from 'react';
import { useSubscription } from '../context/SubscriptionContext';

const SubscriptionStatus = () => {
  const { 
    subscription, 
    productsStatus, 
    isProductActive, 
    isProductInTrial, 
    getProductAccessType, 
    getProductDaysRemaining 
  } = useSubscription();

  const productCodes = ['MARKETAI', 'CHATAI', 'TRADAI', 'AUTOMATIONAI'];

  return (
    <div className="p-4 bg-gray-100 rounded-lg m-4">
      <h3 className="text-lg font-bold mb-4">Subscription Status Debug</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Overall Subscription:</h4>
        <pre className="text-xs bg-white p-2 rounded overflow-auto">
          {JSON.stringify(subscription, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Products Status:</h4>
        <pre className="text-xs bg-white p-2 rounded overflow-auto">
          {JSON.stringify(productsStatus, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Product Access Check:</h4>
        {productCodes.map(code => (
          <div key={code} className="mb-2 p-2 bg-white rounded">
            <strong>{code}:</strong>
            <br />
            - has_access: {productsStatus[code]?.has_access ? 'true' : 'false'}
            <br />
            - access_type: {productsStatus[code]?.access_type || 'none'}
            <br />
            - days_remaining: {productsStatus[code]?.days_remaining || 0}
            <br />
            - isProductActive(): {isProductActive(code) ? 'true' : 'false'}
            <br />
            - isProductInTrial(): {isProductInTrial(code) ? 'true' : 'false'}
            <br />
            - getProductAccessType(): {getProductAccessType(code)}
            <br />
            - getProductDaysRemaining(): {getProductDaysRemaining(code)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionStatus;
