import React, { useState } from 'react';
import useProductAccess from '../hooks/useProductAccess';
import PaymentPopup from './Payments/PaymentPopup';

const ProductAccessExample = ({ productCode, productName }) => {
  const { handleProductClick, isCheckingAccess } = useProductAccess();
  const [showPayment, setShowPayment] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialProduct, setTrialProduct] = useState(null);

  const handleProductClick = async () => {
    const result = await handleProductClick(
      productCode,
      productName,
      () => setShowPayment(true), // Show payment popup
      (code, name) => { // Show trial modal
        setTrialProduct({ code, name });
        setShowTrialModal(true);
      }
    );

    if (result.success) {
      // User has access, proceed to product
      console.log('User has access to product');
      // Navigate to product or show product interface
    } else {
      console.log('Action required:', result.action);
    }
  };

  return (
    <div>
      <button
        onClick={handleProductClick}
        disabled={isCheckingAccess}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isCheckingAccess ? 'Checking...' : `Access ${productName}`}
      </button>

      {/* Payment Popup */}
      {showPayment && (
        <PaymentPopup
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
        />
      )}

      {/* Trial Modal would be handled by PaymentPopup */}
    </div>
  );
};

export default ProductAccessExample;
