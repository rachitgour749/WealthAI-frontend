import React from 'react';
import Navigation from './Navigation';
import ContactSection from './ContactSection';
import Footer from './Footer';

const ContactPage = ({ setCurrentPage, currentPage, hideHeaderFooter = false }) => (
  <div className={hideHeaderFooter ? "h-full flex flex-col" : "h-screen flex flex-col overflow-hidden"}>
    {!hideHeaderFooter && <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} />}
    
    {/* Main Content - Scrollable with padding for header and footer */}
    <div className={hideHeaderFooter ? "flex-1 bg-gray-50 py-6" : "flex-1 bg-gray-50 pt-16 pb-12 sm:pb-16 overflow-y-auto"}>
      <ContactSection setCurrentPage={setCurrentPage} standalone={true} compact={true} />
    </div>
    
    {!hideHeaderFooter && <Footer setCurrentPage={setCurrentPage} />}
  </div>
);

export default ContactPage;