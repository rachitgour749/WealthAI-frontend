import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaUser, FaHistory, FaTrash, FaMicrophone, FaPaperPlane, FaCopy, FaRobot, FaMagic, FaStar, FaPaperclip, FaFile, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaFileAlt } from 'react-icons/fa';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import ReactMarkdown from "react-markdown";
import Navigation from './Navigation';
import PromptGenerater from './PromptGenerater';
import RatingDisplay from './RatingDisplay';
import { formatDate } from '../utils/dateFormatter';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../context/ApiContext';
import axios from 'axios';
import ChatAI1Logo from '../Assets/ChatAI1Logo.png';
import ChatAI from '../Assets/ChatAI.png';

const ChatAI1Landing = ({ setCurrentPage, currentPage }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPromptGeneraterOpen, setIsPromptGeneraterOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
   const [selectedDomain, setSelectedDomain] = useState(null);
   const [isTransitioning, setIsTransitioning] = useState(false);
   
   // File upload states
   const [attachedFiles, setAttachedFiles] = useState([]);
   const [uploadProgress, setUploadProgress] = useState({});
   const [isDragging, setIsDragging] = useState(false);
   
   const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const { buildApiUrl } = useApi();

  // Word limit calculation for ChatAI
  // TODO: Replace with actual user data when backend is connected
  const wordsUsed = 0; // Set to 0 to show 100% for now
  const totalWords = 1000000;
  const wordsRemaining = totalWords - wordsUsed;
  const wordPercentage = wordsRemaining / totalWords;

  const user_id = user?.email;

  // Generate unique conversation ID
  const generateConversationId = () => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const userId = 'user_' + Math.random().toString(36).substring(2, 8);
    return `conv_${timestamp}_${randomString}_${userId}`;
  };

  // File handling functions
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType, fileName = '') => {
    // Check by MIME type
    if (fileType.includes('image')) return <FaFileImage className="text-blue-500" />;
    if (fileType.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FaFileWord className="text-blue-600" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FaFileExcel className="text-green-600" />;
    if (fileType.includes('text')) return <FaFileAlt className="text-gray-600" />;
    if (fileType.includes('video')) return <FaFile className="text-purple-500" />;
    if (fileType.includes('audio')) return <FaFile className="text-pink-500" />;
    if (fileType.includes('zip') || fileType.includes('compressed')) return <FaFile className="text-yellow-600" />;
    
    // Check by file extension if MIME type is generic
    if (fileName) {
      const ext = fileName.split('.').pop().toLowerCase();
      if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <FaFile className="text-yellow-600" />;
      if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return <FaFile className="text-purple-500" />;
      if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return <FaFile className="text-pink-500" />;
    }
    
    return <FaFileAlt className="text-gray-500" />;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'processing':
        return <span className="text-xs" title="Processing...">⏳</span>;
      case 'ready':
        return <span className="text-xs" title="Ready">✅</span>;
      case 'failed':
        return <span className="text-xs" title="Failed">❌</span>;
      default:
        return null;
    }
  };

  const handleFileSelect = (files) => {
    const MAX_FILES = 10;
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
    
    if (!files || files.length === 0) return;
    
    const filesArray = Array.from(files);
    
    // Check file count limit
    if (attachedFiles.length + filesArray.length > MAX_FILES) {
      alert(`You can only attach up to ${MAX_FILES} files per message.`);
      // Reset the file input to allow selecting again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Validate and process files
    const validFiles = filesArray.filter(file => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" is too large. Maximum file size is 100 MB.`);
        return false;
      }
      
      // All file types are now allowed
      return true;
    });
    
    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'processing', // processing, ready, failed
      thumbnail: null
    }));
    
    setAttachedFiles(prev => [...prev, ...newFiles]);
    
    // Reset the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Generate thumbnails for images
    newFiles.forEach(fileData => {
      if (fileData.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachedFiles(prev => prev.map(f => 
            f.id === fileData.id ? { ...f, thumbnail: e.target.result, status: 'ready' } : f
          ));
        };
        reader.onerror = () => {
          setAttachedFiles(prev => prev.map(f => 
            f.id === fileData.id ? { ...f, status: 'failed' } : f
          ));
        };
        reader.readAsDataURL(fileData.file);
      } else {
        // For non-images, mark as ready immediately
        setTimeout(() => {
          setAttachedFiles(prev => prev.map(f => 
            f.id === fileData.id ? { ...f, status: 'ready' } : f
          ));
        }, 500);
      }
    });
  };

  const removeFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  // Initialize conversation ID on component mount
  useEffect(() => {
    if (!conversationId) {
      setConversationId(generateConversationId());
    }
  }, [conversationId]);

  // Fetch chat history on component mount and when user changes
  useEffect(() => {
    if (user_id) {
      fetchChatHistory();
    }
  }, [user_id]);

  // Auto-resize textarea function
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = newHeight + 'px';
    }
  };

  // Auto-resize on input change
  useEffect(() => {
    autoResizeTextarea();
  }, [input]);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Speech Recognition API setup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto scroll to bottom - during typing and when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "end",
        inline: "nearest"
      });
    }
  }, [messages, typingText]);

  // Additional scroll effect for better UX
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: "smooth", 
          block: "end" 
        });
      }
    };
    
    // Scroll on new messages
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Setup speech recognition event handlers
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setInput((prev) => prev + " " + finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
      };

      recognitionRef.current.onstart = () => {
        setListening(true);
      };
    }
  }, []);

  // Fetch chat history from API
  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${buildApiUrl('USER_HISTORY')}?user_id=${user_id}&limit=50`);
      console.log('Chat history response:', response.data);
      
      if (response.data && response.data.success) {
        setChatHistory(response.data.conversations || []);
      } else {
        setChatHistory([]);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setChatHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete chat function
  const deleteChat = async (chatId) => {
    try {
      const response = await axios.delete(`${buildApiUrl('USER_PROMPTS')}/${user.email}/${chatId}`);
      if (response.status === 200) {
        setChatHistory(chatHistory.filter(chat => chat.conversation_id !== chatId));
        console.log('✅ Chat deleted successfully');
        // Refresh history after deletion
        await fetchChatHistory();
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  // Search chat history
  const searchChatHistory = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = chatHistory.filter(chat => 
      chat.user_prompt && chat.user_prompt.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  // Format conversation title for display
  const formatConversationTitle = (conversation) => {
    if (conversation.title && conversation.title !== 'New Chat') {
      const title = conversation.title.replace(/^Chat \d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} [AP]M/, '');
      return title || 'New Chat';
    }
    if (conversation.metadata?.first_message) {
      const firstMessage = conversation.metadata.first_message;
      return firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
    }
    return 'New Chat';
  };

  // Format timestamp
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
      return formatDate(date);
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setCurrentChatId(Date.now());
    setConversationId(generateConversationId());
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
  };

  const handleChatSelected = (chatData) => {
    // Set the user prompt in the input box only
    if (chatData.user_prompt) {
      setInput(chatData.user_prompt);
    }
    
    // Keep existing messages visible - don't clear them
    // This allows users to see their previous conversation while selecting a new prompt
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    
    console.log('Selected chat:', chatData);
  };


  // Typewriter effect optimized for 150 words per second
  const typeWriterEffect = (text, messageIndex) => {
    console.log('🎬 Starting typewriter effect for index:', messageIndex, 'with text length:', text.length);
    setIsTyping(true);
    setTypingText("");
    let index = 0;

    // Calculate timing for exactly 150 words per second
    const words = text.split(' ').length;
    const targetDuration = (words / 150) * 1000; // 150 words per second
    const delay = Math.max(0.01, Math.min(0.3, targetDuration / text.length)); // Optimized delay range

    const type = () => {
      if (index <= text.length) {
        setTypingText(text.substring(0, index));
        index++;
        
        // Use requestAnimationFrame for smoother performance
        if (index <= text.length) {
          typingIntervalRef.current = setTimeout(type, delay);
        } else {
          console.log('✅ Typewriter effect completed for index:', messageIndex);
          setIsTyping(false);
          setMessages(prev =>
            prev.map((msg, i) =>
              i === messageIndex ? { ...msg, isComplete: true } : msg
            )
          );
          setTypingText("");
        }
      }
    };

    type();
  };

  // Start/Stop listening
  const handleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    if (!listening) {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (error) {
        console.error('Speech recognition start error:', error);
        setListening(false);
      }
    } else {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  // Transform text to enhance ChatGPT-style formatting - Optimized for performance
  const transformTextForBoldHeadings = (text) => {
    if (!text) return text;
    
    // Use a single replace operation for better performance
    return text
      // Convert emoji headers to proper markdown headers
      .replace(/^📚\s*DEFINITION\s*:?\s*(.*?)$/gm, '\n## 📚 Definition\n$1')
      .replace(/^💡\s*KEY\s*POINTS?\s*:?\s*(.*?)$/gm, '\n## 💡 Key Points\n$1')
      .replace(/^🎯\s*EXAMPLE\s*:?\s*(.*?)$/gm, '\n## 🎯 Example\n$1')
      .replace(/^✅\s*PRACTICAL\s*TAKEAWAY\s*:?\s*(.*?)$/gm, '\n## ✅ Practical Takeaway\n$1')
      
      // Convert bullet points with • to proper markdown
      .replace(/^•\s*(.*?)$/gm, '- $1')
      .replace(/^[-*]\s*(.*?)$/gm, '- $1')
      
      // Convert numbered lists
      .replace(/^\d+\.\s*(.*?)$/gm, '1. $1')
      
      // Ensure proper spacing around headings
      .replace(/^(#{1,6}\s)/gm, '\n$1')
      
      // Ensure proper spacing around bullet points
      .replace(/^(\s*[-*+]\s)/gm, '\n$1')
      
      // Clean up extra newlines (ChatGPT style - 2 lines max)
      .replace(/\n{3,}/g, '\n\n')
      
      // Add proper spacing after periods in bullet points
      .replace(/(\.)\n(-)/g, '$1\n\n$2')
      
      // Add spacing before bullet points for better readability
      .replace(/([.!?])\n(-)/g, '$1\n\n$2')
      
      // Ensure proper spacing around bold text
      .replace(/\*\*(.*?)\*\*/g, '**$1**')
      
      .trim();
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Send feedback to API
  const sendFeedback = async (traceId, rating, comment = "") => {
    try {
      const response = await fetch(buildApiUrl('RATE'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trace_id: traceId,
          user_rating: rating,
          feedback_comment: comment
        }),
      });

      if (!response.ok) {
        throw new Error(`Feedback submission failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Feedback response:', data);
      return data;
    } catch (error) {
      console.error('Feedback Error:', error);
      // Don't throw error to avoid breaking the UI
      return { success: false, message: error.message };
    }
  };

  // Send message to API
  const sendMessageToAPI = async (message, filesData = []) => {
    try {

      const user_id = user?.email;

      let response;
      
      // If there are files, use FormData and chat-with-files endpoint
      if (filesData.length > 0) {
        const formData = new FormData();
        formData.append('prompt', message);
        formData.append('userId', user?.email);
        
        // Append files
        filesData.forEach((fileData) => {
          formData.append('files', fileData.file);
        });

        response = await axios.post(buildApiUrl('CHAT') + '-with-files', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Regular chat without files
        const requestPayload = {
          prompt: message,
          userId: user?.email,
        };

        response = await axios.post(buildApiUrl('CHAT'), requestPayload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      const data = response.data;
      
      // Ensure rating is a proper number
      let processedRating = null;
      if (data.rating !== undefined && data.rating !== null) {
        processedRating = typeof data.rating === 'number' ? data.rating : parseFloat(data.rating);
        if (isNaN(processedRating)) {
          processedRating = null;
        }
      }
      
      // Try multiple possible response field names
      let answerText = null;
      const possibleResponseFields = [
        'response',
        'answer', 
        'message',
        'content',
        'text',
        'result',
        'data'
      ];
      
      for (const field of possibleResponseFields) {
        if (data[field] && typeof data[field] === 'string' && data[field].trim()) {
          answerText = data[field];
          console.log(`✅ Found response in field: ${field}`);
          break;
        }
      }
      
      // If no response found, log the issue
      if (!answerText) {
        console.error('❌ No response text found in any expected field');
        console.error('Available fields:', Object.keys(data));
        console.error('Field values:', Object.values(data));
      }
      
      // Return the full response object with new format
      const responseObj = {
        answer: answerText || "Sorry, I couldn't process your request. Please check the console for debugging info.",
        rating: processedRating,
        provider: data.provider || null,
        trace_id: data.response_id || data.trace_id || null,
        processing_time: data.processing_time || null,
        timestamp: data.timestamp || null,
        model_used: data.model_used || null,
      };
      
      console.log('📦 Final response object:', responseObj);
      console.log('📝 Answer text:', responseObj.answer);
      
      return responseObj;
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      
      // Check if it's a network error or server error
      let errorMessage = "Sorry, there was an error connecting to the AI service. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        errorMessage = `Server error (${error.response.status}): ${error.response.statusText}`;
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error: Unable to connect to the server. Please check your connection.";
      } else {
        // Other error
        errorMessage = `Request error: ${error.message}`;
      }
      
      return {
        answer: errorMessage,
        rating: null,
        provider: null,
        trace_id: null,
        processing_time: null,
        timestamp: null,
        conversation_id: conversationId
      };
    }
  };

  // Send Button Function
  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input.trim();
    if (textToSend === "" && attachedFiles.length === 0) return;

    // Keep the domain selected so the "Back to Dashboard" button remains visible

    const userMessage = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
      isComplete: true,
      attachedFiles: attachedFiles.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        status: f.status,
        thumbnail: f.thumbnail
      }))
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    if (!messageText) {
      setInput("");
      setAttachedFiles([]); // Clear attached files after sending
    }
    setIsLoading(true);

    try {
      // Get AI response with attached files
      const apiResponse = await sendMessageToAPI(textToSend, attachedFiles);

      const aiMessage = {
        id: Date.now() + 1,
        text: apiResponse.answer,
        sender: 'ai',
        timestamp: new Date(),
        isComplete: false,
        rating: apiResponse.rating,
        provider: apiResponse.provider,
        trace_id: apiResponse.trace_id,
        processing_time: apiResponse.processing_time,
        apiTimestamp: apiResponse.timestamp,
        model_used: apiResponse.model_used,
        system_prompt_used: apiResponse.system_prompt_used
      };

      // Add AI message and start typing effect
      setMessages(prev => {
        const newMessages = [...prev, aiMessage];
        console.log('📋 Updated messages array length:', newMessages.length);
        return newMessages;
      });
      setIsLoading(false);

      // Start typewriter effect
      setTimeout(() => {
        console.log('⌨️ Starting typewriter effect with text:', apiResponse.answer);
        setMessages(prev => {
          const messageIndex = prev.length - 1;
          console.log('🎯 Typewriter effect for message index:', messageIndex);
          typeWriterEffect(apiResponse.answer, messageIndex);
          return prev;
        });
      }, 500);

      // Refresh chat history after sending message
      await fetchChatHistory();

    } catch (error) {
      setIsLoading(false);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, there was an error processing your request. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        isComplete: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
      <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
        <Navigation setCurrentPage={setCurrentPage} currentPage={currentPage} transparent={false} />
        
        {/* Word Limit Percentage Circle - Top Right */}
        <div className="absolute top-20 right-7 z-40">
          <div className="relative w-12 h-12 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center mt-[45px]">
            <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - wordPercentage)}`}
                className={`${
                  wordPercentage >= 0.8 ? 'text-green-500' :
                  wordPercentage >= 0.4 ? 'text-yellow-500' : 'text-red-500'
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-700">
                {Math.round(wordPercentage * 100)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 bg-gradient-to-br from-teal-50 via-blue-50 to-gray-50 flex min-h-0">
            {/* Sidebar */}
            <>
              {/* Overlay for mobile */}
              <div
                className={`fixed inset-0 transition-all duration-300 ease-in-out z-30 lg:hidden ${isSidebarOpen ? 'bg-black bg-opacity-50 pointer-events-auto' : 'bg-opacity-0 pointer-events-none'}`}
                onClick={handleSidebarToggle}
              />

              {/* Sidebar */}
              <div className={`bg-teal-50 fixed left-0 top-0 h-full border-r border-gray-200 shadow-lg z-50 transition-all duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-80 lg:w-80`} style={{ marginTop: '83px', height: 'calc(100vh - 100px)' }}>

              {/* Header */}
              <div className="flex items-center justify-between p-1 border-b border-gray-200">
                {isSidebarOpen ? (
                  <>
                    <h2 className="text-sm font-semibold text-gray-800 ml-[5px] mt-[7px]">Easy Access</h2>
                    <button
                      onClick={handleSidebarToggle}
                      className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                      title="Close sidebar"
                    >
                      <FaTimes className="text-gray-600 text-xs" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSidebarToggle}
                    className="p-1 hover:bg-gray-100 rounded transition-colors w-full flex justify-center"
                    title="Open sidebar"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}
              </div>

              {/* User Info */}
              {isSidebarOpen && (
                <div className="px-1 py-2 border-b border-gray-200">
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center mx-[3px]">
                      <FaUser className="text-white text-xs " />
                    </div>
                    <div className="flex min-w-0 items-center  font-medium text-gray-800 truncate text-xs">
                       {user?.name || user?.email || 'User'}
                    </div>
                  </div>
                </div>
              )}

              {/* New Chat Button */}
              {isSidebarOpen && (
                <div className="px-1 py-2">
                  <button
                    onClick={handleNewChat}
                    className="flex gap-[4px] items-center text-gray-800 hover:bg-teal-200 transition-all duration-400 ease-in-out rounded-[8px] p-[6px] w-full pt-[6px] px-[8px]"
                  >
                    <p className='text-[14px] mb-[1px]'><HiOutlinePencilAlt /></p>
                    <span className="text-xs">New Chat</span>
                  </button>
                </div>
              )}

              {/* Search Input */}
              {isSidebarOpen && (
                <div className="px-1 pb-1 mb-[5px]">
                  <input
                    type="text"
                    placeholder="Search chat history..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchChatHistory(e.target.value);
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent text-xs"
                  />
                </div>
              )}

              {/* Chat History */}
              {isSidebarOpen && (
                <div className="flex-1 overflow-y-auto max-h-[300px]">
                <div className="p-1">
                  <div className="flex items-center justify-between mb-1 px-[5px]">
                    <h3 className="text-[12px] font-medium text-gray-800 flex items-center gap-1">
                      <p className='text-[12px] mb-[0px]'><FaHistory /></p>
                      Recent Chats
                    </h3>
                    {Array.isArray(chatHistory) && chatHistory.length > 0 && (
                      <button
                        onClick={() => {
                          setChatHistory([]);
                          console.log('Cleared all conversations');
                        }}
                        className="text-xs text-gray-600 hover:text-teal-200 transition-colors p-0.5"
                        title="Clear all conversations"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="text-center text-gray-500 text-xs py-2">
                      {searchQuery ? 'Searching...' : 'Loading chat history...'}
                    </div>
                  ) : searchQuery && searchResults.length === 0 ? (
                    <div className="text-center text-gray-500 text-xs py-2">
                      No results found for "{searchQuery}"
                    </div>
                  ) : searchQuery && searchResults.length > 0 ? (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 mb-1">Search Results:</div>
                      {searchResults.map((chat, index) => {
                        const chatId = chat.conversation_id || index;
                        const isActive = chatId === currentChatId;
                        
                        return (
                          <div
                            key={chatId}
                            className={`p-1.5 rounded transition-colors relative group cursor-pointer hover:bg-teal-100 ${
                              isActive ? 'bg-teal-200 border-l-2 border-teal-500' : ''
                            }`}
                          >
                            <div
                              onClick={() => {
                                handleSelectChat(chatId);
                                handleChatSelected(chat);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate flex-1 text-gray-800 text-xs">
                                  {chat.user_prompt ? 
                                    (chat.user_prompt.length > 30 ? chat.user_prompt.substring(0, 30) + '...' : chat.user_prompt) 
                                    : `Chat ${index + 1}`}
                                </p>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(chat.timestamp)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteChat(chat.conversation_id);
                                    }}
                                    className="text-red-500 transition-colors p-0.5 opacity-0 group-hover:opacity-100"
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
                    <div className="text-center text-gray-500 text-xs py-2">
                      No conversations yet. Start a new chat!
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {chatHistory.map((chat, index) => {
                        const chatId = chat.conversation_id || index;
                        const isActive = chatId === currentChatId;
                        
                        return (
                          <div
                            key={chatId}
                            className={`p-1.5 rounded transition-colors relative group cursor-pointer hover:bg-teal-100 ${
                              isActive ? 'bg-teal-200 border-l-2 border-teal-500' : ''
                            }`}
                          >
                            <div
                              onClick={() => {
                                handleSelectChat(chatId);
                                handleChatSelected(chat);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate flex-1 text-gray-800 text-xs">
                                  {chat.user_prompt ? 
                                    (chat.user_prompt.length > 30 ? chat.user_prompt.substring(0, 30) + '...' : chat.user_prompt) 
                                    : `Chat ${index + 1}`}
                                </p>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(chat.timestamp)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteChat(chat.conversation_id);
                                    }}
                                    className="text-red-500 transition-colors p-0.5 opacity-0 group-hover:opacity-100"
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
              )}
            </div>
          </>

          {/* Hamburger Button - Always visible when sidebar is closed */}
          {!isSidebarOpen && (
            <button
              onClick={handleSidebarToggle}
              className="fixed top-[95px] left-4 z-[60] bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-[50px] transition-all duration-300 shadow-md border border-gray-200 mt-[30px]"
              title="Open sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Main Chat Area */}
          <div className={`flex-1 transition-all duration-300 ease-in-out min-h-0 bg-gradient-to-br from-teal-50 via-blue-50 to-gray-50 ${isSidebarOpen ? 'ml-80 lg:ml-80' : 'ml-0'}`}>

            <div className="pt-12">
              <PromptGenerater 
                open={isPromptGeneraterOpen} 
                onClose={() => setIsPromptGeneraterOpen(false)}
                onPromptGenerated={(prompt) => {
                  setInput(prompt);
                  setIsPromptGeneraterOpen(false);
                }}
              />
              
              {/* <div className="flex flex-col justify-between font-sans mt-[-50px] h-full w-full min-h-0">

                <div className='flex justify-center relative items-center h-[100px]'>
                <div className="flex justify-center flex-col items-center">
                  <img src={ChatAI} alt="" className="w-[170px] h-[30px] mb-[30px] mt-[25px]" />
                  <h1 className="text-2xl sm:text-3xl lg:text-[15px] font-bold text-teal-700 mb-3 sm:mb-4 mt-[-40px]">
                    Powered by Wealth<span style={{ color: '#ca8a04', fontFamily: 'Noto Sans Arabic', marginLeft: '3px', marginTop: '3px' }}>AI1</span>
                  </h1>
                </div>
              </div> */}

                {/* Chat Container */}
                <div className="flex flex-col flex-1 w-full px-2 sm:px-3 min-h-0 bg-gradient-to-br from-teal-50 via-blue-50 to-gray-50">
                  {/* Messages Area */}
                  <div className="flex-1 py-2 px-2 sm:px-4 flex flex-col gap-2 overflow-y-auto w-[800px] mx-auto messages-area bg-gradient-to-br from-teal-50 via-blue-50 to-gray-50" style={{
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none',
                    WebkitScrollbar: { display: 'none' },
                    '&::-webkit-scrollbar': { display: 'none' }
                  }}>
                    
                    {messages.length === 0 ? (
                      <div className="text-center py-1 px-3">
                        {selectedDomain === 'mutual-fund' ? (
                          // Mutual Fund Questions View
                          <div>
                            {/* Domain Switch Buttons */}
                            <div className="flex justify-center gap-6 mb-4 py-1">
                              <button
                                onClick={() => {
                                  setIsTransitioning(true);
                                  setTimeout(() => {
                                    setSelectedDomain('stock');
                                    setTimeout(() => {
                                      setIsTransitioning(false);
                                    }, 300);
                                  }, 800);
                                }}
                                className="flex items-center justify-center gap-2.5 rounded-lg hover:shadow-md transition-all duration-200"
                                style={{
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                  border: 'none !important',
                                  width: '180px',
                                  height: '48px'
                                }}
                              >
                                <span style={{ fontSize: '20px' }}>📊</span>
                                <span className="text-base font-medium text-gray-700">Stock</span>
                              </button>
                              <button
                                onClick={() => {
                                  setIsTransitioning(true);
                                  setTimeout(() => {
                                    setSelectedDomain('insurance');
                                    setTimeout(() => {
                                      setIsTransitioning(false);
                                    }, 300);
                                  }, 800);
                                }}
                                className="flex items-center justify-center gap-2.5 rounded-lg hover:shadow-md transition-all duration-200"
                                style={{
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                  border: 'none !important',
                                  width: '180px',
                                  height: '48px'
                                }}
                              >
                                <span style={{ fontSize: '20px' }}>🛡️</span>
                                <span className="text-base font-medium text-gray-700">Insurance</span>
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-center mb-2">
                              <div style={{ fontSize: '20px', marginRight: '8px' }}>📈</div>
                              <h2 className="text-lg font-bold text-teal-800">Mutual Fund Questions</h2>
                            </div>
                            <div className="max-w-lg mx-auto space-y-1">
                              <button 
                                className="w-full p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-700"
                                onClick={() => handleSend("What is a mutual fund?")}
                              >
                                What is a mutual fund?
                              </button>
                              <button 
                                className="w-full p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-700"
                                onClick={() => handleSend("What is the meaning of Net Asset Value (NAV) in mutual funds? Give an example")}
                              >
                                What is the meaning of Net Asset Value (NAV) in mutual funds? Give an example
                              </button>
                              <button 
                                className="w-full p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-700"
                                onClick={() => handleSend("What is a Systematic Investment Plan (SIP)? Explain with an example.")}
                              >
                                What is a Systematic Investment Plan (SIP)? Explain with an example.
                              </button>
                              <button 
                                className="w-full p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-700"
                                onClick={() => handleSend("What are equity and debt mutual funds? Give one example of each.")}
                              >
                                What are equity and debt mutual funds? Give one example of each.
                              </button>
                              <button 
                                className="w-full p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-700"
                                onClick={() => handleSend("What is the role of a fund manager in a mutual fund? Give a real-life example.")}
                              >
                                What is the role of a fund manager in a mutual fund? Give a real-life example.
                              </button>
                            </div>
                          </div>
                        ) : selectedDomain === 'stock' ? (
                          // Stock Questions View
                          <div>
                            {/* Domain Switch Buttons */}
                            <div className="flex justify-center gap-6 mb-4 py-1">
                              <button
                                onClick={() => {
                                  setIsTransitioning(true);
                                  setTimeout(() => {
                                    setSelectedDomain('mutual-fund');
                                    setTimeout(() => {
                                      setIsTransitioning(false);
                                    }, 300);
                                  }, 800);
                                }}
                                className="flex items-center justify-center gap-2.5 rounded-lg hover:shadow-md transition-all duration-200"
                                style={{
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                  border: 'none !important',
                                  width: '180px',
                                  height: '48px'
                                }}
                              >
                                <span style={{ fontSize: '20px' }}>📈</span>
                                <span className="text-base font-medium text-gray-700">Mutual Fund</span>
                              </button>
                              <button
                                onClick={() => {
                                  setIsTransitioning(true);
                                  setTimeout(() => {
                                    setSelectedDomain('insurance');
                                    setTimeout(() => {
                                      setIsTransitioning(false);
                                    }, 300);
                                  }, 800);
                                }}
                                className="flex items-center justify-center gap-2.5 rounded-lg hover:shadow-md transition-all duration-200"
                                style={{
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                  border: 'none !important',
                                  width: '180px',
                                  height: '48px'
                                }}
                              >
                                <span style={{ fontSize: '20px' }}>🛡️</span>
                                <span className="text-base font-medium text-gray-700">Insurance</span>
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-center mb-2">
                              <div style={{ fontSize: '20px', marginRight: '8px' }}>📊</div>
                              <h2 className="text-lg font-bold text-teal-800">Stock Questions</h2>
                            </div>
                            <div className="max-w-lg mx-auto space-y-1">
                              <button 
                                className="w-full p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-700"
                                onClick={() => handleSend("What is a stock or share? Explain with an example.")}
                              >
                                What is a stock or share? Explain with an example.
                              </button>
                              <button 
                                className="w-full p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-700"
                                onClick={() => handleSend("What is the difference between common stock and preferred stock? Give an example.")}
                              >
                                What is the difference between common stock and preferred stock? Give an example.
                              </button>
                              <button 
                                className="w-full p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-700"
                                onClick={() => handleSend("What is a stock exchange? Explain with an example like NSE or BSE.")}
                              >
                                What is a stock exchange? Explain with an example like NSE or BSE.
                              </button>
                              <button 
                                className="w-full p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-700"
                                onClick={() => handleSend("What is a dividend in stocks? Give an example.")}
                              >
                                What is a dividend in stocks? Give an example.
                              </button>
                              <button 
                                className="w-full p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-700"
                                onClick={() => handleSend("What is a stock market index? Explain with an example such as Nifty 50 or Sensex.")}
                              >
                                What is a stock market index? Explain with an example such as Nifty 50 or Sensex.
                              </button>
                            </div>
                          </div>
                        ) : selectedDomain === 'insurance' ? (
                          // Insurance Questions View
                          <div>
                            {/* Domain Switch Buttons */}
                            <div className="flex justify-center gap-6 mb-4 py-1">
                              <button
                                onClick={() => {
                                  setIsTransitioning(true);
                                  setTimeout(() => {
                                    setSelectedDomain('mutual-fund');
                                    setTimeout(() => {
                                      setIsTransitioning(false);
                                    }, 300);
                                  }, 800);
                                }}
                                className="flex items-center justify-center gap-2.5 rounded-lg hover:shadow-md transition-all duration-200"
                                style={{
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                  border: 'none !important',
                                  width: '180px',
                                  height: '48px'
                                }}
                              >
                                <span style={{ fontSize: '20px' }}>📈</span>
                                <span className="text-base font-medium text-gray-700">Mutual Fund</span>
                              </button>
                              <button
                                onClick={() => {
                                  setIsTransitioning(true);
                                  setTimeout(() => {
                                    setSelectedDomain('stock');
                                    setTimeout(() => {
                                      setIsTransitioning(false);
                                    }, 300);
                                  }, 800);
                                }}
                                className="flex items-center justify-center gap-2.5 rounded-lg hover:shadow-md transition-all duration-200"
                                style={{
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                  border: 'none !important',
                                  width: '180px',
                                  height: '48px'
                                }}
                              >
                                <span style={{ fontSize: '20px' }}>📊</span>
                                <span className="text-base font-medium text-gray-700">Stock</span>
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-center mb-2">
                              <div style={{ fontSize: '20px', marginRight: '8px' }}>🛡️</div>
                              <h2 className="text-lg font-bold text-teal-800">Insurance Questions</h2>
                            </div>
                            <div className="max-w-lg mx-auto space-y-1">
                              <button 
                                className="w-full p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-700"
                                onClick={() => handleSend("What is life insurance? Explain with an example.")}
                              >
                                What is life insurance? Explain with an example.
                              </button>
                              <button 
                                className="w-full p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-700"
                                onClick={() => handleSend("What is health insurance? Give an example to show how it works.")}
                              >
                                What is health insurance? Give an example to show how it works.
                              </button>
                              <button 
                                className="w-full p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-700"
                                onClick={() => handleSend("What is the difference between term insurance and whole life insurance? Explain with examples.")}
                              >
                                What is the difference between term insurance and whole life insurance? Explain with examples.
                              </button>
                              <button 
                                className="w-full p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-700"
                                onClick={() => handleSend("What is a premium in an insurance policy? Give an example.")}
                              >
                                What is a premium in an insurance policy? Give an example.
                              </button>
                              <button 
                                className="w-full p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-left hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-xs font-medium text-gray-700"
                                onClick={() => handleSend("What is a cashless claim in health insurance? Explain with an example.")}
                              >
                                What is a cashless claim in health insurance? Explain with an example.
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Default Domain Selection View
                          <div>
                            <FaRobot className="text-xl text-teal-600 mb-1 mx-auto" />
                            
                            {/* Domain Selection Bubbles */}
                            <div className="flex justify-center gap-3 mb-3 flex-nowrap overflow-x-auto py-2 px-2" style={{scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitScrollbar: 'none'}}>
                               <button
                                 onClick={() => {
                                   setIsTransitioning(true);
                                   setTimeout(() => {
                                     setSelectedDomain('mutual-fund');
                                     setTimeout(() => {
                                       setIsTransitioning(false);
                                     }, 300);
                                   }, 800);
                                 }}
                                style={{
                                  background: selectedDomain === 'mutual-fund' 
                                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%)' 
                                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(255, 255, 255, 0.99) 100%)',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '12px 10px',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  boxShadow: selectedDomain === 'mutual-fund' 
                                    ? '0 4px 12px rgba(59, 130, 246, 0.25), 0 2px 6px rgba(59, 130, 246, 0.15)' 
                                    : '0 3px 8px rgba(59, 130, 246, 0.1), 0 2px 4px rgba(59, 130, 246, 0.05)',
                                  minWidth: '120px',
                                  width: '120px',
                                  minHeight: '90px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                  if (selectedDomain !== 'mutual-fund') {
                                    e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)';
                                    e.target.style.transform = 'translateY(-3px) scale(1.02)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (selectedDomain !== 'mutual-fund') {
                                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)';
                                    e.target.style.transform = 'translateY(0) scale(1)';
                                  }
                                }}
                              >
                                <div style={{ fontSize: '18px', marginBottom: '4px' }}>📈</div>
                                <span 
                                  className="domain-text"
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: selectedDomain === 'mutual-fund' ? '700' : '600',
                                    color: selectedDomain === 'mutual-fund' ? '#0d9488' : '#374151',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  Mutual Fund
                                </span>
                              </button>
                              
                               <button
                                 onClick={() => {
                                   setIsTransitioning(true);
                                   setTimeout(() => {
                                     setSelectedDomain('stock');
                                     setTimeout(() => {
                                       setIsTransitioning(false);
                                     }, 300);
                                   }, 800);
                                 }}
                                style={{
                                  background: selectedDomain === 'stock' 
                                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%)' 
                                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(255, 255, 255, 0.99) 100%)',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '12px 10px',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  boxShadow: selectedDomain === 'stock' 
                                    ? '0 4px 12px rgba(59, 130, 246, 0.25), 0 2px 6px rgba(59, 130, 246, 0.15)' 
                                    : '0 3px 8px rgba(59, 130, 246, 0.1), 0 2px 4px rgba(59, 130, 246, 0.05)',
                                  minWidth: '120px',
                                  width: '120px',
                                  minHeight: '90px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                  if (selectedDomain !== 'stock') {
                                    e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)';
                                    e.target.style.transform = 'translateY(-3px) scale(1.02)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (selectedDomain !== 'stock') {
                                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)';
                                    e.target.style.transform = 'translateY(0) scale(1)';
                                  }
                                }}
                              >
                                <div style={{ fontSize: '18px', marginBottom: '4px' }}>📊</div>
                                <span 
                                  className="domain-text"
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: selectedDomain === 'stock' ? '700' : '600',
                                    color: selectedDomain === 'stock' ? '#0d9488' : '#374151',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  Stock
                                </span>
                              </button>
                              
                               <button
                                 onClick={() => {
                                   setIsTransitioning(true);
                                   setTimeout(() => {
                                     setSelectedDomain('insurance');
                                     setTimeout(() => {
                                       setIsTransitioning(false);
                                     }, 300);
                                   }, 800);
                                 }}
                                style={{
                                  background: selectedDomain === 'insurance' 
                                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%)' 
                                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(255, 255, 255, 0.99) 100%)',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '12px 10px',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  boxShadow: selectedDomain === 'insurance' 
                                    ? '0 4px 12px rgba(59, 130, 246, 0.25), 0 2px 6px rgba(59, 130, 246, 0.15)' 
                                    : '0 3px 8px rgba(59, 130, 246, 0.1), 0 2px 4px rgba(59, 130, 246, 0.05)',
                                  minWidth: '120px',
                                  width: '120px',
                                  minHeight: '90px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                  if (selectedDomain !== 'insurance') {
                                    e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)';
                                    e.target.style.transform = 'translateY(-3px) scale(1.02)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (selectedDomain !== 'insurance') {
                                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)';
                                    e.target.style.transform = 'translateY(0) scale(1)';
                                  }
                                }}
                              >
                                <div style={{ fontSize: '18px', marginBottom: '4px' }}>🛡️</div>
                                <span 
                                  className="domain-text"
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: selectedDomain === 'insurance' ? '700' : '600',
                                    color: selectedDomain === 'insurance' ? '#0d9488' : '#374151',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  Insurance
                                </span>
                              </button>
                             </div>
                             
                             {/* Transition animation indicator */}
                             {isTransitioning && (
                               <div className="flex items-center justify-center py-8">
                                 <div className="flex flex-col items-center">
                                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
                                   <p className="text-sm text-gray-600">
                                     {selectedDomain === 'mutual-fund' ? 'Loading Mutual Fund Questions...' :
                                      selectedDomain === 'stock' ? 'Loading Stock Questions...' :
                                      selectedDomain === 'insurance' ? 'Loading Insurance Questions...' :
                                      'Loading Questions...'}
                                   </p>
                                 </div>
                               </div>
                             )}
                             
                             {!isTransitioning && (
                               <p className="text-sm text-gray-600">Ask me anything about finance, investments, or any other topic!</p>
                             )}
                          </div>
                        )}
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div key={`${message.id}-${message.isComplete}`} className="flex flex-col">
                          <div className={`${
                            message.sender === 'user' 
                              ? 'self-end bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-2xl rounded-br-md max-w-[85%] sm:max-w-[70%] shadow-lg' 
                              : 'self-start bg-white/90 backdrop-blur-sm text-slate-800 rounded-2xl rounded-bl-md max-w-[95%] sm:max-w-[85%] relative shadow-lg border border-slate-200/60'
                          } p-3 sm:p-4 break-words`}>
                            {/* Message Header */}
                            <div className="flex items-center mb-3 gap-2">
                              {message.sender === 'user' ? (
                                <div className="p-1.5 bg-white/20 rounded-full">
                                  <FaUser className="text-white text-sm" />
                                </div>
                              ) : (
                                <div className="p-1.5 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full">
                                  <FaRobot className="text-teal-600 text-sm" />
                                </div>
                              )}
                              <span className="font-semibold text-sm">
                                {message.sender === 'user' ? 'You' : 'Chat AI'}
                              </span>
                            </div>
                            
                            {/* Message Content */}
                            <div className="relative">
                              {message.sender === 'ai' ? (
                                <div className="markdown-content"
                                     style={{
                                       margin: 0,
                                       lineHeight: 1.6,
                                     }}>
                                  <ReactMarkdown
                                    components={{
                                      h1: ({node, ...props}) => <h1 className="text-xl font-bold my-3 text-gray-800 leading-tight" {...props} />,
                                      h2: ({node, ...props}) => <h2 className="text-lg font-semibold my-2 text-gray-800 leading-tight" {...props} />,
                                      h3: ({node, ...props}) => <h3 className="text-base font-semibold my-2 text-gray-800 leading-tight" {...props} />,
                                      h4: ({node, ...props}) => <h4 className="text-sm font-semibold my-1 text-gray-800 leading-tight" {...props} />,
                                      h5: ({node, ...props}) => <h5 className="text-sm font-medium my-1 text-gray-800 leading-tight" {...props} />,
                                      h6: ({node, ...props}) => <h6 className="text-sm font-medium my-1 text-gray-800 leading-tight" {...props} />,
                                      p: ({node, ...props}) => <p className="my-2 leading-relaxed text-gray-700 text-sm" {...props} />,
                                      ul: ({node, ...props}) => <ul className="list-disc list-outside my-3 ml-6 space-y-1" {...props} />,
                                      ol: ({node, ...props}) => <ol className="list-decimal list-outside my-3 ml-6 space-y-1" {...props} />,
                                      li: ({node, ...props}) => <li className="leading-relaxed text-gray-700 pl-1 text-sm" {...props} />,
                                      strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                                      em: ({node, ...props}) => <em className="italic" {...props} />,
                                      code: ({node, inline, ...props}) => 
                                        inline ? 
                                          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800" {...props} /> :
                                          <code className="block bg-gray-100 p-2 rounded text-xs font-mono text-gray-800 my-2" {...props} />,
                                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-teal-500 pl-4 my-3 italic bg-gray-50 py-2 rounded-r text-sm" {...props} />
                                    }}
                                  >
                                    {transformTextForBoldHeadings(message.isComplete ? message.text : typingText)}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <div>
                                <p className="m-0 leading-snug">{message.text}</p>
                                  {/* Attached Files */}
                                  {message.attachedFiles && message.attachedFiles.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {message.attachedFiles.map((file) => (
                                        <div 
                                          key={file.id} 
                                          className="flex items-center gap-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-full px-4 py-2 text-sm"
                                          title={`${file.name}\nType: ${file.type}\nSize: ${formatFileSize(file.size)}`}
                                        >
                                          {/* Thumbnail for images */}
                                          {file.thumbnail && (
                                            <img 
                                              src={file.thumbnail} 
                                              alt={file.name}
                                              className="w-8 h-8 rounded-full object-cover"
                                            />
                                          )}
                                          {!file.thumbnail && getFileIcon(file.type, file.name)}
                                          
                                          <div className="flex flex-col">
                                            <div className="flex items-center gap-1">
                                              <span className="text-white truncate max-w-[120px]">
                                                {file.name}
                                              </span>
                                              {file.status && getStatusBadge(file.status)}
                                            </div>
                                            <span className="text-white text-opacity-70 text-xs">
                                              {formatFileSize(file.size)}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Copy Button */}
                              {message.sender === 'ai' && message.isComplete && (
                                <button
                                  onClick={() => copyToClipboard(message.text)}
                                  className="absolute top-[-30px] right-1 bg-black bg-opacity-10 border-none rounded p-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity text-xs text-gray-600"
                                  title="Copy message"
                                >
                                  <p className="flex items-center gap-1"><FaCopy />Copy</p>
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Rating Display - Always show for AI messages */}
                          {message.sender === 'ai' && message.isComplete && message.trace_id && (
                            <div className="mt-2 max-w-[85%]">
                              <RatingDisplay 
                                rating={message.rating} 
                                traceId={message.trace_id}
                                onFeedbackSubmit={(result) => {
                                  console.log('Feedback submitted:', result);
                                  // Update the message with the new rating
                                  setMessages(prev => 
                                    prev.map(msg => 
                                      msg.id === message.id 
                                        ? { ...msg, rating: result.user_rating || msg.rating }
                                        : msg
                                    )
                                  );
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))
                    )}

                    {/* Loading Message */}
                    {isLoading && (
                      <div className="flex flex-col">
                        <div className="self-start bg-white bg-opacity-95 text-gray-800 rounded-t-lg rounded-br-lg rounded-bl-sm max-w-[85%] relative p-3 break-words shadow-lg">
                          <div className="flex items-center mb-2 gap-2">
                            <FaRobot className="text-emerald-500 text-sm" />
                            <span className="font-semibold text-sm opacity-80">Chat AI</span>
                          </div>
                          <div className="relative">
                            <div className="flex gap-1 items-center py-2">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                    
                    {/* Scroll to bottom button */}
                    {messages.length > 3 && (
                      <button
                        onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })}
                        className="fixed bottom-24 right-6 bg-teal-500 hover:bg-teal-600 text-white rounded-full w-10 h-10 shadow-lg transition-all duration-200 flex items-center justify-center z-10"
                        title="Scroll to bottom"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="py-4 flex-shrink-0 flex justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-gray-50">
                    <div 
                      className={`flex flex-col bg-white/90 backdrop-blur-lg rounded-2xl px-3 sm:px-4 border border-slate-200/60 min-h-[60px] max-h-[300px] justify-center py-3 shadow-xl w-full max-w-3xl mx-2 sm:mx-4 ${isDragging ? 'border-blue-400 bg-blue-50/80' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {/* File Chips inside input box */}
                      {attachedFiles.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {attachedFiles.map((file) => (
                            <div 
                              key={file.id} 
                              className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-sm relative"
                              title={`${file.name}\nType: ${file.type}\nSize: ${formatFileSize(file.size)}`}
                            >
                              {/* Thumbnail for images */}
                              {file.thumbnail && (
                                <img 
                                  src={file.thumbnail} 
                                  alt={file.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                              {!file.thumbnail && getFileIcon(file.type, file.name)}
                              
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-700 font-medium text-xs truncate max-w-[150px]">
                                    {file.name}
                                  </span>
                                  {getStatusBadge(file.status)}
                                </div>
                                <span className="text-gray-500 text-xs">
                                  {formatFileSize(file.size)}
                                </span>
                              </div>
                              
                              {uploadProgress[file.id] !== undefined && (
                                <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${uploadProgress[file.id]}%` }}
                                  />
                                </div>
                              )}
                              
                              <button
                                onClick={() => removeFile(file.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                              >
                                <FaTimes className="text-xs" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                        <div className="flex items-end gap-2 sm:gap-3">
                          {/* Hidden file input */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={(e) => handleFileSelect(e.target.files)}
                            className="hidden"
                          />

                          {/* Paperclip button */}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-all duration-200 flex items-center justify-center text-slate-600 hover:text-slate-800 flex-shrink-0"
                            disabled={isLoading}
                            title="Attach files"
                          >
                            <FaPaperclip className="text-sm" />
                          </button>

                      <textarea
                        ref={textareaRef}
                            placeholder="Ask anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 border-none outline-none text-sm py-2 px-3 bg-transparent text-slate-800 resize-none font-inherit min-h-[40px] max-h-[300px] overflow-y-auto placeholder-slate-500"
                        disabled={isLoading}
                        rows={1}
                      />

                      <button
                        onClick={handleMic}
                        className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center flex-shrink-0 ${
                          listening 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        disabled={isLoading}
                        title="Voice input"
                      >
                        <FaMicrophone className="text-sm" />
                      </button>

                      <button
                        onClick={handleSend}
                        className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center flex-shrink-0 ${
                          (input.trim() || attachedFiles.length > 0) 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                        disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
                        title="Send message"
                      >
                        <FaPaperPlane className="text-sm" />
                      </button>
                      
                      <button
                        onClick={() => setIsPromptGeneraterOpen(true)}
                        className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-full transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 flex-shrink-0"
                        disabled={isLoading}
                        title="AI Prompt Generator"
                      >
                        <FaMagic className="text-sm"/>
                      </button>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
};

export default ChatAI1Landing;