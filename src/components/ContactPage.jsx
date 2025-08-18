import React from 'react';
import Navigation from './Navigation';
import ContactSection from './ContactSection';
import Footer from './Footer';

const ContactPage = ({ setCurrentPage }) => (
  <div>
    <Navigation setCurrentPage={setCurrentPage} />
    <div className="pt-16 min-h-screen bg-gray-50">
      <ContactSection setCurrentPage={setCurrentPage} standalone={true} />
    </div>
    <Footer setCurrentPage={setCurrentPage} />
  </div>
);

export default ContactPage;