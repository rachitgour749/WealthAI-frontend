// src/App.jsx
import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import WealthAI1Home from './components/WealthAI1Home';
import MarketsAI1Landing from './components/MarketsAI1Landing';
import MarketsAI1App from './components/MarketsAI1App';
import ChatAI1Landing from './components/ChatAI1Landing';
import PaperTraderAI1Landing from './components/PaperTraderAI1Landing';
import ScanAI1Landing from './components/ScanAI1Landing';
import ProductsPage from './components/ProductsPage';
import ServicesPage from './components/ServicesPage';
import FoundersPage from './components/FoundersPage';
import InsightsPage from './components/InsightsPage';
import ContactPage from './components/ContactPage';
import ProfilePage from './components/ProfilePage';
import PaymentPage from './components/PaymentPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      // Public pages - accessible without login
      case 'home':
        return <WealthAI1Home setCurrentPage={setCurrentPage} />;
      case 'contact':
        return <ContactPage setCurrentPage={setCurrentPage} />;
      case 'founders':
        return <FoundersPage setCurrentPage={setCurrentPage} />;
      case 'insights':
        return <InsightsPage setCurrentPage={setCurrentPage} />;
      case 'services':
        return <ServicesPage setCurrentPage={setCurrentPage} />;
      
      // Protected pages - require authentication
      case 'marketsai1':
        return (
          <ProtectedRoute redirectTo="/marketsai1">
            <MarketsAI1Landing setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        );
      case 'marketsai1-app':
        return (
          <ProtectedRoute redirectTo="/marketsai1-app">
            <MarketsAI1App setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        );
      case 'chatai1':
        return (
          <ProtectedRoute redirectTo="/chatai1">
            <ChatAI1Landing setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        );
      case 'papertraderai1':
        return (
          <ProtectedRoute redirectTo="/papertraderai1">
            <PaperTraderAI1Landing setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        );
      case 'scanai1':
        return (
          <ProtectedRoute redirectTo="/scanai1">
            <ScanAI1Landing setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        );
      case 'products':
        return (
          <ProtectedRoute redirectTo="/products">
            <ProductsPage setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        );
      case 'profile':
        return (
          <ProtectedRoute redirectTo="/profile">
            <ProfilePage setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        );
      case 'payment':
        return (
          <ProtectedRoute redirectTo="/payment">
            <PaymentPage setCurrentPage={setCurrentPage} />
          </ProtectedRoute>
        );
      default:
        return <WealthAI1Home setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <GoogleOAuthProvider clientId="971009763113-o9e1t4bn1ckmj7pogam984v3p2uah5ee.apps.googleusercontent.com">
      <AuthProvider>
        <div className="h-screen bg-white font-montserrat overflow-hidden">
          {renderPage()}
        </div>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;