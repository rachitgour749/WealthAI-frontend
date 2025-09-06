import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaUser, FaHistory, FaPlus, FaTrash, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { PiNotePencilBold } from 'react-icons/pi';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import axios from 'axios';
const ChatSidebar = ({ isOpen, onToggle, conversations, onNewChat, onSelectChat, currentConversationId, onChatSelected }) => {
    const { user, logout } = useAuth();
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // Load chat history from Chai AI API
    useEffect(() => {
        if (user) {
            loadChatHistory();
        }
    }, [user]);

    const loadChatHistory = async () => {
        if (!user?.id && !user?.email) return;

        
        try {
            setLoading(true);
            // Load user prompt history from Chai AI with correct endpoint
            const response = await axios.get(`http://localhost:8000/api/user-prompt-history/${user.email}`);
            if(response.status === 200){
                // Handle the response format: array of chat history objects
                let historyData = [];
                
                if (Array.isArray(response.data)) {
                    // If response.data is directly an array
                    historyData = response.data;
                } else if (response.data && Array.isArray(response.data.history)) {
                    // If response.data.history is an array
                    historyData = response.data.history;
                } else if (response.data && Array.isArray(response.data.data)) {
                    // If response.data.data is an array
                    historyData = response.data.data;
                }
                
                console.log('API Response:', response.data);
                console.log('Processed History Data:', historyData);
                
                setChatHistory(historyData);
                
                // If we still don't have an array, set empty array as fallback
                if (!Array.isArray(historyData)) {
                    console.warn('API response is not an array, setting empty array as fallback');
                    setChatHistory([]);
                }
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
            setChatHistory([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };
    

    const DeleteChat = async (chatId) => {
        try {
            // Use the correct delete endpoint format
            const response = await axios.delete(`http://localhost:8000/api/user-prompt-history/${user.email}/conversation/${chatId}`);
            if(response.status === 200){
                setChatHistory(chatHistory.filter(chat => chat.id !== chatId));
                console.log('✅ Chat deleted successfully');
            }
        }catch(error){
            console.error('Failed to delete chat:', error);
        }
    };

    // Search chat history function
    const searchChatHistory = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8000/api/user-prompt-history/${user.email}/search?q=${encodeURIComponent(query)}`);
            if(response.status === 200){
                setSearchResults(response.data || []);
                console.log('Search results:', response.data);
            }
        } catch (error) {
            console.error('Failed to search chat history:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };
    // Format conversation title for display
    const formatConversationTitle = (conversation) => {
        if (conversation.title && conversation.title !== 'New Chat') {
            // Remove timestamp prefix if it exists
            const title = conversation.title.replace(/^Chat \d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} [AP]M/, '');
            return title || 'New Chat';
        }
        if (conversation.metadata?.first_message) {
            const firstMessage = conversation.metadata.first_message;
            return firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
        }
        return 'New Chat';
    };

    const handleNewChat = () => {
        onNewChat();
        // Close sidebar on mobile
        if (window.innerWidth < 1024) {
            onToggle();
        }
    };

    const handleLogout = () => {
        logout();
        onToggle();
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 transition-all duration-300 ease-in-out z-30 lg:hidden ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
                    }`}
                onClick={onToggle}
            />

            {/* Sidebar */}
            <div className={`bg-teal-50 fixed left-0 top-0 h-full border-r border-gray-200 shadow-lg z-40 transition-all duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } w-80 lg:w-72`} style={{ marginTop: '79px', height: 'calc(100vh - 79px)' }}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 ml-[20px]">Easy Access</h2>
                    <button
                        onClick={onToggle}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Close sidebar"
                    >
                        <FaTimes className="text-gray-600" />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                            <FaUser className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">
                                {user?.name || user?.email || 'User'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                                {user?.email || 'user@example.com'}
                            </p>
                        </div>
                    </div>
                </div>

                                 {/* New Chat Button */}
                 <div className="p-4">
                     <button
                         onClick={handleNewChat}
                         className="flex gap-[10px] font-[15px] items-center text-gray-800 hover:bg-teal-200 transition-all duration-400 ease-in-out rounded-[15px] p-[10px] w-full pt-[11px] px-[15px]"
                     >
                         <p className='text-[22px] mb-[3px]'><HiOutlinePencilAlt /></p>
                         New Chat
                     </button>
                 </div>

                 {/* Search Input */}
                 <div className="px-4 pb-4">
                     <input
                         type="text"
                         placeholder="Search chat history..."
                         value={searchQuery}
                         onChange={(e) => {
                             setSearchQuery(e.target.value);
                             searchChatHistory(e.target.value);
                         }}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                     />
                 </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto max-h-[400px]">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3 px-[15px]">
                            <h3 className="text-[18px] font-medium text-gray-800 flex items-center gap-2">
                                
                                <p className='text-[18px] mb-[2px]'><FaHistory /></p>
                                Recent Chats
                            </h3>
                            {Array.isArray(chatHistory) && chatHistory.length > 0 && (
                                <button
                                    onClick={() => {
                                        setChatHistory([]);
                                        console.log('Cleared all conversations');
                                    }}
                                    className="text-xs text-gray-600 hover:text-teal-200 transition-colors p-1"
                                    title="Clear all conversations"
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="text-center text-gray-500 text-sm py-4">
                                {searchQuery ? 'Searching...' : 'Loading chat history...'}
                            </div>
                        ) : searchQuery && searchResults.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm py-4">
                                No results found for "{searchQuery}"
                            </div>
                        ) : searchQuery && searchResults.length > 0 ? (
                            <div className="space-y-2">
                                <div className="text-xs text-gray-500 mb-2">Search Results:</div>
                                {searchResults.map((chat, index) => {
                                    const chatId = chat.id || chat.conversation_id || index;
                                    const isActive = chatId === currentConversationId;
                                    
                                    return (
                                        <div
                                            key={chatId}
                                            className={`p-3 rounded-lg transition-colors relative group cursor-pointer hover:bg-teal-100 ${
                                                isActive ? 'bg-teal-200 border-l-4 border-teal-500' : ''
                                            }`}
                                        >
                                            <div
                                                onClick={() => {
                                                    onSelectChat(chatId);
                                                    if (onChatSelected) {
                                                        onChatSelected(chat);
                                                    }
                                                    if (window.innerWidth < 1024) {
                                                        onToggle();
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium truncate flex-1 text-gray-800">
                                                        {chat.prompt ? 
                                                          (chat.prompt.length > 40 ? chat.prompt.substring(0, 40) + '...' : chat.prompt) 
                                                          : `Chat ${index + 1}`}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">
                                                            {formatTimestamp(chat.created_at || chat.timestamp)}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                DeleteChat(chat.id);
                                                            }}
                                                            className="text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                                            title="Delete conversation"
                                                        >
                                                            <FaTrash className="text-xs" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : !Array.isArray(chatHistory) || chatHistory.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm py-4">
                                No conversations yet. Start a new chat!
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {chatHistory.map((chat, index) => {
                                    const chatId = chat.id || chat.conversation_id || index;
                                    const isActive = chatId === currentConversationId;
                                    
                                    return (
                                        <div
                                            key={chatId}
                                            className={`p-3 rounded-lg transition-colors relative group cursor-pointer hover:bg-teal-100 ${
                                                isActive ? 'bg-teal-200 border-l-4 border-teal-500' : ''
                                            }`}
                                        >
                                                                                         <div
                                                 onClick={() => {
                                                     onSelectChat(chatId);
                                                     // Pass the selected chat data to parent component
                                                     if (onChatSelected) {
                                                         onChatSelected(chat);
                                                     }
                                                     if (window.innerWidth < 1024) {
                                                         onToggle();
                                                     }
                                                 }}
                                             >
                                                <div className="flex items-center justify-between">
                                                                                                         <p className="font-medium truncate flex-1 text-gray-800">
                                                         {chat.prompt ? 
                                                           (chat.prompt.length > 40 ? chat.prompt.substring(0, 40) + '...' : chat.prompt) 
                                                           : `Chat ${index + 1}`}
                                                     </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">
                                                            {formatTimestamp(chat.created_at || chat.timestamp)}
                                                        </span>
                                                                                                                 <button
                                                             onClick={(e) => {
                                                                 e.stopPropagation();
                                                                 DeleteChat(chat.id);
                                                             }}
                                                             className="text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                                             title="Delete conversation"
                                                         >
                                                             <FaTrash className="text-xs" />
                                                         </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatSidebar;
