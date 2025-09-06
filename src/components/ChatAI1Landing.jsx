import React, { useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import AIAssistant from '../pages/AIAssistant/AIAssistant';
import ChatSidebar from './ChatSidebar';

const ChatAI1Landing = ({ setCurrentPage, currentPage }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  const showChat = true;

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(Date.now());
    // Clear messages in AIAssistant component
    if (window.clearChatMessages) {
      window.clearChatMessages();
    }
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
    // Here you would typically load the selected chat's messages
    // For now, we'll just update the current chat ID
  };

  const handleChatSelected = (chatData) => {
    // Convert the chat data to messages format for display
    const chatMessages = [
      {
        id: Date.now(),
        text: chatData.prompt,
        sender: 'user',
        timestamp: new Date(chatData.timestamp),
        isComplete: true
      },
      {
        id: Date.now() + 1,
        text: chatData.ai_response,
        sender: 'ai',
        timestamp: new Date(chatData.timestamp),
        isComplete: true
      }
    ];
    setMessages(chatMessages);
    
    // Log for debugging
    console.log('Selected chat:', chatData);
    console.log('Converted messages:', chatMessages);
  };

  const handleMessagesUpdate = (newMessages) => {
    setMessages(newMessages);
  };

  if (showChat) {
    return (
      <div className="h-screen flex flex-col">
        <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} transparent={false} />
        <div className="flex-1 bg-gradient-to-br from-teal-50 via-blue-50 to-gray-50 border-2 border-black flex">
          {/* Sidebar */}
          <ChatSidebar
            isOpen={isSidebarOpen}
            onToggle={handleSidebarToggle}
            messages={messages}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            currentChatId={currentChatId}
            onChatSelected={handleChatSelected}
          />

          {/* Main Chat Area */}
          <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-80 lg:ml-72' : 'ml-0'
            }`}>
            {/* Hamburger Menu Button */}
            {isSidebarOpen ? <></> :
              <button
                onClick={handleSidebarToggle}
                className={`fixed top-[95px] left-4 z-50 bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-[50px] transition-all duration-300 shadow-md border border-gray-200 ${isSidebarOpen ? 'left-4' : 'left-4'
                  }`}
                title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            }

            <div className="pt-20">
              <AIAssistant 
                onMessagesUpdate={handleMessagesUpdate} 
                initialMessages={messages}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default ChatAI1Landing;