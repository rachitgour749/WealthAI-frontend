import React from 'react';
import Navigation from './Navigation';
import ContactSection from './ContactSection';
import Footer from './Footer';

const ContactPage = ({ setCurrentPage }) => (
  <div className="h-screen flex flex-col overflow-hidden">
    <Navigation setCurrentPage={setCurrentPage} />
    
    {/* Main Content - Scrollable with padding for header and footer */}
    <div className="flex-1 bg-gray-50 pt-16 pb-12 sm:pb-16 overflow-y-auto">
      <ContactSection setCurrentPage={setCurrentPage} standalone={true} compact={true} />
    </div>
    
    <Footer setCurrentPage={setCurrentPage} />
  </div>
);

export default ContactPage;