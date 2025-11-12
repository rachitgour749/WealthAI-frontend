// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';

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
import ProductsPage from './components/ProductsPage';
import ServicesPage from './components/ServicesPage';
import FoundersPage from './components/FoundersPage';
import InsightsPage from './components/InsightsPage';
import ContactPage from './components/ContactPage';
import ProfilePage from './components/ProfilePage';

import Login from './components/Login';
import 'antd/dist/reset.css';
import Policies from './pages/Policies';
import TermsConditions from './pages/TermsConditions';
import RefundPolicy from './pages/RefundPolicy';
import WealthAIAutomations from './components/AutomationAI/WealthAIAutomations';
import Breadcrumb from './components/Breadcrumb';

// Main App Component with routing
const MainApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState(['home']);
  const [marketsAIResetKey, setMarketsAIResetKey] = useState(0);

  console.log('currentPage', currentPage);

  // Handle page navigation with breadcrumb updates
  const handlePageChange = (newPage, subPage = null) => {
    setCurrentPage(newPage);

    // Don't update breadcrumb for tradeai1 since it opens in a new tab
    if (newPage === 'tradeai1') {
      return;
    }

    // Define main pages (top-level destinations)
    const mainPages = ['home', 'marketsai1-app', 'chatai1', 'papertraderai1', 'scanai1', 'automationai', 'products', 'services', 'founders', 'insights', 'contact', 'profile'];

    // Update breadcrumb path
    setBreadcrumbPath(prev => {
      // Filter out tradeai1 from previous path
      const filteredPrev = prev.filter(p => p !== 'tradeai1');
      
      // Always reset to just Home on home navigation
      if (newPage === 'home') {
        return ['home'];
      }

      // If navigating to another main page directly (no subPage), show Home → [page]
      if (!subPage && mainPages.includes(newPage)) {
        return ['home', newPage];
      }

      // For sub-pages, anchor under the last main page (or the newPage if it is main)
      const lastMainPageIndex = [...filteredPrev].findLastIndex(p => mainPages.includes(p));
      const base = lastMainPageIndex !== -1 ? filteredPrev.slice(0, lastMainPageIndex + 1) : ['home'];
      const ensureBase = mainPages.includes(newPage) ? ['home', newPage] : base;

      if (subPage) {
        return [...ensureBase, subPage];
      }

      // Fallback: Home → newPage
      return ['home', newPage];
    });
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbNavigation = (page) => {
    console.log('Breadcrumb navigation clicked:', page);
    console.log('Current page before navigation:', currentPage);
    console.log('Current breadcrumb path before navigation:', breadcrumbPath);
    
    // Special handling for MarketsAI navigation
    if (page === 'marketsai1' || page === 'marketsai1-app') {
      console.log('Navigating to MarketsAI app page...');
      // If clicking on MarketsAI from breadcrumb, go to MarketsAI app page and reset to default view
      setCurrentPage('marketsai1-app');
      setBreadcrumbPath(['home', 'marketsai1-app']);
      // Trigger a re-render with a key change to reset MarketsAI1App state
      setMarketsAIResetKey(prev => prev + 1);
      console.log('MarketsAI navigation completed');
      return;
    }
    
    console.log('Regular navigation to:', page);
    setCurrentPage(page);
    
    // Update breadcrumb to show path up to clicked page
    setBreadcrumbPath(prev => {
      const clickedIndex = prev.indexOf(page);
      console.log('Clicked index:', clickedIndex, 'Previous path:', prev);
      return prev.slice(0, clickedIndex + 1);
    });
  };

  // Handle sub-page navigation (for internal app navigation)
  const handleSubPageChange = (subPage) => {
    setBreadcrumbPath(prev => {
      // If subPage is 'default', remove the last sub-page from breadcrumb
      if (subPage === 'default') {
        const mainPages = ['home', 'marketsai1-app', 'chatai1', 'papertraderai1', 'scanai1', 'automationai', 'products', 'services', 'founders', 'insights', 'contact', 'profile'];
        const lastMainPageIndex = prev.findLastIndex(page => mainPages.includes(page));
        if (lastMainPageIndex !== -1) {
          return prev.slice(0, lastMainPageIndex + 1);
        }
        return prev;
      }
      
      // Find the last main page in the path
      const mainPages = ['home', 'marketsai1-app', 'chatai1', 'papertraderai1', 'scanai1', 'automationai', 'products', 'services', 'founders', 'insights', 'contact', 'profile'];
      const lastMainPageIndex = prev.findLastIndex(page => mainPages.includes(page));
      
      if (lastMainPageIndex !== -1) {
        // Keep everything up to the last main page, then add the sub-page
        return [...prev.slice(0, lastMainPageIndex + 1), subPage];
      }
      
      // If no main page found, just add the sub-page
      return [...prev, subPage];
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      // Public pages - accessible without login
      case 'home':
        return <WealthAI1Home setCurrentPage={handlePageChange} currentPage={currentPage} hideHeaderFooter={true} />;
      case 'contact':
        return <ContactPage setCurrentPage={handlePageChange} currentPage={currentPage} hideHeaderFooter={true} />;
      case 'founders':
        return <FoundersPage setCurrentPage={handlePageChange} currentPage={currentPage} hideHeaderFooter={true} />;
      case 'insights':
        return <InsightsPage setCurrentPage={handlePageChange} currentPage={currentPage} hideHeaderFooter={true} />;
      case 'services':
        return <ServicesPage setCurrentPage={handlePageChange} currentPage={currentPage} hideHeaderFooter={true} />;
      
      // Protected pages - require authentication
      case 'marketsai1-app':
        return (
          <ProtectedRoute redirectTo="/marketsai1-app" setCurrentPage={handlePageChange}>
            <MarketsAI1App 
              key={marketsAIResetKey}
              setCurrentPage={handlePageChange} 
              currentPage={currentPage} 
              hideHeaderFooter={true}
              onSubPageChange={handleSubPageChange}
            />
          </ProtectedRoute>
        );
      case 'chatai1':
        return (
          <ProtectedRoute redirectTo="/chatai1" setCurrentPage={handlePageChange}>
            <ChatAI1Landing setCurrentPage={handlePageChange} currentPage={currentPage} hideHeaderFooter={true} />
          </ProtectedRoute>
        );
      case 'papertraderai1':
        return (
          <ProtectedRoute redirectTo="/papertraderai1" setCurrentPage={handlePageChange}>
            <PaperTraderAI1Landing setCurrentPage={handlePageChange} currentPage={currentPage} hideHeaderFooter={true} />
          </ProtectedRoute>
        );
      case 'automation':
      case 'automationai':
        return <WealthAIAutomations setCurrentPage={handlePageChange} currentPage={currentPage} hideHeaderFooter={true} />;
      case 'products':
        return (
          <ProtectedRoute redirectTo="/products" setCurrentPage={handlePageChange}>
            <ProductsPage setCurrentPage={handlePageChange} currentPage={currentPage} hideHeaderFooter={true} />
          </ProtectedRoute>
        );
      case 'profile':
        return (
          <ProtectedRoute redirectTo="/profile" setCurrentPage={handlePageChange}>
            <ProfilePage setCurrentPage={handlePageChange} currentPage={currentPage} hideHeaderFooter={true} />
          </ProtectedRoute>
        );
      default:
        return <WealthAI1Home setCurrentPage={handlePageChange} hideHeaderFooter={true} />;
    }
  };

  return (
    <GoogleOAuthProvider clientId="971009763113-o9e1t4bn1ckmj7pogam984v3p2uah5ee.apps.googleusercontent.com">
      <ApiProvider>
        <AuthProvider>
          <SubscriptionProvider>
            
              <div className="min-h-screen bg-white font-montserrat overflow-hidden flex flex-col">
                {/* Static Navigation Header - Fixed at top */}
                <div className="fixed top-0 left-0 right-0 z-50">
                  <Navigation 
                    setCurrentPage={handlePageChange} 
                    currentPage={currentPage} 
                    showLoginModal={showLoginModal}
                    setShowLoginModal={setShowLoginModal}
                  />
                </div>
                
                {/* Breadcrumb Navigation - Below header */}
                <div className="fixed top-20 left-0 right-0 z-40 bg-white/70 backdrop-blur-sm">
                  <Breadcrumb 
                    breadcrumbPath={breadcrumbPath}
                    onNavigate={handleBreadcrumbNavigation}
                  />
                </div>
                
                {/* Main Content Area - Scrollable between header and footer */}
                <main 
                  className="flex-1 overflow-y-auto" 
                  style={{ 
                    marginTop: '110px', // Increased to account for breadcrumb
                    marginBottom: '64px',
                    minHeight: 'calc(100vh - 184px)'
                  }}
                >
                  {renderPage()}
                </main>
                
                {/* Footer - Static on home; hover-reveal on other pages */}
                <div className="fixed bottom-0 left-0 right-0 z-50">
                  <Footer setCurrentPage={setCurrentPage} isHome={currentPage === 'home'} />
                </div>
                
                {/* Login Modal */}
                {showLoginModal && (
                  <Login 
                    onClose={() => setShowLoginModal(false)} 
                    isOpen={showLoginModal}
                  />
                )}
              </div>
            
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
      </Routes>
    </BrowserRouter>
  );
};

export default App;