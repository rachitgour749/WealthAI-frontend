import React, { useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import ChatAI1Landing from './ChatAI1Landing';

const payment = ({ setCurrentPage, currentPage }) => {

  const showChat = true;





  if (showChat) {
    return (
      <div className="h-screen flex flex-col">
        <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} transparent={false} />
        <div className="flex-1 bg-gradient-to-br from-teal-50 via-blue-50 to-gray-50 mt-[79px] border-2 border-black">
          <ChatAI1Landing setCurrentPage={setCurrentPage} currentPage={currentPage} />
        </div>
      </div>
    );
  } 
};

export default payment;