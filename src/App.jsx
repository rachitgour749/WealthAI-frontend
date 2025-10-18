// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { PaymentProvider } from './context/PaymentContext';
import { ApiProvider } from './context/ApiContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
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
import Login from './components/Login';
import 'antd/dist/reset.css';
import Policies from './pages/Policies';
import TermsConditions from './pages/TermsConditions';
import RefundPolicy from './pages/RefundPolicy';
import WealthAIAutomations from './components/AutomationAI/WealthAIAutomations';

// Main App Component with routing
const MainApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showLoginModal, setShowLoginModal] = useState(false);

  console.log('currentPage', currentPage);

  const renderPage = () => {
    switch (currentPage) {
      // Public pages - accessible without login
      case 'home':
        return <WealthAI1Home setCurrentPage={setCurrentPage} currentPage={currentPage} hideHeaderFooter={true} />;
      case 'contact':
        return <ContactPage setCurrentPage={setCurrentPage} currentPage={currentPage} hideHeaderFooter={true} />;
      case 'founders':
        return <FoundersPage setCurrentPage={setCurrentPage} currentPage={currentPage} hideHeaderFooter={true} />;
      case 'insights':
        return <InsightsPage setCurrentPage={setCurrentPage} currentPage={currentPage} hideHeaderFooter={true} />;
      case 'services':
        return <ServicesPage setCurrentPage={setCurrentPage} currentPage={currentPage} hideHeaderFooter={true} />;
      
      // Protected pages - require authentication
      case 'marketsai1':
        return (
          <ProtectedRoute redirectTo="/marketsai1" setCurrentPage={setCurrentPage}>
            <MarketsAI1Landing setCurrentPage={setCurrentPage} currentPage={currentPage} hideHeaderFooter={true} />
          </ProtectedRoute>
        );
      case 'marketsai1-app':
        return (
          <ProtectedRoute redirectTo="/marketsai1-app" setCurrentPage={setCurrentPage}>
            <MarketsAI1App setCurrentPage={setCurrentPage} currentPage={currentPage} hideHeaderFooter={true} />
          </ProtectedRoute>
        );
      case 'chatai1':
        return (
          <ProtectedRoute redirectTo="/chatai1" setCurrentPage={setCurrentPage}>
            <ChatAI1Landing setCurrentPage={setCurrentPage} currentPage={currentPage} hideHeaderFooter={true} />
          </ProtectedRoute>
        );
      case 'papertraderai1':
        return (
          <ProtectedRoute redirectTo="/papertraderai1" setCurrentPage={setCurrentPage}>
            <PaperTraderAI1Landing setCurrentPage={setCurrentPage} currentPage={currentPage} hideHeaderFooter={true} />
          </ProtectedRoute>
        );
      case 'automation':
        return (
          <ProtectedRoute redirectTo="/automation" setCurrentPage={setCurrentPage}>
            <WealthAIAutomations setCurrentPage={setCurrentPage} currentPage={currentPage} hideHeaderFooter={true} />
          </ProtectedRoute>
        );
      case 'products':
        return (
          <ProtectedRoute redirectTo="/products" setCurrentPage={setCurrentPage}>
            <ProductsPage setCurrentPage={setCurrentPage} currentPage={currentPage} hideHeaderFooter={true} />
          </ProtectedRoute>
        );
      case 'profile':
        return (
          <ProtectedRoute redirectTo="/profile" setCurrentPage={setCurrentPage}>
            <ProfilePage setCurrentPage={setCurrentPage} currentPage={currentPage} hideHeaderFooter={true} />
          </ProtectedRoute>
        );
      case 'payment':
        return (
          <ProtectedRoute redirectTo="/payment" setCurrentPage={setCurrentPage}>
            <PaymentPage setCurrentPage={setCurrentPage} currentPage={currentPage} hideHeaderFooter={true} />
          </ProtectedRoute>
        );
      default:
        return <WealthAI1Home setCurrentPage={setCurrentPage} hideHeaderFooter={true} />;
    }
  };

  return (
    <GoogleOAuthProvider clientId="971009763113-o9e1t4bn1ckmj7pogam984v3p2uah5ee.apps.googleusercontent.com">
      <ApiProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <PaymentProvider>
              <div className="min-h-screen bg-white font-montserrat overflow-hidden flex flex-col">
                {/* Static Navigation Header - Fixed at top */}
                <div className="fixed top-0 left-0 right-0 z-50">
                  <Navigation 
                    setCurrentPage={setCurrentPage} 
                    currentPage={currentPage} 
                    showLoginModal={showLoginModal}
                    setShowLoginModal={setShowLoginModal}
                  />
                </div>
                
                {/* Main Content Area - Scrollable between header and footer */}
                <main 
                  className="flex-1 overflow-y-auto" 
                  style={{ 
                    marginTop: '80px', 
                    marginBottom: currentPage === 'home' ? '64px' : '0px',
                    minHeight: currentPage === 'home' ? 'calc(100vh - 144px)' : 'calc(100vh - 80px)'
                  }}
                >
                  {renderPage()}
                </main>
                
                {/* Static Footer - Fixed at bottom - Only show on home page */}
                {currentPage === 'home' && (
                  <div className="fixed bottom-0 left-0 right-0 z-50">
                    <Footer setCurrentPage={setCurrentPage} />
                  </div>
                )}
                
                {/* Login Modal */}
                {showLoginModal && (
                  <Login 
                    onClose={() => setShowLoginModal(false)} 
                    isOpen={showLoginModal}
                  />
                )}
              </div>
            </PaymentProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ApiProvider>
    </GoogleOAuthProvider>
  );
};

// Root App Component with BrowserRouter
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main app route */}
        <Route path="/" element={<MainApp />} />
        {/* Public policies pages - accessible without authentication */}
        <Route path="/policies" element={<Policies />} />
        <Route path="/terms_of_service" element={<TermsConditions />} />
        <Route path="/refund_policy" element={<RefundPolicy />} />
        <Route path="/automationai" element={<WealthAIAutomations />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;