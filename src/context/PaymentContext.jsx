import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentAnalytics, setPaymentAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API base URL - adjust this to match your backend
  const API_BASE_URL = 'http://localhost:8000/api/payment/api/payment';

  // Load payment history
  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/history?limit=50`);
      setPaymentHistory(response.data.history || []);
    } catch (err) {
      console.error('Error loading payment history:', err);
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  // Load payment analytics
  const loadPaymentAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/analytics?period=monthly`);
      setPaymentAnalytics(response.data || {});
    } catch (err) {
      console.error('Error loading payment analytics:', err);
      setError('Failed to load payment analytics');
    } finally {
      setLoading(false);
    }
  };

  // Create payment order
  const createPaymentOrder = async (orderData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/order`, orderData);
      return response.data;
    } catch (err) {
      console.error('Error creating payment order:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to create payment order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verify payment
  const verifyPayment = async (verificationData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/verify`, verificationData);
      return response.data;
    } catch (err) {
      console.error('Error verifying payment:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to verify payment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Razorpay
  const initializeRazorpay = (order, onSuccess, onFailure) => {
    if (!window.Razorpay) {
      setError('Razorpay SDK not loaded');
      return;
    }

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_RCG1Ab7k1DAxkN',
      amount: order.amount,
      currency: order.currency,
      name: 'WealthAI1',
      description: 'Premium Subscription',
      order_id: order.id,
      handler: onSuccess,
      prefill: {
        name: order.customer?.name || '',
        email: order.customer?.email || '',
        contact: order.customer?.contact || ''
      },
      theme: {
        color: '#1e40af'
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal closed');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      console.error('Payment failed:', response.error);
      onFailure(response.error);
    });

    rzp.open();
  };

  // Process payment
  const processPayment = async (orderData, onSuccess, onFailure) => {
    try {
      // Create order
      const order = await createPaymentOrder(orderData);
      
      // Initialize Razorpay
      initializeRazorpay(order, onSuccess, onFailure);
      
      return order;
    } catch (err) {
      onFailure(err.message);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Load initial data
  useEffect(() => {
    loadPaymentHistory();
    loadPaymentAnalytics();
  }, []);

  const value = {
    paymentHistory,
    paymentAnalytics,
    loading,
    error,
    createPaymentOrder,
    verifyPayment,
    processPayment,
    loadPaymentHistory,
    loadPaymentAnalytics,
    clearError
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
