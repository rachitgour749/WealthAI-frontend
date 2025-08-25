// eslint-disable-next-line

import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaPaperPlane, FaCopy, FaRobot, FaUser, FaMagic } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import './AIAssistant.css';
import PromptGenerater from "../../components/PromptGenerater";

const AIAssistant = ({ onBack }) => {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  // eslint-disable-next-line
  const [isTyping, setIsTyping] = useState(false);
  const [isPromptGeneraterOpen, setIsPromptGeneraterOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const textareaRef = useRef(null);

  console.log(isPromptGeneraterOpen);

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

  // Speech Recognition API setup
  const recognitionRef = useRef(null);
  
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

  // Auto scroll to bottom - only when new message is added, not during typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typewriter effect
  const typeWriterEffect = (text, messageIndex) => {
    setIsTyping(true);
    setTypingText("");
    let index = 0;

    const type = () => {
      if (index <= text.length) {
        setTypingText(text.substring(0, index));
        index++;
        typingIntervalRef.current = setTimeout(type, 15); // Faster typing speed
      } else {
        setIsTyping(false);
        setMessages(prev =>
          prev.map((msg, i) =>
            i === messageIndex ? { ...msg, isComplete: true } : msg
          )
        );
        setTypingText("");
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

  // Transform text to make headings with colons bold
  const transformTextForBoldHeadings = (text) => {
    if (!text) return text;
    
    // Pattern to match lines that start with text followed by colon and space
    // Like "Diversification: " or "Professional management: "
    return text.replace(/^([A-Za-z\s]+):\s/gm, '**$1**: ');
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Send message to API
  const sendMessageToAPI = async (message) => {
    try {
      const response = await fetch('https://anjanr--mf-assistant-web.modal.run/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          system_prompt: "You are an expert financial advisor with deep knowledge of investment strategies, MutualFunds. Provide precious but easy-to-understand explanations in brefly."
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      return data.response || data.message || data.answer || "Sorry, I couldn't process your request.";
    } catch (error) {
      console.error('API Error:', error);
      return "Sorry, there was an error connecting to the AI service. Please try again.";
    }
  };

  // Send Button Function
  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
      isComplete: true
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Get AI response
      const aiResponse = await sendMessageToAPI(currentInput);

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        isComplete: false
      };

      // Add AI message and start typing effect
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);

      // Start typewriter effect
      setTimeout(() => {
        typeWriterEffect(aiResponse, messages.length + 1);
      }, 500);

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
    <div className="px-28 py-4">
      <div className="mb-4">
        <button
          onClick={() => onBack?.()}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Strategies
        </button>
      </div>
      
      <PromptGenerater 
        open={isPromptGeneraterOpen} 
        onClose={() => setIsPromptGeneraterOpen(false)}
        onPromptGenerated={(prompt) => {
          setInput(prompt);
          setIsPromptGeneraterOpen(false);
        }}
      />
      
      <div className="rounded-[20px] bg-gradient-to-br from-teal-600 to-blue-800 flex flex-col font-sans">
        {/* Header */}
        <div className="text-center rounded-t-[20px] border p-5 bg-opacity-10 border-b border-white border-opacity-20">
          <h1 className="text-white text-3xl font-semibold">AI Momentum Alpha</h1>
          <p className="text-white text-opacity-80 m-0 text-base font-normal">Hello, What are you working on?</p>
        </div>

        {/* Chat Container */}
        <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full px-5">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto py-5 flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 px-5 text-white text-opacity-80 text-lg">
                <FaRobot className="text-5xl text-emerald-500 mb-4 mx-auto" />
                <p>Ask me anything about finance, investments, or any other topic!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={message.id} className="flex flex-col">
                  <div className={`${
                    message.sender === 'user' 
                      ? 'self-end bg-emerald-500 text-white rounded-t-lg rounded-bl-lg rounded-br-sm max-w-[70%]' 
                      : 'self-start bg-white bg-opacity-95 text-gray-800 rounded-t-lg rounded-br-lg rounded-bl-sm max-w-[85%] relative'
                  } p-3 break-words shadow-lg`}>
                    {/* Message Header */}
                    <div className="flex items-center mb-2 gap-2">
                      {message.sender === 'user' ? (
                        <FaUser className="text-white text-opacity-80 text-sm" />
                      ) : (
                        <FaRobot className="text-emerald-500 text-sm" />
                      )}
                      <span className="font-semibold text-sm opacity-80">
                        {message.sender === 'user' ? 'You' : 'AI Momentum Alpha'}
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
                          <ReactMarkdown>
                            {transformTextForBoldHeadings(message.isComplete ? message.text : typingText)}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="m-0 leading-snug">{message.text}</p>
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
                </div>
              ))
            )}

            {/* Loading Message */}
            {isLoading && (
              <div className="flex flex-col">
                <div className="self-start bg-white bg-opacity-95 text-gray-800 rounded-t-lg rounded-br-lg rounded-bl-sm max-w-[85%] relative p-3 break-words shadow-lg">
                  <div className="flex items-center mb-2 gap-2">
                    <FaRobot className="text-emerald-500 text-sm" />
                    <span className="font-semibold text-sm opacity-80">AI Momentum Alpha</span>
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
          </div>

          {/* Input Area */}
          <div className="py-5 border-t border-white border-opacity-20">
            <div className="flex items-end bg-white bg-opacity-95 rounded-3xl px-4 py-2 shadow-xl backdrop-blur-sm">
              <textarea
                ref={textareaRef}
                placeholder="Type or speak something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border-none outline-none text-base py-3 px-4 bg-transparent text-gray-800 resize-none font-inherit min-h-[48px] max-h-[120px] overflow-y-auto"
                disabled={isLoading}
                rows={1}
              />

              <button
                onClick={handleMic}
                className={`border-none bg-transparent text-xl cursor-pointer mr-2.5 p-2 rounded-full transition-all duration-200 flex items-center justify-center ${listening ? 'opacity-100' : 'opacity-70'}`}
                disabled={isLoading}
              >
                <FaMicrophone color={listening ? "#ff4444" : "#666"} />
              </button>

              <button
                onClick={handleSend}
                className={`border-none bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-10 h-10 cursor-pointer flex justify-center items-center transition-all duration-200 shadow-lg shadow-emerald-500/30 ${input.trim() ? 'opacity-100' : 'opacity-50'}`}
                disabled={isLoading || !input.trim()}
              >
                <FaPaperPlane />
              </button>
              <button
                onClick={() => setIsPromptGeneraterOpen(true)}
                className={`border-none ml-2 bg-blue-800 hover:bg-blue-950 text-white rounded-full w-10 h-10 cursor-pointer flex justify-center items-center transition-all duration-200 shadow-lg shadow-emerald-500/30 opacity-100`}
                disabled={isLoading}
              >
                <FaMagic className="size-4"/>
              </button>

            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AIAssistant;