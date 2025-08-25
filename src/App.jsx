// src/App.jsx
import React, { useState } from 'react';
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

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <WealthAI1Home setCurrentPage={setCurrentPage} setIsAuthenticated={setIsAuthenticated} />;
      case 'marketsai1':
        return <MarketsAI1Landing setCurrentPage={setCurrentPage} setIsAuthenticated={setIsAuthenticated} />;
      case 'marketsai1-app':
        return isAuthenticated ? <MarketsAI1App setCurrentPage={setCurrentPage} /> : <MarketsAI1Landing setCurrentPage={setCurrentPage} setIsAuthenticated={setIsAuthenticated} />;
      case 'chatai1':
        return <ChatAI1Landing setCurrentPage={setCurrentPage} />;
      case 'papertraderai1':
        return <PaperTraderAI1Landing setCurrentPage={setCurrentPage} />;
      case 'scanai1':
        return <ScanAI1Landing setCurrentPage={setCurrentPage} />;
      case 'products':
        return <ProductsPage setCurrentPage={setCurrentPage} setIsAuthenticated={setIsAuthenticated} />;
      case 'services':
        return <ServicesPage setCurrentPage={setCurrentPage} />;
      case 'founders':
        return <FoundersPage setCurrentPage={setCurrentPage} />;
      case 'insights':
        return <InsightsPage setCurrentPage={setCurrentPage} />;
      case 'contact':
        return <ContactPage setCurrentPage={setCurrentPage} />;
      default:
        return <WealthAI1Home setCurrentPage={setCurrentPage} setIsAuthenticated={setIsAuthenticated} />;
    }
  };

  return (
    <div className="h-screen bg-white font-montserrat overflow-hidden">
      {renderPage()}
    </div>
  );
};

export default App;