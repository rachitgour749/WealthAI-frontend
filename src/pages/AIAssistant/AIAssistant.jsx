// eslint-disable-next-line

import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaPaperPlane, FaCopy, FaRobot, FaUser, FaMagic, FaStar } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import './AIAssistant.css';
import PromptGenerater from "../../components/PromptGenerater";
import RatingDisplay from "../../components/RatingDisplay";

const AIAssistant = () => {
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
      const response = await fetch('http://localhost:8000/api/rate', {
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

  // Feedback component
  const FeedbackDisplay = ({ traceId, onFeedbackSubmit }) => {
    const [userRating, setUserRating] = useState(null);
    const [feedbackComment, setFeedbackComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    const handleFeedbackSubmit = async () => {
      if (!userRating || !traceId) return;
      
      setIsSubmitting(true);
      try {
        const result = await sendFeedback(traceId, userRating, feedbackComment);
        if (result.success) {
          setFeedbackSubmitted(true);
          if (onFeedbackSubmit) onFeedbackSubmit(result);
        } else {
          console.warn('Feedback submission failed:', result.message);
        }
      } catch (error) {
        console.error('Feedback submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
    
    return (
      <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg border border-opacity-30 p-3 shadow-lg">
        {!feedbackSubmitted && traceId && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-600">Rate this response:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star * 2)} // Convert to 10-point scale
                    className={`text-lg ${userRating && star * 2 <= userRating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add feedback (optional)"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
              />
              <button
                onClick={handleFeedbackSubmit}
                disabled={!userRating || isSubmitting}
                className="text-xs px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Submit'}
              </button>
            </div>
          </div>
        )}
        
        {feedbackSubmitted && (
          <div>
            <span className="text-xs text-green-600">✓ Feedback submitted!</span>
          </div>
        )}
      </div>
    );
  };

  // Send message to API
  const sendMessageToAPI = async (message) => {
    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
                 body: JSON.stringify({
           prompt: message,
           system_prompt: 
           "You are a ChatGPT-style financial expert. FORMAT: Start with 📚 DEFINITION (30 words max), then 💡 KEY POINTS (1 line each), add 🎯 EXAMPLE (1-2 lines),"
         }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      console.log('🔍 Full API Response:', data);
      console.log('📊 Rating received:', data.rating);
      console.log('📊 Rating type:', typeof data.rating);
      console.log('📝 Response text:', data.response);
      console.log('🆔 Response ID:', data.response_id);
      
      // Ensure rating is a proper number
      let processedRating = null;
      if (data.rating !== undefined && data.rating !== null) {
        processedRating = typeof data.rating === 'number' ? data.rating : parseFloat(data.rating);
        if (isNaN(processedRating)) {
          processedRating = null;
        }
      }
      
      // Return the full response object with new format
      const responseObj = {
        answer: data.response || data.answer || "Sorry, I couldn't process your request.",
        rating: processedRating,
        provider: data.provider || null,
        trace_id: data.response_id || data.trace_id || null,
        processing_time: data.processing_time || null,
        timestamp: data.timestamp || null,
        model_used: data.model_used || null,
        system_prompt_used: data.system_prompt_used || null
      };
      
      console.log('📦 Final response object:', responseObj);
      console.log('📝 Answer text:', responseObj.answer);
      
      console.log('📦 Processed response object:', responseObj);
      return responseObj;
    } catch (error) {
      console.error('API Error:', error);
      return {
        answer: "Sorry, there was an error connecting to the AI service. Please try again.",
        rating: null,
        provider: null,
        trace_id: null,
        processing_time: null,
        timestamp: null
      };
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
      const apiResponse = await sendMessageToAPI(currentInput);

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
      
             console.log('💬 Created AI message object:', aiMessage);
       console.log('⭐ Message rating value:', aiMessage.rating);
       console.log('📝 Message text:', aiMessage.text);
       console.log('🆔 Trace ID for rating:', aiMessage.trace_id);
       console.log('🤖 Model used:', aiMessage.model_used);

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
    <div className="flex flex-col justify-between h-full min-h-screen">
      <PromptGenerater 
        open={isPromptGeneraterOpen} 
        onClose={() => setIsPromptGeneraterOpen(false)}
        onPromptGenerated={(prompt) => {
          setInput(prompt);
          setIsPromptGeneraterOpen(false);
        }}
      />
      
      <div className="rounded-[10px] flex flex-col justify-between font-sans">
        {/* Header */}
        <div className="relative text-center rounded-t-[20px] border p-5 bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-200 flex-shrink-0">
          <h1 className="text-teal-800 text-3xl font-bold">Chat AI</h1>
          <p className="text-teal-600 m-0 text-base font-normal">Hello, What are you working on?</p>
        </div>

        {/* Chat Container */}
        <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full px-5 h-full">
          {/* Messages Area */}
          <div className="flex-1 py-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-300px)] messages-area">
            {messages.length === 0 ? (
              <div className="text-center py-12 px-5 text-gray-800 text-opacity-80 text-lg">
                <FaRobot className="text-5xl text-teal-600 mb-4 mx-auto" />
                <p>Ask me anything about finance, investments, or any other topic!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={`${message.id}-${message.isComplete}`} className="flex flex-col">
                  <div className={`${
                    message.sender === 'user' 
                      ? 'self-end bg-emerald-600 text-white rounded-t-lg rounded-bl-lg rounded-br-sm max-w-[70%]' 
                      : 'self-start bg-white bg-opacity-95 text-gray-800 rounded-t-lg rounded-br-lg rounded-bl-sm max-w-[85%] relative'
                  } p-3 break-words shadow-lg`}>
                    {/* Message Header */}
                    <div className="flex items-center mb-2 gap-2">
                      {message.sender === 'user' ? (
                        <FaUser className="text-white text-opacity-80 text-sm" />
                      ) : (
                        <FaRobot className="text-teal-600 text-sm" />
                      )}
                      <span className="font-semibold text-sm opacity-80">
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
          <div className="py-5 border-t border-white border-opacity-20 flex-shrink-0">
            <div className="flex items-end bg-white bg-opacity-95 rounded-[50px] px-4 border border-teal-300 py-2 shadow-xl backdrop-blur-sm">
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
                className={`border-none bg-transparent text-[23px] cursor-pointer mr-2 p-2 mb-[3px] border border-black rounded-full transition-all duration-200 flex items-center justify-center ${listening ? 'opacity-100' : 'opacity-70'}`}
                disabled={isLoading}
              >
                <FaMicrophone color={listening ? "#ff4444" : "#666"} />
              </button>

              <button
                onClick={handleSend}
                className={`border-none bg-teal-500 hover:bg-teal-600 text-white rounded-full w-10 h-10 mb-[3px] cursor-pointer flex justify-center items-center transition-all duration-200 shadow-lg shadow-teal-500/30 ${input.trim() ? 'opacity-100' : 'opacity-50'}`}
                disabled={isLoading || !input.trim()}
              >
                <FaPaperPlane />
              </button>
              <button
                onClick={() => setIsPromptGeneraterOpen(true)}
                className={`border-none ml-2 bg-blue-800 hover:bg-blue-950 text-white rounded-full w-10 h-10 mb-[3px] cursor-pointer flex justify-center items-center transition-all duration-200 shadow-lg shadow-blue-500/30 opacity-100`}
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