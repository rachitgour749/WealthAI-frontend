import React, { useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import AIAssistant from '../pages/AIAssistant/AIAssistant';

const ChatAI1Landing = ({ setCurrentPage, currentPage }) => {

  const showChat = true;





  if (showChat) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} transparent={false} />
        <div className="flex-1 bg-gradient-to-br from-teal-50 via-blue-50 to-gray-50">
          <AIAssistant/>
        </div>
      </div>
    );
  } 
};

export default ChatAI1Landing;